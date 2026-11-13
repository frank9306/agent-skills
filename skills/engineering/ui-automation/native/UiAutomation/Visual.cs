using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace UiAutomation;

internal sealed partial class Desktop
{
    sealed record VisualFrame(int[] Pixels, Rectangle Screen, string Geometry);
    sealed record VisualObservation(string Id, DateTime At, VisualFrame Frame);
    sealed record VisualStep(Rectangle Bounds, Point Offset, string? Text, bool Sensitive, bool Submit);
    VisualObservation? visual;

    Rectangle WindowBounds()
    {
        if (!GetWindowRect(hwnd, out var rect)) throw new IOException("cannot read window bounds");
        return Rectangle.FromLTRB(rect.left, rect.top, rect.right, rect.bottom);
    }

    string VisualGeometry() => WindowBounds().ToString() + "|" + GetDpiForWindow(hwnd);

    VisualFrame CaptureFrame(Action<Bitmap>? export = null)
    {
        Alive();
        if (capturePaused) throw new IOException("capture paused after credential entry; owner confirmation required");
        var screen = WindowBounds();
        if (GetForegroundWindow() != hwnd || screen.Width < 1 || screen.Height < 1)
            throw new IOException("foreground window required for capture");
        if ((long)screen.Width * screen.Height > 30_000_000) throw new IOException("window capture exceeds pixel budget");
        var geometry = screen.ToString() + "|" + GetDpiForWindow(hwnd);
        using var bitmap = new Bitmap(screen.Width, screen.Height, PixelFormat.Format32bppRgb);
        using (var g = Graphics.FromImage(bitmap))
            g.CopyFromScreen(screen.X, screen.Y, 0, 0, bitmap.Size);
        if (GetForegroundWindow() != hwnd || VisualGeometry() != geometry) throw new IOException("window changed during capture; observe again");
        var pixels = new int[screen.Width * screen.Height];
        var bits = bitmap.LockBits(new Rectangle(Point.Empty, screen.Size), ImageLockMode.ReadOnly, PixelFormat.Format32bppRgb);
        try { Marshal.Copy(bits.Scan0, pixels, 0, pixels.Length); }
        finally { bitmap.UnlockBits(bits); }
        export?.Invoke(bitmap);
        return new VisualFrame(pixels, screen, geometry);
    }

    static string EncodeFrame(Bitmap bitmap)
    {
        using var output = new MemoryStream();
        bitmap.Save(output, ImageFormat.Png);
        return Convert.ToBase64String(output.GetBuffer(), 0, (int)output.Length);
    }

    static string EncodeFrame(VisualFrame frame)
    {
        using var bitmap = new Bitmap(frame.Screen.Width, frame.Screen.Height, PixelFormat.Format32bppRgb);
        var bits = bitmap.LockBits(new Rectangle(Point.Empty, frame.Screen.Size), ImageLockMode.WriteOnly, PixelFormat.Format32bppRgb);
        try { Marshal.Copy(frame.Pixels, 0, bits.Scan0, frame.Pixels.Length); }
        finally { bitmap.UnlockBits(bits); }
        return EncodeFrame(bitmap);
    }

    JsonObject VisualObserve(VisualFrame? captured = null)
    {
        string? encoded = null;
        var frame = captured ?? CaptureFrame(bitmap => encoded = EncodeFrame(bitmap));
        encoded ??= EncodeFrame(frame);
        visual = new VisualObservation(Guid.NewGuid().ToString("N"), DateTime.UtcNow, frame);
        return new JsonObject {
            ["id"] = visual.Id, ["identity"] = Identity(), ["coordinateSpace"] = "image-pixels",
            ["image"] = new JsonObject { ["mime"] = "image/png", ["data"] = encoded, ["width"] = frame.Screen.Width, ["height"] = frame.Screen.Height }
        };
    }

    static bool SamePixels(VisualFrame before, VisualFrame after, IReadOnlyList<Rectangle> ignored, Rectangle? region = null)
    {
        if (before.Geometry != after.Geometry) return false;
        if (region is null && before.Pixels.AsSpan().SequenceEqual(after.Pixels)) return true;
        var bounds = region ?? new Rectangle(Point.Empty, before.Screen.Size);
        for (var y = bounds.Top; y < bounds.Bottom; y++)
        {
            var offset = y * before.Screen.Width;
            for (var x = bounds.Left; x < bounds.Right; x++)
            {
                if (((before.Pixels[offset + x] ^ after.Pixels[offset + x]) & 0xffffff) == 0) continue;
                if (!ignored.Any(area => area.Contains(x, y))) return false;
            }
        }
        return true;
    }

    VisualObservation CheckedObservation(JsonObject p, VisualObservation? prior)
    {
        if (prior is null || p["observation"]?.GetValue<string>() != prior.Id || DateTime.UtcNow - prior.At > TimeSpan.FromSeconds(60))
            throw new IOException("stale visual observation; visual-observe again");
        return prior;
    }

