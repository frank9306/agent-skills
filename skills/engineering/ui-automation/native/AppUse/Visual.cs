using System.Drawing;
using System.Drawing.Imaging;
using System.Globalization;
using System.IO;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Windows.Automation;

namespace AppUse;

internal sealed partial class Desktop
{
    sealed record VisualFrame(byte[] Bytes, Rectangle Screen, string Geometry, RectangleF[] Masked);
    sealed record VisualObservation(string Id, DateTime At, VisualFrame Frame);
    VisualObservation? visual;

    string VisualGeometry()
    {
        var r = Root.Current.BoundingRectangle;
        return r.ToString(CultureInfo.InvariantCulture) + "|" + GetDpiForWindow(hwnd);
    }

    VisualFrame CaptureFrame()
    {
        Alive();
        if (secrets.Count > 0) throw new IOException("capture refused: session contains sensitive input; use a sanitized fixture");
        var r = Root.Current.BoundingRectangle;
        if (GetForegroundWindow() != hwnd || r.IsEmpty || r.Width < 1 || r.Height < 1 || !double.IsFinite(r.Width * r.Height))
            throw new IOException("foreground window required for capture");
        if (r.Width * r.Height > 30_000_000) throw new IOException("window capture exceeds pixel budget");
        var geometry = VisualGeometry();
        var screen = new Rectangle((int)r.X, (int)r.Y, (int)r.Width, (int)r.Height);
        RectangleF[] Masks() => Root.FindAll(TreeScope.Subtree, new PropertyCondition(AutomationElement.IsPasswordProperty, true))
            .Cast<AutomationElement>().Select(e => e.Current.BoundingRectangle).Where(b => !b.IsEmpty)
            .Select(b => new RectangleF((float)(b.X - screen.X), (float)(b.Y - screen.Y), (float)b.Width, (float)b.Height)).ToArray();
        var masked = Masks();
        using var bitmap = new Bitmap(screen.Width, screen.Height);
        using (var g = Graphics.FromImage(bitmap))
        {
            g.CopyFromScreen(screen.X, screen.Y, 0, 0, bitmap.Size);
            masked = masked.Concat(Masks()).Distinct().ToArray();
            foreach (var b in masked) g.FillRectangle(Brushes.Black, b);
        }
        if (GetForegroundWindow() != hwnd || VisualGeometry() != geometry) throw new IOException("window changed during capture; observe again");
        using var output = new MemoryStream(); bitmap.Save(output, ImageFormat.Png);
        return new VisualFrame(output.ToArray(), screen, geometry, masked);
    }

    JsonObject VisualObserve()
    {
        var frame = CaptureFrame();
        visual = new VisualObservation(Guid.NewGuid().ToString("N"), DateTime.UtcNow, frame);
        return new JsonObject {
            ["id"] = visual.Id, ["identity"] = Identity(), ["coordinateSpace"] = "image-pixels",
            ["image"] = new JsonObject { ["mime"] = "image/png", ["data"] = Convert.ToBase64String(frame.Bytes), ["width"] = frame.Screen.Width, ["height"] = frame.Screen.Height }
        };
    }

    JsonObject VisualClick(JsonObject p, VisualObservation? prior, Action guard)
    {
        if (prior is null || p["observation"]?.GetValue<string>() != prior.Id || DateTime.UtcNow - prior.At > TimeSpan.FromSeconds(60))
            throw new IOException("stale visual observation; visual-observe again");
        if (p["target"] is not JsonObject target || target.Any(x => x.Key is not ("x" or "y" or "width" or "height" or "description")))
            throw new IOException("bounded visual target required");
        double Number(string key) {
            if (target[key] is not JsonValue value || !value.TryGetValue<double>(out var n) || !double.IsFinite(n)) throw new IOException("finite visual region required");
            return n;
        }
        if (target["description"] is not JsonValue description || !description.TryGetValue<string>(out var label) || string.IsNullOrWhiteSpace(label) || label.Length > 200)
            throw new IOException("visual target description required (1-200 characters)");
        var x = Number("x"); var y = Number("y"); var width = Number("width"); var height = Number("height");
        if (x < 0 || y < 0 || width <= 0 || height <= 0 || x + width > prior.Frame.Screen.Width || y + height > prior.Frame.Screen.Height)
            throw new IOException("visual region outside captured image");
        var region = new RectangleF((float)x, (float)y, (float)width, (float)height);
        if (prior.Frame.Masked.Any(b => b.IntersectsWith(region))) throw new IOException("visual region overlaps sensitive masked content");
        if (VisualGeometry() != prior.Frame.Geometry) throw new IOException("window geometry or DPI changed; visual-observe again");
        var fresh = CaptureFrame();
        if (fresh.Masked.Any(b => b.IntersectsWith(region))) throw new IOException("visual region overlaps sensitive masked content");
        if (fresh.Geometry != prior.Frame.Geometry || !fresh.Bytes.AsSpan().SequenceEqual(prior.Frame.Bytes))
            throw new IOException("screenshot changed; visual-observe again");
        var point = new Point(fresh.Screen.X + (int)Math.Floor(x + width / 2), fresh.Screen.Y + (int)Math.Floor(y + height / 2));
        void HitVisual() {
            Alive(); guard();
            if (DateTime.UtcNow - prior.At > TimeSpan.FromSeconds(60)) throw new IOException("stale visual observation; visual-observe again");
            if (GetForegroundWindow() != hwnd || VisualGeometry() != prior.Frame.Geometry) throw new IOException("visual target window is not unchanged foreground");
            var hitWindow = WindowFromPoint(point);
            var hit = AutomationElement.FromPoint(new System.Windows.Point(point.X, point.Y));
            if ((GetAncestor(hitWindow, 2) != hwnd && GetAncestor(hitWindow, 3) != hwnd) || !Within(hit))
                throw new IOException("visual target is occluded or hit-test escaped window");
            if (!hit.Current.IsEnabled || hit.Current.IsOffscreen || hit.Current.IsPassword) throw new IOException("visual hit disabled, hidden or sensitive");
        }
        HitVisual();
        if (!SetCursorPos(point.X, point.Y)) throw new IOException("cannot position pointer");
        Thread.Sleep(80);
        var hovered = CaptureFrame();
        if (hovered.Masked.Any(b => b.IntersectsWith(region))) throw new IOException("visual region overlaps sensitive masked content");
        if (hovered.Geometry != prior.Frame.Geometry || !hovered.Bytes.AsSpan().SequenceEqual(prior.Frame.Bytes))
            throw new IOException("screenshot changed after pointer placement; visual-observe again");
        HitVisual();
        Mouse(2); try { } finally { Mouse(4); }
        Thread.Sleep(80);
        var result = new JsonObject {
            ["actionExecuted"] = true, ["goalVerified"] = false,
            ["diagnostics"] = JsonSerializer.SerializeToNode(new { coordinateSpace = "image-pixels", target = new { x, y, width, height, description = label }, screenPoint = new { x = point.X, y = point.Y } }, Broker.Json)
        };
        try { result["observation"] = Observe(); }
        catch (Exception e) { result["observation"] = null; result["observationError"] = e.Message; }
        return result;
    }
}
