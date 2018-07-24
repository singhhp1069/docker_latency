var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const http = require('http');
var influx = require('./db/influx');
const Influx = require('influx');
const os = require('os');
var net = require('net');
var HOST = '192.168.43.186';
var PORT = 3001;
var app = express();
var roundTrip = require('./service/routetrip');
const url = require('url');

var routes = require('./routes/routes');

app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use('/',routes);


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
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    sock.on('data', function(data) {
        let recieved_data = JSON.parse(data);
        if(recieved_data.port){
                roundTrip(Object.assign(url.parse('http://'+sock.remoteAddress +":"+recieved_data.port ), {
                  headers: {
                    'User-Agent': 'xyz'
                  }
                }), (err, res) => {
                  console.log(err || res.timings)
                });
        }

        if(recieved_data.eventloop){
          console.log(recieved_data.eventloop);
        }

        if(recieved_data.eventloop){
          console.log(recieved_data.eventloop);
        }

        if(recieved_data.eventloop){
          console.log(recieved_data.eventloop);
        }


        // if(recieved_data.cpu){
        //     // console.log("data recieved :"+JSON.parse(data));
        //     //   influx.writePoints([
        //     //               {
        //     //                 measurement: 'cpu_percentage',
        //     //                 tags: { host: sock.remoteAddress +':'+ sock.remotePort },
        //     //                 fields: { process : recieved_data.cpu.process },
        //     //                 fields: { system :recieved_data.cpu.system },
        //     //                 fields: { time :recieved_data.cpu.time }
        //     //               }
        //     //             ]).catch(err => {
        //     //               console.error(`Error saving data to InfluxDB! ${err.stack}`)
        //     //             });
        //               }
                    });
    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
    
}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);

app.get('/',function (req,res){
    res.render('index', { title: 'Hey', message: 'Hello there!'});
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

app.get('/', function (req, res) {
  setTimeout(() => res.end('Hello world!'), Math.random() * 500)
})

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





module.exports = app;