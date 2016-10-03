 /*!
 * VERSION: 0.1.2
 * DATE: 2016-10-03
 *
 * Copyright 2016, Jean Paze, hi@jeanpaze.com
 * Released under MIT license
 *
 * ATTENTION!
 * Need at least 1 vertical and 1 horizontal guide.
 */


///////////////////////////////////////////
////////////////////////////////////// VARS
#target photoshop

var mainDoc;

var strCSS;
var strHTML;

var strDestinationFolder;

var strtRulerUnits;
var strtTypeUnits;

var currentItem;


///////////////////////////////////////////
////////////////////////////////////// INIT
function init() {
    strtRulerUnits = app.preferences.rulerUnits;
    strtTypeUnits = app.preferences.typeUnits;

    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.POINTS;

    app.displayDialogs = DialogModes.NO;

    currentItem = 1;

    if( !documents.length ){
        alert ("There are no documents open." );
        return;
    };

    mainDoc = app.activeDocument;

    //CONFIG FOLDER
    var prevExport = confirm( "Same folder of previous export?" );

    if( prevExport ) {
        var cacheFile = File( app.path + "/Presets/Scripts/_cache-Jean-Paze-Scripts.txt" );

        if( !cacheFile.exists ){
            alert( "Previous export folder doesn't exists. Choose new folder." );

            setDestinationFolder();
            processScript();
            return;
        };

        cacheFile.open( "r" );
        var strCacheUrl = cacheFile.read();
        cacheFile.close();

        strDestinationFolder = Folder( strCacheUrl.substr( 0, strCacheUrl.length - 1 ) );

        if( !strDestinationFolder.exists ){
            alert( "Previous export folder doesn't exists. Choose new folder." );

            setDestinationFolder();
            processScript();
            return;
        };
    } else {
        setDestinationFolder();
    };

    processScript();
};


///////////////////////////////////////////
//////////////////// SET DESTINATION FOLDER
function setDestinationFolder(){
    strDestinationFolder = Folder( mainDoc.path ).selectDlg();

    if( strDestinationFolder == null ) {
        alert( "Destination Folder not selected." );
        return;
    };

    //SAVE CACHE FILE
    var saveFile = File( app.path + "/Presets/Scripts/_cache-Jean-Paze-Scripts.txt" );
    if( saveFile.exists ) saveFile.remove();
    saveFile.open( "w" );
    saveFile.writeln( strDestinationFolder );
    saveFile.close();
};


///////////////////////////////////////////
//////////////////////////// PROCESS SCRIPT
function processScript() {
    if( strDestinationFolder == null ) return;

    parseByGuides();
    saveCSSFile();

    //ALL FINISH, RESET PREFERENCES
    app.preferences.rulerUnits = strtRulerUnits;
    app.preferences.typeUnits = strtTypeUnits;

    mainDoc = null;

    strCSS = null;
    strHTML = null;

    strDestinationFolder = null;

    strtRulerUnits = null;
    strtTypeUnits = null;

    currentItem = null;
};


///////////////////////////////////////////
/////////////////////////// PARSE BY GUIDES
function parseByGuides() {
    var arrGuides = getGuides();

    for( var i = 0; i < arrGuides[ 0 ].length + 1; i++ ){// horizontal guides
    	var top = ( i == 0 ) ? 0 : arrGuides[ 0 ][ i - 1 ];
    		top = Math.round( top );
    	var bottom = ( i == 0 ) ? arrGuides[ 0 ][ 0 ] : ( ( arrGuides[ 0 ][ i ] ) ? arrGuides[ 0 ][ i ] : mainDoc.height );
    		bottom = Math.round( bottom );

    	for( var j = 0; j < arrGuides[ 1 ].length + 1; j++ ){// vertical guides
			var left = ( j == 0 ) ? 0 : arrGuides[ 1 ][ j - 1 ];
				left = Math.round( left );
			var right = ( j == 0 ) ? arrGuides[ 1 ][ 0 ] : ( ( arrGuides[ 1 ][ j ] ) ? arrGuides[ 1 ][ j ] : mainDoc.width );
				right = Math.round( right );

			var selectArea = [ [left,top], [right,top], [right,bottom], [left,bottom], [left,top] ];

			// duplicate layer to new doc and crop area
		    duplicateLayer();
		    app.activeDocument.selection.select( selectArea );
		    activeDocument.crop( app.activeDocument.selection.bounds );

		    // check full transparency
		    var onlyTransparent = isAreaEmpty( selectArea );

		    // check if has transparency
		    selectTransparency();

		    var layerOpacity = Math.floor( activeDocument.activeLayer.opacity );
		    var hasTransparency = true;

		    try{
		        var sBnds = app.activeDocument.selection.bounds;
		    }catch(e){
		        hasTransparency = false;
		    };

		    hasTransparency = ( layerOpacity != 100 ) ? true : hasTransparency;

		    app.activeDocument.selection.deselect();

			//alert( "top: " + top + " - bottom: " + bottom + " - left: " + left + " - right: " + right + " - onlyTransparent: " + onlyTransparent + " - hasTransparency: " + hasTransparency );

			// export layer if has some visible pixel
			if( !onlyTransparent ) {
				// save image
				var fileNameParent = activeDocument.activeLayer.name.replace( new RegExp(" ", 'g'), "-" );
				var fileName = fileNameParent + "-" + currentItem;
				var extension = ( hasTransparency ) ? ".png" : ".jpg";

			    var exportOpts = new ExportOptionsSaveForWeb();
			        exportOpts.format = ( hasTransparency ) ? SaveDocumentType.PNG : SaveDocumentType.JPEG;

		        // PNG ONLY
		        if( hasTransparency ) exportOpts.PNG8 = false;
		        if( hasTransparency ) exportOpts.transparency = true;

		        // JPG ONLY
		        if( !hasTransparency ) exportOpts.includeProfile = false;
		        if( !hasTransparency ) exportOpts.optimized = true;

		        // ALL
		        exportOpts.interlaced = false;
		        exportOpts.quality = ( hasTransparency ) ? 100 : 80;

			    activeDocument.exportDocument( File( strDestinationFolder +"/" + fileName + extension ), ExportType.SAVEFORWEB, exportOpts );

			    // feed css + html (on css file)
				feedCSS( { top:top, bottom:bottom, left:left, right:right, name:fileName, nameParent:fileNameParent, extension:extension, currentItem:currentItem } );

			    currentItem++;
			};


			app.activeDocument.close( SaveOptions.DONOTSAVECHANGES );
	    };
    };
};


