/*****************************************************************************
 *	FileName: neo4j.js
 *
 *	Description: This file contains the javascript code related to operations 
 *	performed on the neo4j database. The main categories of operations are:
 *	Creating, Reading, Updating and Deleting.
 *
 ****************************************************************************/
 
 /*****************************************************************************
 *	Function Name: getNodeData()
 *	Description: Get node data from neo4j
 ****************************************************************************/
function getNodeData()
{
	
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
	data: JSON.stringify({"statements": [{"statement": "MATCH (n { name: 'Tourism' }) RETURN n"}]}),
    success: function (data, textStatus, jqXHR) {
		$(".neo4jResponse").html(JSON.stringify(data));
    },
    error: function (jqXHR, textStatus, errorThrown) {
        // handle errors
		alert("Error");
    }
});
	
}

/*****************************************************************************
 *	Function Name: showNodeFromNeo4j()
 *	Description: Get node data from neo4j and show it on the canvas
 ****************************************************************************/
function showNodeFromNeo4j()
{

// Setup AJAX Header for authorization		
$.ajaxSetup({
    headers: {
        // Add authorization header in all ajax requests
        "Authorization": "Basic bmVvNGo6T2NlYW4=" 
    }
});

$.ajax({
	async: false,
    type: "POST",
    url: "http://localhost:7474/db/data/transaction/commit ",
    dataType: "json",
    contentType: "application/json;charset=UTF-8",
	data: JSON.stringify({"statements": [{"statement": "MATCH (n { name: 'Quality' }) RETURN n"}]}),
    success: function (data, textStatus, jqXHR) {
        // use result data...
		nodeNameValue = data.results[0].data[0].row[0].name;
		nodeTitleValue = data.results[0].data[0].row[0].title;
    },
    error: function (jqXHR, textStatus, errorThrown) {
        // handle errors
		alert("Error");
    }
});

	// because :active only works in WebKit?
	svg.classed('active', true);
	
	  var node = {id: ++lastNodeId, reflexive: false, nodeName: nodeNameValue, nodeTitle: nodeTitleValue };
	node.x = 100;
	node.y = 100;
  
	nodes.push(node);

	restart();


}

/*****************************************************************************
 *	Function Name: showTwoNodes()
 *	Description: Get data from neo4j for two nodes and show them on the canvas
 ****************************************************************************/
function showTwoNodes()
{

// Setup AJAX Header for authorization		
$.ajaxSetup({
    headers: {
        // Add authorization header in all ajax requests
        "Authorization": "Basic bmVvNGo6T2NlYW4=" 
    }
});

$.ajax({
	async: false,
    type: "POST",
    url: "http://localhost:7474/db/data/transaction/commit ",
    dataType: "json",
    contentType: "application/json;charset=UTF-8",
	data: JSON.stringify({"statements": [{"statement": "MATCH ( n:CoastalDebris ) RETURN n"}]}),
    success: function (data, textStatus, jqXHR) {
		
		// Parse the JSON object returned from neo4j
		for (var i = 0; i < data.results[0].data.length; i++) 
		{
			var node = {id: ++lastNodeId, 
						reflexive: false, 
						nodeName: data.results[0].data[i].row[0].name, 
						nodeTitle: data.results[0].data[i].row[0].title };
			node.x = 100;
			node.y = 100;
  
			nodes.push(node);
		}
    },
    error: function (jqXHR, textStatus, errorThrown) {
        // handle errors
		alert("Error");
    }
});
	restart();
}

/*****************************************************************************
 *	Function Name: saveChanges()
 *	Description: Create a node in Neo4j
 ****************************************************************************/
