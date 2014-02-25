/**
 * @author Behemecoathyl
 */

SA3D.Object3D = function(){
	this.name = '';
	this.position = new THREE.Vector3();
	return this;
};



SA3D.Object3D.prototype = {

	constructor: SA3D.Object3D,	
	setName: function ( name ) {
		this.name = name;
		return this;
	}
	
};