///////////////////////////////////////////
//////////////////////////////// GET GUIDES
function getGuides(){
    var i, l;
    var g, d;
    var arrGuides = [[],[]];

    for( i=0,l=mainDoc.guides.length; i < l; i++){
        g = mainDoc.guides[ i ];
        d = ( g.direction === Direction.HORIZONTAL ) ? 0 : 1;
        arrGuides[ d ].push( parseFloat( g.coordinate )+0 );
    };

    //sort
    for( d = 0; d < 2; d++ ){
        if( arrGuides[ d ].length ){
            arrGuides[ d ].sort( function( a, b ){ return a - b; } );
        };
    };

    return arrGuides;
};


///////////////////////////////////////////
/////////////////////////// DUPLICATE LAYER
function duplicateLayer() {
    var desc143 = new ActionDescriptor();
    var ref73 = new ActionReference();
    ref73.putClass( charIDToTypeID('Dcmn') );
    desc143.putReference( charIDToTypeID('null'), ref73 );
    desc143.putString( charIDToTypeID('Nm  '), activeDocument.activeLayer.name );
    var ref74 = new ActionReference();
    ref74.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
    desc143.putReference( charIDToTypeID('Usng'), ref74 );
    executeAction( charIDToTypeID('Mk  '), desc143, DialogModes.NO );
};


///////////////////////////////////////////
///////////////////////////// IS AREA EMPTY
function isAreaEmpty( selectionArea ) {
	var selectionArea = [ [0, 0], [app.activeDocument.width, 0], [app.activeDocument.width, app.activeDocument.height], [0, app.activeDocument.height] ];
	var selection = app.activeDocument.selection;
		selection.select( selectionArea );

	try {
		selection.copy();
	} catch (e) {
		return true;
	} finally {
		selection.deselect();
	}

	return false;
};


///////////////////////////////////////////
/////////////////////// SELECT TRANSPARENCY
function selectTransparency() {
    var desc52 = new ActionDescriptor();
    var ref47 = new ActionReference();
    ref47.putProperty( charIDToTypeID('Chnl'), charIDToTypeID('fsel') );
    desc52.putReference( charIDToTypeID('null'), ref47 );
    var ref48 = new ActionReference();
    ref48.putEnumerated( charIDToTypeID('Chnl'), charIDToTypeID('Chnl'), charIDToTypeID('Trsp') );
    desc52.putReference( charIDToTypeID('T   '), ref48 );
    desc52.putBoolean( charIDToTypeID('Invr'), true );
    try{
        executeAction( charIDToTypeID('setd'), desc52, DialogModes.NO );
    }catch(e){}
};


///////////////////////////////////////////
////////////////////////////////// FEED CSS
function feedCSS( objConfig ) {
	// first time
	if( objConfig.currentItem == 1 ) {
		strHTML = "";
		strHTML = strHTML.concat( "/* ///////////////////////////////////////// */\r/* //////////////////////////////////// HTML */\r" );
		strHTML = strHTML.concat( '                    <div id="' + objConfig.nameParent + '">\r' );

		strCSS = "";
		strCSS = strCSS.concat( '                    </div>\r\r\r' );
	    strCSS = strCSS.concat( "/* ///////////////////////////////////////// */\r/* ///////////////////////////////////// CSS */\r" );
	};

	// set html
	strHTML = strHTML.concat( '                        <div id="' + objConfig.name + '"></div>\r' );

	// set css
    strCSS = strCSS.concat( "#" + objConfig.name + " {\r" );
    if( objConfig.top != 0 ) strCSS = strCSS.concat( "    top: " + objConfig.top + "px;\r" );
    if( objConfig.left != 0 ) strCSS = strCSS.concat( "    left: " + objConfig.left + "px;\r" );
    strCSS = strCSS.concat( "    width: " + ( objConfig.right - objConfig.left ) + "px;\r" );
    strCSS = strCSS.concat( "    height: " + ( objConfig.bottom - objConfig.top ) + "px;\r" );
    strCSS = strCSS.concat( "    background: url(" + objConfig.name + objConfig.extension + ");\r" );
    strCSS = strCSS.concat( "}" + "\r\r" );
};


///////////////////////////////////////////
///////////////////////////// SAVE CSS FILE
function saveCSSFile(){
	if( currentItem == 1 ) return;

    var saveFile = File( strDestinationFolder + "/" + mainDoc.activeLayer.name + ".css" );
    if( saveFile.exists ) saveFile.remove();

    saveFile.encoding = "UTF8";
    saveFile.open( "w" );
    saveFile.writeln( strHTML + strCSS );
    saveFile.close();
    saveFile.execute();
};


init();
