 var http = require('http');
var unirest = require('unirest');

module.exports = {

	inspectSwarm : function (callback){

	},

	initSwarm : function (callback){

	},

	getNodes : function (callback){

		let options = {
         socketPath: '/var/run/docker.sock',
          path: `/v1.26/nodes`,
          method: 'GET'
        };
        let clientRequest = http.request(options, (res) => {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk; 
            });
            res.on('end', () => {
                const parsedData = JSON.parse(rawData);
                console.log(parsedData);
                callback(rawData);

            });
        });
        clientRequest.on('error', (e) => {
            console.log(e);
        });
        clientRequest.end();

	},

	getNodeById : function (node_id,callback){

	},

	updateNodeAddLable : function (node_id,label_details,callback){

	}

}

// unirest.post('unix:///var/run/docker.sock')
// .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
// .send({ "parameter": 23, "foo": "bar" })
// .end(function (response) {
//   console.log("response is ":response.body);
// });
 

//  var Request = unirest.get("unix:///var/run/docker.sock"+"/v1.26/nodes")
//  .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
// .end(function (response) {
//   console.log("response is "+response/);
// });

 // var Request = unirest.get(options.host+path)
	// 			.headers({'Content-Type': 'application/json','server_hash':options.server_hash}).end(function (response)
	// 			{
	// 				callback(response.body);
	// 			});



// 	let	jsonObject ='Labels : quality 1';

// 	// prepare the header
// // var postheaders = {
// //     'Content-Type' : 'application/json',
// //     'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
// // };

//   let options = {
//           socketPath: '/var/run/docker.sock',
//           path: `/v1.35/nodes/oldcp1tacckgflmjwh3y9ar61/update`,
//           method: 'POST',
//           // headers : postheaders
//         };


//         let clientRequest = http.request(options, (res) => {
//             res.setEncoding('utf8');
//             let rawData = '';
//             res.on('data', (chunk) => {
//                 rawData += chunk; 
//             });
           
//             res.on('end', () => {
//                 const parsedData = JSON.parse(rawData);
//                 console.log(parsedData);

//             });
//         });
//         clientRequest.on('error', (e) => {
//             console.log(e);
//         });
//         clientRequest.write(jsonObject);
//         clientRequest.end();


 /

