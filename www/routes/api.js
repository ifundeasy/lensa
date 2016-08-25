var fs = require('fs');
var express = require('express');
var router = express.Router();
var util = require('util');
//
module.exports = function (mongoose) {

    router.get('/:col', function(req, res) {
    	var Collection = mongoose.models[req.params.col] || false;
    	if(Collection){
    		Collection.find(function (err, kittens) {
				if (err){
					res.send({error: 'resource could not be loaded.'});
				} else {
					res.send(kittens);
				}
			});
    	} else {
    		res.send({error: 'resource not found.'});
    	}
    	
    });

    return router;
};

