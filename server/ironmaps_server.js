//Lets require/import the HTTP module
var http = require('http');
var request = require('request');
var mongo = require('mongodb');
const db = require('monk')('localhost/ironmapsdb')

//Lets define a port we want to listen to
const PORT=5001;

//We need a function which handles requests and send response
function handleRequest(req, response){

  response.writeHead(200, {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers" : "Origin, X-Requested-With, Content-Type, Accept"});

  var collection = db.get('tweets');
  collection.find({},{},function(e,docs){
    res.render(docs);
  });
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});
