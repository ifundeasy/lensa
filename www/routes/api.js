// includes
var express = require('express');
var router = express.Router();
//

module.exports = function (cfg) {

	//rest apis
	// all verbs
    router.all('/:col/:rec?', function(req, res) {

    	// check if the following collection exist in db
    	var Collection = cfg.mongoose.models[req.params.col] || false;
    	if(Collection){
    		console.log(cfg.home + 'libs/getuser');
    		// check authorized user
    		var getuser = require(cfg.home + 'libs/getuser');
    		// TO DO : ganti dgn pengecekan di collection INTERNAL
    		getuser(req.cookies[cfg.name], cfg.mongoose.models['user'], function(err, msg){
				if(err){
					var loggedUser = '';
				} else {
					var loggedUser = msg;
				}

				// dokumentasi sok-sokan inggris gapapa lah :V
				// above is only for checking logged user. it's not necessary that guest cannot do anything. It can be arranged here before
				// METHOD switching. (to do)

				// METHOD switching
				switch (req.method){
	    			case 'GET':
	    				if(!req.params.rec){
	    					console.log('without rec param');
							Collection.find(function (err, kittens) {
								if (err){
									res.send({error: 'resource could not be loaded.'});
								} else {
									res.send(kittens);
								}
							});
						} else {
							console.log('with rec param');
							console.log(req.params.rec);
							Collection.findOne({ 'id': req.params.rec }, function (err, kittens) {
								if (err){
									res.send({error: 'resource could not be loaded.'});
								} else {
									console.log(kittens);
									res.send(kittens);
								}
							});
						}
	    				
	    				break;
					case 'POST':
						res.send({message: 'new source has been inserted.'});
						break;
					case 'PUT':
						res.send({message: 'resource has been updated.'});
						break;
					case 'DELETE':
						res.send({message: 'resource has been deleted.'});
						break;
	    		}
			});
    	} else {
    		res.send({error: 'resource not found.'});
    	}
    	
    });

    // other action-based api goes here

    //

    //

    return router;
};

