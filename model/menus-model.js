
const mongoose=require('mongoose');


// how our document look like
const menusSchema = mongoose.Schema({
    menu_id:  String,
    menu_name:  {type: String},
    menu_type: {type: String},
    menu_order: {type: String},
    menu_status: {type: String},
    menu_web_url:{type: String},
    parent_id:{type: String},
    web_class_name:{type: String},
    web_icon:{type: String},
    org_id:{type:String},
    created_date_time:{ type : String }
});


const menusModel = mongoose.model('menus', menusSchema);

module.exports=menusModel;