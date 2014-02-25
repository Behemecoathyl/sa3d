/**
 * @author Behemecoathyl
 */

var camera, scene, renderer;
var light1, light2;
var controls;
var viewersize = new THREE.Vector2();
var mouse = new THREE.Vector2(), INTERSECTED, SELECTED, select_sphere;
var axes;
var diagramm_height = 500;
var diagramm_width  = 500;
var status = 0;           // 0 = undefined; 1 = explode; 2 = treemap; 3 = sphere; 4 = helix; 

var treemap_json;
var cubes = new Array();  // .length .push() .pop()
var lines = new Array();  // .length .push() .pop()
var targets = { explode: [], treemap: [], sphere: [], helix: [], grid: [] };


//viewersize.x = window.innerWidth * 0.6;//document.getElementById("viewer").width;		
//viewersize.y = window.innerHeight * 0.6;//document.getElementById("viewer").height;			// TODO  minus Höhe des oberen Teils dynamisch berechnen

window.onload=init;

function init(){
	viewersize.x = document.getElementById("viewer").clientWidth;		
	viewersize.y = document.getElementById("viewer").clientHeight;
	
	init_threejs();
	animate();
}

function init_threejs() {
	camera = new THREE.PerspectiveCamera( 75, viewersize.x / viewersize.y, 1, 3000 );
	camera.position.set( 400, 400, 400 );

	controls = new THREE.TrackballControls( camera, document.getElementById("viewer") );

	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	
	controls.noZoom = false;
	controls.noPan = false;

	controls.staticMoving = false;
	controls.dynamicDampingFactor = 0.3;

	controls.keys = [ 65, 83, 68 ];
//	controls.addEventListener( 'change', render );

	scene 		= new THREE.Scene();
	projector 	= new THREE.Projector();
	raycaster 	= new THREE.Raycaster();
	
	update_treemap();
	
	light1 = new THREE.DirectionalLight( 0xffffff, 2 );
	light1.position.set( 1, 1, 1 ).normalize();
	scene.add( light1 );

	light2 = new THREE.DirectionalLight( 0xffffff );
	light2.position.set( -1, -1, -1 ).normalize();
	scene.add( light2 );

	axes = new THREE.AxisHelper(50);
	scene.add(axes);	
		
	if (window.WebGLRenderingContext){
		 renderer = new THREE.WebGLRenderer(); 
	} else { 
		renderer = new THREE.CanvasRenderer();
	}
/*
	if((navigator.userAgent.match(/android/i))) {
		alert('yay!');
		renderer = THREE.CanvasRenderer();
	}
*/
	renderer.setClearColorHex( 0xEEEEEE, 1 );
	renderer.setSize( viewersize.x, 
					  viewersize.y );
	init_events();					  
}

function init_events(){
	document.getElementById('viewer').appendChild( renderer.domElement );
	document.getElementById('viewer').addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.getElementById( 'viewer' ).addEventListener( 'click', function ( event ) {
/*
		if (INTERSECTED){
			if(select_sphere){
				scene.remove( select_sphere );	
			}
			var radius = Math.max(Math.max(INTERSECTED.scale.x, INTERSECTED.scale.y), INTERSECTED.scale.z)*2/3;
			select_sphere = sphere_mesh( radius );
			select_sphere.position.set( INTERSECTED.position.x, INTERSECTED.position.y, INTERSECTED.position.z );
			scene.add( select_sphere );
		}
*/		
	}, false);
	document.getElementById( 'viewer' ).addEventListener( 'dblclick', tweenNext, false);
	document.getElementById( 'viewer' ).addEventListener( 'click', click_select, false);
	
	window.addEventListener( 'resize', onWindowResize, false );
	
	// BUTTONS:
	document.getElementById( 'btn_update' ).addEventListener( 'click', function ( event ) {
		update_treemap();
	}, false ); 	
	document.getElementById( 'btn_treemap' ).addEventListener( 'click', function ( event ) {
		transform( targets.treemap );
		status = 2;
	}, false );
	document.getElementById( 'btn_explode' ).addEventListener( 'click', function ( event ) {
		status = 0;
		tweenNext();
	}, false );
	document.getElementById( 'btn_next' ).addEventListener( 'click', tweenNext, false );
	document.getElementById( 'btn_clear' ).addEventListener( 'click', function ( event ) {
		clear_scene();
	}, false ); 	
	
	// FRAME STATUS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	document.getElementById( 'viewer' ).appendChild( stats.domElement );
}

function animate() {
	requestAnimationFrame( animate );
	TWEEN.update();
	stats.update();
	controls.update();
	hide_lines( scene, lines );  
	if ( (parseInt( status ) === 3)||(parseInt( status ) === 4)){
		if(SELECTED &&  SELECTED instanceof THREE.Mesh){
			lines = calculate_lines( SELECTED, cubes );
		} else {
			lines = calculate_lines( cubes[0], cubes );
		}
		show_lines( scene, lines ); 
	}
	find_intersections();
	if(INTERSECTED &&  INTERSECTED instanceof THREE.Mesh){ //INTERSECTED !== axes && INTERSECTED !== select_sphere){
		var output = INTERSECTED.userdata.name + " (" + INTERSECTED.userdata.size + ") ";
		document.getElementById("classname").innerHTML = output;  
	}
	renderer.render( scene, camera );
}

