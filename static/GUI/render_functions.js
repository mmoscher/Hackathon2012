/* Renderfunctions for GUI
 * Communications functions node.js server applications
 * foundamental jQuery stuff
 */

var PlayerRight = null;
var PlayerLeft = null;



var camera, scene, renderer;
var geometry, material, mesh;



function init_scene() {

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 300;

    scene = new THREE.Scene();

    var player1 = initPlayerModel( null , 'left' );  
    scene.add( player1 );
    
    var player2 = initPlayerModel( null , 'right' );  
    scene.add( player2 );
    
    // create a point light
    var pointLight =
      new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    // add to the scene
    scene.add(pointLight);

    renderer = new THREE.CanvasRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

    renderer.render( scene, camera );
}


/*
 * 
 * \params _playerSide (left || right )
 * 
 */


function initPlayerModel( _palyerID, _playerSide ) {
  
    var radius = 50;
    var segments = 16;
    var rings = 16;
    
    var sphereMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
    var playerModel = new THREE.SphereGeometry( radius, segments, rings);
    var playerMeshUp = new THREE.Mesh( playerModel , sphereMaterial );
    
   //playerMeshUp.position.y = 100;
    //playerMeshUp.position.z = 100;
    
    if( _playerSide == 'left') {
      playerMeshUp.position.x = -100;
    }else if(_playerSide == 'right') {
      playerMeshUp.position.x = 100;
    }
    
    
    return playerMeshUp;
}

$(document).ready( function() {
  init_scene();
});