    JsonObject VisualCrop(JsonObject p, VisualObservation? prior)
    {
        var snapshot = CheckedObservation(p, prior);
        var frame = snapshot.Frame;
        var bounds = ParseStep(p, frame).Bounds;
        if (bounds.Width > 1568 || bounds.Height > 1568)
            throw new IOException("visual crop exceeds the image budget");
        var width = Math.Max(280, bounds.Width);
        var height = Math.Max(280, bounds.Height);
        var pixels = new int[width * height];
        Array.Fill(pixels, 0xffffff);
        for (var row = 0; row < bounds.Height; row++)
            Array.Copy(frame.Pixels, (bounds.Top + row) * frame.Screen.Width + bounds.Left,
                pixels, row * width, bounds.Width);
        var cropped = new VisualFrame(pixels, new Rectangle(0, 0, width, height), frame.Geometry);
        var encoded = EncodeFrame(cropped);
        visual = snapshot;
        return new JsonObject {
            ["image"] = new JsonObject { ["mime"] = "image/png", ["data"] = encoded, ["width"] = width, ["height"] = height }
        };
    }

    JsonObject VisualBaseline()
    {
        visual = new VisualObservation(Guid.NewGuid().ToString("N"), DateTime.UtcNow, CaptureFrame());
        return new JsonObject { ["id"] = visual.Id };
    }

    JsonObject VisualChange(JsonObject p, VisualObservation? prior)
    {
        var baseline = CheckedObservation(p, prior);
        var fresh = CaptureFrame();
        if (!SamePixels(baseline.Frame, fresh, [])) return VisualObserve(fresh);
        visual = baseline;
        return new JsonObject { ["changed"] = false };
    }

    static VisualStep ParseStep(JsonObject p, VisualFrame frame)
    {
        if (p["target"] is not JsonObject target || target.Any(x => x.Key is not ("x" or "y" or "width" or "height" or "description")))
            throw new IOException("bounded visual target required");
        double Number(string key) {
            if (target[key] is not JsonValue value || !value.TryGetValue<double>(out var n) || !double.IsFinite(n)) throw new IOException("finite visual region required");
            return n;
        }
        if (target["description"] is not JsonValue description || !description.TryGetValue<string>(out var label) || string.IsNullOrWhiteSpace(label) || label.Length > 200)
            throw new IOException("visual target description required (1-200 characters)");
        var x = Number("x"); var y = Number("y"); var width = Number("width"); var height = Number("height");
        if (x < 0 || y < 0 || width <= 0 || height <= 0 || x + width > frame.Screen.Width || y + height > frame.Screen.Height)
            throw new IOException("visual region outside captured image");
        var action = p["action"]?.AsObject();
        if (action is not null && (action["type"]?.GetValue<string>() != "type" ||
            action.Any(entry => entry.Key is not ("type" or "text" or "submit" or "sensitive"))))
            throw new IOException("unsupported visual action");
        var input = action?["text"]?.GetValue<string>();
        if (action is not null && (string.IsNullOrEmpty(input) || input.Length > 4096 || input.Any(char.IsControl)))
            throw new IOException("visual typing requires 1–4096 non-control characters");
        var bounds = Rectangle.FromLTRB((int)Math.Floor(x), (int)Math.Floor(y), (int)Math.Ceiling(x + width), (int)Math.Ceiling(y + height));
        return new VisualStep(bounds, new Point((int)Math.Floor(x + width / 2), (int)Math.Floor(y + height / 2)),
            input, action?["sensitive"]?.GetValue<bool>() == true, action?["submit"]?.GetValue<bool>() == true);
    }

    JsonObject VisualClick(JsonObject p, VisualObservation? prior, Action guard)
    {
        var snapshot = CheckedObservation(p, prior);
        var step = ParseStep(p, snapshot.Frame);
        Rectangle? guardRegion = null;
        if (p["guardRegion"] is { } scope)
        {
            if (scope is not JsonObject region) throw new IOException("bounded visual guard region required");
            if (step.Text is not null) throw new IOException("a scoped visual guard only supports clicks");
            var context = ParseStep(new JsonObject { ["target"] = region.DeepClone() }, snapshot.Frame).Bounds;
            var required = Rectangle.Inflate(step.Bounds, 8, 8);
            if (!context.Contains(required))
                throw new IOException("visual guard region must contain the target and at least eight pixels of context on every side");
            guardRegion = context;
        }
        return ExecuteStep(step, snapshot, [], guard, guardRegion);
    }

