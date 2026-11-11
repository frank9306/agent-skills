using System.Drawing;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Windows.Forms;

sealed class ForegroundFixture : Form
{
    [DllImport("user32.dll")] static extern nint GetForegroundWindow();
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetWindowText(nint hwnd, StringBuilder text, int count);
    [DllImport("user32.dll")] static extern bool IsIconic(nint hwnd);
    [DllImport("user32.dll")] static extern bool ShowWindowAsync(nint hwnd, int command);
    public ForegroundFixture(string[] args)
    {
        Text = "app-use focus fixture " + args.Last();
        Size = new Size(500, 280);
        var result = new TextBox { AccessibleName = "Focus result", ReadOnly = true, Text = "Pending", Bounds = new Rectangle(30, 140, 400, 30) };
        var apply = new Button { Text = "Focus apply", AccessibleName = "Focus apply", Bounds = new Rectangle(30, 80, 160, 35) };
        apply.Click += (_, _) => result.Text = "Focused action complete";
        Controls.AddRange([new Label { Text = "app-use-focus-fixture-v1", AutoSize = true, Location = new Point(30, 25) }, apply, result]);
        Shown += (_, _) => {
            Console.WriteLine(JsonSerializer.Serialize(new { ready = true, hwnd = (long)Handle, pid = Environment.ProcessId }));
            _ = Task.Run(() => {
                while (Console.ReadLine() is { } line) {
                    var command = line;
                    BeginInvoke(() => {
                        try {
                        if (command == "minimize") WindowState = FormWindowState.Minimized;
                        if (command == "maximize") WindowState = FormWindowState.Maximized;
                        if (command == "normal") WindowState = FormWindowState.Normal;
                        if (command == "close-soon") {
                            var timer = new System.Windows.Forms.Timer { Interval = 100 };
                            timer.Tick += (_, _) => { timer.Stop(); timer.Dispose(); Close(); };
                            timer.Start();
                        }
                        nint browser = 0;
                        if (command.StartsWith("browser-", StringComparison.Ordinal)) {
                            var parts = command.Split(':');
                            if (parts.Length != 3 || !Guid.TryParseExact(parts[2], "D", out _)) throw new IOException("controlled browser identity required");
                            browser = (nint)long.Parse(parts[1]);
                            var caption = new StringBuilder(512); GetWindowText(browser, caption, caption.Capacity);
                            if (!caption.ToString().StartsWith("app-use focus browser " + parts[2] + " - ", StringComparison.Ordinal)) throw new IOException("controlled browser caption mismatch");
                            if (parts[0] == "browser-minimize") ShowWindowAsync(browser, 6);
                        }
                        var foreground = GetForegroundWindow();
                        var title = new StringBuilder(512); GetWindowText(foreground, title, title.Capacity);
                        // Only the task's controlled page caption can enter test evidence.
                        var controlledTitle = title.ToString().StartsWith("app-use focus browser ", StringComparison.Ordinal) ? title.ToString() : null;
                        Console.WriteLine(JsonSerializer.Serialize(new { command, hwnd = (long)Handle, foreground = (long)foreground, controlledTitle, browserMinimized = browser != 0 && IsIconic(browser), minimized = WindowState == FormWindowState.Minimized, maximized = WindowState == FormWindowState.Maximized }));
                        } catch (Exception e) { Console.WriteLine(JsonSerializer.Serialize(new { error = e.Message })); }
                    });
                }
            });
        };
    }
}
