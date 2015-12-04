/*****************************************************************************
 *	FileName: neo4j.js
 *
 *	Description: This file contains the javascript code related to operations 
 *	performed on the neo4j database. The main categories of operations are:
 *	Creating, Reading, Updating and Deleting.
 *
 ****************************************************************************/

/*****************************************************************************
 *	Function Name: saveChanges()
 *	Description: Create a node/relationship in Neo4j
 ****************************************************************************/
function saveChanges(){

	//Disable button on click.
	$('#saveChanges').prop('disabled', true);
	//Get relationship type value.
	var relationshipType=$('#relationshipType').val();

	//Get table data in Json format.
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

	//Ajax authentication request for saving relationship to Neo4j.
	if(!tableDataJson.hasOwnProperty("nodeType")){
				$.ajaxSetup({
		headers: {
			// Add authorization header in all ajax requests
			"Authorization": "Basic bmVvNGo6T2NlYW4=" 
		}
	});

	//Ajax request for saving relationship to Neo4j.
	//Passing source Neo4j Id in url and target Neo4j Id in data for creating relationship.
	var restServerURL = "http://localhost:7474/db/data";
	$.ajax({
		async: false,
		type: "POST",
		url: restServerURL + "/node/"+tableDataJson['sourceNeo4jNodeId']+"/relationships",
		dataType: "json",
		data:JSON.stringify({to: "http://localhost:7474/db/data/node/"+tableDataJson['targetNeo4jNodeId'], type: relationshipType,data:tableDataJson}),
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
	
	//Ajax code for creating a node in Neo4j.
	//Authentication header of ajax request.
	}else{
		$.ajaxSetup({
		headers: {
			"Authorization": "Basic bmVvNGo6T2NlYW4=" 
			}
		});
		var restServerURL = "http://localhost:7474/db/data";
		tableDataJson["uri"]=data.self;

		//Ajax request for saving a Node with Node json properties as input.	
		$.ajax({
			async: false,
			type: "POST",
			url: restServerURL + "/node",
			data: JSON.stringify(tableDataJson),
			dataType: "json",
			contentType: "application/json",
			success: function( data, xhr, textStatus ) {
				 neo4jNodeId = data.metadata.id;
			},
			error: function( xhr ) {
				window.console && console.log( xhr );
			},
			complete: function() {
			}
		});

		//Delete the last created node on canvas.
		//This code needs enhancement.
		nodes.pop();

		//Create a new node on canvas with Neo4j id from Neo4j database.
		createNode(tableDataJson["nodeName"], neo4jNodeId, true,'Driver');

		// Set the property neo4jNodeId in the database to the id returned from neo4j
		//This code needs enhancement.
		$.ajaxSetup({
			headers: {
			"Authorization": "Basic bmVvNGo6T2NlYW4=" 
			}
		});
		// Set the property neo4jNodeId in the database to the id returned from neo4j
		//This code needs enhancement.
		$.ajax({
			type: "POST",
			url: "http://localhost:7474/db/data/transaction/commit ",
			dataType: "json",
			contentType: "application/json;charset=UTF-8",
			data: JSON.stringify({"statements": [{"statement": "START n=node(" + neo4jNodeId + ") SET n.neo4jNodeId = " + neo4jNodeId + " RETURN n"}]}),
			success: function (data, textStatus, jqXHR) {
				//alert("neo4jNodeId property successfully updated in database");
			},
			error: function (jqXHR, textStatus, errorThrown) {
				// handle errors
				alert("Error");
			}
		});

		
	}

}

/*****************************************************************************
 *	Function Name: getNewPropertiesForUpdate(tableDataJson)
 *	Description: This mehtod converts a json object to string as update method
				 of Neo4j takes string as input.
				 The sample input string for update is {property:'value'}
 ****************************************************************************/
function getNewPropertiesForUpdate(tableDataJson){
//Creating property window data in json format.
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
//creating new properties string for update properties.
//Replacing "" with '' and removing space from properties name.
var propertiesSet=JSON.stringify(tableDataJson);
propertiesSet = propertiesSet.replace(/",/g, '\',');
propertiesSet = propertiesSet.replace(/:"/g, ':\'');
propertiesSet = propertiesSet.replace(/"/g, "");
propertiesSet = propertiesSet.replace(/}/g, '\'}');
propertiesSet = propertiesSet.replace(/''/g, '\'ggg\'');
propertiesSet = propertiesSet.replace(/\s+/g,"");

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
	//Get Node properties in string format for input of update operation.
	var newPropertiesSet=getNewPropertiesForUpdate(tableDataJson);
	//Get Query criteria value for updating a particular node.
	var nodeCriteriaValue=tableDataJson[nodeQueryCriteria];

	// Setup AJAX Header for authorization		
	$.ajaxSetup({
		headers: {
			"Authorization": "Basic bmVvNGo6T2NlYW4=" 
		}
	});

	//Ajax request for selecting a node for update and passing new properties value string for update.
	 $.ajax({
		 type: "POST",
		url: "http://localhost:7474/db/data/transaction/commit ",
		dataType: "json",
		contentType: "application/json;charset=UTF-8",
		data: JSON.stringify({"statements":[{"statement":"MATCH (n { "+nodeQueryCriteria+": '"+nodeCriteriaValue+"' }) SET n = "+newPropertiesSet+" RETURN n"}]}),
		success: function (data, textStatus, jqXHR) {
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

	var tableDataJson={};
	//Get Node properties in string format for input of update operation.
	var newPropertiesSet=getNewPropertiesForUpdate(tableDataJson);
	// Setup AJAX Header for authorization	
	$.ajaxSetup({
		headers: {
			"Authorization": "Basic bmVvNGo6T2NlYW4=" 
		}
	});
	//Ajax request for selecting a relationship for update and passing new properties value string for update.
	//Relationship will be queried on sourceNeo4j and targetNeo4j property values.
	 $.ajax({
		 type: "POST",
		url: "http://localhost:7474/db/data/transaction/commit ",
		dataType: "json",
		contentType: "application/json;charset=UTF-8",
		data: JSON.stringify({"statements":[{"statement":"MATCH (n) WHERE ID(n)="+tableDataJson[sourceNodeQueryCriteria]+" MATCH (m) WHERE ID(m)="+tableDataJson[targetNodeQueryCriteria]+" OPTIONAL MATCH (n)-[r:"+tableDataJson["Relationship Type"]+"]->(m) SET r="+newPropertiesSet+" RETURN r"}]}),
		success: function (data, textStatus, jqXHR) {
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
	var tableDataJson={};
	//Get Node properties in string format for input of update operation.
	var newPropertiesSet=getNewPropertiesForUpdate(tableDataJson);
	
	// Setup AJAX Header for authorization	
	$.ajaxSetup({
    headers: {
        "Authorization": "Basic bmVvNGo6T2NlYW4=" 
    }
	});
	//Ajax request for deleting a relationship.
	//Relationship will be selected on sourceNeo4j and targetNeo4j property values.
	 $.ajax({
		 type: "POST",
		url: "http://localhost:7474/db/data/transaction/commit ",
		dataType: "json",
		contentType: "application/json;charset=UTF-8",
		data: JSON.stringify({"statements":[{"statement":"MATCH (n) WHERE ID(n)="+tableDataJson[sourceNodeQueryCriteria]+" MATCH (m) WHERE ID(m)="+tableDataJson[targetNodeQueryCriteria]+" OPTIONAL MATCH (n)-[r:"+tableDataJson["Relationship Type"]+"]->(m) DELETE r"}]}),
		success: function (data, textStatus, jqXHR) {
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

	var tableDataJson={};
	//Get Node properties in string format for input of update operation.
	var newPropertiesSet=getNewPropertiesForUpdate(tableDataJson);
	// Setup AJAX Header for authorization	
	$.ajaxSetup({
    headers: {
        "Authorization": "Basic bmVvNGo6T2NlYW4=" 
    }
	});
	//Ajax request for deleting a node.
	//node will be selected on nodeName property value.
	 $.ajax({
		 type: "POST",
		url: "http://localhost:7474/db/data/transaction/commit ",
		dataType: "json",
		contentType: "application/json;charset=UTF-8",
		data: JSON.stringify({"statements":[{"statement":"MATCH (n { "+nodeQueryCriteria+": '"+tableDataJson[nodeQueryCriteria]+"' }) OPTIONAL MATCH (n)-[r]->() DELETE n,r"}]}),
		success: function (data, textStatus, jqXHR) {
		},
		error: function (jqXHR, textStatus, errorThrown) {
			alert("Error");
		}
	});
}


/*****************************************************************************
 *	Function Name: showGraphFromNeo4j()
 *	Description: Get data from neo4j for the complete graph and show it on the 
 *	canvas. 
 ****************************************************************************/
function showGraphFromNeo4j()
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
		data: JSON.stringify({"statements": [{"statement": "MATCH (n) MATCH (m) OPTIONAL MATCH n-[r]->m RETURN n,r,m"}]}),
		success: function (data, textStatus, jqXHR) {
			
			// Loop through the data and populate the nodes array
			for(var rowCount = 0; rowCount < data.results[0].data.length; rowCount++)
			{
				var elementPath = data.results[0].data[rowCount].row;
				
				for(var elementCount = 0; elementCount < elementPath.length; elementCount++)
				{
					var elementInfo = elementPath[elementCount];
					
					if( (elementInfo != null) && (elementInfo.hasOwnProperty("nodeName")) )
					{
						//alert("Found Node");
						// Check to ensure that node has not been added to the node array already
						if(getNodeById(elementInfo.neo4jNodeId) == null)
						{
							// Push node into the node array
							var node = {id: elementInfo.neo4jNodeId,
										reflexive: false,
										nodeName: elementInfo.nodeName,
										neo4jNodeId: elementInfo.neo4jNodeId };
							
							node.x = 100;
							node.y = 100;
							
							nodes.push(node);
						}
					}
				}
			}
			
			var direction = 'right';
			
			// Loop through the data and populate the links array
			for(var rowCount = 0; rowCount < data.results[0].data.length; rowCount++)
			{
				var elementPath = data.results[0].data[rowCount].row;
				
				for(var elementCount = 0; elementCount < elementPath.length; elementCount++)
				{
					var elementInfo = elementPath[elementCount];
					
					if( (elementInfo != null) && (!elementInfo.hasOwnProperty("nodeName")) )
					{
						// Create relationship
						var sourceNode = getNodeById( elementInfo.sourceNeo4jNodeId );
						var targetNode = getNodeById( elementInfo.targetNeo4jNodeId );
						
						var link = links.filter(function(l) {
							return (l.source === sourceNode && l.target === targetNode);
						})[0];
						
						if(link) {
							link[direction] = true;
						} else {
							link = {source: sourceNode, 
								target: targetNode, 
								left: false, 
								right: false, 
								relType: elementInfo.relType };
								
							link[direction] = true;
							links.push(link);
						}
					}
				}
			}
						
		},
		error: function (jqXHR, textStatus, errorThrown) {
			// handle errors
			alert("Error");
		}
	});
	
	restart();	
}

//This method will query all the path between two nodes.
//Each path is represented by one row in output.
//In below example output two paths were found so two rows are there.
//Success text status is success and data is {"results":[{"columns":["p"],"data":[{"row":[[{"title":"Tourism","name":"Tourism"},{"title":"PARENT","name":"PARENT"},{"title":"Quality","name":"Quality"}]]},{"row":[[{"title":"Tourism","name":"Tourism"},{"title":"CONTRIBUTES_TO","name":"CONTRIBUTES_TO"},{"title":"Coastal Debris","name":"Coastal Debris"},{"title":"IMPACTS","name":"IMPACTS"},{"title":"Quality","name":"Quality"}]]}]}],"errors":[]}

function queryPathBetweenTwoNodes(){	
	
	//Get the value from fields for query parameters.
	var selectedLevel = $("#SelectLevel option:selected").val();	
	var region = $("input[name='seaName']:checked").val();	
	var sourceNodeName=$( sourceNode).val();
	var targetNodeName=$( targetNode).val();
	
	//Making source name and target name field blank after reading values.
	$( sourceNode).val("");
	$( targetNode).val("");

	//Fade al the elements on canvas.
	d3.selectAll(".node").style("opacity", 0.2);
	d3.selectAll(".link").style("opacity", 0.2);	
	
	var nodesList=[];	
	var relationshipList=[];	
 
	//statements for query. If level is not All then first statement will execute to get the filtered value else later statement will execute.
	if(selectedLevel!="All"){
		var statement="MATCH p=({name:"+"\""+sourceNodeName+"\""+"})-[*1.."+"\""+selectedLevel+"\""+"]->({name:"+"\""+targetNodeName+"\""+"})RETURN p"; 
	
	}else{
		var statement="MATCH (n { name: "+"\""+sourceNodeName+"\""+"} ),(m { name: "+"\""+targetNodeName+"\""+"} ), p = (n)-[*]-(m) RETURN p";
	 
	}

	// Setup AJAX Header for authorization	
	$.ajaxSetup({
		headers: {
			// Add authorization header in all ajax requests
			"Authorization": "Basic bmVvNGo6T2NlYW4=" 
		}
	});
	
	//Ajax request for querying the path between two node.
	 $.ajax({
		 type: "POST",
		url: "http://localhost:7474/db/data/transaction/commit ",
		dataType: "json",
		contentType: "application/json;charset=UTF-8",
		data: JSON.stringify({"statements":[{"statement":statement}]}),
		success: function (data, textStatus, jqXHR) {			
				//Parsing the output result.
				for(var rowCount = 0; rowCount < data.results[0].data.length; rowCount++){
					var pathDetail=data.results[0].data[rowCount].row[0];
					for(var k=0;k<pathDetail.length;k++){
						var eachElementInfo=pathDetail[k];
						
						//If some specific region is selected Ex - Baltic then it will filter out the result with specific values.
						if(region!="All"){
							if(eachElementInfo["region"]==region){
								
								//Push elements to node and relationship list.
								if(eachElementInfo.hasOwnProperty("title")){
								nodesList.push(eachElementInfo);
								}else{
								relationshipList.push(eachElementInfo);
								}
								
								//Code to highlight the values on canvas on basis of query result.	
								if(eachElementInfo.id!=undefined){
								
								var nodeId=parseInt(eachElementInfo.id);
								var newid=nodeId+1;
									 //Highlight the node on basis of id.
									 d3.select("#name"+newid).style("opacity",1);
								}else{
									 //Highlight the relationship on basis of id.
									d3.select("#link" +eachElementInfo.sourceid+eachElementInfo.targetid).style("opacity", 1);
								}									
								}
						//If region == All then no filter is required and push all elements to array.
						}else{
								//Push elements to node and relationship list.
								if(eachElementInfo.hasOwnProperty("title")){
								nodesList.push(eachElementInfo);
								}else{
								relationshipList.push(eachElementInfo);
							}
							
							//Code to highlight the values on canvas on basis of query result.	
							if(eachElementInfo.id!=undefined){	
								var nodeId=parseInt(eachElementInfo.id);
								var newid=nodeId+1;
								//Highlight the node on basis of id.
								 d3.select("#name"+newid).style("opacity",1);
							}else{
								//Highlight the relationship on basis of id.
								d3.select("#link" +eachElementInfo.sourceid+eachElementInfo.targetid).style("opacity", 1);
							}										
						}
					}
				}
		},
		error: function (jqXHR, textStatus, errorThrown) {
			alert("Error");
		}
	});	

}
