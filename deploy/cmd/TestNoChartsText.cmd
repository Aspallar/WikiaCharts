@echo off
del ..\temp\*.*
copy ..\..\Web\Templates\NoChartsText.html ..\temp\.
htmlminifier ..\temp\.
WikiPush ..\temp\NoChartsText.html Template:TestNoChartsText %1
