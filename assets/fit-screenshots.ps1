# Play Console の掲載要件にスクリーンショットを合わせる。
#
# Google の要件（サポート記事 9866151）:
#   - JPEG または 24 ビット PNG（アルファなし）
#   - 各辺 320〜3840 px
#   - 長辺を短辺の 2 倍以上にできない
#
# 最近の Android は 20:9 前後の縦長画面なので、撮ったままだと比率が 2.2:1
# ほどになり最後の条件で弾かれる。切り取ると画面の内容が欠けるので、
# 短辺側に余白を足して比率だけを下げる。余白はアプリの地の色（和紙色）に
# するため、額装したように見えて不自然さがない。
#
# あわせて 24 ビット PNG に変換する。Android のスクリーンショットは
# 32bpp ARGB で保存されることがあり、アルファ付きは要件外になるため。
#
#   使い方: powershell -ExecutionPolicy Bypass -File fit-screenshots.ps1 <入力フォルダ> [出力フォルダ]
#
# 入力は変更しない。出力フォルダに `play-01.png` … の連番で書き出す。

param(
  [Parameter(Mandatory = $true)][string]$InputDir,
  [string]$OutputDir = ""
)

Add-Type -AssemblyName System.Drawing

if ([string]::IsNullOrEmpty($OutputDir)) { $OutputDir = Join-Path $InputDir "play-ready" }
if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir | Out-Null }

# 比率の上限は 2.0 未満。丸めの影響を避けたいので 1.94 を狙う。
$TargetRatio = 1.94
# アプリの背景色（和紙色 #F3ECDC）
$Pad = [System.Drawing.Color]::FromArgb(243, 236, 220)

$files = Get-ChildItem -Path $InputDir -File | Where-Object { $_.Extension -match '^\.(png|jpg|jpeg)$' } | Sort-Object Name
if ($files.Count -eq 0) { Write-Output "画像が見つかりません: $InputDir"; exit 1 }

Write-Output "入力: $($files.Count) 件"
Write-Output ""

$i = 0
foreach ($f in $files) {
  $i++
  $src = [System.Drawing.Bitmap]::FromFile($f.FullName)
  $w = $src.Width; $h = $src.Height

  # 長辺 / 短辺 が 2 以上なら、短辺を広げて比率を下げる
  $newW = $w; $newH = $h
  if ($h -ge $w) {
    if ($h / $w -ge 2.0) { $newW = [int][Math]::Ceiling($h / $TargetRatio) }
  } else {
    if ($w / $h -ge 2.0) { $newH = [int][Math]::Ceiling($w / $TargetRatio) }
  }

  # 各辺 320〜3840 に収まっているかも確認する
  $warn = ""
  foreach ($side in @($newW, $newH)) {
    if ($side -lt 320) { $warn = " [!] 辺が320px未満" }
    if ($side -gt 3840) { $warn = " [!] 辺が3840px超" }
  }

  $dst = New-Object System.Drawing.Bitmap($newW, $newH, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($dst)
  $g.Clear($Pad)
  # 拡大縮小はしない。元の画素をそのまま中央に置く。
  $g.DrawImageUnscaled($src, [int](($newW - $w) / 2), [int](($newH - $h) / 2))
  $g.Dispose()

  $outName = "play-{0:D2}.png" -f $i
  $outPath = Join-Path $OutputDir $outName
  $dst.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $ratioBefore = [Math]::Round([Math]::Max($w, $h) / [Math]::Min($w, $h), 3)
  $ratioAfter = [Math]::Round([Math]::Max($newW, $newH) / [Math]::Min($newW, $newH), 3)
  $sizeKB = [Math]::Round((Get-Item $outPath).Length / 1KB)
  Write-Output ("  {0} : {1}x{2} ({3}:1, {4}) -> {5} : {6}x{7} ({8}:1, 24bit) {9}KB{10}" -f `
    $f.Name, $w, $h, $ratioBefore, $src.PixelFormat, $outName, $newW, $newH, $ratioAfter, $sizeKB, $warn)

  $dst.Dispose(); $src.Dispose()
}

Write-Output ""
Write-Output "出力先: $OutputDir"
