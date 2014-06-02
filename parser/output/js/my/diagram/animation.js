/**
 * @author Behemecoathyl
 */

var camera, scene, renderer;
var light1, light2;
var controls;
var viewersize = new THREE.Vector2();
var mouse = new THREE.Vector2();
var INTERSECTED, SELECTED;
var axes;
var diagramm_height = 500;
var diagramm_width  = 500;

var treemap_json;
var cubes = new Array();  // .length .push() .pop()
var nameList = new Array();		// enthält nur Namen der Elemente, um id Mapping zu ermöglichen
var lines = new Array();  // .length .push() .pop()
var tempObj = new Array();
var treemap = { LOC: [], NOM: [], NOA: [], NOC: [], CBO: [], DIT: [], RFC: [] };
var targets = { explode: [], sphere: [], helix: [], grid: [], relationArc: [], relationSphere: [] };
targets.treemap = treemap;
var modified = false;
var tweening = false;

var relation_mode = 0;		// 0 - Single Relation, 1 - All Relation
var metrics_mode = 0;			// 0 - LOC, 1 - NOM, 2 - NOA, 3 - NOC, 4 - CBO, 5 - DIT, 6 - RFC
var status = 0;            // 0-7            
var diagram_radio_array = { idxToValue:	[	"undefinded", 
											"intro",	
											"treemap_package", 
											"treemap_classes", 
											"relation_sphere", 
											"relation_helix", 
											"relation_package_arc",
											"relation_package_sphere"]};

window.onload=init;

function init(){
	viewersize.x = document.getElementById("viewer").clientWidth;		
	viewersize.y = document.getElementById("viewer").clientHeight;
	
	init_threejs();
	animate();
}

function init_threejs() {
	camera = new THREE.PerspectiveCamera( 75, viewersize.x / viewersize.y, 1, 5000 );
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
	renderer.setClearColorHex( 0xEEEEEE, 1 );
	renderer.setSize( viewersize.x, 
					  viewersize.y );
	init_events();
	//changeStatus();
}

function init_events(){
	document.getElementById( 'viewer' ).appendChild( renderer.domElement );
	document.getElementById( 'viewer' ).addEventListener( 'mousemove', onDocumentMouseMove, false );
//	document.getElementById( 'viewer' ).addEventListener( 'dblclick', tweenToStatus, false);
	document.getElementById( 'viewer' ).addEventListener( 'click', click_select, false);
	
	window.addEventListener( 'resize', onWindowResize, false );
	
	// BUTTONS:
	document.getElementById( 'btn_update' ).addEventListener( 'click', function ( event ) {
		update_treemap();
	}, false ); 	
	document.getElementById( 'btn_clear' ).addEventListener( 'click', function ( event ) {
		clear_scene();
	}, false ); 	
	document.getElementById( 'btn_reset_view' ).addEventListener( 'click', function( event ){
		//TODO camera richtig reseten: camera.setViewOffset(viewersize.x, viewersize.y,);//( fullWidth, fullHeight, x, y, width, height )		
		//75, viewersize.x / viewersize.y, 1, 3000
		camera.position.set( 400, 400, 400 );
		camera.lookAt(0,0,0);		
	}, false );
	
	// FRAME STATUS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	document.getElementById( 'viewer' ).appendChild( stats.domElement );
	
	hide_diagramm_controls();
	show_metrics_control_div();
}

