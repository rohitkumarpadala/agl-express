
const mongoose=require('mongoose');


// how our document look like
const missmatchedLogSchema = mongoose.Schema({
    log_id:  String,
    transaction_id:  {type: String, max: 10,required: true},
    mm_cash: {type: String,required: true},
    mm_bank: {type: String,required: true},
    mm_upi: {type: String,required: true},
    mm_amount: {type: String,required: true},
    payment_type: {type: String,required: true},
    qry_type: {type: String,required: true},
    transaction_type: {type: String,required: true},
    user_id: {type: String,required: true},
    org_id:{type:String,required:true},
    created_date_time:{ type : String }
    
});


const missmatchedLogModel = mongoose.model('missmatched_logs', missmatchedLogSchema);

module.exports=missmatchedLogModel;