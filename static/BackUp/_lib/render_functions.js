/* Renderfunctions for GUI
 * Communications functions node.js server applications
 * foundamental jQuery stuff
 */

var camera, scene, renderer;
var geometry, material, mesh;
var scenePlayerLeft;
var scenePlayerRight;

//global vars
var playerRadius = 15;
var tableHeight = 10;
var tableLegLength = 60;
var tableWidth = 300;

var bumpingHeight = 10;




this.de2ra = function(degree)   { return degree*(Math.PI/180); }

function init_scene() {

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000 );
    camera.position.z = 300;
    
    // create a point light
    var pointLight = new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    
    
    //link player model
    this.playerLeft.model = createPlayerModel( null , 'left' );  
    this.playerLeft.scene = new THREE.Scene();
    this.playerLeft.scene.add( this.playerLeft.model );
    this.playerLeft.scene.add(pointLight);
    
    this.playerRight.model = createPlayerModel( null , 'right' ); 
    this.playerRight.scene = new THREE.Scene();
    this.playerRight.scene.add( this.playerRight.model );
    this.playerRight.scene.add(pointLight);
    
    
    sceneTable = new THREE.Scene();
    sceneTable.add(pointLight);
    
    var table = createTable();
    sceneTable.add( table );
    
    var tableLeftLeg = createTableLeg('left');
    sceneTable.add( tableLeftLeg );
    
    var tableRightLeg = createTableLeg('right');
    sceneTable.add( tableRightLeg );

    rendererTable = new THREE.CanvasRenderer();
    rendererTable.setSize( window.innerWidth, window.innerHeight );
    
    this.playerRight.render = new THREE.CanvasRenderer();
    this.playerRight.render.setSize( window.innerWidth, window.innerHeight );
    
    this.playerLeft.render = new THREE.CanvasRenderer();
    this.playerLeft.render.setSize( window.innerWidth, window.innerHeight );
    
    $('#table').append( rendererTable.domElement );
    $('#playerRight').append( this.playerRight.render.domElement );
    $('#playerLeft').append( this.playerLeft.render.domElement );
    
    rendererTable.render( sceneTable, camera );
    this.playerLeft.render.render( this.playerLeft.scene, camera );
    this.playerRight.render.render( this.playerRight.scene, camera );
    
}


/*
 * 
 * \params _playerSide (left || right )
 * 
 */

function createTable() {
      
  var sphereMaterial = new THREE.MeshLambertMaterial( { color: 0x7E4C36 } );
  var table = new THREE.CubeGeometry( tableWidth, tableHeight, 50 );
  var tableMeshUp = new THREE.Mesh( table , sphereMaterial );
   
  tableMeshUp.position.y = -( playerRadius + ( playerRadius - tableHeight ) );
  tableMeshUp.position.z = -30;
  
  return tableMeshUp;
}

/*
 * \param type = (left || right)
 */
function createTableLeg( type ) {
  
  var sphereMaterial = new THREE.MeshLambertMaterial( { color: 0x7E4C36 } );
  var tableLeg = new THREE.CubeGeometry( tableLegLength, (tableHeight/2) , 50 );
  var tableLegMeshUp = new THREE.Mesh( tableLeg , sphereMaterial );
   
  tableLegMeshUp.position.y = -( tableHeight + (tableLegLength/2) );
  if( type == 'left' ) {
    tableLegMeshUp.position.z = -30;
    tableLegMeshUp.position.x = -( tableWidth/2 );
    
    tableLegMeshUp.rotation.z = this.de2ra(45);
  }else if( type =='right' ) {
    tableLegMeshUp.position.z = -30;
    tableLegMeshUp.position.x = ( tableWidth/2 );
    
    tableLegMeshUp.rotation.z = this.de2ra(-45);
  }
  
  return tableLegMeshUp;
}

function createPlayerModel( _palyerID, _playerSide ) {
  
 
    /*
    var sphereMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000  } );
    var playerModel = new THREE.SphereGeometry( radius, segments, rings);
    var playerMeshUp = new THREE.Mesh( playerModel , sphereMaterial );
    
   //playerMeshUp.position.y = 100;
    //playerMeshUp.position.z = 100;
    
    if( _playerSide == 'left') {
      playerMeshUp.position.x = -100;
    }else if( _playerSide == 'right') {
      playerMeshUp.position.x = 100;
    }
    
     // set the geometry to dynamic
    // so that it allow updates
    playerMeshUp.geometry.dynamic = true;

    // changes to the vertices
    playerMeshUp.geometry.__dirtyVertices = true;

    // changes to the normals
    playerMeshUp.geometry.__dirtyNormals = true;
    */
    var player = new Player();
    if(_playerSide == 'right') {
      player.createPlayer(100);
    }else if(_playerSide == 'left') {
      player.createPlayer(-100);
    }
    
    return player.getMesh() ;
}

/*
 * 	playerType = left || right
 */ 
function bumbModel( playerType ) {
  //jump high
  for(var y = 0; y <= bumpingHeight; y++) {
    this.Players[playerType].model.position.y = y;
    this.Players[playerType].render.render( this.Players[playerType].scene, camera );
    //jQuery.delay(300);
  }
  //jQuery.delay(300);
  //jump low
  for(var y = bumpingHeight; y >= 0; y--) {
    this.Players[playerType].model.position.y = y;
    this.Players[playerType].render.render( this.Players[playerType].scene, camera );
    //jQuery.delay(300);
  }
}
