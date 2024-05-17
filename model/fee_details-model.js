
const mongoose=require('mongoose');


// how our document look like
const feeDetailsSchema = mongoose.Schema({
    
    fee_type:  {type: String,required:true},
    access_status: {type: String},
    fee_order: {type: String,required:true},
    status: {type: String,required:true},
    org_id:{type:String,required:true},
    created_date_time:{ type : String},
    created_by:{type:String},
    updated_by:{type:String},
    deleted_by:{type:String},
    other_fee_id:{type: String}//1->old due,while creating fee type Dynamically through front end should be 0
});


const feeDetailsModel = mongoose.model('fee_details', feeDetailsSchema);

module.exports=feeDetailsModel;