/*****************************************************************************
 *	FileName: canvas.js
 *	Description: This file contains the javascript code for the canvas displayed 
 *	in the centre section of the Responseable user interface.
 ****************************************************************************/

/*****************************************************************************
 *	Global Variables
 ****************************************************************************/
var hiddenDefaultPropertyNode=({"reflexive":"reflexive","neo4jNodeId":"neo4jNodeId","x":"x","y":"y","index":"index","weight":"weight","px":"px","py":"py"});
var hiddenDefaultPropertyNodeDocument=({"reflexive":"reflexive","neo4jNodeId":"neo4jNodeId","x":"x","y":"y","index":"index","weight":"weight","px":"px","py":"py","nodeSavedToDatabase":"nodeSavedToDatabase","fixed":"fixed","nodeName":"nodeName"});
var hiddenDefaultPropertyRelation=({"left":"left","right":"right"});
var data = new Array();
var defaultData = ({"key":"ttt","value":"ttt","uri":data.self});

// Set up SVG for D3
var width = 640,
	height = 360
    colors = d3.scale.category10();

// Bind svg to the div named "panel-body"
var svg = d3.select('#panel-body')
  .append('svg')
  .attr('oncontextmenu', 'return false;')
  .attr('width', width)
  .attr('height', height)
  .call(d3.behavior.zoom().on("zoom", redraw));
  
  
/*****************************************************************************
 *	Function Name: redraw()
 *	Description: Used to implement zoom behaviour on the D3 canvas
 ****************************************************************************/
 // Moving to canvas.js
  function redraw() {
	  d3.event.sourceEvent.stopPropagation();
      svg.attr("transform",
          "translate(" + d3.event.translate + ")"
          + " scale(" + d3.event.scale + ")");
    } 

	
var nodeNameValue = "";
var nodeTitleValue = "";


// nodes and links arrays containing details displayed on canvas
var nodes = [],
  lastNodeId = -1,
  links = [];
  
// init D3 force layout
var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([width, height])
    .linkDistance(150)
    .charge(-500)
    .on('tick', tick)

// define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 6)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#000');

svg.append('svg:defs').append('svg:marker')
    .attr('id', 'start-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 4)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M10,-5L0,0L10,5')
    .attr('fill', '#000');

// line displayed when dragging new nodes
var drag_line = svg.append('svg:path')
  .attr('class', 'link dragline hidden')
  .attr('d', 'M0,0L0,0');


// handles to link and node element groups
var path = svg.append('svg:g').selectAll('path'),
    circle = svg.append('svg:g').selectAll('g');

// mouse event variables
var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;

	
/*****************************************************************************
 *	Function Name: resetMouseVars()
 *	Description: Used to clear the global mouse event variables
 ****************************************************************************/
function resetMouseVars() {
  mousedown_node = null;
  mouseup_node = null;
  mousedown_link = null;
}

/*****************************************************************************
 *	Function Name: tick()
 *	Description: Updates force layout (called automatically each iteration)
 ****************************************************************************/
function tick() {
  // draw directed edges with proper padding from node centers
  path.attr('d', function(d) {
	  //alert("Inside tick function, d contains " + JSON.stringify(d));
    var deltaX = d.target.x - d.source.x,
        deltaY = d.target.y - d.source.y,
        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        normX = deltaX / dist,
        normY = deltaY / dist,
		sourcePadding,
		targetPadding;
		
		if ( d.relType == "instanceOf" )
		{
			sourcePadding = d.left ? 35 : 30;
			targetPadding = d.right ? 35 : 30;
		}
		else if ( d.relType == "causal" )
		{
			// Padding values changed because the causal relationship
			// contains two lines which are connecting nodes of different sizes
			if ( d.relPart == 1 ) // First part of causal relationship
			{
				sourcePadding = d.left ? 35 : 30;
				targetPadding = d.right ? 19 : 14;
			}
			else
			{
				sourcePadding = d.left ? 19 : 14;
				targetPadding = d.right ? 35 : 30;
			}
		}
		else
		{
			sourcePadding = d.left ? 35 : 30;
			targetPadding = d.right ? 35 : 30;
		}
		
    var sourceX = d.source.x + (sourcePadding * normX),
        sourceY = d.source.y + (sourcePadding * normY),
        targetX = d.target.x - (targetPadding * normX),
        targetY = d.target.y - (targetPadding * normY);
		
		if ( d.relType == "instanceOf" )
		{
			// Straight line for relationship
			return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
		}
		else
		{
			// Curved line for relationship
			return "M" + sourceX + "," + sourceY + "A" + dist + "," + dist + " 0 0,1 " + targetX + "," + targetY;
		}
  });

  circle.attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });
}

