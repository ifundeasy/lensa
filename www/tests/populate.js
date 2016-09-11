//native
//compass https://downloads.mongodb.com/compass/mongodb-compass-1.3.0-darwin-x64.dmg?_ga=1.129942476.1188280473.1473598937
var print = function (object) {
    return JSON.stringify(object, 0, 2);
};
var normalize = require('./../libs/normalize');
var ngo = require('./../config/mongo');
var Db = require('./../libs/db');
ngo.database.callback = function (err, db) {
    if (!err) {
        console.log("   >> Connected!");
        main(db);
    } else console.log('> Error open connection', err)
};
new Db(ngo.connection).open(ngo.database);
//
var main = function (db) {
    /**
     * //todo : if you had some collection.
     *
     * Countries = {
     *    id : ObjectId,
     *    value : String
     * }
     *
     * Jobs = {
     *     id : ObjectId,
     *     value : String,
     * }
     *
     * PhoneTypes = {
     *     id : ObjectId,
     *     value : String,
     * }
     *
     * Companies = {
     *     id : ObjectId,
     *     value : String,
     *     address : {
     *        value : String,
     *        zipcode : Number,
     *        country : ObjectId
     *     },
     * };
     *
     * Persons = {
     *     firstName : String,
     *     lastName : String,
     *     age : Number,
     *     company : ObjectId,
     *     address : {
     *         value : String,
     *         zipcode : Number,
     *         country : ObjectId
     *     },
     *     jobs : [ObjectId, ObjectId],
     *     phones : [
     *         {type : ObjectId, value : String},
     *         {type : ObjectId, value : String}
     *     ]
     * }
     * */
    var mongoose = db.mongoose;
    var Schema = mongoose.Schema;
    //
    var Country = mongoose.model('Country', new Schema({value : String}));
    var Job = mongoose.model('Job', new Schema({value : String}));
    var PhoneType = mongoose.model('PhoneTypes', new Schema({value : String}));
    var Company = mongoose.model('Company', new Schema({
        value : String,
        address : {
            value : String,
            zipcode : Number,
            "countries._id" : {type : Schema.Types.ObjectId, ref : 'Country'}
        }
    }));
    var personSchema = new Schema({
        firstName : String,
        lastName : String,
        age : Number,
        "companies._id" : {type : Schema.Types.ObjectId, ref : 'Company'},
        address : {
            value : String,
            zipcode : Number,
            "countries._id" : {type : Schema.Types.ObjectId, ref : 'Country'}
        },
        "jobs._ids" : [{type : Schema.Types.ObjectId, ref : 'Job'}],
        phones : [
            {"phonetypes._id" : {type : Schema.Types.ObjectId, ref : 'PhoneTypes'}, value : String}
        ]
    });
    personSchema.virtual('name').get(function () {
        return this.firstName + (this.lastName ? (" " + this.lastName) : "");
    });
    personSchema.methods.justForInstance = function (body, cb) {
        return this.model('Person').find(body || {}, cb);
    };
    personSchema.statics.findByAge = function (age, cb) {
        return this.find({age : age}, cb);
    };
    personSchema.statics.finder = function (body, cb) {
        return this.find(body || {}).populate([
            {path : "phones.phonetypes._id", select : 'value'},
            {path : "jobs._ids", select : 'value'},
            {path : "address.countries._id", select : 'value'},
            {
                path : "companies._id", select : 'value address',
                populate : {
                    path : 'address.countries._id',
                    select : 'value'
                }
            },
        ])
        .exec(cb);
    };
    var Person = mongoose.model('Person', personSchema);
    //
    var data = {
        country : [],
        job : [],
        phonetype : [],
        company : [],
        person : [],
    }
    var putCountry = function (cb) {
        Country.create([
            {value : 'Indonesong'},
            {value : 'Americrate'},
        ], function (err, res) {
            console.log("Country :", JSON.stringify(res, 0, 2));
            data.country = data.country.concat(res);
            cb(data.country)
        });
    }
    var putJob = function (cb) {
        Job.create([
            {value : 'IT Developer'},
            {value : 'IT Manager'},
        ], function (err, res) {
            console.log("Jobs :", JSON.stringify(res, 0, 2));
            data.job = data.job.concat(res);
            cb(data.job)
        });
    }
    var putPhoneType = function (cb) {
        PhoneType.create([
            {value : 'Line'},
            {value : 'Handphone'},
        ], function (err, res) {
            console.log("PhoneTypes :", JSON.stringify(res, 0, 2));
            data.phonetype = data.phonetype.concat(res)
            cb(data.phonetype)
        });
    }
    var putCompany = function (cb) {
        Company.create({
            value : "Bintang Ciptaan Tuhan",
            address : {
                value : "Jl. Jalan 07, Mendoan, Seblak Utara.",
                zipcode : 45331,
                "countries._id" : data.country[1]._id
            }
        }, function (err, res) {
            console.log("Company :", JSON.stringify(res, 0, 2));
            data.company = data.company.concat(res);
            cb(data.company)
        })
    }
    var putPerson = function (cb) {
        var someone = new Person({
            firstName : "Jokoy",
            lastName : "William",
            age : 19,
            "companies._id" : data.company[0]._id,
            address : {
                value : "Jl. Indah selalu 771, Timor West Wong, Estate",
                zipcode : 22123,
                "countries._id" : data.country[0]._id
            },
            "jobs._ids" : [data.job[0]._id, data.job[1]._id],
            phones : [
                {"phonetypes._id" : data.phonetype[0]._id, value : "0221334223"},
                {"phonetypes._id" : data.phonetype[1]._id, value : "088122374664"},
            ]
        });
        someone.save(function (err, res) {
            console.log("Person :", JSON.stringify(res, 0, 2));
            data.person = data.person.concat(res);
            cb(data.person);
        })
    }
    var getPerson = function () {
        var someone = new Person({
            firstName : "Jokoy",
            lastName : "William",
            age : 19,
            address : {
                value : "Jl. Indah selalu 771, Timor West Wong, Estate",
                zipcode : 22123,
            }
        });
        /*
        someone.justForInstance({
            name : "Hailey"
        }, function () {
            console.log(arguments)
        })
        someone.justForInstance(0, function () {
            console.log(arguments)
        })
        Person.findByAge(19, function (err, cols) {
            console.log(arguments)
        })
        */
        /*Person.finder(null, function (err, docs) {
            if (err) {
                console.log(err)
            } else {
                var rows = normalize(docs);
                console.log(print(rows))
            }
            process.exit()
        })*/
        Person
        .finder(null)
        .then(function (docs) {
            var rows = normalize(docs);
            console.log(print(rows))
        })
        .catch(function (err) {
            console.log(err)
        })
    }
    /*
    putCountry(function(){
        putJob(function(){
            putPhoneType(function(){
                putCompany(function(){
                    putPerson(function(){
                        getPerson()
                    })
                })
            })
        })
    });
    */
    getPerson()
};