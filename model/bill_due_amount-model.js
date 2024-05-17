
const mongoose=require('mongoose');


// how our document look like
const billDueAmountSchema = mongoose.Schema({
    bill_due_amount_id:  String,
    due_amount: {type: String,required: true},
    fee_id: {type: String,required: true},
    bill_String: {type: String,required: true},
    status: {type: String,required: true},
    org_id:{type:String,required:true},
    created_date_time:{ type : String },
    created_by:{type:String,required:true},
});


const billDueAmountModel = mongoose.model('bill_due_amount', billDueAmountSchema);

module.exports=billDueAmountModel;