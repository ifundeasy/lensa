module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var commentSchema = new Schema({
        text : String,
        "users._id" : {
            ref : 'user',
            type : Schema.Types.ObjectId,
            required : true
        },
        "medias._ids" : [
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
        "procedures._id" : {
            ref : 'procedure',
            type : Schema.Types.ObjectId,
            required : true
        },
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    var postSchema = new Schema({
        title : {
            type : String,
            required : true
        },
        text : String,
        "users._id" : {
            ref : 'user',
            type : Schema.Types.ObjectId,
            required : true
        },
        "medias._ids" : [
            {
                ref : 'media',
                type : Schema.Types.ObjectId
            }
        ],
        statuses : [statusSchema],
        comments : [commentSchema],
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    //
    postSchema.statics.getPopQuery = function (nestIdx) {
        var populate = [
            {
                path : "medias._ids",
                select : "type directory description",
                match : {active : true}
            },
            {
                path : "users._id",
                select : "name username",
                match : {active : true},
                populate : [
                    {
                        path : "medias._ids",
                        select : "type directory description",
                        match : {active : true}
                    },
                    {
                        path : "userGroups._id",
                        select : "name routes",
                        match : {active : true}
                    },
                    {
                        path : "organizations._id",
                        select : "name description",
                        match : {active : true},
                        populate : {
                            path : "medias._id",
                            select : "type directory description",
                            match : {active : true}
                        }
                    },
                    {
                        path : "organizationRoles._id",
                        select : "name description organizations._id",
                        match : {active : true},
                        populate : {
                            path : "organizations._id",
                            select : "name description",
                            match : {active : true},
                            populate : {
                                path : "medias._id",
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
                        path : "userGroups._id",
                        select : "name",
                        match : {active : true}
                    },
                    {
                        path : "organizations._id",
                        select : "name description",
                        match : {active : true},
                        populate : {
                            path : "medias._id",
                            select : "type directory description",
                            match : {active : true}
                        }
                    },
                    {
                        path : "organizationRoles._id",
                        select : "name description organizations._id",
                        match : {active : true},
                        populate : {
                            path : "organizations._id",
                            select : "name description",
                            match : {active : true},
                            populate : {
                                path : "medias._id",
                                select : "type directory description",
                                match : {active : true}
                            }
                        }
                    }
                ]
            },
            {
                path : "comments.medias._ids",
                select : "type directory description",
                match : {active : true}
            },
            {
                path : "statuses.users._id",
                select : "name username",
                match : {active : true},
                populate : [
                    {
                        path : "userGroups._id",
                        select : "name",
                        match : {active : true}
                    },
                    {
                        path : "organizations._id",
                        select : "name description",
                        match : {active : true},
                        populate : {
                            path : "medias._id",
                            select : "type directory description",
                            match : {active : true}
                        }
                    },
                    {
                        path : "organizationRoles._id",
                        select : "name description organizations._id",
                        match : {active : true},
                        populate : {
                            path : "organizations._id",
                            select : "name description",
                            match : {active : true},
                            populate : {
                                path : "medias._id",
                                select : "type directory description",
                                match : {active : true}
                            }
                        }
                    }
                ]
            },
            {
                path : "statuses.procedure._id",
                select : "name description steps organizationCategories._id",
                match : {active : true},
                populate : {
                    path : "organizationCategories._id",
                    select : "name description organizations._id",
                    match : {active : true},
                    populate : {
                        path : "organizations._id",
                        select : "name description",
                        match : {active : true},
                        populate : {
                            path : "medias._id",
                            select : "type directory description",
                            match : {active : true}
                        }
                    }
                }
            }
        ];
        return mongoose.nested(populate, nestIdx)
    };
    return mongoose.model('post', postSchema);
};