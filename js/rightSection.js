/*****************************************************************************
 *	FileName: rightSection.js
 *	Description: This file contains the JavaScript code for the right-hand 
 *				 section of the main user interface. The right hand section
 *				 contains the properties window for selected elements on the
 *				 canvas.
 ****************************************************************************/
 
 /*****************************************************************************
 *	Function Name: showPropertyWindow()
 *	Description: Show the property window for nodes in right panel.
 ****************************************************************************/
function showPropertyWindow(){
	//This code is to render new table and remove old one.
	d3.select("table").remove();
	//Make Save Changes button active.
	$('#saveChanges').prop('disabled', false);
	//This variable contains the header values of table.
	var columns=["Property Name", "Property Value"];
	//It contains all data of properties table into an array.
	var tableDataArray = new Array();
	
	//Pushing all the properties into array,
	for(var myKey in selected_node) {
	   var dataJson={};
	   dataJson['Property Name']=myKey;
	   dataJson['Property Value']=selected_node[myKey];
	   tableDataArray.push(dataJson);
	}

     //Creating properties table.
    var table = d3.select("#table-responsive").append("table")
			.attr('class', 'table table-striped'),
        thead = table.append("thead"),
        tbody = table.append("tbody");

    // append the header row
    thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
            .text(function(column) { return column; });

    // create a row for each object in the data
    var rows = tbody.selectAll("tr")
        .data(tableDataArray)
        .enter()
        .append("tr");
	

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
        .attr("style", "font-family: Courier")
		.attr({class: 'cell', contenteditable: true})
         .html(function(d) { return d.value; })
		

		  
		  //Add an extra column to the table for deleting row.
			rows.insert("td")
			.attr("style", "font-family: Courier")
			.attr("style","backgroundColor:white")
			.html("<img src=https://cdn2.iconfinder.com/data/icons/aspneticons_v1.0_Nov2006/delete_16x16.gif alt=Smiley face>")
			.on("click",function deleteRow(){
				$(this).parent("tr").remove();
			});
			
			
			//Creating extra rows for Document Type Node
			if(selected_node.hasOwnProperty("DocumentType")){
				 
				 	$("tr:last").before("<tr><td class=cell style=font-family:Courier contenteditable=true>DocumentURL</td><td  > <a href=http://water.epa.gov/type/oceb/marinedebris/factsheet_marinedebris_debris.cfm target=_blank>Open Document URL</a></td><td onclick=deleteRow()><img src=https://cdn2.iconfinder.com/data/icons/aspneticons_v1.0_Nov2006/delete_16x16.gif alt=Smiley face></td></tr>");
				
			}
						
		//Hiding unwanted properties from the properties windows and displaying only default properties.
		var tr = $('tr').length;
		var tableDataJson={};
		for(var i=0; i < tr;i++){
		$.each($('tr:eq('+i+') td'),function(){
			var tds = $('tr:eq('+i+') td');
				   var productId = $(tds).eq(0).text();
				   var name = $(tds).eq(1).text();
				   
		   
		   //Document Type Node
		    if(selected_node.hasOwnProperty("DocumentType")){	   
			    if(hiddenDefaultPropertyNodeDocument.hasOwnProperty(productId)){
			    $('tr:eq('+i+')').hide();
		   }//For all other node types.
		   }else{
			    if(hiddenDefaultPropertyNode.hasOwnProperty(productId)){
			    $('tr:eq('+i+')').hide();
		   }

		  } 

});
}
//Making all the buttons visible only when properties window is open.
$("#saveChanges").css('visibility', 'visible');
$("#addProperty").css('visibility', 'visible');
$("#updateNodeProperty").css('visibility', 'visible');
$("#updateRelProperty").css('visibility', 'visible');
$("#deleteNode").css('visibility', 'visible');
$("#deleteRelationship").css('visibility', 'visible');


    return table;
}

/*****************************************************************************
 *	Function Name: showPropertyWindowForRelationship()
 *	Description: Show the property window for a relationship
 ****************************************************************************/
