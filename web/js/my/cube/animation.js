/**
 * @author Behemecoathyl
 */
var camera, scene, renderer;
var center_mesh, cyl_mesh;
var mouse = new THREE.Vector2(), INTERSECTED;

var projector, raycaster;
var box_array = new Array();			
var controls;


init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 200, 200, 200 );

	controls = new THREE.TrackballControls( camera );

	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	
	controls.noZoom = false;
	controls.noPan = false;

	controls.staticMoving = false;
	controls.dynamicDampingFactor = 0.3;

	controls.keys = [ 65, 83, 68 ];

	scene = new THREE.Scene();
	fill_box_array();
	for ( var i = 0; i < 6; i ++ ) {
		scene.add( box_array[i] );
	}				
	
	center_mesh = cube_mesh(  100, 100, 100, 0x000000);
	scene.add( center_mesh );

	cyl_mesh = cylinder_mesh(50, 50, 200, 0xffff00);
	cyl_mesh.position.set( 200, 0, 0 );
	scene.add( cyl_mesh );
	
	var light = new THREE.DirectionalLight( 0xffffff, 2 );
	light.position.set( 1, 1, 1 ).normalize();
	scene.add( light );

	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( -1, -1, -1 ).normalize();
	scene.add( light );
	
	projector = new THREE.Projector();
	raycaster = new THREE.Raycaster();
	
	renderer = new THREE.WebGLRenderer( { antialias: true } )
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	//document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );
}

function animate() {

	requestAnimationFrame( animate );
	find_intersections();
	controls.update();
	if ( center_mesh ) {
		center_mesh.rotation.x += 0.01;
		center_mesh.rotation.y += 0.01;
		center_mesh.rotation.z += 0.01;
	}
	if ( box_array ) {
		for ( var i = 0; i < 6; i ++ ){
			if (i%3==0){
				box_array[i].rotation.z +=0.01;
			} else if (i%3==1) {
				box_array[i].rotation.x +=0.01;
			} else if (i%3==2) {
				box_array[i].rotation.y +=0.01;
			}
		}
	}
	if ( cyl_mesh ) {
		cyl_mesh.rotation.x += 0.01;
	}				
	renderer.render( scene, camera );
}

function onDocumentMouseMove( event ) {
	event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}		

function onDocumentMouseDown( event ) {

}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function cube_mesh(height, width, length, color) {
	geometry = new THREE.CubeGeometry( height, width, length );				
	material = new THREE.MeshLambertMaterial( { color: color, wireframe: false, vertexColors: false} );				
	return new THREE.Mesh( geometry, material );
}

function cylinder_mesh(radiusTop, radiusBottom, height, color) {
	geometry = new THREE.CylinderGeometry( radiusTop, radiusBottom, height, 100 );				
	material = new THREE.MeshLambertMaterial( { color: color, wireframe: false} );
	return new THREE.Mesh( geometry, material );
}

function get_spotlight() {
	spotLight = new THREE.SpotLight( 0xffffff ); 
	spotLight.position.set( 1000, 10000, 1000 ); 
	spotLight.castShadow = true; 
	spotLight.shadowMapWidth = window.innerWidth; 
	spotLight.shadowMapHeight = window.innerHeight; 
	spotLight.shadowCameraNear = 500; 
	spotLight.shadowCameraFar = 4000; 
	spotLight.shadowCameraFov = 30; 
	return spotLight;
}

function fill_box_array() {
	box_array[0] = cube_mesh(  100, 100,  50, 0xff0000);
	box_array[0].position.set(   0,   0, 100 );
	
	box_array[1] = cube_mesh(   50, 100, 100, 0x00ff00);
	box_array[1].position.set( 100,   0,   0 );
	
	box_array[2] = cube_mesh(  100,  50, 100, 0x0000ff);
	box_array[2].position.set(   0, 100,   0 );
	
	box_array[3] = cube_mesh(  100, 100,  50, 0xff0000);
	box_array[3].position.set(   0,   0,-100 );
	
	box_array[4] = cube_mesh(   50, 100, 100, 0x00ff00);
	box_array[4].position.set(-100,   0,   0 );
	
	box_array[5] = cube_mesh(  100,  50, 100, 0x0000ff);
	box_array[5].position.set(   0,-100,   0 );
}

function find_intersections(){
	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	vec3 = projector.unprojectVector( vector, camera );
//				log('vec3   = ' + vec3.x   + ' ' + vec3.y   + ' ' + vec3.z);
	raycaster.set( camera.position, vec3.sub( camera.position ).normalize() );
	var intersects = raycaster.intersectObjects( scene.children );
	if ( intersects.length > 0 ) {
		if ( INTERSECTED != intersects[ 0 ].object ) {
			if ( INTERSECTED ) {
				INTERSECTED.material.emissive = INTERSECTED.currentHex;//.setHex( INTERSECTED.currentHex );
			}
			INTERSECTED = intersects[ 0 ].object;
			INTERSECTED.currentHex = INTERSECTED.material.emissive;//.getHex();
			INTERSECTED.material.emissive = 0xff0000;//.setHex( 0xff0000 );
		}
	} else {
		if ( INTERSECTED ) {
			INTERSECTED.material.emissive = INTERSECTED.currentHex; //.setHex( INTERSECTED.currentHex );
		}
		INTERSECTED = null;

	}			
}				

function log(msg){
	if (window.console && console.log) {
		console.log(msg); //for firebug
	}
}  
