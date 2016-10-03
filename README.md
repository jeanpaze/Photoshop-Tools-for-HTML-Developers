# Photoshop Tools for HTML Developers

![Art](/presentation/art.jpg?raw=true)

Designed for HTML developers, this is a bundle of Photoshop scripts that make your life easier. Contains:

<b>Export Layers to HTML</b>

* Allows you to export layers in your document as individual files and generate a css file with positions of each image.
* Layer content will not crop according to document edges. May result in negative position.


<b>Export Text Lines to HTML</b>

* This script will split each line of your text layer and export them. When finished, will generate a css file with positions of each layer.
* Layer content will not crop according to document edges. May result in negative position.
* Known limitations: Underline and strikethrough doesn't work. New lines must be specified with "enter" key or "shift + enter".


<b>Export Sliced Layers to HTML</b>

* With this script you can create Photoshop guides that will used to split the selected layer. When finished, will generate a css file with positions of each layer.
* Need at least 1 vertical and 1 horizontal guide.

Click on image below and see how to use:
[![How to use](https://i.vimeocdn.com/video/595096507_640.webp)](https://vimeo.com/185369026)

All scripts detect transparent pixels on image to switch between PNG or JPG and delivers a friendly lightweight image file.

At the end of script, the .css file will open with your default program.

Installation
-----

<b>Option 1</b> (recommended):

1. [Download as zip](https://github.com/jeanpaze/Photoshop-Tools-for-HTML-Developers/archive/master.zip).<br>
2. Copy Scripts (.jsx) into Photoshop Scripts folder:
    * Windows (32 bit): `C:\Program Files (x86)\Adobe Photoshop [VERSION]\Presets\Scripts\`
    * Windows (64 bit): `C:\Program Files\Adobe Photoshop [VERSION]\Presets\Scripts\`
    * Mac: `/Applications/Adobe Photoshop [VERSION]/Presets/Scripts/`
3. Open/Reopen Photoshop.

<b>Option 2</b>:

1. [Download as zip](https://github.com/jeanpaze/Photoshop-Tools-for-HTML-Developers/archive/master.zip).<br>
2. Open/Reopen Photoshop.
3. File -> Scripts -> Browse.
4. Locate the script (.jsx file from downloaded zip) and open it.

<b>keyboard shortcut</b>:<br>
You can make a keyboard shortcut to run automatically. Here's how:

1. Choose Edit > Keyboard Shortcuts.
2. Highlight "Export Layers to HTML" under File > Scripts.
3. Click under the 'Shortcut' column and type the [F3] key (or whatever you want).
4. If there are conflicts, choose 'Accept & Continue', otherwise choose 'Accept'.

Release History
-----

* 0.1.2 (10.03.2016)
    * Bug fix

* 0.1.1 (07.05.2016)
    * Comments changed
    * Idents fix

* 0.1.0 (01.19.2016)
    * Initial Release

Support
-------

This script has been tested on Photoshop CC 2015 on Windows.

Please use this script at your own risk. I'm not responsible for any lost data or damaged PSDs so always make a backup.

To suggest a feature, report a bug or general discussion: https://github.com/jeanpaze/Photoshop-Tools-for-HTML-Developers/issues.

[References](https://github.com/jeanpaze/Photoshop-Tools-for-HTML-Developers/blob/master/References.txt).

Thanks
------

© 2016 [Jean Paze](http://jeanpaze.com/). Released under the [MIT License](LICENSE).

> Jean Paze [jeanpaze.com](http://jeanpaze.com/) <br>
> CodePen [codepen.io/jeanpaze](http://codepen.io/jeanpaze/) <br>
> Twitter [@jpaze](http://twitter.com/jpaze) <br>
> Facebook [facebook.com/jeanpaze](https://www.facebook.com/jeanpaze)
