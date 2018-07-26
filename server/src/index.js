var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var influx = require('./db/influx');
var Influx = require('influx');
var os = require('os');
var net = require('net');
var ip = require('ip');
var SOCKET_HOST = ip.address() || "127.0.0.1";
var SOCKET_PORT = process.argv[3] || 3001;
var APPLICATION_PORT = process.argv[2] || 3000;
var roundTrip = require('./service/routetrip');
var url = require('url');
var docker = require('./routes/docker');
var dockerfunctions = require('./service/dockerswarm');

var http = require('http').Server(app);
var jointoken = '';
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//api expose for the docker
app.use('/docker', docker);



net.createServer(function(sock) {
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    sock.on('data', function(data) {
        let recieved_data = JSON.parse(data);
        switch(Object.keys(recieved_data).toString()){
            case "port": 
                setInterval(function () { 
                  roundTrip(Object.assign(url.parse('http://'+sock.remoteAddress +":"+recieved_data.port ), {
                          headers: {
                            'User-Agent': 'xyz'
                          }
                        }), (err, res) => {
                          if(res){
                            console.log(JSON.stringify(res.timings));
                                  influx.writePoints([
                                    {
                                      measurement: 'round_trip',
                                      fields: { tcpConnection :parseFloat(res.timings.tcpConnection),
                                                firstByte :parseFloat(res.timings.firstByte),
                                                contentTransfer :parseFloat(res.timings.contentTransfer),
                                                total :parseFloat(res.timings.total),
                                                time :Date.now() },
                                    tags: { host: sock.remoteAddress +':'+ sock.remotePort }
                                    }
                                  ]).catch(err => {
                                    console.error(`Error saving data to InfluxDB! ${err.stack}`)
                                  });
                          }
                            if(err){
                                console.log("Client Disconnected");
                            }
                        });
                }, 5000);
          
              case "event_loop_latency":
                if (typeof recieved_data.event_loop_latency !== 'undefined' && recieved_data.event_loop_latency)
                {
                    console.log("event loop recieved"+JSON.stringify(recieved_data.event_loop_latency));
                      var recieved_latency = recieved_data.event_loop_latency;
                      
                      //latency lableling
                      if(parseFloat(recieved_data.event_loop_latency.avg)>9){
                          dockerfunctions.getNodes(function(result){
                            for (var i = 0, len = result.length; i < len; i++) {
                              dockerfunctions.updateNodeAddLable(result[i].data.ID,{ "quality" :"poor"},function(result1){
                                console.log("Node updated :"+JSON.stringify(result1));
                              })
                            }                             
                          });
                      }else if(parseFloat(recieved_data.event_loop_latency.avg)<=9 && parseFloat(recieved_data.event_loop_latency.avg)>5 ){
                        dockerfunctions.getNodes(function(result){
                          for (var i = 0, len = result.length; i < len; i++) {
                            dockerfunctions.updateNodeAddLable(result[i].data.ID,{ "quality" :"average"},function(result1){
                              console.log("Node updated :"+JSON.stringify(result1));
                            })
                          }                             
                        });
                    }else if(parseFloat(recieved_data.event_loop_latency.avg)<5){
                      dockerfunctions.getNodes(function(result){
                        for (var i = 0, len = result.length; i < len; i++) {
                          dockerfunctions.updateNodeAddLable(result[i].data.ID,{ "quality" :"good"},function(result1){
                            console.log("Node updated :"+JSON.stringify(result1));
                          })
                        }                             
                      });
                  }
                      influx.writePoints([
                        {
                          measurement: 'latency',
                          fields: { min :parseFloat(recieved_latency.min),
                                    max :parseFloat(recieved_latency.max),
                                    avg :parseFloat(recieved_latency.avg),
                                    time :recieved_latency.time },
                        tags: { host: sock.remoteAddress +':'+ sock.remotePort }
                        }
                      ]).catch(err => {
                        console.error(`Error saving data to InfluxDB! ${err.stack}`)
                      });
                }
              
              
              case "http_requests":
                  if (typeof recieved_data.http_requests !== 'undefined' && recieved_data.http_requests)
                  {
                      console.log("http_requests recieved"+JSON.stringify(recieved_data.http_requests));
                        var recieved_http_requests = recieved_data.http_requests;
                        influx.writePoints([
                          {
                            measurement: 'http_requests',
                            fields: { method :recieved_http_requests.method.toString(),
                                      url :recieved_http_requests.url.toString(),
                                      duration :parseFloat(recieved_http_requests.duration),
                                      time :recieved_http_requests.time },
                          tags: { host: sock.remoteAddress +':'+ sock.remotePort }
                          }
                        ]).catch(err => {
                          console.error(`Error saving data to InfluxDB! ${err.stack}`)
                        });
                  }

              default : 
                console.log("no Response from the client yet");
      
        }
       
    });
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
    
}).listen(SOCKET_PORT, SOCKET_HOST);

console.log('socket server listening on ' + SOCKET_HOST +':'+ SOCKET_PORT);



http.listen(APPLICATION_PORT, function(){
  console.log('listening on : '+APPLICATION_PORT);
});

app.post('/jointoken',function(req,res){
    jointoken = req.body.token;
    res.render('pages/index',{ server_details: { socket_ip : SOCKET_HOST,
      socket_port : SOCKET_PORT,
      server_port : APPLICATION_PORT,
      token : jointoken
    } , message: 'Hello there!'});

});

  //     influx.query(`
  //   select * from round_trip
  //   order by time desc
  //   limit 10
  // `).then(result => {
  //   res.json(result)
  // }).catch(err => {
  //   res.status(500).send(err.stack)
  // })

app.get('/',function (req,res){
  res.render('pages/index',{ server_details: { socket_ip : SOCKET_HOST,
                                socket_port : SOCKET_PORT,
                                server_port : APPLICATION_PORT,
                                token : jointoken
                              } , message: 'Hello there!'});
});


app.get('/getdockernode',function(req,res){
  dockerfunctions.getNodes(function (result) {
    res.render('pages/index',{ server_details: { socket_ip : SOCKET_HOST,
      socket_port : SOCKET_PORT,
      server_port : APPLICATION_PORT,
      token : jointoken,
      docker_nodes : result
    } , message: 'Hello there!'});
	});
  
})

