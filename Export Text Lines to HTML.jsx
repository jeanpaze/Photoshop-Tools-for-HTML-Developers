 /*!
 * VERSION: 0.1.2
 * DATE: 2016-10-03
 *
 * Copyright 2016, Jean Paze, hi@jeanpaze.com
 * Released under MIT license
 *
 * KNOWN LIMITATIONS:
 * - Underline and strikethrough doesn't work.
 * - New lines must be specified with "enter" key or "shift + enter".
 *
 * ATTENTION!
 * Rasterize blend modes before run this script to preview the behavior of effects.
 */


///////////////////////////////////////////
////////////////////////////////////// VARS
#target photoshop

var mainDoc;
var mainTextLayer;
var mainTextLayerName;
var mainTextLayerBounds;

var arrTexts;
var strCSS;
var strDestinationFolder;
var strtRulerUnits;
var strtTypeUnits;


///////////////////////////////////////////
////////////////////////////////////// INIT
function init() {
    strtRulerUnits = app.preferences.rulerUnits;
    strtTypeUnits = app.preferences.typeUnits;

    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.POINTS;

    if( !documents.length ){
        alert ("There are no documents open." );
        return;
    };

    mainDoc = app.activeDocument;
    mainTextLayer = mainDoc.activeLayer;
    mainTextLayerName = mainTextLayer.name;
    mainTextLayerBounds = mainTextLayer.bounds;

    if( mainTextLayer.kind != LayerKind.TEXT ){
        alert( "Error! Select text layer." );
        return;
    };

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

    parseLines();
    saveCSSFile();

    //ALL FINISH, RESET PREFERENCES
    app.preferences.rulerUnits = strtRulerUnits;
    app.preferences.typeUnits = strtTypeUnits;

    mainTextLayer.visible = false;

    mainDoc = null;
    mainTextLayer = null;
    mainTextLayerName = null;
    mainTextLayerBounds = null;

    arrTexts = null;
    strCSS = null;
    strDestinationFolder = null;
    strtRulerUnits = null;
    strtTypeUnits = null;
};


///////////////////////////////////////////
/////////////////////////////// PARSE LINES
function parseLines() {
    var mainTextString = mainTextLayer.textItem.contents;
    var mainTextPosition = mainTextLayer.textItem.position;

    arrTexts = mainTextString.split(/[\u0003\r]/);

    var arrNewLineChar = new Array();
    var arrTextsShiftEnterChar = mainTextString.split(/[\u0003]/);
    for( var j = 0; j < arrTextsShiftEnterChar.length; j++ ){
        var arrTextsEnterChar = arrTextsShiftEnterChar[ j ].split(/[\r]/);

        for( var p = 1; p < arrTextsEnterChar.length; p++ ){
            arrNewLineChar.push( "\r" );
        };

        arrNewLineChar.push( "\u0003" );
    };

    //FEED MAIN DIV ON CSS FILE
    var idx = 1;
    strCSS = "";
    strCSS = strCSS.concat( "/* ///////////////////////////////////////// */\r/* //////////////////////////////////// HTML */\r" );
    strCSS = strCSS.concat( '                    <div id="' + mainTextLayerName + '">\r' );

    for( k = 0; k < arrTexts.length; k++ ){
        if( arrTexts[ k ] != "" && /\S/.test(arrTexts[ k ]) ){
            strCSS = strCSS.concat( '                        <div id="' + mainTextLayerName.replace( new RegExp(" ", 'g'), "-" ) + "-" + idx + '"></div>\r' );
            idx++;
        };
    };

    strCSS = strCSS.concat( '                    </div>\r\r\r' );
    strCSS = strCSS.concat( "/* ///////////////////////////////////////// */\r/* ///////////////////////////////////// CSS */\r" );
    strCSS = strCSS.concat( "#" + mainTextLayerName.replace( new RegExp(" ", 'g'), "-" ) + " {\r" );
    if( Number( mainTextLayerBounds[ 1 ] ) != 0 ) strCSS = strCSS.concat(   "    top: " + Number( mainTextLayerBounds[ 1 ] ).toString() + "px;\r" );
    if( Number( mainTextLayerBounds[ 0 ] ) != 0 ) strCSS = strCSS.concat(   "    left: " + Number( mainTextLayerBounds[ 0 ] ).toString() + "px;\r" );
    strCSS = strCSS.concat( "    width: " + ( Number( mainTextLayerBounds[ 2 ] ) - Number( mainTextLayerBounds[ 0 ] ) ).toString() + "px;\r" );
    strCSS = strCSS.concat( "    height: " + ( Number( mainTextLayerBounds[ 3 ] ) - Number( mainTextLayerBounds[ 1 ] ) ).toString() + "px;\r" );
    strCSS = strCSS.concat( "}\r\r" );

    var mainFontInfo = getFontInfo();

    idx = 1;

    //MAIN LOOP
    for( k = 0; k < arrTexts.length; k++ ){
        if( arrTexts[ k ] != "" && /\S/.test(arrTexts[ k ]) ){
            var strContent = "";

            for( m = 0; m < arrTexts.length; m++ ){
                strContent += ( m == k ) ? arrTexts[ m ] + arrNewLineChar[ m ] : arrTexts[ m ].replace(/./g, ' ') + arrNewLineChar[ m ];
            };

            var newLayer = mainTextLayer.duplicate( mainTextLayer, ElementPlacement.PLACEBEFORE );
                newLayer.name = mainTextLayerName + "-" + idx;
                newLayer.textItem.contents = strContent;

            mainDoc.activeLayer = newLayer;

            setFontInfo( mainFontInfo );

            exportLayerToPNG( newLayer, newLayer.name + ".png", strDestinationFolder );

            feedCSS( newLayer, k );

            idx++;
        };
    };
};


