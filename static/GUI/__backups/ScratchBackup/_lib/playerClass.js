return new Class(function() {
 
    // Private members
    var mesh = null;
    var radius = playerRadius;
    var segments = 70;
    var rings = 70;
 
    var tween = null;
 
    var currentXpos = { x: mesh.position.x  };
    var targetXpos = { x: 10 };
 
    Object.append(this, {
      // Getters/setters
      getMesh: function() { return mesh; },
      setMesh: function(value) { mesh = value; },
 
      // Methods
      createCharacter: function(xpos) {
        mesh = new THREE.Mesh(
	  new THREE.SphereGeometry( radius, segments, rings),
	  new THREE.MeshLambertMaterial( { color: 0xff0000  } ),	      
        );
 
        mesh.position.x = xpos;
        mesh.position.y = 0;
      },
    
      move: function(event) {
      
	// Reset angle info:
	actualXpos = 0;
	currentXpos = { x: 0 };
      
	// Define the tween along with the update function:
	tween = new TWEEN.Tween(currentXpos)
	  .to(targetXpos, 1000)
	  .onUpdate(function() {
      
	    // Calculate the difference between current angle and where we want to be:
	    var difference = Math.abs(currentXpos.x - actualXpos);
	    actualXpos = currentXpos.x;
      
	    // Rotate about Y:
	    mesh.position.x += difference;
	  })
	  .start();
      }
    });
});