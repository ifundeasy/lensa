var NodeGeocoder = require('node-geocoder');
var path = require('path');

var options = {
    provider: 'google',
    // Optional depending on the providers 
    httpAdapter: 'https', // Default 
    apiKey: 'AIzaSyDAxcmB59ndh8i4W9R1107oRQ3zu9XIsUw', // for Mapquest, OpenCage, Google Premier 
    formatter: null       // 'gpx', 'string', ... 
};

module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var commentSchema = new Schema({
        text : String,
        "users._id" : {
            ref : 'user',
            type : Schema.Types.ObjectId,
            required : true
        },
        "media._ids" : [
            {
                ref : 'media',
                type : Schema.Types.ObjectId
            }
        ],
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    var statusSchema = new Schema({
        "users._id" : {
            ref : 'user',
            type : Schema.Types.ObjectId,
            required : true
        },
        "steps._id" : {
            ref : 'step',
            type : Schema.Types.ObjectId,
            required : true
        },
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    var postSchema = new Schema({
        title : {
            type : String,
            required : false
        },
        text : {
            type : String,
            required : true
        },
        "categories._id" : {
            ref : 'category',
            type : Schema.Types.ObjectId,
            required : false
        },
        "users._id" : {
            ref : 'user',
            type : Schema.Types.ObjectId,
            required : true
        },
        "organizations._id" : {
            ref : 'organization',
            type : Schema.Types.ObjectId,
            required : true
        },
        "media._ids" : [
            {
                ref : 'media',
                type : Schema.Types.ObjectId
            }
        ],
        statuses : [statusSchema],
        comments : [commentSchema],
        assignFrom: {
            "users._id" :  {
                ref: 'user',
                type: Schema.Types.ObjectId,
                required: false
            },
            createdAt : {type : Date}
        },
        assignTo : {
            "roles._id" :  {
                ref: 'role',
                type: Schema.Types.ObjectId,
                required: false
            },
            createdAt : {type : Date},
            implementor : {
                "users._id" :  {
                    ref: 'user',
                    type: Schema.Types.ObjectId,
                    required: false
                },
                createdAt : {type : Date, required: false}
            }
        },
        lat : {
            type : String,
            required : false
        },
        long : {
            type : String,
            required : false
        },
        posts : {
            _id: {
                ref : 'post',
                type : Schema.Types.ObjectId
            },
            "users._id" :  {
                ref: 'user',
                type: Schema.Types.ObjectId,
                required: false
            },
            createdAt : {type : Date}
        },
        createdAt : {type : Date, default : Date.now},
        returned: {
            reason : {type : String, required : false },
            createdAt : {type : Date, required : false }
        },
        notes: { type: String, required: false },
        rejected: {
            "users._id" :  {
                ref: 'user',
                type: Schema.Types.ObjectId
            },
            reason : {type : String, required : false },
            createdAt : {type : Date, required : false }
        },
        finished: {type: Boolean, default: false},
        static: {type: Boolean, default: false},
        active : {type : Boolean, default : true}
    });
    //
    postSchema.statics.getPopQuery = function (nestIdx) {
        var populate = [
            {
                path : "media._ids",
                select : "type directory description",
                match : {active : true}
            },
            {
                path : "users._id",
                select : "name username",
                match : {active : true},
                populate : [
                    {
                        path : "media._ids",
                        select : "type directory description",
                        match : {active : true}
                    },
                    {
                        path : "groups._id",
                        select : "name routes",
                        match : {active : true}
                    },
                    {
                        path : "organizations._id",
                        select : "name description",
                        match : {active : true},
                        populate : {
                            path : "media._id",
                            select : "type directory description",
                            match : {active : true}
                        }
                    },
                    {
                        path : "roles._id",
                        select : "name description organizations._id",
                        match : {active : true},
                        populate : {
                            path : "organizations._id",
                            select : "name description",
                            match : {active : true},
                            populate : {
                                path : "media._id",
                                select : "type directory description",
                                match : {active : true}
                            }
                        }
                    }
                ]
            },
            {
                path : "comments.users._id",
                select : "name username",
                match : {active : true},
                populate : [
                    {
                        path : "groups._id",
                        select : "name",
                        match : {active : true}
                    },
                    {
                        path : "organizations._id",
                        select : "name description",
                        match : {active : true},
                        populate : {
                            path : "media._id",
                            select : "type directory description",
                            match : {active : true}
                        }
                    },
                    {
                        path : "roles._id",
                        select : "name description organizations._id",
                        match : {active : true},
                        populate : {
                            path : "organizations._id",
                            select : "name description",
                            match : {active : true},
                            populate : {
                                path : "media._id",
                                select : "type directory description",
                                match : {active : true}
                            }
                        }
                    }
                ]
            },
            {
                path : "comments.media._ids",
                select : "type directory description",
                match : {active : true}
            },
            {
                path : "statuses.users._id",
                select : "name username",
                match : {active : true},
                populate : [
                    {
                        path : "groups._id",
                        select : "name",
                        match : {active : true}
                    },
                    {
                        path : "organizations._id",
                        select : "name description",
                        match : {active : true},
                        populate : {
                            path : "media._id",
                            select : "type directory description",
                            match : {active : true}
                        }
                    },
                    {
                        path : "roles._id",
                        select : "name description organizations._id",
                        match : {active : true},
                        populate : {
                            path : "organizations._id",
                            select : "name description",
                            match : {active : true},
                            populate : {
                                path : "media._id",
                                select : "type directory description",
                                match : {active : true}
                            }
                        }
                    }
                ]
            },
            {
                //path : "statuses.procedure._id",
                //select : "name description steps categories._id",
                //match : {active : true},
                //populate : {
                //    path : "categories._id",
                //    select : "name description organizations._id",
                //    match : {active : true},
                //    populate : {
                //        path : "organizations._id",
                //        select : "name description",
                //        match : {active : true},
                //        populate : {
                //            path : "media._id",
                //            select : "type directory description",
                //            match : {active : true}
                //        }
                //    }
                //}
                path : "statuses.steps._id",
                select : "name  description  stepNumber duration procedures._id",
                match : {active : true},
                populate : {
                    path : "procedures._id",
                    select : "name description categories._id",
                    match : {active : true},
                    populate : {
                        path : "categories._id",
                        select : "name description organizations._id",
                        match : {active : true},
                        populate : {
                            path : "organizations._id",
                            select : "name description",
                            match : {active : true},
                            populate : {
                                path : "media._id",
                                select : "type directory description",
                                match : {active : true}
                            }
                        }
                    }
                }

            }
        ];
        return mongoose.nested(populate, nestIdx)
    };

    postSchema.pre('save', function (next) {
        var post = this;

        // proses mencari organisasi yang tepat untuk laporan yang akan disimpan, based on location data
        var geocoder = NodeGeocoder(options);
        geocoder.reverse({lat:parseFloat(post.lat), lon:parseFloat(post.long)})
        .then(function(res) {
            console.log("succeded reverse geocoding");
            var Organization = mongoose.models.organization;
            var g = res[0];
            console.log(g);
            Organization.find({
                $or: [
                    { $and: [{"location.administrativeAreaLevel": 1}, {"location.administrativeName": g.administrativeLevels.level1long}] },
                    { $and: [{"location.administrativeAreaLevel": 2}, {"location.administrativeName": g.administrativeLevels.level2long}] },
                    { $and: [{"location.administrativeAreaLevel": 3}, {"location.administrativeName": g.administrativeLevels.level3long}] },
                    { $and: [{"location.administrativeAreaLevel": 4}, {"location.administrativeName": g.administrativeLevels.level4long}] }
                ]
            }).then(function(docs){
                console.log(docs);
                if(docs.length != 0){
                    console.log("organization : " + docs[0].name);
                    post.organizations._id = docs[0]._id;
                }
                next();
            }).catch(function(e){
                console.log("failed query organization");
                next(e);
            });
        })
        .catch(function(err) {
            next(err);
        });
    });

    return mongoose.model('post', postSchema);
};