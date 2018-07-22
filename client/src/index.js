var express = require('express');
var app = express();
var net = require('net');
const appmetrics = require('appmetrics');
const monitoring = appmetrics.monitor();

var HOST = '127.0.0.1';
var PORT = 8000;

var client = new net.Socket();
client.connect(PORT, HOST, function() {

    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
    client.write('I am Chuck Norris!');
});

 monitoring.on('cpu', (cpu) => {
    const postData = `cpu_percentage,host=InfluxDB process=${cpu.process},system=${cpu.system} ${cpu.time}`;
    client.write(postData);
});


// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
client.on('data', function(data) {
    console.log('DATA: ' + data);

    // Close the client socket completely
   // client.destroy();
    
});

// Add a 'close' event handler for the client socket
client.on('close', function() {
    console.log('Connection closed');
});

	app.listen(process.env.PORT, function (req, res){
		console.log("its working");
	})

module.exports = app;