function onWindowResize() {
	viewersize.x = document.getElementById("viewer").clientWidth;		
	viewersize.y = document.getElementById("viewer").clientHeight;
	camera.aspect = viewersize.x / viewersize.y;
	camera.updateProjectionMatrix();
	renderer.setSize( viewersize.x, viewersize.y );
}

function tweenNext(){
	switch (parseInt( status )) {
	case 0: {
		status ++;
		calculate_explode( targets );  
		transform_cubes_tween( targets.explode, 1000 ); 
		break;
	}		
	case 1: {
		status ++;  
		transform_cubes_tween( targets.treemap, 3000 ); 
		break;
	}		
	case 2: {
		status ++;
		calculate_sphere( targets );
		transform_cubes_tween( targets.sphere, 3000 );
		break;
	}		
	case 3: {
		status ++; 
		calculate_helix( targets ); 
		transform_cubes_tween( targets.helix, 3000 ); 
		break;
	}
	case 4: {
		status ++; 
		calculate_grid( targets ); 
		transform_cubes_tween( targets.grid, 3000 ); 
		break;
	}
	case 5: {
		status = 1; 
		calculate_explode( targets ); 
		transform_cubes_tween( targets.explode, 1000 ); 
		break;
	}
	default: { break; }		
	}
	document.getElementById( 'btn_next' ).innerHTML = 'Next (' + (status) + ')';
}

function hide_lines( scene, lines ){
	for(var i = 0; i < lines.length; i++){
		scene.remove( lines[i] );
	}
}