function saveChanges(){
	//alert('12');
	//getNewPropertiesForUpdate();
	$('#saveChanges').prop('disabled', true);

var relationshipType=$('#relationshipType').val();
var tr = $('tr').length;
var tableDataJson={};
for(var i=0; i < tr;i++){
$.each($('tr:eq('+i+') td'),function(){
	var tds = $('tr:eq('+i+') td');

           var productId = $(tds).eq(0).text();
		   var name = $(tds).eq(1).text();
		   
		   if(!tableDataJson.hasOwnProperty(productId)){
			 if(productId=="Relationship Type"){
				 tableDataJson[productId]=$('#relationshipType').val();
			 }else{
				 tableDataJson[productId]=name;
			 }

}
});
}
//reating new properties set for update properties.
var propertiesSet=JSON.stringify(tableDataJson);

propertiesSet = propertiesSet.replace(/",/g, '\',');
propertiesSet = propertiesSet.replace(/:"/g, ':\'');
propertiesSet = propertiesSet.replace(/"/g, "");
propertiesSet = propertiesSet.replace(/}/g, '\'}');

alert("data is : "+JSON.stringify(tableDataJson));
if(!tableDataJson.hasOwnProperty("Node Type")){
			$.ajaxSetup({
    headers: {
        // Add authorization header in all ajax requests
        "Authorization": "Basic bmVvNGo6T2NlYW4=" 
    }
});

//Query the last generated id
var restServerURL = "http://localhost:7474/db/data";
$.ajax({
    async: false,
    type: "POST",
    url: restServerURL + "/node/"+tableDataJson['source neo4jNodeId']+"/relationships",
    dataType: "json",
	data:JSON.stringify({to: "http://localhost:7474/db/data/node/"+tableDataJson['target neo4jNodeId'], type: relationshipType,data:tableDataJson}),
    contentType: "application/json",
    success: function( data, xhr, textStatus ) {
         console.log("success"+data);
    },
    error: function(  data, xhr, textStatus ) {
        window.console && console.log( xhr );
		console.log("data is "+JSON.stringify(data)+"textStatus is "+textStatus+" and xhr is "+xhr);
        console.log("error");
    },
    complete: function() {
        console.log("complete function");   
    }
});
	}else{
			$.ajaxSetup({
    headers: {
        // Add authorization header in all ajax requests
        "Authorization": "Basic bmVvNGo6T2NlYW4=" 
    }
});

//Query the last generated id
	var restServerURL = "http://localhost:7474/db/data";
	tableDataJson["uri"]=data.self;
	tableDataJson["type"]="Driver";
	
$.ajax({
	//Code added by Conor
	async: false,
    type: "POST",
    url: restServerURL + "/node",
    data: JSON.stringify(tableDataJson),
    dataType: "json",
    contentType: "application/json",
    success: function( data, xhr, textStatus ) {
		 //Code added by Conor
		 neo4jNodeId = data.metadata.id;
    },
    error: function( xhr ) {
        window.console && console.log( xhr );
    },
    complete: function() {
    }
});
nodes.pop();
createNode(tableDataJson["name"], neo4jNodeId, true,$('#nodeType').val());
		
	}

}



function getNewPropertiesForUpdate(tableDataJson){
var relationshipType=$('#relationshipType').val();
var tr = $('tr').length;
for(var i=0; i < tr;i++){
$.each($('tr:eq('+i+') td'),function(){
	var tds = $('tr:eq('+i+') td');

           var productId = $(tds).eq(0).text();
		   var name = $(tds).eq(1).text();
		   
		   if(!tableDataJson.hasOwnProperty(productId)){
			 if(productId=="Relationship Type"){
				 tableDataJson[productId]=$('#relationshipType').val();
			 }else{
				 tableDataJson[productId]=name;
			 }

}
});
}
//reating new properties set for update properties.
var propertiesSet=JSON.stringify(tableDataJson);

propertiesSet = propertiesSet.replace(/",/g, '\',');
propertiesSet = propertiesSet.replace(/:"/g, ':\'');
propertiesSet = propertiesSet.replace(/"/g, "");
propertiesSet = propertiesSet.replace(/}/g, '\'}');
propertiesSet = propertiesSet.replace(/''/g, '\'ggg\'');
propertiesSet = propertiesSet.replace(/\s+/g,"");

//alert("data is : "+JSON.stringify(tableDataJson));

return propertiesSet;
}

/*****************************************************************************
 *	Function Name: updateNodeProperty(nodeQueryCriteria)
 *	Description: This method will override the old properties set of a 
				specific node with the new one.
				nodeQueryCriteria - Based on this parameter query will be done 
				to find a specific node to update the properties.
 ****************************************************************************/
function updateNodeProperty(nodeQueryCriteria){

	var tableDataJson={};
	var newPropertiesSet=getNewPropertiesForUpdate(tableDataJson);
	var nodeCriteriaValue=tableDataJson[nodeQueryCriteria];

	alert("MATCH (n { "+nodeQueryCriteria+": '"+nodeCriteriaValue+"' }) SET n = "+newPropertiesSet+" RETURN n");
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
	data: JSON.stringify({"statements":[{"statement":"MATCH (n { "+nodeQueryCriteria+": '"+nodeCriteriaValue+"' }) SET n = "+newPropertiesSet+" RETURN n"}]}),
    success: function (data, textStatus, jqXHR) {
        // use result data...
		//alert("Success text status is " + textStatus + " and data is " + JSON.stringify(data));

    },
    error: function (jqXHR, textStatus, errorThrown) {
		alert("Error");
    }
});
}


/*****************************************************************************
 *	Function Name: updateRelProperty(sourceNodeQueryCriteria,targetNodeQueryCriteria,neo4JID)
 *	Description: This method will override the old properties set of a 
				specific relationship with the new one.
				sourceNodeQueryCriteria - This parameter contains the source node 
				information for query of relationship.
				targetNodeQueryCriteria - This parameter contains the target node 
				information for query of relationship.
			 
 ****************************************************************************/
function updateRelProperty(sourceNodeQueryCriteria,targetNodeQueryCriteria,neo4JID){
	alert('1');
	var tableDataJson={};
	var newPropertiesSet=getNewPropertiesForUpdate(tableDataJson);

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
	data: JSON.stringify({"statements":[{"statement":"MATCH (n) WHERE ID(n)="+tableDataJson[sourceNodeQueryCriteria]+" MATCH (m) WHERE ID(m)="+tableDataJson[targetNodeQueryCriteria]+" OPTIONAL MATCH (n)-[r:"+tableDataJson["Relationship Type"]+"]->(m) SET r="+newPropertiesSet+" RETURN r"}]}),
    success: function (data, textStatus, jqXHR) {
        // use result data...
		//alert("Success text status is " + textStatus + " and data is " + JSON.stringify(data));

    },
    error: function (jqXHR, textStatus, errorThrown) {
		alert("Error");
    }
});
}

