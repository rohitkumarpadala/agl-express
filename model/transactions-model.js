
const mongoose=require('mongoose');
const mongoosePaginate = require('mongoose-aggregate-paginate-v2');

// how our document look like
const transactionsSchema = mongoose.Schema({
    bill_number:  {type: String}, 
    created_date_time_value:{ type : String },
    transactionidvalue: {type: Number},
    tot_amt:{ type : String },
    paiddetails: [{
    student_id: {type: String},
    sub_fee_id: {type: String},
    payment_method: {type: String},
    amount: {type: String},
    cash: {type: String},
    bank: {type: String},
    upi: {type: String},
    bill_type: {type: String},
    status: {type: String},
    transaction_type: {type: String},
    created_by:{type:String},
    updated_by:{type:String},
    org_id:{type: String},
    created_date_time:{ type : String },
    year:{type:String},
    branch_id:{type: String},
    date:{type : String},
    academic_years_id:{ type : String },
    calendar_years_id:{ type : String },
    transaction_number:  {type: String},
    transaction_id: {type: Number},
    
}]
});

transactionsSchema.plugin(mongoosePaginate);
const transactionsModel = mongoose.model('transactions', transactionsSchema);

module.exports=transactionsModel;