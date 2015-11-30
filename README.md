Setting up ResponSEAble User Interface (UI) locally

1. Install neo4j graph database on local machine. Neo4j can be installed from http://neo4j.com/download/  

2. Download the ResponSEAble UI code from GitHub using the url https://github.com/Responseable/KnowledgebaseProject.git

3. Start the neo4j database on the local machine. Note: the login username and password are currently hardcoded into the 
REST API AJAX calls in the javascript code. The username is neo4j and the password is Ocean. If you wish to use a 
different username and password the headers for the AJAX calls in “neo4j.js” need to be modified accordingly. 
http://neo4j.com/docs/stable/rest-api-security.html contains information on how to set up the database username 
and password.

4.	To view the current ResponSEAble UI open the ‘index.html’ file in a browser.

Testing the ResponSEAble User Interface

The current functionality provided by the ResponSEAble UI includes:
- Creating a node on the canvas, editing its properties and saving it to the database.
- Creating an ‘instanceOf’ relationship on the canvas by dragging a line between two nodes, editing the relationship’s properties and saving the relationship to the database.
- Creating a causal relationship between two nodes on the canvas.
- Highlighting a path between two nodes. Currently the highlight path feature only works for ‘instanceOf’ relationships. For this feature to work all nodes and relationships must be saved in the database.

To test the current system the user should use the functionality provided in the left section of the ResponSEAble UI.