/*****************************************************************************
 *	Function Name: deleteRelationship(sourceNodeQueryCriteria,targetNodeQueryCriteria,targetNodeCriteriaValue,neo4JID)
 *	Description: This method will delete the relationship between queried source and target node.
				sourceNodeQueryCriteria - This parameter contains the source node 
				information for query of relationship for deletion.
				targetNodeQueryCriteria - This parameter contains the target node 
				information for query of relationship for deletion.
			 
 ****************************************************************************/
function deleteRelationship(sourceNodeQueryCriteria,targetNodeQueryCriteria,targetNodeCriteriaValue,neo4JID){
	//MATCH (n{name:'Test1'}) OPTIONAL MATCH (n)-[r]->() DELETE n,r
	
	var tableDataJson={};
	var newPropertiesSet=getNewPropertiesForUpdate(tableDataJson);
	
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
	data: JSON.stringify({"statements":[{"statement":"MATCH (n) WHERE ID(n)="+tableDataJson[sourceNodeQueryCriteria]+" MATCH (m) WHERE ID(m)="+tableDataJson[targetNodeQueryCriteria]+" OPTIONAL MATCH (n)-[r:"+tableDataJson["Relationship Type"]+"]->(m) DELETE r"}]}),
    success: function (data, textStatus, jqXHR) {
        // use result data...
		//alert("Success text status is " + textStatus + " and data is " + JSON.stringify(data));

    },
    error: function (jqXHR, textStatus, errorThrown) {
		alert("Error");
    }});
}

/*****************************************************************************
 *	Function Name: deleteNode(nodeQueryCriteria)
 *	Description: This method will delete a specific node and its associated relationships.
				nodeQueryCriteria - Based on this parameter query will be done 
				to find a specific node to delete.
 ****************************************************************************/
function deleteNode(nodeQueryCriteria){
	//MATCH (n{name:'Test1'}) OPTIONAL MATCH (n)-[r]->() DELETE n,r
	var tableDataJson={};
	var newPropertiesSet=getNewPropertiesForUpdate(tableDataJson);
	
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
	data: JSON.stringify({"statements":[{"statement":"MATCH (n { "+nodeQueryCriteria+": '"+tableDataJson[nodeQueryCriteria]+"' }) OPTIONAL MATCH (n)-[r]->() DELETE n,r"}]}),
    success: function (data, textStatus, jqXHR) {
        // use result data...
		//alert("Success text status is " + textStatus + " and data is " + JSON.stringify(data));

    },
    error: function (jqXHR, textStatus, errorThrown) {
		alert("Error");
    }
});
}
