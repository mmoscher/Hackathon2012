require(['_lib/Player', '_lib/render_functions', '_lib/Tween', '_lib/Three', 'jquery'],  function(Character) {
 
  var camera, scene, renderer;
  var player = new player();
 
  // Add some button click event handlers:
 
  // Initialise and then animate the 3D scene!
 
  function render() {
 
    // *** Update the scene ***
    renderer.render(scene, camera);
  }
  
  $(document).ready( function() {
	//first of all init the scene
	init_scene();
	    
alert("hallo");
	//init the game
	//init_game();
    });
});