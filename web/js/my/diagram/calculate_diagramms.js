/**
 * @author Behemecoathyl
 */

function calculate_sphere( targets ){
	if(targets.sphere.length == 0){
		var vector = new THREE.Vector3();
		var l = cubes.length;
		var radius = l * 1.5;
		for ( var i = 0; i < l; i ++ ) {
		
			var phi = Math.acos( -1 + ( 2 * i ) / l );
			var theta = Math.sqrt( l * Math.PI ) * phi;
		
			var object = new THREE.Object3D();
			object.position.x = radius * Math.cos( theta ) * Math.sin( phi );
			object.position.y = radius * Math.sin( theta ) * Math.sin( phi );
			object.position.z = radius * Math.cos( phi );
			
			local_scale( object );
		
			vector.copy( object.position ).multiplyScalar( 2 );
			object.lookAt( vector );
			targets.sphere.push( object );
		}
	}
}

function calculate_explode( targets ){
	var size = 1500;
	if(targets.explode.length > 0){
		targets.explode = new Array();
	}
	for ( var i = 0; i < cubes.length; i ++ ) {
		var object = new THREE.Object3D();
		object.position.x = Math.random() * size - size/2;
		object.position.y = Math.random() * size - size/2;
		object.position.z = Math.random() * size - size/2;
		object.rotation.x = Math.random();
		object.rotation.y = Math.random();
		object.rotation.z = Math.random();
		if(targets.treemap[i]){
			var scale3 = Math.pow(targets.treemap[i].scale.x*targets.treemap[i].scale.y*targets.treemap[i].scale.z, 1/3);
			object.scale.set(scale3, scale3, scale3);
		}
		targets.explode.push( object );
	}
}

/**
 * 
 * @param {Object} targets	global array of objectpositions
 * @param {Object} sections	number of random generated sections
 */
function calculate_sorted_explode( targets, sections ){
	var size = 1500;
	if(targets.explode.length > 0){
		targets.explode = new Array();
	}
	for ( var i = 0; i < cubes.length; i ++ ) {
		var object = new THREE.Object3D();
		object.position.x = Math.random() * size - size/2;
		object.position.y = Math.random() * size - size/2;
		object.position.z = Math.random() * size - size/2;
		object.rotation.x = Math.random();
		object.rotation.y = Math.random();
		object.rotation.z = Math.random();
		if(targets.treemap[i]){
			var scale3 = Math.pow(targets.treemap[i].scale.x*targets.treemap[i].scale.y*targets.treemap[i].scale.z, 1/3);
			object.scale.set(scale3, scale3, scale3);
		}
		targets.explode.push( object );
	}
}

function calculate_helix( targets ) {
	if(targets.helix.length == 0){
		var vector = new THREE.Vector3();
		var l = cubes.length;
		var radius = l;
		for ( var i = 0; i < l; i ++ ) {
			var phi = i * 0.175 + Math.PI;

			var object = new THREE.Object3D();
			object.position.x = radius * Math.sin( phi );
			object.position.y = - ( i * 2 ) + (radius/2);
			object.position.z = radius * Math.cos( phi );

			local_scale( object );

			vector.x = object.position.x * 2;
			vector.y = object.position.y;
			vector.z = object.position.z * 2;
			object.lookAt( vector );
			targets.helix.push( object );
		}
	}
}

function calculate_grid ( targets ) {
	if(targets.grid.length == 0){
		var l = cubes.length;
		var distance = l/2;
		for ( var i = 0; i < l; i ++ ) {
			var object = new THREE.Object3D();
			object.position.x = ( ( i % 5 ) * (distance/2) ) - distance;
			object.position.y = ( - ( Math.floor( i / 5 ) % 5 ) * (distance/2) ) + distance;
			object.position.z = ( Math.floor( i / 25 ) ) * (distance/2) - distance;

			local_scale( object );
		
			targets.grid.push( object );
		}
	}
}	

