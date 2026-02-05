$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$Home\Desktop\Reply Maker.lnk")
$Shortcut.TargetPath = "$PSScriptRoot\launch-simple.bat"
$Shortcut.WorkingDirectory = $PSScriptRoot
$Shortcut.Description = "Launch Reply Maker"
$Shortcut.Save()
Write-Host "Desktop shortcut updated successfully!" -ForegroundColor Green