function show_lines( scene, lines ){
	for(var i = 0; i < lines.length; i++){
		scene.add( lines[i] );
	}
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

function draw_nodes( nodes ){
	var i = 0;
	while (nodes[i]){		
		draw_node(nodes[i]);
		i++;
	};
}


var cubeColor;
var lastDepth = -1;

function draw_node( node ){
	var box_width 	= node.dx;
	var box_height	= node.dy;
	var box_depth	= 25;
	
	var pos_x 	= node.x + (box_width/2);
	var pos_y	= node.y + (box_height/2);
	var pos_z 	= node.depth * 30 + 25/2;

	// TREEMAP - POSITION     	-- not realy a draw_node function
	var obj_treemap = new THREE.Object3D();
	obj_treemap.position.x = pos_x - (diagramm_width/2);
	obj_treemap.position.y = pos_z;
	obj_treemap.position.z = pos_y - (diagramm_height/2);

	obj_treemap.scale.x = box_width;
	obj_treemap.scale.y = box_depth;
	obj_treemap.scale.z = box_height;    
	targets.treemap.push( obj_treemap );

	// EXPLODE POSITION & ROTATION & SCALE			-- not realy a draw_node function
	var obj_explode = new THREE.Object3D(); 
	var field_size = 1500;
	obj_explode.position.x = Math.random() * field_size - field_size/2;
	obj_explode.position.y = Math.random() * field_size - field_size/2;
	obj_explode.position.z = Math.random() * field_size - field_size/2;
	obj_explode.rotation.x = Math.random();
	obj_explode.rotation.y = Math.random();
	obj_explode.rotation.z = Math.random();
	var scale3 = Math.pow(box_width*box_height*box_depth, 1/3);
	obj_explode.scale.set(scale3, scale3, scale3);
	targets.explode.push( obj_explode );

	
	// COLOR STUFF	
/*
	if( lastDepth !== node.depth ){
		cubeColor = get_random_color( node.depth ); 
	} else if (node.depth >= 1) {
//		var tinyc = tinycolor.analogous(cubeColor)[1];    // zu schnell in einem anderen Farbbereich
//		var tinyc = tinycolor.lighten(cubeColor);		  // nach max 3 iterationen weis
		var tinyc = tinycolor.monochromatic(cubeColor)[1];		
		cubeColor = tinyc.toHexString(); 
	}
	
*/

	var tinyc;
	
	if(node.depth == 0 || node.depth == 1){
		tinyc = tinycolor.random();
	}else if(node.depth >= lastDepth){
		tinyc = tinycolor.monochromatic(cubeColor)[1];			
	} else {
		tinyc = tinycolor.analogous(cubeColor)[1];    
	}
	cubeColor = tinyc.toHexString(); 
	lastDepth = node.depth;

	// the real cube:
	var cube = cube_mesh( obj_treemap.scale.x, obj_treemap.scale.y,  obj_treemap.scale.z, cubeColor);
//	var cube = cube_mesh_multimaterial( obj_treemap.scale.x, obj_treemap.scale.y,  obj_treemap.scale.z, cubeColor);
	
	// INIT CUBE - POSITION & ROTATION AS EXPLODE
	cube.position.set(obj_explode.position.x, obj_explode.position.y, obj_explode.position.z);
	cube.rotation.set(obj_explode.rotation.x, obj_explode.rotation.y, obj_explode.rotation.z);
	cube.scale.set(obj_explode.scale.x, obj_explode.scale.y, obj_explode.scale.z);
	
	// CUBE USERDATA
	var jsonString = "{ \"name\":\"" + node.name + "\", \"size\":\"" + node.size +"\"}";
	var out = jQuery.parseJSON( jsonString );
	cube.userdata = out;

	cubes.push( cube );
	scene.add( cube );
}

function get_random_color( depth ) {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
	if (depth){
		if (depth % 3 == 0){
			// rote Zufallswerte
	        color += letters[Math.round(Math.random() * 15)];
	        color += letters[Math.round(Math.random() * 15)];
	        color += "0000";
		} else if (depth % 3 == 1) {
			// grüne Zufallsfarben
	        color += "00";
	        color += letters[Math.round(Math.random() * 15)];
	        color += letters[Math.round(Math.random() * 15)];
	        color += "00";
		} else if (depth % 3 == 2){
			// blaue Zufallsfarben
	        color += "0000";
	        color += letters[Math.round(Math.random() * 15)];
	        color += letters[Math.round(Math.random() * 15)];
		} else {
			color = "#000000";
		}
	} else {
	    for (var i = 0; i < 6; i++ ) {
		        color += letters[Math.round(Math.random() * 15)];
    	}
    }
    return color;
}
				
function update_treemap(){
	clear_scene();
// TREEMAP --------- INIT ----------------------------
	var treemap = d3.layout.treemap();
	treemap.size([diagramm_width, diagramm_height]);
	treemap.mode(["squarify"]);			// "squarify"; "slice-dice"; "slice"; "dice";
	treemap.ratio(diagramm_height / diagramm_width * 0.5 * (1 + Math.sqrt(5)));
	treemap.sticky([true]);
	treemap.round([false]);
	treemap.children(function(d){ 
						return d.children; 
		  			});  // instructs the algorithm to find children by looking for node.kids instead of the default node.children
	treemap.value(function(d){ 
  						return d.size;
					});  // similarly, value of the nodes is the age attribute of the node
	
	treemap.sort(function(a,b) { return a.size - b.size; });  // TODO besseren SORT finden
	treemap.padding(2);
// TREEMAP --------- INIT END ----------------------------
 	var jsonString = document.getElementById("ta_input").value;
 	var json_out;
 	if(jsonString != ""){ 
 		jsonString = jsonString.replace(/(\r\n|\n|\r)/gm,"");
 		jsonString = jsonString.replace(/\s/g, "");
 		json_out = jQuery.parseJSON( jsonString );
		treemap_json = treemap.nodes(json_out);	
		draw_nodes(treemap_json);
	}else{
	    filename = "files/treemap_sample_big.json";
		d3.json(filename, function( error, json_out ) {			
			treemap_json = treemap.nodes(json_out);	
			draw_nodes(treemap_json);
		});
	}
	status ++;
	calculate_explode( targets );  
	transform( targets.explode ); 	
}

function clear_scene(){
	targets.explode	= new Array();
	targets.treemap = new Array();
	targets.sphere	= new Array();
	targets.helix   = new Array();
	targets.grid	= new Array();
	while(cubes.length>0){
		scene.remove( cubes.pop() );
	}
	status = 0;
}
			

// -------- part for intersections ---------------------------
function onDocumentMouseMove( event ) {
	event.preventDefault();
	mouse.x = ( event.clientX / viewersize.x ) * 2 - 1;
	mouse.y = - ( event.clientY / viewersize.y ) * 2 + 1;
}	

function find_intersections(){
	if(status>0){
		var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
		vec3 = projector.unprojectVector( vector, camera );
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
}				

function transform( targets ) {
	for ( var i = 0; i < cubes.length; i ++ ) {

		var cube = cubes[ i ];
		var target = targets[ i ];

		cube.position.set( target.position.x, target.position.y, target.position.z );
		cube.rotation.set( target.rotation.x, target.rotation.y, target.rotation.z );

		cube.scale.set( target.scale.x, target.scale.y, target.scale.z );
	}
}

function transform_cubes_tween( targets, duration ) {
	TWEEN.removeAll();
	for ( var i = 0; i < cubes.length; i ++ ) {

		var cube = cubes[ i ];
		var target = targets[ i ];

		new TWEEN.Tween( cube.position )
			.to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
			.easing( TWEEN.Easing.Exponential.InOut )
			.start();

		new TWEEN.Tween( cube.rotation )
			.to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
			.easing( TWEEN.Easing.Exponential.InOut )
			.start();

		new TWEEN.Tween( cube.scale )
			.to( { x: target.scale.x, y: target.scale.y, z: target.scale.z }, Math.random() * duration + duration )
			.easing( TWEEN.Easing.Exponential.InOut )
			.start();
	}

	new TWEEN.Tween( this )
		.to( {}, duration * 2 )
		.onUpdate( render )
		.start();
}

function render(){
	renderer.render( scene, camera );
}

function click_select(){
	if (INTERSECTED){
		SELECTED = INTERSECTED;
	}
}