/*****************************************************************************
 *	Function Name: restart()
 *	Description: Updates the graph on the canvas. This function is also called
 *               recursively.
 ****************************************************************************/
function restart() {
  // path (link) group
  path = path.data(links);

  // update existing links
  path.classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });
	
  // add new links
  path.enter().append('svg:path')
    .attr('class', 'link')
	.attr("id", function(l){return "link"+l.source.id+l.target.id;})
    .classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
    .on('mousedown', function(d) {
      if(d3.event.ctrlKey) return;
	  
path.attr("d", function(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
});

//Call function to open property window.
      // select link
      mousedown_link = d;
      if(mousedown_link === selected_link) selected_link = null;
      else selected_link = mousedown_link;
      selected_node = null;
	  showPropertyWindowForRelationship();
	  
      restart();
    });

  // remove old links
  path.exit().remove();


  // circle (node) group
  // NB: the function arg is crucial here! nodes are known by id, not by index!
  circle = circle.data(nodes, function(d) { return d.id; });

  // update existing nodes (reflexive & selected visual states)
  circle.selectAll('circle')
	.style('fill', function(d) 
		{ 
			// Changing code from using ternary operator to if statement		
			if ( d === selected_node )
			{
				return getDPSIRColor(d.nodeType);
			}
			else
			{
				return getDPSIRColor(d.nodeType);
			}
		}
	)
	.classed('reflexive', function(d) { return d.reflexive; });

  // add new nodes
  var g = circle.enter().append('svg:g')
	
var drag = force.stop().drag()
.on("dragstart", function(d) {
    d3.event.sourceEvent.stopPropagation(); // to prevent pan functionality from 
     d3.select(this).classed("fixed", d.fixed = true); //overriding node drag functionality.
     //put any other 'dragstart' actions here
});

  g.append('svg:circle')
	.attr("class", function(d){ if($('#nodeType').val()=="Document"){return 'node type4'}else{return 'node'}})
	.attr("text-anchor", "middle")
	.attr('r', function(d){
		if( d.nodeType == "RelationshipNodeInfo" )
		{
			return 14;
		}if( d.nodeType == "Document" )
		{
			return 30;
		}
		else
		{
			return 30
		}
		
	})
	.attr('id', function(d){ return 'nodeName' + d.id; })
	.style('fill', function(d) 
		{
			// Changing code from using ternary operator to if statement
			if ( d === selected_node )
			{
				return getDPSIRColor(d.nodeType);
			}
			else
			{
				return getDPSIRColor(d.nodeType);
			}
		}
	)
    .style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); })
    .classed('reflexive', function(d) { return d.reflexive; })
	.call(drag)
   .on('mouseover', function(d) {
      // enlarge target node
     d3.select(this).attr('transform', 'scale(1.1)');
    })
    .on('mouseout', function(d) {
      // unenlarge target node
      d3.select(this).attr('transform', '');
    })

	// This appears to be where the node is being selected
    .on('mousedown', function(d) {
      if(d3.event.ctrlKey) return;

      // select node
      mousedown_node = d;
	  selected_node = mousedown_node;
      selected_link = null;
	  	
	 showPropertyWindow();
	
      // reposition drag line
      drag_line
        .style('marker-end', 'url(#end-arrow)')
        .classed('hidden', false)
        .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

      restart();
    })
	.on('mouseup', function(d) {
      if(!mousedown_node) return;

      // needed by FF
      drag_line
        .classed('hidden', true)
        .style('marker-end', '');

      // check for drag-to-self
      mouseup_node = d;
      if(mouseup_node === mousedown_node) { resetMouseVars(); return; }

      // unenlarge target node
      d3.select(this).attr('transform', '');

      // add link to graph (update if exists)
      // NB: links are strictly source < target; arrows separately specified by booleans
      var source, target, direction;
      if(mousedown_node.id < mouseup_node.id) {
        source = mousedown_node;
        target = mouseup_node;
        direction = 'right';
      } else {
        source = mouseup_node;
        target = mousedown_node;
        direction = 'left';
      }
	  
	console.log("mouse up node"+JSON.stringify(mouseup_node));
	console.log("mouse down node"+mousedown_node);

      var link;
      link = links.filter(function(l) {
        return (l.source === source && l.target === target);
      })[0];

      if(link) {
        link[direction] = true;
      } else {
		//Creating links
        link = {source: source, target: target, left: false, right: false, relType: "instanceOf"};
        link[direction] = true;
        links.push(link);
      }
      // select new link
      selected_link = link;
      selected_node = null;

      restart();
    });

  // show node IDs
  g.append('svg:text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('class', 'id')
	  .attr("text-anchor", "middle")
	  .attr("fill", "white")
	  .style("font-size","11px")
	  .text(function(d) {
		  
		  if( d.nodeType == "RelationshipNodeInfo" )
		  {
			  return "";
		  }
		  else
		  {
			  return d.nodeName;
		  }
		  
	  });

  // remove old nodes
  circle.exit().remove();
  
    function fade(opacity) {
		
        return function(d) {
            node.style("stroke-opacity", function(o) {
                thisOpacity = isConnected(d, o) ? 1 : opacity;
                this.setAttribute('fill-opacity', thisOpacity);
                return thisOpacity;
            });

            link.style("stroke-opacity", function(o) {
                return o.source === d || o.target === d ? 1 : opacity;
            });
        };
    }

  // set the graph in motion
  force.start();
}

