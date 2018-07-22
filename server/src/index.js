var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const http = require('http');
const appmetrics = require('appmetrics');
const monitoring = appmetrics.monitor();
var influx = require('./db/influx');
const Influx = require('influx');
const os = require('os');
var net = require('net');
var HOST = '127.0.0.1';
var PORT = 8000;
var app = express();

var routes = require('./router/routes');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use('/',routes);


// INSTRUMENTATION

const options = {
  port: 8186,
  path: '/write?precision=ms',
  method: 'POST',
  headers: {'Content-Type': 'application/x-www-form-urlencoded'}
};

influx.getDatabaseNames()
  .then(names => {
    if (!names.includes('express_response_db_test')) {
      return influx.createDatabase('express_response_db_test');
    }
  })
  .then(() => {
    app.listen(3000, function (req, res){
        console.log("its working");
    })
  })
  .catch(err => {
    console.error(`Error creating Influx database!`);
  });


net.createServer(function(sock) {    
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    // Add a 'data' event handler to this instance of socket
    sock.on('data', function(data) {
         const duration = Date.now();
              // const postData = `cpu_percentage,host=InfluxDB pprocess=0.000861665,system=0.0825397 1531998152003`;
              console.log('DATA is' + sock.remoteAddress + ': ' + data);
                  influx.writePoints([
                          {
                            measurement: 'response_times',
                            tags: { host: sock.remoteAddress +':'+ sock.remotePort },
                            fields: { duration, path: sock.remoteAddress +':'+ sock.remotePort },
                          }
                        ]).catch(err => {
                          console.error(`Error saving data to InfluxDB! ${err.stack}`)
                        });
    });
    
    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
    
}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);

app.get('/',function (req,res){
	res.json("Home page");
});




//   app.use((req, res, next) => {
//   const start = Date.now()
//   res.on('finish', () => {
//     const duration = Date.now() - start
//     console.log(`Request to ${req.path} took ${duration}ms`);

//     influx.writePoints([
//       {
//         measurement: 'response_times',
//         tags: { host: os.hostname() },
//         fields: { duration, path: req.path },
//       }
//     ]).catch(err => {
//       console.error(`Error saving data to InfluxDB! ${err.stack}`)
//     })
//   })
//   return next()
// })

// app.get('/', function (req, res) {
//   setTimeout(() => res.end('Hello world!'), Math.random() * 500)
// })

// app.get('/times', function (req, res) {
//   influx.query(`
//     select * from response_times
//     where host = ${Influx.escape.stringLit(os.hostname())}
//     order by time desc
//     limit 10
//   `).then(result => {
//     res.json(result)
//   }).catch(err => {
//     res.status(500).send(err.stack)
//   })
// })




// monitoring.on('cpu', (cpu) => {
//   const postData = `cpu_percentage,host=InfluxDB process=${cpu.process},system=${cpu.system} ${cpu.time}`;
//   const req = http.request(options, (res) => {
//     console.log(`STATUS: ${res.statusCode}`);
//     console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
//     res.setEncoding('utf8');
//     res.on('data', (chunk) => {
//       console.log(`BODY: ${chunk}`);
//     });
//     res.on('end', () => {
//       console.log('No more data in response.');
//     });
//   });

//   req.on('error', (e) => {
//     console.error(`problem with request: ${e.message}`);
//   });
//   req.write(postData);
//   req.end();
// });

// monitoring.on('eventloop', (eventLoop) => {
//   const postData = `event_loop_latency,host=InfluxDB min=${eventLoop.latency.min},max=${eventLoop.latency.max},avg=${eventLoop.latency.avg} ${eventLoop.time}`;

//   const req = http.request(options, (res) => {
//     console.log(`STATUS: ${res.statusCode}`);
//     console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
//     res.setEncoding('utf8');
//     res.on('data', (chunk) => {
//       console.log(`BODY: ${chunk}`);
//     });
//     res.on('end', () => {
//       console.log('No more data in response.');
//     });
//   });

//   req.on('error', (e) => {
//     console.error(`problem with request: ${e.message}`);
//   });
//   req.write(postData);
//   req.end();
// });

// monitoring.on('gc', (gc) => {
//   const postData = `gc,host=InfluxDB,type=${gc.type} size=${gc.size},used=${gc.used},duration=${gc.duration} ${gc.time}`;

//   const req = http.request(options, (res) => {
//     console.log(`STATUS: ${res.statusCode}`);
//     console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
//     res.setEncoding('utf8');
//     res.on('data', (chunk) => {
//       console.log(`BODY: ${chunk}`);
//     });
//     res.on('end', () => {
//       console.log('No more data in response.');
//     });
//   });

//   req.on('error', (e) => {
//     console.error(`problem with request: ${e.message}`);
//   });
//   req.write(postData);
//   req.end();
// });

// monitoring.on('memory', (memory) => {
//   const postData = `memory,host=InfluxDB physical_total=${memory.physical_total},physical_used=${memory.physical_used},physical_free=${memory.physical_free},virtual=${memory.virtual},private=${memory.private},physical=${memory.physical} ${memory.time}`;

//   const req = http.request(options, (res) => {
//     console.log(`STATUS: ${res.statusCode}`);
//     console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
//     res.setEncoding('utf8');
//     res.on('data', (chunk) => {
//       console.log(`BODY: ${chunk}`);
//     });
//     res.on('end', () => {
//       console.log('No more data in response.');
//     });
//   });

//   req.on('error', (e) => {
//     console.error(`problem with request: ${e.message}`);
//   });
//   req.write(postData);
//   req.end();
// });

// monitoring.on('http', (request) => {
//   const postData = `HTTP_requests,host=InfluxDB,method=${request.method},url=${request.url} duration=${request.duration}  ${request.time}`;

//   const req = http.request(options, (res) => {
//     console.log(`STATUS: ${res.statusCode}`);
//     console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
//     res.setEncoding('utf8');
//     res.on('data', (chunk) => {
//       console.log(`BODY: ${chunk}`);
//     });
//     res.on('end', () => {
//       console.log('No more data in response.');
//     });
//   });

//   req.on('error', (e) => {
//     console.error(`problem with request: ${e.message}`);
//   });
//   req.write(postData);
//   req.end();
// });




// /* POST to get the bandwidth on the client side */
// app.post('/speed', function (req, res) {
//     console.log(req.body);
//     console.log(req.body.speed);
//     res.end('yes');
// });
// /* POST to ask for the server timestamp to measure the latency */
// app.post('/timestamp', function (req, res, next) {
//     var json = '{'
//         + '"timestamp" : ' + (new Date()).getTime()
//         + '}';
//     res.send(JSON.parse(json));
// });
// /* POST timestamp to measure latency */
// app.post('/measure_latency', function (req, res) {
//     console.log(req.body);
//     var inte =  req.body.value2 - req.body.value1;
//     console.log("Latency = " + inte);
//     res.end('yes');
// });


// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

// // error handlers

// // development error handler
// // will print stacktrace
// if (app.get('env') === 'development') {
//     app.use(function (err, req, res, next) {
//         res.status(err.status || 500);
//         res.render('error', {
//             message: err.message,
//             error: err
//         });
//     });
// }

// // production error handler
// // no stacktraces leaked to user
// app.use(function (err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//         message: err.message,
//         error: err //change to the following statement on production
//         //error: {}
//     });
// });


module.exports = app;