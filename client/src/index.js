var express = require('express');
var app = express();
var net = require('net');
const appmetrics = require('appmetrics');
const monitoring = appmetrics.monitor();
var APP_PORT = process.argv[2];
var HOST = process.argv[3]; //host url of the server eg. var HOST = '194.95.174.175';
var PORT = process.argv[4]; //host port of the server eg. 3001
var isConnectionAlive = false;
var sleep = require('system-sleep');
var fake_latancy_addition=0;

var client = new net.Socket();
client.connect(PORT, HOST, function() {
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
     client.write(JSON.stringify({port : APP_PORT}));
     isConnectionAlive = true;
});

// data is what the server sent to this socket
client.on('data', function(data) {
    console.log('DATA in client: ' + data);    
});

// Add a 'close' event handler for the client socket
client.on('close', function() {
    console.log('Connection closed');
    isConnectionAlive = false;
    client.destroy();
});

setInterval(function(){
    fake_latancy_addition = getRandomInt(1,10);
    console.log("fake_latancy_addition"+fake_latancy_addition);
},10000);


monitoring.on('eventloop', (eventLoop) => {
    if(Boolean(isConnectionAlive)){
        const postData =  { min: eventLoop.latency.min,max :eventLoop.latency.max ,avg : eventLoop.latency.avg+parseFloat(fake_latancy_addition),time :eventLoop.time };
        client.write(JSON.stringify({event_loop_latency : postData}));
    } 
});

monitoring.on('http', (request) => {
    if(Boolean(isConnectionAlive)){
        const postData =  { method: request.method, url :request.url ,duration : request.duration,time :request.time };
        client.write(JSON.stringify({http_requests : postData}));
    }
});

// monitoring.on('cpu', (cpu) => {
//     const postData =  { process: cpu.process,system :cpu.system ,time :cpu.time };
//     client.write(JSON.stringify({cpu : postData}));
// });

// monitoring.on('memory', (memory) => {
//    const postData =  { physical_total: memory.physical_total,physical_used :memory.physical_used ,physical_free : memory.physical_free,virtual :memory.virtual,private :memory.private ,physical :memory.physical,time :memory.time   };
//    client.write(JSON.stringify({memory : postData}));
// });


app.listen(APP_PORT, function (req, res){
        console.log("its working on"+APP_PORT);
})

app.get('/',function (req,res){
    res.json("wowowowowowowo client is up babes...");
});


function getRandomInt(min, max) {
    return Math.random() * (max - min) + min;
  }

