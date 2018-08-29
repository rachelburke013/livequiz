var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var fs = require('fs');
//var path = require("path");
//var sequelize= require("sequelize");
//var basename = path.basename(module.filename);
//var env = process.env.Node_ENV || "developement";
//var config = require(__dirname + "/..cinfug/config.son")[env];
var usernames ={};
var pairCount = 0, userID, clientsno, pgmstart=0,varCounter;
var scores = {};


app.use('/', express.static(__dirname + '/public'));

var usernames = {};
var pairCount = 0, userID, clientsno, pgmstart=0,varCounter;
var scores = {};

server.listen(4444);
console.log("Listening to 4444")
console.log("Connection Established !")

//Route
app.get('/',function (req,res){
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	console.log("New Client Arrived!");

	socket.on('addClient', function(username){
		socket.username = username;
		usernames[username] = username;
		scores[socket.username] = 0;
		varCounter = 0
		var userID = Math.round((Math.random() * 1000000));
		pairCount++;
		if(pairCount === 1 || pairCount >=3){
			userID = Math.round((Math.random() * 1000000));
			socket.room = userID;
			pairCount = 1;
			console.log(pairCount + " " + userID);
			socket.join(userID);
			pgmstart = 1;
		} else if (pairCount === 2){
        	console.log(pairCount + " " + userID);
        	socket.join(userID);
			pgmstart = 2;
		}
	
		
		console.log(username + " joined to "+ userID);

		socket.emit('updatechat', 'SERVER', 'You are connected! Waiting for other player to connect...',userID);
		
		socket.broadcast.to(userID).emit('updatechat', 'SERVER', username + ' has joined to this game !',userID);

		
		if(pgmstart ==2){
			fs.readFile(__dirname + "/public/questions.json", "Utf-8", function(err, data){
				jsoncontent = JSON.parse(data);
				io.sockets.in(userID).emit('sendQuestions',jsoncontent);
				
			});
		console.log("Player2");
			//io.sockets.in(userID).emit('game', "haaaaai");
		} else {
			console.log("Player1");

		}




  
	});


	socket.on('result', function (usr,rst) {
		
				io.sockets.in(rst).emit('viewresult',usr);
				//io.in(userID).emit('viewresult',usr);
				//console.log("Mark = "+usr);
				//console.log(userID);	

	});


	
	
	socket.on('disconnect', function(){
		
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		//io.sockets.in(userID).emit('updatechat', 'SERVER', socket.username + ' has disconnected',userID);
		socket.leave(socket.room);
	});
});