function showPropertyWindowForRelationship(){
		//This code is to render new table and remove old one.
		d3.select("table").remove(); 
		
		//Make buttons active.
		$('#saveChanges').prop('disabled', false);
		$('#addProperty').prop('disabled', false);
	
	//This variable contains the header values of table.
	var columns=["Property Name", "Property Value"];
	//It contains all data of properties table into an array.
	var tableDataArray = new Array();

	//Pushing link properties values to the array.
	for(var myKey in selected_link) {
  
		//Adding Neo4j source and target Neo4J Node ids to the properties of relationship.
		//Needs improvement on using multiple keys for the same property.
		if(myKey=="source" || myKey=="target"){
		 var dataJson={};
		 var idJson={};
	
		var sourceOrTargetInfo=selected_link[myKey];
		var sourceOrTargetNodeInfor=sourceOrTargetInfo['neo4jNodeId'];
		
		dataJson['Property Name']=myKey.trim()+"Neo4jNodeId";
	    dataJson['Property Value']=sourceOrTargetInfo['neo4jNodeId'];
	   
		idJson['Property Name']=myKey.trim()+"id";
	    idJson['Property Value']=sourceOrTargetInfo['id'];
		
		tableDataArray.push(dataJson);
		tableDataArray.push(idJson);
		}else{
			 var dataJson={};
		dataJson['Property Name']=myKey;
	   dataJson['Property Value']=selected_link[myKey];
	   tableDataArray.push(dataJson);
		}
	}

	   //Creating properties table.
		var table = d3.select("#table-responsive").append("table") 
		   .attr('class', 'table table-striped'),
        thead = table.append("thead"),
        tbody = table.append("tbody");

    // append the header row
    thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
            .text(function(column) { return column; });

    // create a row for each object in the data
    var rows = tbody.selectAll("tr")
        .data(tableDataArray)
        .enter()
        .append("tr");
	

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
        .attr("style", "font-family: Courier")
		.attr({class: 'cell', contenteditable: true})
         .html(function(d) { return d.value; })
		  
		  //Add an extra column to the table for deleting row.
			rows.insert("td")
			.attr("style", "font-family: Courier")
			.attr("style","backgroundColor:white")
			.html("<img src=https://cdn2.iconfinder.com/data/icons/aspneticons_v1.0_Nov2006/delete_16x16.gif alt=Smiley face>")
			.on("click",function deleteRow(){
				$(this).parent("tr").remove();
			});
		
			//Adding extra row for Relationship Type property.	
			$("tr:first").after("<tr><td class=cell style=font-family:Courier contenteditable=true>Relationship Type</td><td> <select class=form-control id=relationshipType><option id=Other>Other</option></select></td><td onclick=deleteRow()><img src=https://cdn2.iconfinder.com/data/icons/aspneticons_v1.0_Nov2006/delete_16x16.gif alt=Smiley face></td></tr>");

				
//Hiding unwanted properties from the properties window and displaying only default properties.
var tr = $('tr').length;
var tableDataJson={};
for(var i=0; i < tr;i++){
$.each($('tr:eq('+i+') td'),function(){
	var tds = $('tr:eq('+i+') td');
           var productId = $(tds).eq(0).text();
		   var name = $(tds).eq(1).text();
		   if(hiddenDefaultPropertyRelation.hasOwnProperty(productId)){
			    $('tr:eq('+i+')').hide();
		   }
});
}

//Making all the buttons visible only when properties window is open.			
$("#saveChanges").css('visibility', 'visible');
$("#addProperty").css('visibility', 'visible');
$("#updateNodeProperty").css('visibility', 'visible');
$("#updateRelProperty").css('visibility', 'visible');
$("#deleteNode").css('visibility', 'visible');
$("#deleteRelationship").css('visibility', 'visible');

    return table;
}

/*****************************************************************************
 *	Function Name: addNewRow()
 *	Description: Add a new row to the property window on click of Add Property button.
 ****************************************************************************/
function addNewRow(){
	$("tr:last").after("<tr><td class=cell style=font-family:Courier contenteditable=true></td><td class=cell style=font-family:Courier contenteditable=true></td><td onclick=deleteRow()><img src=https://cdn2.iconfinder.com/data/icons/aspneticons_v1.0_Nov2006/delete_16x16.gif alt=Smiley face></td></tr>");
}

/*****************************************************************************
 *	Function Name: deleteRow()
 *	Description: Delete a row from the property window on click of cross sign.
 ****************************************************************************/
function deleteRow(){
	$("tr:last").remove();
}


