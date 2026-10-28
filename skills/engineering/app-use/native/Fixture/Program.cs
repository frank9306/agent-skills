using System.Windows.Forms;
using System.Drawing;

Application.SetHighDpiMode(HighDpiMode.PerMonitorV2);
Application.EnableVisualStyles();
if (args.Contains("--visual")) { Application.Run(new VisualFixture()); return; }
if (args.Contains("--foreground")) { Application.Run(new ForegroundFixture(args)); return; }
var form = new Form { Text = "app-use controlled fixture", Size = new Size(640, 460), StartPosition = FormStartPosition.CenterScreen };
var menu = new MenuStrip();
var file = new ToolStripMenuItem("Fixture");
var dialog = new ToolStripMenuItem("Open dialog");
dialog.Click += (_, _) => MessageBox.Show(form, "Controlled dialog", "app-use dialog", MessageBoxButtons.OK);
file.DropDownItems.Add(dialog); menu.Items.Add(file); form.Controls.Add(menu);
var input = new TextBox { AccessibleName = "Fixture input", Location = new Point(30, 70), Width = 240 };
var select = new ComboBox { AccessibleName = "Fixture choice", Location = new Point(30, 120), Width = 240, DropDownStyle = ComboBoxStyle.DropDownList };
select.Items.AddRange(["Alpha", "Beta"]); select.SelectedIndex = 0;
var result = new TextBox { AccessibleName = "Fixture result", Location = new Point(30, 220), Width = 400, ReadOnly = true, Text = "Pending" };
var button = new Button { AccessibleName = "Apply fixture", Text = "Apply fixture", Location = new Point(30, 170), Width = 160 };
button.Click += (_, _) => result.Text = input.Text + ":" + select.Text;
var disabled = new Button { Text = "Disabled fixture", AccessibleName = "Disabled fixture", Enabled = false, Location = new Point(300, 170), Width = 180 };
var password = new TextBox { AccessibleName = "Fixture secret", UseSystemPasswordChar = true, Text = "CONTROLLED_SECRET", Location = new Point(30, 280), Width = 240 };
var block = new Panel { AccessibleName = "Fixture blocker", BackColor = Color.DarkGray, Bounds = button.Bounds, Visible = false };
var obstruct = new CheckBox { Text = "Obstruct action", AccessibleName = "Obstruct action", Location = new Point(300, 120), Width = 180 };
obstruct.CheckedChanged += (_, _) => { block.Visible = obstruct.Checked; block.BringToFront(); };
form.Controls.AddRange([input, select, result, button, disabled, password, obstruct, block]);
Application.Run(form);

sealed class VisualFixture : Form
{
    readonly PaintedSurface surface;
    readonly TextBox result;
    readonly System.Windows.Forms.Timer timer = new() { Interval = 1500 };
    Action? delayed;
    public VisualFixture()
    {
        Text = "app-use visual fixture"; Size = new Size(640, 460); StartPosition = FormStartPosition.CenterScreen;
        AutoScaleMode = AutoScaleMode.Dpi;
        var build = new Label { Text = "app-use-visual-desktop-v1", AutoSize = true, Location = new Point(30, 15) };
        result = new TextBox { AccessibleName = "Visual result", ReadOnly = true, TabStop = false, Text = "Pending", Location = new Point(30, 230), Width = 400 };
        surface = new PaintedSurface { AccessibleName = "Painted surface", Location = new Point(30, 60), Size = new Size(460, 140) };
        surface.Activated += () => result.Text = "Painted action complete";
        var secret = new TextBox { AccessibleName = "Visual secret", UseSystemPasswordChar = true, Text = "CONTROLLED_VISUAL_SECRET", Location = new Point(30, 280), Width = 240 };
        var repaint = new Button { Text = "Arm repaint", AccessibleName = "Arm repaint", Location = new Point(30, 330), Width = 150 };
        var move = new Button { Text = "Arm move", AccessibleName = "Arm move", Location = new Point(200, 330), Width = 150 };
        var disable = new Button { Text = "Arm disable", AccessibleName = "Arm disable", Location = new Point(370, 330), Width = 150 };
        var hover = new Button { Text = "Arm hover", AccessibleName = "Arm hover", Location = new Point(30, 370), Width = 150 };
        repaint.Click += (_, _) => Arm(() => { surface.Alternate = !surface.Alternate; surface.Invalidate(); });
        move.Click += (_, _) => Arm(() => Location = new Point(Left + 30, Top + 20));
        disable.Click += (_, _) => Arm(() => { surface.Enabled = false; surface.Invalidate(); });
        hover.Click += (_, _) => surface.RepaintOnHover = true;
        timer.Tick += (_, _) => { timer.Stop(); delayed?.Invoke(); delayed = null; };
        Controls.AddRange([build, surface, result, secret, repaint, move, disable, hover]);
        Shown += (_, _) => { TopMost = true; Activate(); TopMost = false; surface.Focus(); };
        FormClosed += (_, _) => timer.Dispose();
    }
    void Arm(Action action) { delayed = action; timer.Stop(); timer.Start(); }
}

sealed class PaintedSurface : Panel
{
    public event Action? Activated;
    public bool Alternate;
    public bool RepaintOnHover;
    public PaintedSurface() { SetStyle(ControlStyles.Selectable, true); TabStop = true; DoubleBuffered = true; BackColor = Color.White; }
    RectangleF PaintedButton => new(Width * .1f, Height * .2f, Width * .4f, Height * .6f);
    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);
        var r = PaintedButton;
        using var brush = new SolidBrush(!Enabled ? Color.DarkGray : Alternate ? Color.SeaGreen : Color.RoyalBlue);
        e.Graphics.FillRectangle(brush, r);
        var cx = r.Left + r.Width / 2; var cy = r.Top + r.Height / 2;
        e.Graphics.FillPolygon(Brushes.White, [new PointF(cx - 12, cy - 18), new PointF(cx - 12, cy + 18), new PointF(cx + 18, cy)]);
    }
    protected override void OnMouseClick(MouseEventArgs e)
    {
        base.OnMouseClick(e);
        if (e.Button == MouseButtons.Left && Enabled && PaintedButton.Contains(e.Location)) Activated?.Invoke();
    }
    protected override void OnMouseEnter(EventArgs e)
    {
        base.OnMouseEnter(e);
        if (RepaintOnHover) { RepaintOnHover = false; Alternate = !Alternate; Invalidate(); }
    }
}
