
const mongoose=require('mongoose');


// how our document look like
const dueBillDetailsSchema = mongoose.Schema({
    
    sub_fee_id:  {type: String,required:true},
    bill_number: {type: String},
    org_id: {type: String,required:true},
    due_amount: {type: String,required:true},
    org_id:{type:String,required:true},
    created_date_time:{ type : String},
    status:{ type : String},
   
});


const dueBillDetailsModel = mongoose.model('due_bill', dueBillDetailsSchema);

module.exports=dueBillDetailsModel;