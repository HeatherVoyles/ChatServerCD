/* Server Set Up */

var express = require('express'), /* Set up the server. Require our express module */
	app = express (), /* to get functionality, we need to use variable and express function */
	server = require('http').createServer(app), /* before, you could use "express.create server" to 
	create an http server; now it isn't automatically created, so the app variable 
	bundles everything together for express; but, for socket io, we do need an http object. So, we can have 
	create server and pass the app variable */
	io = require('socket.io').listen(server);

server.listen(3000);

	/*create socket functionality by creating variable 
	io and socketio requirement and then make it listen (that's why we needed an http server object), add 
	parameter of "listen" and pass to server and then tell it what port to listen to.

Route Set Up

/* Now that the server is set up, we need to set up the route. Right now, we can't access any pages; Express 
makes routing a little easier */
app.get('/', function(req, res) { /* root directory is the first parameter - what the client is trying to 
access and then set functions for http request and response as parameters */
	res.sendfile (__dirname + '/index.html'); /*we want the client to get the index.html file to get when we go to localhost:3000 */
});

/* Now we have to receive the event on the server 
side. This code turns "on" a connection event; look at the name of the socket.emit 
event on the index.html file and use the same name 
o receive on the server side. 

Remember "parameter = instruction and 
"function" = behaviour */

io.sockets.on('connection', function(socket) { 
	socket.on('send message', function(data) { 
		io.sockets.emit('new message', data); 
		/* we want the messages to go out to everyone, so we add 
		sockets emit and pass the data collected from the function. 
		This code will make the message
		appear to everyone, including the sender. If you don't want 
		the sender to get a copy of the message, then 
		use the socket.broadcast.emit function the message appears
		to everyone but the sender 
		/*socket.broadcast.emit ('new message', data); */ 
	}); 
}); 