var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var util = require('util');
var url = require('url');
var readline = require('readline');
var MongoClient = require('mongodb').MongoClient;
var request = require("request");
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth-connect');
var mkdirp = require('mkdirp');
var app = express();
var options = {
    host: '127.0.0.1',
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
};

http.createServer(app).listen(3007);

app.use(bodyParser());
app.use('/', express.static('./auth-comments', {maxAge: 60*60*1000}));

app.get('/comment', function (req, res) {
  var userQuery = url.parse(req.url, true).query;
   console.log(userQuery);
   MongoClient.connect("mongodb://localhost/comments", function(err, db) {
    if (err) throw err;
    db.collection("comments", function(err, comments) {
     if (err) throw err;
     comments.find(userQuery,function(err, items) {
      items.toArray(function(err, itemArr) {
       res.writeHead(200, { "Access-Control-Allow-Origin": "http://ec2-52-88-191-100.us-west-2.compute.amazonaws.com:3007" });
       res.end(JSON.stringify(itemArr));
      });
     });
    });
   });
});

//POST Methods
app.post('/comment', function (req, res) {
    var reqObj = req.body;
    MongoClient.connect("mongodb://localhost/comments", function(err, db) {
        if(err) console.log(err);
        db.collection('comments').insert(reqObj,function(err, records) {
            console.log("Record added as "+records[0]._id);
            res.writeHead(200, { "Access-Control-Allow-Origin": "http://ec2-52-88-191-100.us-west-2.compute.amazonaws.com:3007" });
            res.end(JSON.stringify(records[0]));
        });
    });
});

app.get('/credentials', function(req, res) {
    console.log("getting credentials");
    console.log(req.query);
    res.header("Access-Control-Allow-Origin","http://ec2-52-88-191-100.us-west-2.compute.amazonaws.com:3007");
    
    var username = req.query.Name;
    var password = req.query.Password;
    MongoClient.connect("mongodb://localhost/comments", function(err, db) {
        if(err) throw err;
        db.collection("comments", function(err, comments){
            if(err) console.log(err);
            comments.find(function(err, items){
                items.toArray(function(err, itemArr){
                        itemArr = itemArr.filter(function(item) {
                            //console.log(item);
                            //We want item.Password to be defined
                            return item.Name === username && item.Password === password;
                        });
                        console.log("itemArr");
                        console.log(itemArr);
                        if (itemArr.length == 0) {
                            res.writeHead(401);
                            res.end("Not Authorized");
                            return;
                        }
                        res.writeHead(200);
                        res.end("Authorized");
                });
            });
        });
    });
    
});
