var role = ["", "self", "restrict", "root"];
var accessibility = { //logged as admin grouper
    group : {
        get : "restrict",   //delete if.. "groups.id == (self)groups.id" || "groups.id == rootId"
        post : "",
        put : "",
        delete : ""
    },
    organization : {
        get : "self",
        post : "",
        put : "self",
        delete : ""
    },
    users : {
        /**
         * foreign key : groups, organizations
         * if "restrict" please lookup <foreigntable>.get -> (for this case lookup group.get && organization.get)
         */
        get : "restrict",
        post : "restrict",
        put : "restrict",
        delete : "restrict"
    }
}
//
/**
 * todo : new url route because accesibility!
 * GET /me
 * PUT /me
 * PUT /me?q=changepassword */
//
/**
 * todo : new url for verify
 * GET /verify?q=somecode
 * and for phone url?
 * */