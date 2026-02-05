# Create desktop shortcut for Reply Maker
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$Home\Desktop\Reply Maker.lnk")
$Shortcut.TargetPath = "$PSScriptRoot\launch.bat"
$Shortcut.WorkingDirectory = $PSScriptRoot
$Shortcut.Description = "Launch Reply Maker"
$Shortcut.Save()
Write-Host "Desktop shortcut created successfully!" -ForegroundColor Green
