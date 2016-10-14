var router = require('express').Router();
var bcrypt = require('bcrypt');

module.exports = function(args){
	var global = args.global;
    var locals = args.locals;
    var worker = args.worker;
    var account = args.account;
    var mongoose = args.mongoose;
    var maxLimit = 50;
    var Collection = (function () {
        var o = {};
        var models = mongoose.models;
        for (var m in models) o[models[m].collection.name] = mongoose.models[m];
        return o;
    })();

 	router.post('/', function(req, res, next){
 		var class_route = req.header("Class");

 		switch(class_route){

 			case 'user/create':
 				// check for mandatory field
 				if(req.body.first_name && req.body.username && req.body.email && req.body.password){
 					// check for username and email availability
 					var User = Collection['users'];
 					User.find({ username: req.body.username}).or({ email: req.body.email }).then(function(docs){
 						if(docs.length != 0){
 							var body = {
					            "status": 0,
					            "message": "username or email is already registered"
					        };

					        res.status(500).send(body);
 						} else {

 							var newUser = new User({
 								username: req.body.username,
 								name: {
 									first: req.body.first_name,
 									last : req.body.last_name || null
 								},
 								"phone.value": req.body.phone || null,
 								email: {
 									value: req.body.email
 								},
 								password: req.body.password,
 								'organizations._id':'57e4c4d0194f677f2b17b4e8', // organization "public"
 								'groups._id': '57e27d79c4785029e9df3fda' // usergroup "A"
 							});

 							newUser.save().then(function(doc){
 								var body = {
						            "status": 1,
						            "message": "new user has been created"
						        };

						        res.status(201).send(body);
 							}).catch(function(e){
 								var body = {
						            "status": 0,
						            "message": e
						        };

						        res.status(500).send(body);
 							});
 						}
 						
 					}).catch(function(e){
 						var body = {
				            "status": 0,
				            "message": e
				        };

				        res.status(500).send(body);
 					});
 				} else {
 					var body = {
			            "status": 0,
			            "message": "field is not completed"
			        };

			        res.status(500).send(body);
 				}
 				break;

 			case 'login':
 				break;

 			case 'logout':
 				break;

 			case 'report/all':
 				var Post = Collection['posts'];
 				var start = parseInt(req.body.start);
 				var limit = parseInt(req.body.limit);

 				Post.find().sort('createdAt').skip(start).limit(limit).then(function(docs){
 					var body = {
			            "status": 1,
			            "data": docs
			        };

			        res.status(200).send(body);
 				}).catch(function(e){
 					var body = {
			            "status": 0,
			            "message": e
			        };

			        res.status(500).send(body);
 				});
 				break;

 			case 'report/get':
 				var Post = Collection['posts'];

 				Post.findOne({ _id: req.body._id}).then(function(doc){
 					if(doc !== null){
 						var body = {
				            "status": 1,
				            "data": doc
				        };
				        res.status(200).send(body);
 					} else {
 						var body = {
				            "status": 1,
				            "message": "invalid report id"
				        };

				        res.status(500).send(body);
 					}
 				}).catch(function(e){
 					var body = {
			            "status": 0,
			            "message": e
			        };

			        res.status(500).send(body);
 				});
 				break;

 			case 'report/create':
 				var Post = Collection['posts'];

 				var useridDummies = ['5800eada5cfa2608637c49c5','5800364438e91da4b2e74c74', '5800f03cfc3d480d6f32e51a', '5800f01bfc3d480d6f32e519'];
 				var useridDummiesIndex = Math.floor(Math.random() * ((useridDummies.length-1) - 0 + 1)) + 0;
 				
 				var newPost = new Post({
 					title: req.body.title,
 					text: req.body.text,
 					"users._id": useridDummies[useridDummiesIndex], // hardcode buat testing. TODO: cek session atau token dan ambil id user yg bersangkutan
 					"organizations._id": '57ead1e9e324096fa1277bd4', // hardcode buat testing. TODO: pake metode geofencing untuk menentukan laporan ini untuk organisasi mana berdasarkan lokasi. lokasi diambil dari req.body.lat & req.body.long
 					statuses: [],
 					comments: [],
 					lat: req.body.lat,
 					long: req.body.long
 				});

 				newPost.save().then(function(doc){
 					var body = {
			            "status": 1,
			            "message": "new post has been created"
			        };

			        res.status(201).send(body);
 				}).catch(function(e){
 					var body = {
			            "status": 0,
			            "message": e
			        };

			        res.status(500).send(body);
 				});

 				break;


 			case 'report/delete':
 				var Post = Collection['posts'];

 				Post.findOne({_id: req.body._id}).remove().then(function(doc){
 					if(doc!==null){
 						var body = {
				            "status": 1,
				            "message": "report has been deleted"
				        };

				        res.status(200).send(body);
 					} else {
 						var body = {
				            "status": 0,
				            "message": "invalid report id"
				        };

				        res.status(500).send(body);
 					}
 				}).catch(function(e){
 					var body = {
			            "status": 0,
			            "message": e
			        };

			        res.status(500).send(body);
 				});
 				break;

 			case 'comment/create':
 				var Post = Collection['posts'];

 				Post.findOne({_id: req.body.parent_id}).then(function(doc){
 					if(doc!==null){
 						var newComment = {
 							text: req.body.text,
 							"users._id": '5800f01bfc3d480d6f32e519', // dummy. TODO: baca user id dari session/cookie/token

 						};
 						doc.comments.push(newComment);

 						doc.save(function(err){
 							if(!err){
 								var body = {
						            "status": 1,
						            "message": "comment has been posted"
						        };

						        res.status(200).send(body);
 							} else {
 								var body = {
						            "status": 0,
						            "message": err
						        };

						        res.status(500).send(body);
 							}
 						});
 					} else {
 						var body = {
				            "status": 0,
				            "message": "invalid report id"
				        };

				        res.status(500).send(body);
 					}
 				}).catch(function(e){
 					var body = {
			            "status": 0,
			            "message": e
			        };

			        res.status(500).send(body);
 				});
 				break;


 			case 'comment/delete':
 				var Post = Collection['posts'];

 				Post.findOne({_id: req.body.parent_id}).then(function(doc){
 					if(doc!==null){
 						var rm = doc.comments.id(req.body._id).remove();

 						doc.save(function(err){
 							if(!err){
 								var body = {
						            "status": 1,
						            "message": "comment has been removed"
						        };

						        res.status(200).send(body);
 							} else {
 								var body = {
						            "status": 0,
						            "message": err
						        };

						        res.status(500).send(body);
 							}
 						});
 					} else {
 						var body = {
				            "status": 0,
				            "message": "invalid report id"
				        };

				        res.status(500).send(body);
 					}
 				}).catch(function(e){
 					var body = {
			            "status": 0,
			            "message": e
			        };

			        res.status(500).send(body);
 				});
 				break;


 			case 'user/get':
 				var User = Collection['users'];
 				User.findOne({_id: req.body._id}).select('-password').then(function(doc){
 					if(doc!==null){
 						var body = {
				            "status": 1,
				            "data": doc
				        };

				        res.status(200).send(body);
 					} else {
 						var body = {
				            "status": 0,
				            "message": "invalid user id"
				        };

				        res.status(500).send(body);
 					}
 				}).catch(function(e){
 					var body = {
			            "status": 0,
			            "message": e
			        };

			        res.status(500).send(body);
 				});
 				break;

 			case 'user/update':
 				var User = Collection['users'];
 				User.findOne({_id: req.body._id}).then(function(doc){
 					if(doc !== null){
 						if(req.body.username) doc.username = req.body.username;
 						if(req.body.first_name) doc.name.first = req.body.first_name;
 						if(req.body.last_name) doc.name.last = req.body.last_name;
 						if(req.body.gender) doc.gender = req.body.gender;
 						if(req.body.password) doc.password = req.body.password;
 						if(req.body.email) doc.email = req.body.email;
 						if(req.body.phone) doc.phone = req.body.phone;
 						if(req.body.address) doc.address = req.body.address;
 						if(req.body.country) doc.country = req.body.country;
 						if(req.body.state) doc.state = req.body.state;
 						if(req.body.zipcode) doc.zipcode = req.body.zipcode;
 						if(req.body.birthDate) doc.birthDate = req.body.birthDate;

 						doc.save(function(err){
 							if(!err){
 								var body = {
						            "status": 1,
						            "message": "user data has been updated"
						        };

						        res.status(200).send(body);
 							} else {
 								var body = {
						            "status": 0,
						            "message": err
						        };

						        res.status(500).send(body);	
 							}
 						});
 					} else {
 						var body = {
				            "status": 0,
				            "message": "invalid user id"
				        };

				        res.status(500).send(body);
 					}
 				}).catch(function(e){
 					var body = {
			            "status": 0,
			            "message": e
			        };

			        res.status(500).send(body);
 				});
 				break;


 			case 'organization/get':
 				var Organization = Collection['organizations'];
 				Organization.findOne({_id: req.body._id}).then(function(doc){
 					if(doc!==null){
 						var body = {
				            "status": 1,
				            "data": doc
				        };

				        res.status(200).send(body);
 					} else {
 						var body = {
				            "status": 0,
				            "message": "invalid organization id"
				        };

				        res.status(500).send(body);
 					}
 				}).catch(function(e){
 					var body = {
			            "status": 0,
			            "message": e
			        };

			        res.status(500).send(body);
 				});
 				break;

 		}

 		
 	})   

 	return router;
}