
const mongoose=require('mongoose');




const orgMenuSchema=mongoose.Schema({
    
    menu_object_id:{type: String},
    status: {type: String},
    org_id:{type:String},
    created_date_time:{ type : String },
    created_by:{type:String},
    updated_by:{type:String},
    deleted_by:{type:String},
})

const orgMenuModel = mongoose.model('org_menu', orgMenuSchema);
module.exports=orgMenuModel;