/*****************************************************************************
 *	Function Name: mousedown()
 *	Description: Called when user clicks on the canvas
 ****************************************************************************/
function mousedown() {
  // prevent I-bar on drag
  d3.event.preventDefault();
 
  // because :active only works in WebKit?
  svg.classed('active', true);

  if(d3.event.ctrlKey || mousedown_node || mousedown_link) return;

}

/*****************************************************************************
 *	Function Name: mousemove()
 *	Description: Called when svg.on(mousemove
 ****************************************************************************/
function mousemove() {
  if(!mousedown_node) return;

  // update drag line
  drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

  restart();
}

/*****************************************************************************
 *	Function Name: mouseup()
 *	Description: Called when svg.on(mouseup
 ****************************************************************************/
function mouseup() {
  if(mousedown_node) {
    // hide drag line
    drag_line
      .classed('hidden', true)
      .style('marker-end', '');
  }

  // because :active only works in WebKit?
  svg.classed('active', false);

  // clear mouse event vars
  resetMouseVars();
}

/*****************************************************************************
 *	Function Name: spliceLinksForNode()
 *	Description: Used for deleting
 ****************************************************************************/
function spliceLinksForNode(node) {
  var toSplice = links.filter(function(l) {
    return (l.source === node || l.target === node);
  });
  toSplice.map(function(l) {
    links.splice(links.indexOf(l), 1);
  });
}

// only respond once per keydown
var lastKeyDown = -1;

/*****************************************************************************
 *	Function Name: keydown()
 *	Description: Called when a key is pressed on the keyboard
 ****************************************************************************/
function keydown() {
  d3.event.preventDefault();

  if(lastKeyDown !== -1) return;
  lastKeyDown = d3.event.keyCode;

  // ctrl
  if(d3.event.keyCode === 17) {
    circle.call(force.drag);
    svg.classed('ctrl', true);
  }

  if(!selected_node && !selected_link) return;
  switch(d3.event.keyCode) {
    case 8: // backspace
    case 46: // delete
      if(selected_node) {
        nodes.splice(nodes.indexOf(selected_node), 1);
        spliceLinksForNode(selected_node);
      } else if(selected_link) {
        links.splice(links.indexOf(selected_link), 1);
      }
      selected_link = null;
      selected_node = null;
      restart();
      break;
    case 66: // B
      if(selected_link) {
        // set link direction to both left and right
        selected_link.left = true;
        selected_link.right = true;
      }
      restart();
      break;
    case 76: // L
      if(selected_link) {
        // set link direction to left only
        selected_link.left = true;
        selected_link.right = false;
      }
      restart();
      break;
    case 82: // R
      if(selected_node) {
        // toggle node reflexivity
        selected_node.reflexive = !selected_node.reflexive;
      } else if(selected_link) {
        // set link direction to right only
        selected_link.left = false;
        selected_link.right = true;
      }
      restart();
      break;
  }
}

