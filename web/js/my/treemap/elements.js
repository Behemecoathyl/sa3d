
function cube_mesh(height, width, length, color) {
	var geometry = new THREE.CubeGeometry( 1, 1, 1 );				
	var material = new THREE.MeshLambertMaterial( { color: color, wireframe: false, vertexColors: false, transparent: true, opacity: 0.8 } );				
	var cube = new THREE.Mesh( geometry, material );
	cube.scale.set(height, width, length);
	return cube;
}

function cube_mesh_multimaterial( height, width, length, color ){
	var material = new THREE.MeshLambertMaterial( { color: color, wireframe: false, transparent: true, opacity: 0.8} );				
	var wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, transparent: true } ); 
	var multiMaterial = [ material, wireframeMaterial ]; 
	var geometry = new THREE.CubeGeometry(1, 1, 1); 
	var cube = THREE.SceneUtils.createMultiMaterialObject( 
		geometry, 
		multiMaterial );
	cube.scale.set( height, width, length );
	return cube;		
}

function sphere_mesh( radius ) {
	var geometry = new THREE.SphereGeometry(radius,	4, 4);
	var material = new THREE.MeshLambertMaterial( { color: 0xff0000, wireframe: true } );// , vertexColors: true, transparent: true, opacity: 0.9} );				
	var sphere = new THREE.Mesh( geometry, material );
	return sphere;
}

/**
 * Param: spline = THREE.SplineCurve3
 */
function line_mesh( spline ){
	var numPoints = 10;
	
//	spline = new THREE.SplineCurve3([
//	   new THREE.Vector3(0, 0, 0),
//	   new THREE.Vector3(0, 200, 0),
//	   new THREE.Vector3(150, 150, 0),
//	   new THREE.Vector3(150, 50, 0),
//	   new THREE.Vector3(250, 100, 0),
//	   new THREE.Vector3(250, 300, 0)
//	]);
	
	var material = new THREE.LineBasicMaterial({
	    color: 0xff0000,
	});
	
	var geometry = new THREE.Geometry();
	var splinePoints = spline.getPoints(numPoints);
	
	for(var i = 0; i < splinePoints.length; i++){
	    geometry.vertices.push(splinePoints[i]);  
	}

	return new THREE.Line(geometry, material);
}
