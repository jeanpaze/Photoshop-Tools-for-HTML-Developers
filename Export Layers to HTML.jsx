 /*!
 * VERSION: 0.1.2
 * DATE: 2016-10-03
 *
 * Copyright 2016, Jean Paze, hi@jeanpaze.com
 * Released under MIT license
 *
 * ATTENTION!
 * Layer content will not crop according to document edges. May result in negative position.
 */


///////////////////////////////////////////
////////////////////////////////////// VARS
#target photoshop

var mainDoc;
var arrActiveLayers;

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

    arrActiveLayers = new Array();

    var arrActiveLayersIdx = getSelectedLayersIdx();

    for( var i = 0; i < arrActiveLayersIdx.length; i++) {
        makeActiveByIndex( arrActiveLayersIdx[ i ], true );
        arrActiveLayers.push( activeDocument.activeLayer );
    };

    if( !arrActiveLayers.length ){
        alert( "Select layers to export." );
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

    exportAssets();
    saveCSSFile();

    //ALL FINISH, RESET PREFERENCES
    app.preferences.rulerUnits = strtRulerUnits;
    app.preferences.typeUnits = strtTypeUnits;

    mainDoc = null;
    arrActiveLayers = null;

    strCSS = null;
    strDestinationFolder = null;
    strtRulerUnits = null;
    strtTypeUnits = null;
};


///////////////////////////////////////////
///////////////////////////// EXPORT ASSETS
function exportAssets() {
	strCSS = "";
    strCSS = strCSS.concat( "/* ///////////////////////////////////////// */\r/* //////////////////////////////////// HTML */\r" );

	var lenActiveLayers = arrActiveLayers.length;
	var i;

    for( i = 0; i < lenActiveLayers; i++ ){
		strCSS = strCSS.concat( '                    <div id="' + arrActiveLayers[ i ].name.replace( new RegExp(" ", 'g'), "-" ) + '"></div>\r' );
	};

	strCSS = strCSS.concat( '\r\r' );
	strCSS = strCSS.concat( "/* ///////////////////////////////////////// */\r/* ///////////////////////////////////// CSS */\r" );

	for( i = 0; i < lenActiveLayers; i++ ){
		var layer = arrActiveLayers[ i ];

        var extension = exportLayer( layer, strDestinationFolder );

        feedCSS( layer, i, extension );
	};
};


///////////////////////////////////////////
////////////////////////////////// FEED CSS
function feedCSS( layer, idx, extension ) {
    var goTop =  Number( layer.bounds[ 1 ] ).toString();
    var goLeft = Number( layer.bounds[ 0 ] ).toString();
    var goWidth = Number( layer.bounds[ 2 ] ).toString() - Number( layer.bounds[ 0 ] ).toString();
    var goHeight = Number( layer.bounds[ 3 ] ).toString() - Number( layer.bounds[ 1 ] ).toString();
    var name = layer.name.replace( new RegExp(" ", 'g'), "-" );
    var bgUrl = name + extension;
    var addOnEnd = ( idx == arrActiveLayers.length - 1 ) ? "" : "\r\r";

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
function exportLayer( layer, path ) {
    activeDocument.activeLayer = layer;
    duplicateLayer();

    activeDocument.crop( layer.bounds );

    if( layer.typename =="LayerSet" ){
        activeDocument.mergeVisibleLayers();
    };

    selectTransparency();

    var layerOpacity = Math.floor( activeDocument.activeLayer.opacity );
    var hasTransparency = true;

    try{
        var sBnds = app.activeDocument.selection.bounds;
    }catch(e){
        hasTransparency = false;
    };

    hasTransparency = ( layerOpacity != 100 ) ? true : hasTransparency;

    var extension = ( hasTransparency ) ? ".png" : ".jpg";

    var exportOpts = new ExportOptionsSaveForWeb();
        exportOpts.format = ( hasTransparency ) ? SaveDocumentType.PNG : SaveDocumentType.JPEG;

        //PNG ONLY
        if( hasTransparency ) exportOpts.PNG8 = false;
        if( hasTransparency ) exportOpts.transparency = true;

        //JPG ONLY
        if( !hasTransparency ) exportOpts.includeProfile = false;
        if( !hasTransparency ) exportOpts.optimized = true;

        //ALL
        exportOpts.interlaced = false;
        exportOpts.quality = ( hasTransparency ) ? 100 : 80;

    activeDocument.exportDocument( File( path +"/" + layer.name.replace( new RegExp(" ", 'g'), "-" ) + extension ), ExportType.SAVEFORWEB, exportOpts );

    app.activeDocument.close( SaveOptions.DONOTSAVECHANGES );

    return extension;
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
	var filename = ( arrActiveLayers.length == 1 ) ? arrActiveLayers[ 0 ].name : "mixed_layers_" + generateQuickGuid();

    var saveFile = File( strDestinationFolder + "/" + filename + ".css" );
    if( saveFile.exists ) saveFile.remove();
    saveFile.encoding = "UTF8";
    saveFile.open( "w" );
    saveFile.writeln( strCSS );
    saveFile.close();
    saveFile.execute();
};


///////////////////////////////////////////
///////////////// GET SELECTED LAYERS INDEX
function getSelectedLayersIdx(){
    var selectedLayers = new Array();
    var ref = new ActionReference();

    ref.putEnumerated( charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );

    var desc = executeActionGet(ref);

    if( desc.hasKey( stringIDToTypeID( 'targetLayers' ) ) ){
        desc = desc.getList( stringIDToTypeID( 'targetLayers' ));
        var c = desc.count;

        for( var i = 0; i < c; i++ ){
            try{
                activeDocument.backgroundLayer;
                selectedLayers.push(  desc.getReference( i ).getIndex() );
            }catch(e){
                selectedLayers.push(  desc.getReference( i ).getIndex()+1 );
            };
        };
    }else{
        var ref = new ActionReference();
            ref.putProperty( charIDToTypeID("Prpr") , charIDToTypeID( "ItmI" ));
            ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );

        try{
            activeDocument.backgroundLayer;
            selectedLayers.push( executeActionGet(ref).getInteger(charIDToTypeID( "ItmI" ))-1);
        }catch(e){
            selectedLayers.push( executeActionGet(ref).getInteger(charIDToTypeID( "ItmI" )));
        };
    };

    return selectedLayers;
};


///////////////////////////////////////////
////////////////////// MAKE ACTIVE BY INDEX
function makeActiveByIndex( idx, visible ){
    if( idx.constructor != Array ) idx = [ idx ];

    for( var i = 0; i < idx.length; i++ ){
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putIndex( charIDToTypeID( 'Lyr ' ), idx[ i ] )
        desc.putReference( charIDToTypeID( 'null' ), ref );

        if( i > 0 ) {
            var idselectionModifier = stringIDToTypeID( 'selectionModifier' );
            var idselectionModifierType = stringIDToTypeID( 'selectionModifierType' );
            var idaddToSelection = stringIDToTypeID( 'addToSelection' );
            desc.putEnumerated( idselectionModifier, idselectionModifierType, idaddToSelection );
        };

        desc.putBoolean( charIDToTypeID( 'MkVs' ), visible );
        executeAction( charIDToTypeID( 'slct' ), desc, DialogModes.NO );
    };
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
/////////////////////// GENERATE QUICK GUID
function generateQuickGuid() {
    var d = new Date().getTime();
    return Math.random().toString().substr(2, 4) + d.toString().substr(-4, 4);
};


init();