///////////////////////////////////////////
///////////////////////////// GET FONT INFO
function getFontInfo(){
    var ref = new ActionReference();
        ref.putEnumerated( stringIDToTypeID( "layer" ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );

    var desc = executeActionGet( ref );
    var list =  desc.getObjectValue( charIDToTypeID( "Txt " ) );
    var tsr = list.getList( charIDToTypeID( "Txtt" ) );
    var paraList = list.getList( stringIDToTypeID( "paragraphStyleRange" ) );

    return { tsr:tsr, paraList:paraList };
};


///////////////////////////////////////////
///////////////////////////// SET FONT INFO
function setFontInfo( objFontInfo ) {
    var ref = new ActionReference();
        ref.putEnumerated( stringIDToTypeID( "layer" ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );

    var desc = executeActionGet( ref );
    var list =  desc.getObjectValue( charIDToTypeID( "Txt " ) );

    var txtRef = new ActionReference();
        txtRef.putEnumerated( charIDToTypeID( "TxLr" ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );

    var action = new ActionDescriptor();
        action.putReference( charIDToTypeID( "null" ), txtRef );

    list.putList( charIDToTypeID( "Txtt" ), objFontInfo.tsr );
    list.putList( stringIDToTypeID( "paragraphStyleRange" ), objFontInfo.paraList );

    action.putObject( charIDToTypeID( "T   " ), charIDToTypeID( "TxLr" ), list );

    //REMOVE STRIKETHROUGH AND UNDERLINE - FIX: this will remove all text style :(
    // var idsetd = charIDToTypeID( "setd" );
    // var idnull = charIDToTypeID( "null" );
    // var ref121 = new ActionReference();
    // var idPrpr = charIDToTypeID( "Prpr" );
    // var idTxtS = charIDToTypeID( "TxtS" );
    // ref121.putProperty( idPrpr, idTxtS );
    // var idTxLr = charIDToTypeID( "TxLr" );
    // var idOrdn = charIDToTypeID( "Ordn" );
    // var idTrgt = charIDToTypeID( "Trgt" );
    // ref121.putEnumerated( idTxLr, idOrdn, idTrgt );
    // action.putReference( idnull, ref121 );
    // var idT = charIDToTypeID( "T   " );
    // var desc399 = new ActionDescriptor();
    // var idstrikethrough = stringIDToTypeID( "strikethrough" );
    // var idstrikethroughOff = stringIDToTypeID( "strikethroughOff" );
    // desc399.putEnumerated( idstrikethrough, idstrikethrough, idstrikethroughOff );
    // var idUndl = charIDToTypeID( "Undl" );
    // var idunderlineOff = stringIDToTypeID( "underlineOff" );
    // desc399.putEnumerated( idUndl, idUndl, idunderlineOff );
    // var idTxtS = charIDToTypeID( "TxtS" );
    // action.putObject( idT, idTxtS, desc399 );

    executeAction( charIDToTypeID( "setd" ), action, DialogModes.NO );
};


///////////////////////////////////////////
////////////////////////////////// FEED CSS
function feedCSS( newLayer, idx ) {
    var goTop = newLayer.bounds[ 1 ].toString().substr( 0, newLayer.bounds[ 1 ].toString().length - 3 ) - mainTextLayerBounds[ 1 ].toString().substr( 0, mainTextLayerBounds[ 1 ].toString().length - 3 );
    var goLeft = newLayer.bounds[ 0 ].toString().substr( 0, newLayer.bounds[ 0 ].toString().length - 3 ) - mainTextLayerBounds[ 0 ].toString().substr( 0, mainTextLayerBounds[ 0 ].toString().length - 3 );
    var goWidth = newLayer.bounds[ 2 ].toString().substr( 0,  newLayer.bounds[ 2 ].toString().length - 3 ) - newLayer.bounds[ 0 ].toString().substr( 0, newLayer.bounds[ 0 ].toString().length - 3 );
    var goHeight = newLayer.bounds[ 3 ].toString().substr( 0,  newLayer.bounds[ 3 ].toString().length - 3 ) - newLayer.bounds[ 1 ].toString().substr( 0, newLayer.bounds[ 1 ].toString().length - 3 );
    var name = newLayer.name.replace( new RegExp(" ", 'g'), "-" );
    var bgUrl = name + ".png";
    var addOnEnd = ( idx == arrTexts.length - 1 ) ? "" : "\r\r";

    strCSS = strCSS.concat( "#" + name + " {\r" );
    if( goTop != 0 ) strCSS = strCSS.concat( "    top: " + goTop + "px;\r" );
    if( goLeft != 0 ) strCSS = strCSS.concat( "    left: " + goLeft + "px;\r" );
    strCSS = strCSS.concat( "    width: " + goWidth + "px;\r" );
    strCSS = strCSS.concat( "    height: " + goHeight + "px;\r" );
    strCSS = strCSS.concat( "    background: url(" + bgUrl + ");\r" );
    strCSS = strCSS.concat( "}" + addOnEnd );
};


///////////////////////////////////////////
/////////////////////// EXPORT LAYER TO PNG
function exportLayerToPNG( layer, layerName, path ) {
    activeDocument.activeLayer = layer;
    duplicateLayer();

    activeDocument.crop( layer.bounds );

    var pngOpts = new ExportOptionsSaveForWeb;
        pngOpts.format = SaveDocumentType.PNG;
        pngOpts.PNG8 = false;
        pngOpts.transparency = true;
        pngOpts.interlaced = false;
        pngOpts.quality = 100;

    activeDocument.exportDocument( File( path +"/" + layerName.replace( new RegExp(" ", 'g'), "-" ) ), ExportType.SAVEFORWEB, pngOpts );

    app.activeDocument.close( SaveOptions.DONOTSAVECHANGES );
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
///////////////////////////// SAVE CSS FILE
function saveCSSFile(){
    var saveFile = File( strDestinationFolder + "/" + mainTextLayerName + ".css" );
    if( saveFile.exists ) saveFile.remove();
    saveFile.encoding = "UTF8";
    saveFile.open( "w" );
    saveFile.writeln( strCSS );
    saveFile.close();
    saveFile.execute();
};


init();
