# Regenerates the two graphics Google Play requires in the store listing:
#   - play-icon-512.png       512x512 app icon
#   - feature-graphic-1024x500.png
#
#   powershell -ExecutionPolicy Bypass -File assets\generate-store-assets.ps1
#
# Same visual language as generate-icons.ps1 (which makes the in-app launcher
# icon and splash), kept as a separate script because these two are store
# artifacts only and are never bundled into the app.
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
$Muted   = [System.Drawing.ColorTranslator]::FromHtml("#5C544A")

function Text-From([int[]]$codePoints) {
  -join ($codePoints | ForEach-Object { [char]$_ })
}

$Kanji    = Text-From @(0x5DE1)                                                   # 巡
$Wordmark = Text-From @(0x770C,0x5E81,0x6240,0x5728,0x5730,0x5DE1,0x793C,0x5E33)  # 県庁所在地巡礼帳
# 47都道府県の県庁所在地をめぐるスタンプ帳
$Tagline  = Text-From @(0x0034,0x0037,0x90FD,0x9053,0x5E9C,0x770C,0x306E,0x770C,0x5E81,0x6240,0x5728,0x5730,0x3092,
                        0x3081,0x3050,0x308B,0x30B9,0x30BF,0x30F3,0x30D7,0x5E33)

function New-Canvas([int]$w, [int]$h, $background) {
  $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  if ($null -ne $background) { $g.Clear($background) } else { $g.Clear([System.Drawing.Color]::Transparent) }
  return @($bmp, $g)
}

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

# --- Play store icon: 512x512, opaque. Play renders it rounded itself, so the
# --- seal stays well inside the square.
$c = New-Canvas 512 512 $Cream
Draw-Seal $c[1] 256 256 310
Save-Png $c[0] $c[1] "play-icon-512.png"

# --- Feature graphic: 1024x500. Shown at the top of the store listing and
# --- often cropped on the sides, so the seal and wordmark stay centred.
$c = New-Canvas 1024 500 $Cream
$g = $c[1]

Draw-Seal $g 250 250 250

# The wordmark is 8 full-width glyphs, so the box has to fit 8 * fontSize
# plus slack — at 76px it overflowed and Windows silently clipped the last
# two characters, printing a truncated title.
$fontTitle = New-Object System.Drawing.Font("Yu Gothic UI", 64, [System.Drawing.FontStyle]::Bold,
                                            [System.Drawing.GraphicsUnit]::Pixel)
$brushTitle = New-Object System.Drawing.SolidBrush($Navy)
$fmtLeft = New-Object System.Drawing.StringFormat
$fmtLeft.Alignment = [System.Drawing.StringAlignment]::Near
$fmtLeft.LineAlignment = [System.Drawing.StringAlignment]::Center
$fmtLeft.FormatFlags = [System.Drawing.StringFormatFlags]::NoWrap
$g.DrawString($Wordmark, $fontTitle, $brushTitle,
              (New-Object System.Drawing.RectangleF(420, 172, 590, 90)), $fmtLeft)

$rulePen = New-Object System.Drawing.Pen($Gold, 3)
$g.DrawLine($rulePen, 422, 278, 700, 278)
$rulePen.Dispose()

$fontTag = New-Object System.Drawing.Font("Yu Gothic UI", 25, [System.Drawing.FontStyle]::Regular,
                                          [System.Drawing.GraphicsUnit]::Pixel)
$brushTag = New-Object System.Drawing.SolidBrush($Muted)
$g.DrawString($Tagline, $fontTag, $brushTag,
              (New-Object System.Drawing.RectangleF(422, 296, 600, 50)), $fmtLeft)

$fontTitle.Dispose(); $brushTitle.Dispose(); $fontTag.Dispose(); $brushTag.Dispose(); $fmtLeft.Dispose()
Save-Png $c[0] $g "feature-graphic-1024x500.png"
