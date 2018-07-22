var express = require('express');
var router = express.Router();
var docker = require('../service/dockerswarm');


router.get('/', function (request, response) {
	docker.getNodes(function (res) {
		response.json(res);	
	});
});

router.get('/:node_id', function (request, response) {
	docker.getNodeById(request.params.node_id,function (res) {
		response.json(res);	
	});
});

router.post('/update/:node_id', function (request, response) {
	// label : {
	// 	"test": "dsad"
	// 	}
	docker.updateNodeAddLable(request.params.node_id,request.body.label,function (res) {
		response.json(res);	
	});
});


module.exports = router;