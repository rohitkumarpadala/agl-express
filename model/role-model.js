
const mongoose=require('mongoose');


// how our document look like
const roleSchema = mongoose.Schema({
    role_id:  String,
    role_name:  {type: String, max: 10,required: true},
    status: {type: String,required: true},
    created_by: {type: String,required: true},
    org_id:{type:String,required:true},
    created_date_time:{ type : String },
    created_by:{type:String},
    updated_by:{type:String},
    deleted_by:{type:String},
    menu_object_id: {type: String}

});


const roleModel = mongoose.model('role', roleSchema);

module.exports=roleModel;