function animate() {
	requestAnimationFrame( animate );
	TWEEN.update();
	stats.update();
	controls.update();

	updateLines();

	// selection and intersection:
	find_intersections();
	if(INTERSECTED &&  INTERSECTED instanceof THREE.Mesh){ /*INTERSECTED !== axes && INTERSECTED !== select_sphere){
		var output = INTERSECTED.userData.name + " (" + INTERSECTED.userData.size + ") ";*/
		var output = JSON.stringify(INTERSECTED.userData);
		var div = document.getElementById("classname");
		if (div){
			div.innerHTML = output;
		}  
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

/**
 * 
 * @param {Object} newStatus if no newStatus, then inc()
 */
function changeStatus( newStatus ){
	if ((newStatus)&&( newStatus <= 7)){
		status = newStatus;
	}else{
		status++;		
	}
	modified = true;
	hide_tempObjects( scene, tempObj );
} 

function tweenToStatus( next ){
	changeStatus( next );
	hide_diagramm_controls();
	switch (parseInt( status )) {
		case 0: {
			break;
		}
		case 1: {
			show_metrics_control_div();
			calculate_explode( targets, metrics_mode, false );  
			transform_cubes_tween( targets.explode, 1000 );
			break;
		}		
		case 2: {
			show_metrics_control_div();
			calculate_treemap( treemap_json, targets, metrics_mode );
			switch (parseInt( metrics_mode )){
				case 0:{
					transform_cubes_tween( targets.treemap.LOC, 3000 ); 
					break;
				}
				case 1:{
					transform_cubes_tween( targets.treemap.NOM, 3000 ); 
					break;
				}
				case 2:{
					transform_cubes_tween( targets.treemap.NOA, 3000 ); 
					break;
				}
				case 3:{
					transform_cubes_tween( targets.treemap.NOC, 3000 ); 
					break;
				}
				case 4:{
					transform_cubes_tween( targets.treemap.CBO, 3000 ); 
					break;
				}
				case 5:{
					transform_cubes_tween( targets.treemap.DIT, 3000 ); 
					break;
				}
				case 6:{
					transform_cubes_tween( targets.treemap.RFC, 3000 ); 
					break;
				}
				default:{
					transform_cubes_tween( targets.treemap.LOC, 3000 ); 
					break;			
				}
			}
			break;
		}		
		// TODO: treemap für Klassenhierarchie hier einfügen
		case 3: {
			//transform_cubes_tween( targets.treemap, 3000 ); 
			break;
		}		
		case 4: {
			show_relation_control_div();
			calculate_sphere( targets );
			transform_cubes_tween( targets.sphere, 3000 );
			break;
		}		
		case 5: {
			show_relation_control_div();
			calculate_helix( targets ); 
			transform_cubes_tween( targets.helix, 3000 ); 
			break;
		}
		case 6: {
			show_relation_control_div();
			calculate_relation( targets, 1 );
			transform_cubes_tween( targets.relationArc, 3000 ); 
			break;
		}
		case 7: {
			show_relation_control_div();
			calculate_relation( targets, 2 );
			transform_cubes_tween( targets.relationSphere, 3000 ); 
			break;
		}
		default: { 
			changeStatus( 1 ); 
			calculate_explode( targets, metrics_mode, false ); 
			transform_cubes_tween( targets.explode, 1000 ); 
			break;
		}		
	}
	
	var radio_btn = document.getElementById( diagram_radio_array.idxToValue[status] );
	if (radio_btn){
		radio_btn.checked="checked";
	}	
}

function updateLines(){
	// relationship lines:
	if (modified) {
		hide_lines( scene, lines );
//		hide_tempObjects( scene, tempObj );  
		// PERFORMANCE BEACHTEN - nur zeichen, wenn modified und nicht im Tween (tweening)!!
		if (!tweening){
			if ( (parseInt( status ) === 4) || 
				 (parseInt( status ) === 5) ||
				 (parseInt( status ) === 6) || 
				 (parseInt( status ) === 7)){
			
				// Relationen von einem Objekt zu vielen
				if ( (parseInt( relation_mode ) === 0) ){
					if(SELECTED &&  SELECTED instanceof THREE.Mesh){
						switch (parseInt(status)){
							case 4: {
								lines = calculate_curved_lines( SELECTED, cubes, SELECTED.userData.color );
								break;
							}
							case 5: {
								lines = calculate_curved_lines( SELECTED, cubes, SELECTED.userData.color );
								break;
							}
							case 6: {
								lines = calculate_bundle_lines( SELECTED, cubes, SELECTED.userData.color );
								break;
							}
							default:{
								lines = calculate_lines( SELECTED, cubes, SELECTED.userData.color );
								break;
							}
						}
						show_lines( scene, lines ); 
					} 
				}
				// Relationen von vielen zu vielen (AAAAAH... die Performance)
				else if ((parseInt( relation_mode ) === 1)){
					lines = new Array();
					for (var i=0; i < cubes.length; i++) {
						var tmpLines = new Array();
						// bundles für die Relation-Package-Arc Darstellung
						if(parseInt(status) === 6){
							tmpLines = calculate_bundle_lines( cubes[i], cubes, cubes[i].userData.color );
						}else{
							tmpLines = calculate_lines( cubes[i], cubes, cubes[i].userData.color );
						}
							
						for (var j=0; j < tmpLines.length; j++) {
							lines.push( tmpLines[j] );
						};
					};
					show_lines( scene, lines );	// optimierungen? 
				}
				}
			modified = false; 
		}
	}
}

function hide_lines( scene, lines ){
	for(var i = 0; i < lines.length; i++){
		scene.remove( lines[i] );
	}
	lines = new Array();
}

function show_lines( scene, lines ){
	for(var i = 0; i < lines.length; i++){
		scene.add( lines[i] );
	}
}

function hide_tempObjects( scene, tempObj ){
	for(var i = 0; i < tempObj.length; i++){
		scene.remove( tempObj[i] );
	}
	tempObj = new Array();
}

function show_tempObjects( scene, tempObj ){
	for(var i = 0; i < tempObj.length; i++){
		scene.add( tempObj[i] );
	}
}

function generate_nodes( nodes ){
	var i = 0;
	var currentPackageName = '';
	init_packageList();
	while (nodes[i]){
		if (i>1){
			// Package des aktuellen Elementes ist immer fullName des darunter liegenden Elementes
			if (nodes[i].depth > nodes[i-1].depth){
				currentPackageName = nodes[i-1].fullName;
				if(currentPackageName === undefined){
					currentPackageName = nodes[i-1].name;
				}
			}
		}
		// ... bekommen alle tieferen Klassen den Packagenamen aufgedrückt
		nodes[i].packageName = currentPackageName;
		nodes[i].id 		 = i;			
		add_to_packageList( currentPackageName );
		
		generate_node(nodes[i]);
		i++;
	};
}

var cubeColor;
var lastDepth = -1;

function generate_node( node ){
	nameList.push( node.fullName );
	   
	targets.treemap.LOC.push( generate_treemap_target_object( node ) );

	// EXPLODE POSITION & ROTATION & SCALE			-- not realy a draw_node function
	var obj_explode = new THREE.Object3D(); 
	var field_size = 1500;
	obj_explode.position.x = Math.random() * field_size - field_size/2;
	obj_explode.position.y = Math.random() * field_size - field_size/2;
	obj_explode.position.z = Math.random() * field_size - field_size/2;
	obj_explode.rotation.x = Math.random();
	obj_explode.rotation.y = Math.random();
	obj_explode.rotation.z = Math.random();

	var scale3 = Math.pow( node.LOC * 100 , 1/3);   // box_width*box_height*box_depth
	if((scale3 == undefined)||(scale3 == NaN)||(scale3 == null)){
		obj_explode.scale.set(scale3, scale3, scale3);
	}else{
		obj_explode.scale.set(0, 0, 0);  // nur nicht sichtbar
	}
	targets.explode.push( obj_explode );


	// generate colors
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

	generate_scene_cube( node );
}

function generate_scene_cube( node ){
	// the real cube:
	var cube = cube_mesh( 1, 1, 1, cubeColor, false);
//	var cube = cube_mesh( obj_treemap.scale.x, obj_treemap.scale.y,  obj_treemap.scale.z, cubeColor, false);
//	var cube = cube_mesh_multimaterial( obj_treemap.scale.x, obj_treemap.scale.y,  obj_treemap.scale.z, cubeColor);
	
	// INIT CUBE - POSITION & ROTATION AS EXPLODE
//	cube.position.set(obj_explode.position.x, obj_explode.position.y, obj_explode.position.z);
//	cube.rotation.set(obj_explode.rotation.x, obj_explode.rotation.y, obj_explode.rotation.z);
//	cube.scale.set(obj_explode.scale.x, obj_explode.scale.y, obj_explode.scale.z);

	// CUBE userData
	var jsonString = "{ \"fullName\":\"" + node.fullName
					 +"\", \"name\":\"" + node.name 
					 +"\", \"id\":\"" + node.id 
					 +"\", \"packageName\":\"" + node.packageName 
					 +"\", \"depth\":\"" + node.depth 
					 + "\", \"size\":\"" + node.size 
					 +"\", \"color\":\"" + cubeColor
					 +"\"}";
					 
	var metricsString = "{ \"LOC\":\"" + node.LOC 
					 +"\", \"NOA\":\"" + node.NOA 
					 +"\", \"NOM\":\"" + node.NOM					  
					 +"\", \"NOC\":\"" + node.NOC					  
					 +"\", \"CBO\":\"" + node.CBO					  
					 +"\", \"DIT\":\"" + node.DIT					  
					 +"\", \"RFC\":\"" + node.RFC					  
					 +"\"}";

	var out = jQuery.parseJSON( jsonString );
	out.metrics = jQuery.parseJSON( metricsString );
	if(node.relatedTo !== undefined){
		out.relatedTo = node.relatedTo;
	}
	cube.userData = out;

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
  						return d.LOC;
					});  // similarly, value of the nodes is the age attribute of the node
	
	treemap.sort(function(a,b) { return a.size - b.size; });  // TODO besseren SORT finden
	treemap.padding(2);
	nameList = new Array();
// TREEMAP --------- INIT END ----------------------------
 	var jsonString = document.getElementById("ta_input").value;
 	var json_out;
 	if(jsonString != ""){ 
 		jsonString = jsonString.replace(/(\r\n|\n|\r)/gm,"");
 		jsonString = jsonString.replace(/\s/g, "");
 		json_out = jQuery.parseJSON( jsonString );
		treemap_json = treemap.nodes(json_out);	
		generate_nodes(treemap_json);
		tweenToStatus(1);					  
	}else{
	    filename = "files/Slick2D.json";
		d3.json(filename, function( error, json_out ) {			
			treemap_json = treemap.nodes(json_out);	
			generate_nodes(treemap_json);
			tweenToStatus(1);					  
		});
	}
//	changeStatus();
//	calculate_explode( targets, metrics_mode, false );
//	transform_cubes_tween( targets.explode, 3000 );	
  
	//transform( targets.explode ); 
}

