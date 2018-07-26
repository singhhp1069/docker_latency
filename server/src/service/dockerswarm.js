 var http = require('http');
const {Docker} = require('node-docker-api');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });


module.exports = {

	swarminit: function (callback){
		var option = {
			"ListenAddr": "0.0.0.0:2377",
			"AdvertiseAddr": "192.168.1.1:2377",
			"ForceNewCluster": false,
			"Spec": {
			  "Orchestration": {},
			  "Raft": {},
			  "Dispatcher": {},
			  "CAConfig": {}
			}
		  };
		docker.swarm.init(option).then(res=>{
			console.log("response is : "+res);
			callback(res);
		}).catch(err=>{
			console.log("error is :"+err);
			callback(err);
		});
		},
	
	getNodes : function (callback){
		docker.node.list().then(node =>{
			callback(node);
		})
	},

	getNodeById : function (node_id,callback){
		var node_detail = docker.node.get(node_id);
		node_detail.status().then(result=>{
			callback(result);
		})
	},
	updateNodeAddLable : function (node_id,label_tag,callback){
		var node_detail = docker.node.get(node_id);
			node_detail.status().then(result=>{
				var label = {
					"version":result.data.Version.Index,
					"Role": "manager",
					"Membership":"accepted",
					"Availability": "active",
					"Labels": label_tag
				};
					node_detail.update(label).then(response=>{
						var node_detail = docker.node.get(node_id);
							node_detail.status().then(result=>{
								callback(result);
							})
					})
			});	
	},

}