/*****************************************************************************
 *	Function Name: keydown()
 *	Description: Called when a key is released on the keyboard
 ****************************************************************************/
function keyup() {
  lastKeyDown = -1;

  // ctrl
  if(d3.event.keyCode === 17) {
    circle
      .on('mousedown.drag', null)
      .on('touchstart.drag', null);
    svg.classed('ctrl', false);
  }
}

// app starts here
svg.on('mousedown', mousedown)
  .on('mousemove', mousemove)
  .on('mouseup', mouseup);
d3.select(window)
 // .on('keydown', keydown)
 // .on('keyup', keyup);
restart();


function fx(){

	nodes.each( function() {
        var node_data = d3.select(this).datum();
		
	})
		var saveEdges = [];
}


/*****************************************************************************
 *	Function Name: createNode()
 *	Description: Creates a node on the canvas
 ****************************************************************************/
function createNode(inputName, inputNeo4jNodeId, inputNodeSavedToDatabase,nodeType)
{
	var node={};
	var allNodesSaved = true;
	
	// Check all nodes to ensure they are saved to database
	for(var i = 0; i < nodes.length; i++)
	{
		//alert("Saved to database value is " + nodes[i]['nodeSavedToDatabase']);
		if ( nodes[i]['nodeSavedToDatabase'] == false )
		{
			//Disable this feature for now
			allNodesSaved = true;
		}
	}	
	// If all nodes are saved allow user to create new node
	if ( allNodesSaved == true )
	{		
		// because :active only works in WebKit?
		svg.classed('active', true);
		
		//Document Node Type
		if(nodeType!="Document"){
			node = {id: ++lastNodeId, reflexive: false, nodeName: inputName, neo4jNodeId: inputNeo4jNodeId, nodeSavedToDatabase: inputNodeSavedToDatabase, nodeType: nodeType};
		}else{
			node = {id: ++lastNodeId, reflexive: false, nodeName: inputName, neo4jNodeId: inputNeo4jNodeId, nodeSavedToDatabase: inputNodeSavedToDatabase, nodeType: nodeType,DocumentType:" ",Description:" "};
		}
		
		node.x = 300;
		node.y = 300;  
		nodes.push(node);
		restart();
	}
	else
	{
		alert("Node has not been saved to database. Please save existing nodes before creating new nodes");
	}
	return node;
	
}

/*****************************************************************************
 *	Function Name: createRelationshipNode()
 *	Description: 
 ****************************************************************************/
function createRelationshipNode(inputName, inputNeo4jNodeId, inputNodeSavedToDatabase,nodeType)
{
	var allNodesSaved = true;
	
	// Check all nodes to ensure they are saved to database
	for(var i = 0; i < nodes.length; i++)
	{
		if ( nodes[i]['nodeSavedToDatabase'] == false )
		{	
			//Disable this feature for now
			allNodesSaved = true;
		}
	}	
	// If all nodes are saved allow user to create new node
	if ( allNodesSaved == true )
	{		
		// because :active only works in WebKit?
		svg.classed('active', true);
		
		var node = {id: "test", reflexive: false, nodeName: inputName, neo4jNodeId: inputNeo4jNodeId, nodeSavedToDatabase: inputNodeSavedToDatabase, nodeType:"RelationshipInfoNode"};
		node.x = 300;
		node.y = 300;  
		
		nodes.push(node);
		restart();
	}
	else
	{
		alert("Node has not been saved to database. Please save existing nodes before creating new nodes");
	}
	
}

/*****************************************************************************
 *	Function Name: highlightPath()
 *	Description: Highlight the path between two nodes
 ****************************************************************************/
