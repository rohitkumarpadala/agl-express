
const mongoose=require('mongoose');


// how our document look like
const transactionLogSchema = mongoose.Schema({
    bill_number:  {type: String}, 
    date:{type: String},
    payment_method :{type: String},
    transaction_id:  {type: String, required: true},
    prev_amount:{type: String,required: true},
    modified_amount: {type: String,required: true},
    prev_cash:{type: String,required: true},
    modified_cash: {type: String,required: true},
    prev_bank:{type: String,required: true},
    modified_bank: {type: String,required: true},
    prev_upi:{type: String,required: true},
    modified_upi: {type: String,required: true},
    prev_sub_fee_id:{type: String,required: true},
    modified_sub_fee_id: {type: String,required: true},
    operation_type: {type:String,required: true},
    operated_by: {type:String},
    created_date_time:{ type : String},
    org_id:{ type : String},
    student_id:{ type : String},
    updated_date_time:{ type : String},
});


const transactionLogModel = mongoose.model('transaction_logs', transactionLogSchema);

module.exports=transactionLogModel;