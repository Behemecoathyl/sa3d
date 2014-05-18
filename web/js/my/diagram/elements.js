
function cube_mesh(height, width, length, color, wireframe) {
	var geometry = new THREE.CubeGeometry( 1, 1, 1 );				
	var material = new THREE.MeshLambertMaterial( { color: color, wireframe: wireframe, vertexColors: false, transparent: true, opacity: 0.8 } );				
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
 * creates a line object from a THREE.SplineCurve3
 * @param {Object} spline THREE.SplineCurve3
 */
function line_mesh( spline, color ){
	var numPoints = 10;
	var col;
	if (color){
		col = color;
	}else{
		col = 0xff0000;
	}
	var material = new THREE.LineBasicMaterial( {color: col} );	
	var geometry = new THREE.Geometry();
	var splinePoints = spline.getPoints(numPoints);
	
	for(var i = 0; i < splinePoints.length; i++){
	    geometry.vertices.push(splinePoints[i]);  
	}

	return new THREE.Line(geometry, material);
}

function get_spotlight() {
	spotLight = new THREE.SpotLight( 0xffffff ); 
	spotLight.position.set( 1000, 10000, 1000 ); 
	spotLight.castShadow = true; 
	spotLight.shadowMapWidth = viewersize.x; 
	spotLight.shadowMapHeight = viewersize.y; 
	spotLight.shadowCameraNear = 500; 
	spotLight.shadowCameraFar = 4000; 
	spotLight.shadowCameraFov = 30; 
	return spotLight;
}