function highlightPath() {
		
		var sourceNodeName=$( sourceNode).val();
		var targetNodeName=$( targetNode).val();
		
		$( sourceNode).val("");
		$( targetNode).val("");

		d3.selectAll(".node").style("opacity", 0.2);
		d3.selectAll(".link").style("opacity", 0.2);

		
		var statements="MATCH p=({nodeName:"+"\""+sourceNodeName+"\""+"})-[:Other*1..5]->({nodeName:"+"\""+targetNodeName+"\""+"})RETURN p";

		// Setup AJAX Header for authorization		
$.ajaxSetup({
    headers: {
        // Add authorization header in all ajax requests
        "Authorization": "Basic bmVvNGo6T2NlYW4=" 
    }
});
		
 $.ajax({
     type: "POST",
    url: "http://localhost:7474/db/data/transaction/commit ",
    dataType: "json",
    contentType: "application/json;charset=UTF-8",
	data: JSON.stringify({"statements":[{"statement":"MATCH p=({nodeName:"+"\""+sourceNodeName+"\""+"})-[:Other*1..5]->({nodeName:"+"\""+targetNodeName+"\""+"})RETURN p"}]}),
    success: function (data, textStatus, jqXHR) {
        // use result data...
		            data.results[0].data[0].row[0].forEach(function (n) {
						
					if(n.id!=undefined){
						
						var nodeId=parseInt(n.id);
						var newid=nodeId+1;
						 d3.select("#nodeName"+newid).style("opacity",1);
					}else{
						d3.select("#link" +n.sourceid+n.targetid).style("opacity", 1);
					}

            });
    },
    error: function (jqXHR, textStatus, errorThrown) {
		alert("Error");
    }
});

}
	
function findAttribute(name) {
	for (var i = 0, len = graph.nodes.length; i < len; i++) {
		if (graph.nodes[i].name === name)
			return graph.nodes[i]; // Return as soon as the object is found
	}
	return null; // The object was not found
}

/*****************************************************************************
 *	Function Name: getDPSIRColor()
 *	Description: Return the hex value for the color of a node based on 
 *               nodeType.
 ****************************************************************************/
function getDPSIRColor(nodeType)
{
	var returnValue = '#0066CC'; // Default color	
	if ( nodeType === "Document" )
	{
		returnValue = '#D3D3D3';
	}
	else if ( nodeType === "RelationshipNodeInfo" )
	{
		returnValue = '#000000';
	}
	
	return returnValue;
	
}


function dragstart(d) {
  d3.select(this).classed("fixed", d.fixed = true);
}

/*****************************************************************************
 *	Function Name: getNodeByName()
 *	Description: Search for a node name on the canvas
 ****************************************************************************/
function getNodeByName(name)
{
	var returnValue = null;
	
	for (var i=0;i<nodes.length;i++) 
	{
		if ( nodes[i].nodeName == name )
		{
			returnValue = nodes[i];
		}
	}

	return returnValue;
	
}

/*****************************************************************************
 *	Function Name: getNodeById()
 *	Description: Search for a node Id on the canvas
 ****************************************************************************/
function getNodeById(id)
{

	var returnValue = null;
	
	for (var i=0;i<nodes.length;i++) 
	{
		if ( nodes[i].id == id )
		{
			returnValue = nodes[i];
		}
	}

	return returnValue;
	
}

/*****************************************************************************
 *	Function Name: createRelationship()
 *	Description: This method will create a causal relationship between two nodeSavedToDatabase
                 by inserting a new node and dividing one relationship to two
				 and connecting both relationship with the newly created node.
 ****************************************************************************/
function createRelationship()
{	
	var source, target, direction;	  
	  direction = 'right';	  
	  source = getNodeByName( $(relSourceNode).val() );
	  target = getNodeByName( $(relTargetNode).val() );	  

	  var newNode = createNode('New Node', 0, false,"RelationshipNodeInfo");
	  
      var link;
	  var linkTwo;
      link = links.filter(function(l) {
        return (l.source === source && l.target === target);
      })[0];

      if(link) {
        link[direction] = true;
      } else {
	   link = {source: source, target: newNode, left: false, right: false, relType: "causal", relPart: 1};
	   linkTwo = {source: newNode, target: target, left: false, right: false, relType: "causal", relPart: 2};
        link[direction] = true;
		linkTwo[direction] = true;
		
        links.push(link);
		links.push(linkTwo);
      }

      // select new link
      selected_link = link;
      selected_node = null;

      restart();
	
}





