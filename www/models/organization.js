module.exports = function (mongoose, opts) {
    var Schema = mongoose.Schema;
    var orgSchema = new Schema({
        name : {
            type : String,
            required : true,
            unique : true
        },
        pic : {
            type : String,
            required : true,
            unique : true
        },
        "media._id" : { //avatar
            ref : 'media',
            type : Schema.Types.ObjectId
        },
        email : {
            value : {
                type : String,
                trim : true,
                lowercase : true,
                match : [opts.regEx.email, '{VALUE} is not a valid email address!'],
                unique : true,
                required : true
            },
            verifyUrl : String,
            verified : {type : Boolean, default : false}
        },
        phone : {
            value : {
                type : String,
                trim : true,
                lowercase : true,
                match : [opts.regEx.phone, '{VALUE} is not a valid phone number!'],
                unique : true,
                required : true
            },
            verifyCode : String,
            verified : {type : Boolean, default : false}
        },
        location: {
            address : String,
            country : String,
            state : String,
            zipcode : String,
            administrativeAreaLevel: Number,
            administrativeName: String,
            lat : {
                type : Number,
                required : true
            },
            long : {
                type : Number,
                required : true
            },
        },
        restricted : {type : Boolean, default : false},
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    //
    orgSchema.statics.getPopQuery = function (nestIdx) {
        var populate = {
            path : "media._id",
            select : "type directory description",
            match : {active : true}
        };
        return mongoose.nested(populate, nestIdx)
    };
    orgSchema.pre('update', function (next) {
        var org = this._update.$set;
        if (org["phone.value"]) org["phone.value"] = org["phone.value"].replace(/[\(\)\+\-\s]/g, "");
        return next();
    });
    orgSchema.pre('save', function (next) {
        var org = this;
        
        var NodeGeocoder = require('node-geocoder');
        var options = {
            provider: 'google',
            // Optional depending on the providers 
            httpAdapter: 'https', // Default 
            apiKey: 'AIzaSyDAxcmB59ndh8i4W9R1107oRQ3zu9XIsUw', // for Mapquest, OpenCage, Google Premier 
            formatter: null       // 'gpx', 'string', ... 
        };
        
        // proses mencari organisasi yang tepat untuk laporan yang akan disimpan, based on location data
        var geocoder = NodeGeocoder(options);
        geocoder.reverse({lat:parseFloat(org.location.lat), lon:parseFloat(org.location.long)})
        .then(function(res) {
            console.log("succeded reverse geocoding");
            var g = res[0];
            
            if(org.location.administrativeAreaLevel == '1'){
                org.location.administrativeName = g.administrativeLevels.level1long;
            } else if (org.location.administrativeAreaLevel == '2'){
                org.location.administrativeName = g.administrativeLevels.level2long;
            } else if (org.location.administrativeAreaLevel == '3'){
                org.location.administrativeName = g.administrativeLevels.level3long;
            } else {
                org.location.administrativeName = g.administrativeLevels.level4long;
            }
    
        })
        .catch(function(err) {
            next(err);
        });
        org.phone.value = org.phone.value.replace(/[\(\)\+\-\s]/g, "");
        
        return next();
    });
    return mongoose.model('organization', orgSchema);
};