function calculate_relation( targets ){
	var distance = 100 + 1 * cubes.length; //1000;						// "Radius"-Distanz zur Mitte = default 100 + Anzahl der Klassen
	
	var package_count = 15;						// angenommene Package Anzahl - später hoffentlich bekannt
	var angle_d = (Math.PI*2) / package_count;   	// Winkelschritt in Bogenmaß

	// Sektionsaufteilung anhand der Anzahl der Packages
	var axis = new THREE.Vector3( 0, 1, 0 );
	var sections = new Array();
	var v = new THREE.Vector3(distance, 0, 0);
	var angle = 0;
	for (var i=0; i < package_count; i++) {
		sections.push( rotate_vector( v, axis, angle ) );			  
		angle += angle_d;
	};
	
	
	// Zufallswerte ermitteln und in die jeweilige Package Section räumen:
	var size;
	if(sections.length>=2){
		size = sections[0].distanceTo(sections[1]) * 0.5;		// abstand zweier benachbarter Sektionen
	} else {
		size = 200;
	} 	
	if(targets.relation.length > 0){
		targets.relation = new Array();
	}
	for ( var i = 0; i < cubes.length; i ++ ) {
		var object = new THREE.Object3D();
		object.position.x = Math.random() * size - size/2 + sections[i%package_count].x;		// TODO % entfernen und durch logik ersetzen
		object.position.y = Math.random() * size - size/2 + sections[i%package_count].y;
		object.position.z = Math.random() * size - size/2 + sections[i%package_count].z;
		if(targets.treemap[i]){
			var scale3 = 0.02 * distance; 																	// gleiche größe für alle Klassen 
			object.scale.set(scale3, scale3, scale3);
		}
		targets.relation.push( object );
	}			
}

function rotate_vector( v, axis, angle ){
	if (v) {
		var v_return = v.clone();
		var matrix = new THREE.Matrix4().makeRotationAxis( axis, angle );
	
		v_return.applyMatrix4( matrix );
		return v_return;
	}else{
		return new THREE.Vector3( 0, 0, 0 );
	}
}


function calculate_curved_lines( base, cubes, color ){
	var limit = 20;
	// TODO - beziehungen simulieren
	// vorerst werden hier nur Linien vom 0. Element zu allen anderen gezogen:
	var lines = new Array();
	for (var i=0; i < cubes.length; i++) {
		if (i % 5 == 0){
			var cube1, cube2;
			cube1	= base;
			cube2	= cubes[i];
						
			var radius 	= cube1.position.length();		// Length of Vector in Spere equals radius
			var pos		= cube1.position.clone();
			var dist	= pos.sub(cube2.position);
			if (dist.length() > radius) {
				var spline 	= new THREE.SplineCurve3([
				   cube1.position,
				   //new THREE.Vector3(0, 0, 0),
				   spline_vector_line( cube1.position, cube2.position ),
				   cube2.position
				]);

			} else {
				var spline 	= new THREE.SplineCurve3([
				   cube1.position,
				   spline_vector_line( cube1.position, cube2.position ),
				   cube2.position
				]);
			}
			lines.push( line_mesh( spline, color ) );
		}
	};
	return lines;
}

function calculate_lines( base, cubes, color ){
	// TODO - beziehungen simulieren
	// vorerst werden hier nur Linien vom 0. Element zu allen anderen gezogen:
	var lines = new Array();
	var rnd = parseInt(Math.random()*50);
	for (var i=0; i < cubes.length; i++) {
		if (i % rnd == 1){
			var cube1, cube2;
			cube1	= base;
			cube2	= cubes[i];						
			var spline 	= new THREE.SplineCurve3([
			   cube1.position,
			   cube2.position
			]);
			lines.push( line_mesh( spline, color ) );
		}
	};
	return lines;
}

function spline_vector_line( position1, position2 ){
	var radius 	= position1.length();		
	var pos1	= position1.clone();
	var pos2	= position2.clone();
	
	var dist	= pos1.sub( pos2 );
	var len		= dist.length() / 2;
	dist.setLength( len );

	var pos2	= position2.clone();
	var middle 	= pos2.add( dist );
	var inv_middle	= middle.clone().negate();
	inv_middle.setLength( len / 2 );
	return middle.add( inv_middle );
//	return middle;
}

function local_scale( object ){
	if(object){
		object.scale.x = 40;
		object.scale.y = 40;
		object.scale.z = 5;    
	}
}