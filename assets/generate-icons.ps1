# Regenerates the launcher icon, adaptive-icon foreground and splash artwork.
#   powershell -ExecutionPolicy Bypass -File assets\generate-icons.ps1
#
# Japanese glyphs are written as code points rather than literal characters so
# this file stays pure ASCII — Windows PowerShell 5.1 mangles UTF-8 source
# without a BOM, which would silently turn the seal into mojibake.

Add-Type -AssemblyName System.Drawing

$OutDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$Cream   = [System.Drawing.ColorTranslator]::FromHtml("#F3ECDC")
$SealRed = [System.Drawing.ColorTranslator]::FromHtml("#BD3B28")
$Navy    = [System.Drawing.ColorTranslator]::FromHtml("#16283F")
$Gold    = [System.Drawing.ColorTranslator]::FromHtml("#B8923F")

function Text-From([int[]]$codePoints) {
  -join ($codePoints | ForEach-Object { [char]$_ })
}

$Kanji    = Text-From @(0x5DE1)                                                   # 巡
$Wordmark = Text-From @(0x770C,0x5E81,0x6240,0x5728,0x5730,0x5DE1,0x793C,0x5E33)  # 県庁所在地巡礼帳

function New-Canvas([int]$w, [int]$h, $background) {
  $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  if ($null -ne $background) { $g.Clear($background) } else { $g.Clear([System.Drawing.Color]::Transparent) }
  return @($bmp, $g)
}

# A solid seal reads far better than an outline at launcher size (48dp), so the
# disc is filled and the glyph is knocked out in cream.
function Draw-Seal($g, [single]$cx, [single]$cy, [single]$diameter) {
  $r = $diameter / 2.0

  $goldPen = New-Object System.Drawing.Pen($Gold, [single]($diameter * 0.018))
  $g.DrawEllipse($goldPen, ($cx - $r - $diameter * 0.055), ($cy - $r - $diameter * 0.055),
                 ($diameter + $diameter * 0.11), ($diameter + $diameter * 0.11))
  $goldPen.Dispose()

  $fill = New-Object System.Drawing.SolidBrush($SealRed)
  $g.FillEllipse($fill, ($cx - $r), ($cy - $r), $diameter, $diameter)
  $fill.Dispose()

  $innerPen = New-Object System.Drawing.Pen($Cream, [single]($diameter * 0.028))
  $inset = $diameter * 0.10
  $g.DrawEllipse($innerPen, ($cx - $r + $inset), ($cy - $r + $inset),
                 ($diameter - $inset * 2), ($diameter - $inset * 2))
  $innerPen.Dispose()

  $font = New-Object System.Drawing.Font("Yu Gothic UI", [single]($diameter * 0.46),
                                         [System.Drawing.FontStyle]::Bold,
                                         [System.Drawing.GraphicsUnit]::Pixel)
  $brush = New-Object System.Drawing.SolidBrush($Cream)
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = [System.Drawing.StringAlignment]::Center
  $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
  $rect = New-Object System.Drawing.RectangleF(($cx - $r), ($cy - $r), $diameter, $diameter)
  $g.DrawString($Kanji, $font, $brush, $rect, $fmt)
  $font.Dispose(); $brush.Dispose(); $fmt.Dispose()
}

function Save-Png($bmp, $g, [string]$name) {
  $g.Dispose()
  $path = Join-Path $OutDir $name
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output ("{0}  {1:N0} bytes" -f $name, (Get-Item $path).Length)
}

# --- Launcher icon: opaque, seal at ~66% so it survives a circular mask ------
$c = New-Canvas 1024 1024 $Cream
Draw-Seal $c[1] 512 512 620
Save-Png $c[0] $c[1] "icon.png"

# --- Adaptive foreground: transparent, and everything vital inside the -------
# --- centre 66% safe zone, since Android crops the outer band. --------------
$c = New-Canvas 1024 1024 $null
Draw-Seal $c[1] 512 512 520
Save-Png $c[0] $c[1] "adaptive-icon.png"

# --- Splash artwork: seal plus wordmark, transparent so the configured -------
# --- backgroundColor shows through. -----------------------------------------
$c = New-Canvas 1024 1024 $null
Draw-Seal $c[1] 512 400 460
$font = New-Object System.Drawing.Font("Yu Gothic UI", 92, [System.Drawing.FontStyle]::Bold,
                                       [System.Drawing.GraphicsUnit]::Pixel)
$brush = New-Object System.Drawing.SolidBrush($Navy)
$fmt = New-Object System.Drawing.StringFormat
$fmt.Alignment = [System.Drawing.StringAlignment]::Center
$rect = New-Object System.Drawing.RectangleF(0, 730, 1024, 160)
$c[1].DrawString($Wordmark, $font, $brush, $rect, $fmt)
$font.Dispose(); $brush.Dispose(); $fmt.Dispose()
Save-Png $c[0] $c[1] "splash-icon.png"