    JsonObject VisualBatch(JsonObject p, VisualObservation? prior, Action guard)
    {
        var snapshot = CheckedObservation(p, prior);
        if (p["steps"] is not JsonArray requests || requests.Count is < 2 or > 5)
            throw new IOException("desktop batch requires 2–5 steps");
        var steps = requests.Select(request => ParseStep(request!.AsObject(), snapshot.Frame)).ToArray();
        for (var index = 0; index < steps.Length - 1; index++)
        {
            var step = steps[index];
            if (step.Text is null || step.Sensitive || step.Submit)
                throw new IOException("intermediate desktop steps must type into a visible field without submitting");
            if (steps.Skip(index + 1).Any(next => next.Bounds.IntersectsWith(step.Bounds)))
                throw new IOException("desktop batch targets must be disjoint");
        }
        var edited = new List<Rectangle>();
        var results = new JsonArray();
        for (var index = 0; index < steps.Length; index++)
        {
            var step = steps[index];
            try { results.Add(ExecuteStep(step, snapshot, edited, guard)); }
            catch (IOException error)
            {
                return new JsonObject { ["completed"] = results.Count, ["steps"] = results, ["error"] = error.Message, ["capturePaused"] = capturePaused };
            }
            edited.Add(step.Bounds);
            if (index + 1 < steps.Length) Thread.Sleep(35);
        }
        return new JsonObject { ["completed"] = results.Count, ["steps"] = results, ["capturePaused"] = capturePaused };
    }

    JsonObject ExecuteStep(VisualStep step, VisualObservation prior, List<Rectangle> edited, Action guard, Rectangle? guardRegion = null)
    {
        var timer = Stopwatch.StartNew();
        if (VisualGeometry() != prior.Frame.Geometry) throw new IOException("window geometry or DPI changed; visual-observe again");
        var fresh = CaptureFrame();
        if (!SamePixels(prior.Frame, fresh, edited, guardRegion))
            throw new IOException("screenshot changed; visual-observe again");
        var point = new Point(fresh.Screen.X + step.Offset.X, fresh.Screen.Y + step.Offset.Y);
        void HitVisual() {
            Alive(); guard();
            if (DateTime.UtcNow - prior.At > TimeSpan.FromSeconds(60)) throw new IOException("stale visual observation; visual-observe again");
            if (GetForegroundWindow() != hwnd || VisualGeometry() != prior.Frame.Geometry) throw new IOException("visual target window is not unchanged foreground");
            var hitWindow = WindowFromPoint(point);
            if (hitWindow == 0 || GetAncestor(hitWindow, 2) != hwnd)
                throw new IOException("visual target is occluded or hit-test escaped window");
        }
        HitVisual();
        if (!GetCursorPos(out var cursor) || cursor != point)
        {
            if (!SetCursorPos(point.X, point.Y)) throw new IOException("cannot position pointer");
            Thread.Sleep(80);
            var hovered = CaptureFrame();
            if (!SamePixels(fresh, hovered, [.. edited, step.Bounds], guardRegion))
                throw new IOException("screenshot changed outside visual target after pointer placement; visual-observe again");
        }
        HitVisual();
        if (!GetCursorPos(out var actualPoint) || actualPoint != point)
            throw new IOException("pointer moved before dispatch; visual-observe again");
        var guardMs = timer.Elapsed.TotalMilliseconds;
        timer.Restart();
        if (step.Sensitive) capturePaused = true;
        Mouse(2); Mouse(4);
        if (step.Text is { } input)
        {
            Thread.Sleep(80);
            var thread = GetWindowThreadProcessId(hwnd, out _);
            nint FocusedWindow()
            {
                guard();
                var info = new GUITHREADINFO { size = (uint)System.Runtime.InteropServices.Marshal.SizeOf<GUITHREADINFO>() };
                if (GetForegroundWindow() != hwnd || !GetGUIThreadInfo(thread, ref info) ||
                    info.focus == 0 || GetAncestor(info.focus, 2) != hwnd)
                    throw new IOException("keyboard focus is outside target window");
                return info.focus;
            }
            var focused = FocusedWindow();
            for (var offset = 0; offset < input.Length;)
            {
                if (FocusedWindow() != focused) throw new IOException("keyboard focus changed during input");
                var count = Math.Min(32, input.Length - offset);
                if (offset + count < input.Length && char.IsHighSurrogate(input[offset + count - 1])) count--;
                SendText(input.AsSpan(offset, count));
                offset += count;
            }
            if (step.Submit)
            {
                if (FocusedWindow() != focused) throw new IOException("keyboard focus changed before submission");
                SendKey(13, false);
                SendKey(13, true);
            }
        }
        return new JsonObject {
            ["actionExecuted"] = true, ["goalVerified"] = false,
            ["capturePaused"] = capturePaused,
            ["guardMs"] = guardMs,
            ["inputMs"] = timer.Elapsed.TotalMilliseconds
        };
    }
}
