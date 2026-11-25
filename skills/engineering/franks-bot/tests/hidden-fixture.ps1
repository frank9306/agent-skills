$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
$form = [Windows.Forms.Form]::new()
$form.Text = 'Franks Bot Hidden Fixture'
$form.Size = [Drawing.Size]::new(420, 280)
$form.BackColor = [Drawing.Color]::White
$entry = [Windows.Forms.TextBox]::new()
$entry.AccessibleName = 'Sample text'
$entry.Location = [Drawing.Point]::new(25, 20)
$entry.Width = 280
$form.Controls.Add($entry)
$status = [Windows.Forms.Label]::new()
$status.Text = 'Waiting'
$status.Location = [Drawing.Point]::new(25, 65)
$status.AutoSize = $true
$form.Controls.Add($status)
$panel = [Windows.Forms.Panel]::new()
$panel.Bounds = [Drawing.Rectangle]::new(25, 110, 180, 75)
$panel.BackColor = [Drawing.Color]::RoyalBlue
$panel.add_Paint({
    param($sender, $eventArgs)
    $eventArgs.Graphics.DrawString('CONFIRM', $form.Font, [Drawing.Brushes]::White, 45, 25)
})
$panel.add_MouseUp({ $status.Text = 'Confirmed' })
$form.Controls.Add($panel)
[Windows.Forms.Application]::Run($form)
