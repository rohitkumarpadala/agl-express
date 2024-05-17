const { ObjectId } = require('mongodb');
const mongoose=require('mongoose');


// how our document look like
const feeLogsSchema = mongoose.Schema({
        fee_id: {type:String,required: true},
        operation_type: {type:String,required: true},
        operated_by: {type:String},
        created_date_time:{ type : String}
});


const feeLogsModel = mongoose.model('fee_logs', feeLogsSchema);

module.exports=feeLogsModel;