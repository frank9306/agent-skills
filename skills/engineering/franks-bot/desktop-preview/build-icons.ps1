$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = $PSScriptRoot
$brand = Join-Path $root 'brand'
[IO.Directory]::CreateDirectory($brand) | Out-Null
function Brush([string]$hex) { [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml($hex)) }
function RoundPath([single]$x,[single]$y,[single]$size,[single]$radius) {
    $path = [Drawing.Drawing2D.GraphicsPath]::new()
    $d = 2*$radius
    $path.AddArc($x,$y,$d,$d,180,90)
    $path.AddArc(($x+$size-$d),$y,$d,$d,270,90)
    $path.AddArc(($x+$size-$d),($y+$size-$d),$d,$d,0,90)
    $path.AddArc($x,($y+$size-$d),$d,$d,90,90)
    $path.CloseFigure()
    $path
}
function Draw-Mark([int]$size) {
    $bitmap = [Drawing.Bitmap]::new($size,$size,[Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [Drawing.Graphics]::FromImage($bitmap)
    $g.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.ScaleTransform($size/256.0,$size/256.0)
    $navy = Brush '#11283C'
    $mint = Brush '#6DDDBA'
    $cream = Brush '#F8ECDD'
    $gold = Brush '#FFAA55'
    $corner = [Drawing.Pen]::new([Drawing.ColorTranslator]::FromHtml('#55988B'),10)
    $corner.StartCap = $corner.EndCap = [Drawing.Drawing2D.LineCap]::Round
    $tile = RoundPath 5 5 246 61
    try {
        $g.FillPath($navy,$tile)
        foreach ($s in @(@(49,86,49,49,86,49),@(170,49,207,49,207,86),@(207,170,207,207,170,207),@(86,207,49,207,49,170))) {
            $points = [Drawing.Point[]]@([Drawing.Point]::new($s[0],$s[1]),[Drawing.Point]::new($s[2],$s[3]),[Drawing.Point]::new($s[4],$s[5]))
            $g.DrawLines($corner,$points)
        }
        $g.FillEllipse($mint,70,71,39,39)
        $g.FillEllipse($mint,147,71,39,39)
        $g.FillEllipse($mint,74,79,108,104)
        $g.FillEllipse($cream,93,125,70,47)
        $g.FillEllipse($navy,96,110,12,14)
        $g.FillEllipse($navy,148,110,12,14)
        $g.FillEllipse($navy,118,130,20,13)
        $g.FillEllipse($gold,175,164,27,27)
        $g.FillEllipse($navy,183,172,11,11)
        $memory = [IO.MemoryStream]::new()
        try { $bitmap.Save($memory,[Drawing.Imaging.ImageFormat]::Png); return ,$memory.ToArray() }
        finally { $memory.Dispose() }
    } finally {
        $tile.Dispose(); $corner.Dispose(); $navy.Dispose(); $mint.Dispose()
        $cream.Dispose(); $gold.Dispose(); $g.Dispose(); $bitmap.Dispose()
    }
}
$sizes = 16,24,32,48,64,128,256
$images = @{}
foreach ($size in $sizes) { $images[$size] = Draw-Mark $size }
$png = Join-Path $brand 'franks-bot.png'
$ico = Join-Path $brand 'franks-bot.ico'
[IO.File]::WriteAllBytes($png,$images[256])
$writer = [IO.BinaryWriter]::new([IO.File]::Create($ico))
try {
    $writer.Write([uint16]0); $writer.Write([uint16]1); $writer.Write([uint16]$sizes.Count)
    $offset = 6+16*$sizes.Count
    foreach ($size in $sizes) {
        $writer.Write([byte]($size % 256)); $writer.Write([byte]($size % 256))
        $writer.Write([uint16]0); $writer.Write([uint16]1); $writer.Write([uint16]32)
        $writer.Write([uint32]$images[$size].Length); $writer.Write([uint32]$offset)
        $offset += $images[$size].Length
    }
    foreach ($size in $sizes) { $writer.Write([byte[]]$images[$size]) }
} finally { $writer.Dispose() }
Copy-Item -LiteralPath $png -Destination (Join-Path $root 'cmd/player/icon.png') -Force
[IO.Directory]::CreateDirectory((Join-Path $root 'ui/public')) | Out-Null
Copy-Item -LiteralPath $png -Destination (Join-Path $root 'ui/public/franks-bot.png') -Force
Push-Location $brand
try {
    $resource = '1 ICON "franks-bot.ico"'
    foreach ($entry in 'player','source') {
        $resource | windres --input-format=rc --output-format=coff --target=pe-x86-64 -o "../cmd/$entry/icon_windows_amd64.syso"
        if ($LASTEXITCODE) { throw "windres failed for $entry" }
    }
} finally { Pop-Location }
