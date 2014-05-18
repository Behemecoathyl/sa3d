var packageList = new Array();

// TODO irgendwann mal ein Objekt daraus basteln

/**
 * Array ohne Duplikate  (geht das auch einfacher? :)) 
 * @param {String} packageName
 */
function add_to_packageList( packageName ){
	if (packageList){
		var isInList = false;
		for (var i=0; i < packageList.length; i++) {
		  	if ( packageName === packageList[i]){
		  		isInList = true;
		  		break;
		  	}
		};
		if (!isInList){
			packageList.push( packageName );
		}
	}
}

function init_packageList(){
	packageList = new Array();
}

function get_index_packageList( packageName ){
	if (packageList){
		for (var i=0; i < packageList.length; i++) {
		  	if ( packageName === packageList[i]){	
		  		return i;
		  	}
		};
	}
	return 0;
}
