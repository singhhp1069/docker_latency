var express = require('express');
var router = express.Router();
var docker = require('../service/dockerswarm');


router.get('/', function (request, response) {
	docker.getNodes(function (res) {
		response.json(res);	
	});
});


module.exports = router;