function clear_scene(){
	targets.explode			= new Array();
	targets.treemap.LOC 	= new Array();
	targets.treemap.NOM 	= new Array();
	targets.treemap.NOA 	= new Array();
	targets.treemap.NOC 	= new Array();
	targets.treemap.CBO 	= new Array();
	targets.treemap.DIT 	= new Array();
	targets.treemap.RFC 	= new Array();
	targets.sphere			= new Array();
	targets.helix   		= new Array();
	targets.grid			= new Array();
	targets.relationArc		= new Array();
	targets.relationSphere	= new Array();
	while(cubes.length>0){
		scene.remove( cubes.pop() );
	}
	status = 0;
	relation_mode = 0;		
	metrics_mode = 0;		
	hide_lines( scene, lines );
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
			var index = 0;
			if( (tempObj[0]) && ( tempObj[0] == intersects[ index ].object)){
				index++;
				if (index >= intersects.length){
					return;
				}
			}
			if (INTERSECTED != intersects[ index ].object ) {
				if ( INTERSECTED ) {
					INTERSECTED.material.emissive = INTERSECTED.currentHex;//.setHex( INTERSECTED.currentHex );
				}
				INTERSECTED = intersects[ index ].object;
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
		.onComplete( tweenStop )
		.start();
	
	tweening = true;
}

function render(){
	renderer.render( scene, camera );
}

function tweenStop(){
	tweening = false;	
}

function click_select(){	
	// Check for modifications 
	if ((parseInt( relation_mode ) === 0) && 
		((parseInt( status ) === 4) || 
		 (parseInt( status ) === 5) || 
		 (parseInt( status ) === 6) ||
		 (parseInt( status ) === 7))) {
		modified = (INTERSECTED)&&(SELECTED !== INTERSECTED);
	} 
	// set new selected element
	if (INTERSECTED){
		SELECTED = INTERSECTED;
	}

	// generate some temporary stuff / cube around the package-cluster
	if ((SELECTED)&&(modified)&& /*(parseInt( relation_mode ) === 0) &&*/ 
		((parseInt( status ) === 6) || (parseInt( status ) === 7))) {
		
		hide_tempObjects( scene, tempObj );
		tempObj = new Array();
			
		var index = get_index_packageList(SELECTED.userData.packageName); 	
		var cube = cube_mesh( SECTION_SIZE, SECTION_SIZE,  SECTION_SIZE, SELECTED.userData.color, true);
		cube.position.set(SECTIONS[index].x, SECTIONS[index].y, SECTIONS[index].z);
		tempObj.push( cube );
		show_tempObjects( scene, tempObj );
	}	
}

function setRelationMode(mode){
	relation_mode = mode;
	modified = true;
}

function setMetricsMode(mode){
	metrics_mode = mode;
	if(parseInt(status) === 1){
		calculate_explode( targets, metrics_mode, true );
		transform_cubes_tween( targets.explode, 1000 );	
	} else if((parseInt(status) === 2)||(parseInt(status) === 3)){
		calculate_treemap( treemap_json, targets, metrics_mode, callback_tween_treemap );
	}
}

function callback_tween_treemap(){
	switch (parseInt(metrics_mode)){
		case 0:{
			transform_cubes_tween( targets.treemap.LOC, 2000 );	
			break;
		}
		case 1:{
			transform_cubes_tween( targets.treemap.NOM, 2000 );	
			break;
		}
		case 2:{
			transform_cubes_tween( targets.treemap.NOA, 2000 );	
			break;
		}
		case 3:{
			transform_cubes_tween( targets.treemap.NOC, 2000 );	
			break;
		}
		case 4:{
			transform_cubes_tween( targets.treemap.CBO, 2000 );	
			break;
		}
		case 5:{
			transform_cubes_tween( targets.treemap.DIT, 2000 );	
			break;
		}
		case 6:{
			transform_cubes_tween( targets.treemap.RFC, 2000 );	
			break;
		}
		default:{
			transform_cubes_tween( targets.treemap.LOC, 2000 );	
		}
	}
}

function hide_diagramm_controls(){
	var div = document.getElementById("diagram_relation");
	div.style.display='none';	
	var div = document.getElementById("diagram_intro");
	div.style.display='none';	
}

function show_relation_control_div(){
	var div = document.getElementById("diagram_relation");
	div.style.display='block';	
	document.getElementById('rb_single').checked="checked";
}

function show_metrics_control_div(){
	var div = document.getElementById("diagram_intro");
	div.style.display='block';	
}




