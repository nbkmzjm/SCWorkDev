@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\node_modules\npm-windows-upgrade-portable\bin\npm-windows-upgrade" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\node_modules\npm-windows-upgrade-portable\bin\npm-windows-upgrade" %*
)