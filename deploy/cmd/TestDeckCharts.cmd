@echo off
del ..\temp\*.*
copy ..\..\Web\Templates\DeckCharts.html ..\temp\.
htmlminifier ..\temp\.
WikiPush ..\temp\DeckCharts.html Template:TestDeckCharts %1
