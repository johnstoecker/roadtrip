var http = require('express');
var mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient

//Lets define a port we want to listen to
const PORT=5001;

//Create a server
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.set({"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers" : "Origin, X-Requested-With, Content-Type, Accept"});
  db.collection('tweets').find().toArray((err, result) => {
    if (err) return console.log(err)
    // renders index.ejs
    res.send( {tweets: result})
  })
})

app.get('/2012', (req, res) => {
  res.set({"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers" : "Origin, X-Requested-With, Content-Type, Accept"});
  db.collection('tweets')..find({"created_at" : { $gte : new ISODate("2021-01-01T20:15:31Z") }});.toArray((err, result) => {
    if (err) return console.log(err)
    // renders index.ejs
    res.send( {tweets: result})
  })
})

app.post('/pixels', (req, res) => {
  db.collection('pixels').insertOne(req.body)
    .then(result => {
      console.log(result)
    })
    .catch(error => console.error(error))
})

app.get('/trips/:id', (req, res) => {
    db.collection('pixels').find({tripId: req.params.id}).toArray((err, result) => {
      if (err) return console.log(err)
      res.send( { pixels: result})
    })
});

var db;

MongoClient.connect('mongodb://localhost:27017/ironmapsdb', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(PORT, () => {
    console.log("Server listening on: http://localhost:%s", PORT);
  })
})
