
const mongoose=require('mongoose');


// how our document look like
const securitiesSchema = mongoose.Schema({
    
    admin_name: {type:String,required: true},
    admin_email: {type:String,required: true},
    admin_mobile: {type:String,required: true},
    address: {type:String,required: true},
    admin_password:{type:String,required: true},
    status:{type:String,required: true},
    role_id:{type:String,required: true},
    security_type:{type:String,required: true},
    access_status:{type:String,required: true},
    org_id:{type:String,required:true},
    created_by:{type:String},
    updated_by:{type:String},
    deleted_by:{type:String},
    created_date_time:{ type : String },
    old_security_id:{type:String},

});


var userDefinedSchemaDetails = {
    security_type:'SA',
    admin_email:'superadmin@vulcantechs.com',
    admin_password:'$2a$12$aSg6QgiwPIRdiT4xbq4YFOGXF2kyvOHp47D4Xl/035Nth9zeV4ZIa',
    admin_mobile:'1234567890',
    admin_name:"admin",
    status:"1",
    role_id:"0",
    address:"none",
    org_id:"0",
    access_status:"1"
    };
    const securitiesModel = mongoose.model('securities', securitiesSchema);
    const addbasemenu = async (userDefinedSchemaDetails) => {
    var value =await securitiesModel.findOne({ "security_type":"SA" })
    if (!value) {
        await securitiesModel.create(userDefinedSchemaDetails);
    }
    }
    addbasemenu(userDefinedSchemaDetails)
module.exports=securitiesModel;