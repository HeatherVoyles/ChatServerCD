

/* Server Set Up: */
var express = require('express'), /* Set up the server. Require our express module */
	app = express(), /* to get functionality, we need to use variable and express function */
	server = require('http').createServer(app), /* before, you could use "express.create server" to 
	create an http server; now it isn't automatically created, so the app variable 
	bundles everything together for express; but, for socket io, we do need an http object. So, we can have 
	create server and pass the app variable */
	io = require('socket.io').listen(server),
	users = {},
	redis = require('redis'),
	client = redis.createClient()
	/*Since we want to display a list of user names to the client, we need to keep 
	track of them. An array will do this.*/ 

server.listen(3000, function(){
	console.log('listening on *:3000');
});

//Redis integration script - connecting to Redis, it checks to see if it's on, if it doesn't connect, it sends the error message to the console. //

client.on("error", function(err){ 
	console.log("Error" + err);
});

client.set("app name", "simple chat", redis.print); 
// checking to make sure Redis is doing what we're asking by way of setting & getting//
	
//End Redis script//

/*create socket functionality by creating variable 
io and socketio requirement and then make it listen (that's why we needed an http server object), add 
parameter of "listen" and pass to server and then tell it what port to listen to.

Route Set Up:
/* Now that the server is set up, we need to set up the route. Right now, we can't access any pages; Express 
makes routing a little easier */
app.get('/', function(req, res){ 

/* root directory is the first parameter - what the client is trying to 
access and then set functions for http request and response as parameters */
	res.sendfile(__dirname + '/index.html'); /*we want the client to get the index.html file to get when 
	we go to localhost:3000 */
});

/* Now we have to receive the event on the server 
side. This code turns "on" a connection event; look at the name of the socket.emit 
event on the index.html file and use the same name 
o receive on the server side. 

This section I don't fully understand as it relates to the nicknames */

io.sockets.on('connection', function(socket){ 

//Redis integration - getting the app name//
	client.get('app name', function(err, reply){
		console.log('app name is', reply); 
	});

	client.hgetall('history', function(err, replies) {
		socket.emit('history', replies);
	}); //when connected Redis gets history and sends it to individual user just connected//

//End Redis//

	console.log('a user connected');
	socket.on('new user', function(data, callback){
		if (data in users){
			callback(false);
		} else{
			callback(true);
			socket.nickname = data; 
			users[socket.nickname] = socket;
			updateNicknames(); 
		}

	});		
	
	function updateNicknames(){ 
		io.sockets.emit('usernames', Object.keys(users)); 
	}

//socket on = chat message function - msg being sent to users via public or private functions)//
	socket.on('send message', function(data, callback){ 
		var msg = data.trim(); 
		if(msg.substr(0,3) === '/w '){
			msg = msg.substr(3); 
			var ind = msg.indexOf(' '); 
			if (ind !== -1){
				var name = msg.substring(0, ind); 
				var msg = msg.substring(ind + 1); 
				if(name in users){
					users[name].emit('whisper', {msg: msg, nick: socket.nickname});
					console.log('Whisper!'); 
				} else{
					callback('Error. Enter a valid user please.');			
				}
			} else{ 
					callback('Error. Please enter a private message.');
			} 
		} else{
			io.sockets.emit('new message', {msg: msg, nick: socket.nickname}); 

//Redis

			client.incr('msg_id', function(err, msg_id) {
				console.log('msg_id', msg_id);
				client.hset('history', msg_id, msg); 
			});
//Redis


		}  
	}); 


	socket.on('disconnect', function(data){
		if(!socket.nickname) return;
		delete users[socket.nickname]; 
		updateNicknames();
	});
});



	/*socket.on('disconnect', function(data){ 
		if(!socket.nickname) return; 
		nicknames.splice(nicknames.indexOf(socket.nickname), 1); 
		updateNicknames();	
}); 
		/* we want the messages to go out to everyone, so we add 
		sockets emit and pass the data collected from the function. 
		This code will make the message
		appear to everyone, including the sender. If you don't want 
		the sender to get a copy of the message, then 
		use the socket.broadcast.emit function the message appears
		to everyone but the sender 
		socket.broadcast.emit ('new message', data); 

		Remember "parameter = instruction and 
		"function" = behaviour 

		The script below was removed from package.json on my original
		simple chat server, but I kept for comparison value 
		and quick reference. It is slightly different, but 
		I'm not exactly sure why. 

{
  "name": "socket-chat-example",
  "version": "0.0.1",
  "description": "my first socket.io app",
  "dependencies": {
    "express": "^4.9.5",
    "socket.io": "^1.1.0"
  }

}
*/



	