
const mongoose=require('mongoose');


// how our document look like
const subfeeDetailsSchema = mongoose.Schema({
    fee_type_id: {type: String,required:true},
   sub_fee_type:  {type: String,required:true},
    access_status: {type: String},
    fee_order: {type: String,required:true},
    status: {type: String,required:true},
    org_id:{type:String,required:true},
    created_date_time:{ type : String},
    created_by:{type:String,required:true},
    
});


const subfeeDetailsModel = mongoose.model('sub_fee_details', subfeeDetailsSchema);

module.exports=subfeeDetailsModel;