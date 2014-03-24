/**
 * @author Behemecoathyl
 */

var family= {
  "name": "Fred",
  "age": 81,
  "kids": [
    {
      "name": "Becky",
      "age": 51,
      "kids": [
         {"name": "John", "age": 15},
         {"name": "Jill", "age": 11}
      ]
    }
  ]
};

init_treemap();

function init_treemap(){			
	var treemap = d3.layout.treemap();
	treemap.children(function(d){ 
	  					return d.kids;
	  			});  // instructs the algorithm to find children by looking for node.kids instead of the default node.children
	treemap.value(function(d){ 
	  					return d.age; 
				});  // similarly, value of the nodes is the age attribute of the node
	
	// now whenever treemap has gone through and set up your structure, you can call
	var persons = treemap.nodes(family);   // to get all the people in the family (flat structure)
	// each person object will have (after d3 enriches it)
	// * parent - the parent node, or null for the root.
	// * children - the array of child nodes, or null for leaf nodes.
	// * value - the node value, as returned by the value accessor.
	// * depth - the depth of the node, starting at 0 for the root.
	// * x - the minimum x-coordinate of the node position.
	// * y - the minimum y-coordinate of the node position.
	// * dx - the x-extent of the node position.
	// * dy - the y-extent of the node position.
	log(persons);	
		
	var relationship = treemap.links(persons);  // this will give you the link nodes which will be objects with the following attributes
	// * source - the parent node (as described above).
	// * target - the child node.
}	