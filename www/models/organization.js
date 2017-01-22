var NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'google',
    // Optional depending on the providers 
    httpAdapter: 'https', // Default 
    apiKey: 'AIzaSyDAxcmB59ndh8i4W9R1107oRQ3zu9XIsUw', // for Mapquest, OpenCage, Google Premier 
    formatter: null       // 'gpx', 'string', ... 
};

var publicOrgId = "580b731cdcba0f490c72c7a9";

module.exports = function (mongoose, opts) {
    var Schema = mongoose.Schema;
    var orgSchema = new Schema({
        name: {
            type: String,
            required: true,
            unique: true
        },
        pic: {
            type: String,
            required: true,
            unique: true
        },
        "media._id": { //avatar
            ref: 'media',
            type: Schema.Types.ObjectId
        },
        email: {
            value: {
                type: String,
                trim: true,
                lowercase: true,
                match: [opts.regEx.email, '{VALUE} is not a valid email address!'],
                unique: true,
                required: true
            },
            verifyUrl: String,
            verified: {type: Boolean, default: false}
        },
        phone: {
            value: {
                type: String,
                trim: true,
                lowercase: true,
                match: [opts.regEx.phone, '{VALUE} is not a valid phone number!'],
                unique: true,
                required: true
            },
            verifyCode: String,
            verified: {type: Boolean, default: false}
        },
        location: {
            address: String,
            country: String,
            state: String,
            zipcode: String,
            administrativeAreaLevel: Number,
            administrativeName: String,
            lat: {
                type: Number,
                required: true
            },
            long: {
                type: Number,
                required: true
            },
        },
        restricted: {type: Boolean, default: false},
        notes: String,
        createdAt: {type: Date, default: Date.now},
        active: {type: Boolean, default: true}
    });
    //
    orgSchema.statics.getPopQuery = function (nestIdx) {
        var populate = {
            path: "media._id",
            select: "type directory description",
            match: {active: true}
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

        // proses mencari organisasi yang tepat untuk laporan yang akan disimpan, based on location data
        var geocoder = NodeGeocoder(options);
        geocoder.reverse({lat: parseFloat(org.location.lat), lon: parseFloat(org.location.long)})
        .then(function (res) {
            var g = res[0];
            console.log("succeded reverse geocoding");
            console.log(g);
            if (org.location.administrativeAreaLevel == 1) {
                org.location.administrativeName = g.administrativeLevels.level1long;
            } else if (org.location.administrativeAreaLevel == 2) {
                org.location.administrativeName = g.administrativeLevels.level2long;
            } else if (org.location.administrativeAreaLevel == 3) {
                org.location.administrativeName = g.administrativeLevels.level3long;
            } else {
                org.location.administrativeName = g.administrativeLevels.level4long;
            }
            
            return next();
        })
        .catch(function (err) {
            return next(err);
        });
        org.phone.value = org.phone.value.replace(/[\(\)\+\-\s]/g, "");

    });
    
    orgSchema.post('save', function(doc, next) {
        console.log('new org :');
        console.log(doc);
        var updateQuery = {
            "organizations._id": publicOrgId,
            active : true
        };
        
        // check the newly save organization location info (administrative level)
        if(doc.location.administrativeAreaLevel == 1){
            updateQuery["administrativeLevels.level1"] = doc.location.administrativeName;
        } else if (doc.location.administrativeAreaLevel == 2){
            updateQuery["administrativeLevels.level2"] = doc.location.administrativeName;
        } else if (doc.location.administrativeAreaLevel == 3){
            updateQuery["administrativeLevels.level3"] = doc.location.administrativeName;
        } else  if (doc.location.administrativeAreaLevel == 4){
            updateQuery["administrativeLevels.level4"] = doc.location.administrativeName;
        }
        // after new organization has been saved, search through all reports assigned to public to be re-assigned on to this new organization
        var Post = mongoose.models.post;
        Post.update(updateQuery, {
            "organizations._id" : doc._id
        }, function(err, numberAffected, rawResponse) {
           //handle it
           if(!err){
               console.log("all corresponding public reports has been reassigned");
               console.log("document changed : ");
               console.log(numberAffected);
               return next();
           } else {
               return next(err);
           }
        });
    });
    
    return mongoose.model('organization', orgSchema);
};