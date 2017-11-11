@echo off
del ..\temp\*.*
copy ..\..\Web\Templates\SampleHand.html ..\temp\.
htmlminifier ..\temp\.
WikiPush ..\temp\SampleHand.html Template:TestSampleHand %1
