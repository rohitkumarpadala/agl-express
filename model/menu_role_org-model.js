
const mongoose=require('mongoose');
const roleMenuOrgSchema=mongoose.Schema({
    role_id:{type: String},
    status: {type: String},
    org_id:{type:String},
    menu_object_id:{type:String},
    created_date_time:{ type : String },
    created_by:{type:String},
    updated_by:{type:String},
    deleted_by:{type:String},
})

const roleMenuModel = mongoose.model('menu_role_org', roleMenuOrgSchema);
module.exports=roleMenuModel;