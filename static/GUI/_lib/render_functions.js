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
var tableWidth = 340;

var bumpingHeight = 10;

var jumpingHeight = 20;
var jumpingDuration = 500;

var runnigDuration = 2000;

var currentJumpingPlayerType = "";

var playerDistance = 20;

this.de2ra = function(degree)   { return degree*(Math.PI/180); }

function init_scene() {

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000 );
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

    rendererTable = new THREE.WebGLRenderer();
    rendererTable.setSize( window.innerWidth, window.innerHeight );
    
    this.playerRight.render = new THREE.WebGLRenderer();
    this.playerRight.render.setSize( window.innerWidth, window.innerHeight );
    
    this.playerLeft.render = new THREE.WebGLRenderer();
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
  
    var radius = playerRadius;
    var segments = 70;
    var rings = 70;
  
    
    var sphereMaterial = new THREE.MeshLambertMaterial( { color: 0xFF0000 } );
    var playerModel = new THREE.SphereGeometry( radius, segments, rings);
    var playerMeshUp = new THREE.Mesh( playerModel , sphereMaterial );
    
   //playerMeshUp.position.y = 100;
    //playerMeshUp.position.z = 100;
    
    if( _playerSide == 'left') {
      playerMeshUp.position.x = -(playerDistance);
    }else if( _playerSide == 'right') {
      playerMeshUp.position.x = playerDistance;
    }
    
     // set the geometry to dynamic
    // so that it allow updates
    playerMeshUp.geometry.dynamic = true;

    // changes to the vertices
    playerMeshUp.geometry.__dirtyVertices = true;

    // changes to the normals
    playerMeshUp.geometry.__dirtyNormals = true;
    
    /*var player = new Player();
    if(_playerSide == 'right') {
      player.createPlayer(100);
    }else if(_playerSide == 'left') {
      player.createPlayer(-100);
    }*/
    
    return playerMeshUp ;
}


function jumpPlayer( playerType ) {
  currentJumpingPlayerType  = playerType;
  // remove previous tweens if needed
  //TWEEN.removeAll();
  //alert("lets go");
  var position = { y: 0 };
  var target = { y: jumpingHeight };
  var target_back = { y: 0 };
  
  var update = function() {
    Players[playerType].model.position.y = position.y;
  }; 
  
  //var tween = new TWEEN.Tween(position).to(target, 2000);  
 
 var easingUp	= TWEEN.Easing.Quartic.EaseOut;
 var easingDown = TWEEN.Easing.Bounce.EaseOut;

 var tweenHead	= new TWEEN.Tween(position)
			    .to(target, jumpingDuration)
			    .delay(0)
			    .easing(easingUp)
			    .onUpdate(update);
			    //.onComplete(cancelAnimationFrame( animate ));
			    //.onComplete( alert( position.y) );
  // build the tween to go backward
  var tweenBack	= new TWEEN.Tween(position)
			    .to(target_back, jumpingDuration)
			    .delay(0)
			    .easing(easingDown)
			    .onUpdate(update);
			    //.onComplete(cancelAnimationFrame( animate ));
  
  // after tweenHead do tweenBack
  tweenHead.chain(tweenBack);
  //tweenHead.start();
  tweenHead.start();
  animate( );
}

function movePlayers( destinationQuotient ) {
  //destinationQuotient 0.01 <-> 0.99
  //destination 1.0 -> player right win
  //destination 0.0 -> player left win
  var xTarget = destinationQuotient * (tableWidth - 2*playerDistance);
  //relativieren mittelpunkt ist x = 0;
  if( xTarget >= ((tableWidth/2) - 2*playerDistance) ) {
      xTarget = xTarget - ((tableWidth/2) - 2*playerDistance);
      jumpPlayer('left');
  }else{
      xTarget = (-1)*(((tableWidth/2) - 2*playerDistance) - xTarget);
      jumpPlayer('right');
  }
    
  var xTargetLeftPlayer = xTarget - playerDistance;
  var xTargetRightPlayer = xTarget + playerDistance;

   
  var position = { playerLeftX: Players['left'].model.position.x, playerRightX: Players['right'].model.position.x};
  var target = { playerLeftX: xTargetLeftPlayer, playerRightX: xTargetRightPlayer};
  
  var update = function() {
    Players['left'].model.position.x = position.playerLeftX;
    Players['right'].model.position.x = position.playerRightX;
  }; 
  
  //var tween = new TWEEN.Tween(position).to(target, 2000);  
 
 var easing	= TWEEN.Easing.Quartic.EaseOut;

 var tweenHead	= new TWEEN.Tween(position)
			    .to(target, runnigDuration)
			    .delay(100)
			    .easing(easing)
			    .onUpdate(update);
			    
  tweenHead.start();
  animateBoth( );
}


function animateBoth() {
      requestAnimationFrame( animateBoth );
      // render the 3D scene
      renderBothBuddies();
      // update the tweens from TWEEN library
      TWEEN.update();
}

function animate( ) {
      requestAnimationFrame( animate );
      // render the 3D scene
      renderBuddy();
      // update the tweens from TWEEN library
      TWEEN.update();
}

function renderBuddy( ) {
  Players[currentJumpingPlayerType].render.render( Players[ currentJumpingPlayerType ].scene, camera );
}

function renderBothBuddies( ) {
  Players['left'].render.render( Players[ 'left' ].scene, camera );
  Players['right'].render.render( Players[ 'right' ].scene, camera );
}


(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());



