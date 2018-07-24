var express = require('express');
var app = express();
var net = require('net');
const appmetrics = require('appmetrics');
const monitoring = appmetrics.monitor();

var HOST = '194.95.175.72';
var PORT = 3001;

var client = new net.Socket();
client.connect(PORT, HOST, function() {
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
     client.write(JSON.stringify({port : 3002}));
});

// monitoring.on('cpu', (cpu) => {
//     const postData =  { process: cpu.process,system :cpu.system ,time :cpu.time };
//     client.write(JSON.stringify({cpu : postData}));
// });

monitoring.on('eventloop', (eventLoop) => {
    const postData =  { min: eventLoop.latency.min,max :eventLoop.latency.max ,avg : eventLoop.latency.avg,time :eventLoop.time };
    client.write(JSON.stringify({event_loop_latency : postData}));
});


// monitoring.on('memory', (memory) => {
//    const postData =  { physical_total: memory.physical_total,physical_used :memory.physical_used ,physical_free : memory.physical_free,virtual :memory.virtual,private :memory.private ,physical :memory.physical,time :memory.time   };
//    client.write(JSON.stringify({memory : postData}));
// });

// monitoring.on('http', (request) => {
//   const postData =  { method: request.method, url :request.url ,duration : request.duration,time :request.time };
//   client.write(JSON.stringify({HTTP_requests : postData}));
// });

// monitoring.on('gc', (gc) => {
//   const postData =  { type: gc.type, size :gc.size ,used : gc.used,duration :gc.duration,time :gc.time };
//   client.write(JSON.stringify({HTTP_requests : postData}));
// });

// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
client.on('data', function(data) {
    console.log('DATA in client: ' + data);
   
    // Close the client socket completely
   // client.destroy();
    
});

// Add a 'close' event handler for the client socket
client.on('close', function() {
    console.log('Connection closed');
});

app.listen( 3002 , function (req, res){
        console.log("its working");
})

app.get('/',function (req,res){
    res.json("wowowowowowowo client is up babes...");
});

module.exports = app;
