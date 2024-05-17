
const mongoose=require('mongoose');


// how our document look like
const oldTransactionsSchema = mongoose.Schema({
    transaction_id:  String,
    bill_String:  {type: String,required: true},
    transaction_String: {type: String,required: true},
    student_id: {type: String,required: true},
    student_name: {type: String,required: true},
    fee_id: {type: String,required: true},
    payment_method: {type: String,required: true},
    amount: {type: String,required: true},
    cash: {type: String,required: true},
    bank: {type: String,required: true},
    upi: {type: String,required: true},
    bill_type: {type: String,required: true},
    status: {type: String,required: true},
    transaction_type: {type: String,required: true},
    created_by: {type: String,required: true},
    date:Date,
    org_id:{type:String,required:true},
    created_date_time:{ type : String }
});


const oldTransactionsModel = mongoose.model('old_transactions', oldTransactionsSchema);

module.exports=oldTransactionsModel;