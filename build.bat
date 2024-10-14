"%MSFS_SDK%Tools\bin\fspackagetool.exe" "chrisaut-toolbar-printouts\Build\chrisaut-toolbar-printouts.xml" -nopause
xcopy /Y "chrisaut-toolbar-printouts\Build\Packages\chrisaut-toolbar-printouts\Build\chrisaut-toolbar-printouts.spb" "chrisaut-toolbar-printouts\InGamePanels"
xcopy /Y /I "chrisaut-toolbar-printouts\manifest.json" "release\chrisaut-toolbar-printouts\"
xcopy /Y /I "chrisaut-toolbar-printouts\Build\Packages\chrisaut-toolbar-printouts\Build\chrisaut-toolbar-printouts.spb" "release\chrisaut-toolbar-printouts\InGamePanels\"
xcopy /E /Y /I "chrisaut-toolbar-printouts\html_ui\*" "release\chrisaut-toolbar-printouts\html_ui\"
PowerShell -ExecutionPolicy Bypass -File "%~dp0Create-Layout.ps1"
