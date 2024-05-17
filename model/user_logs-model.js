const { ObjectId } = require('mongodb');
const mongoose=require('mongoose');


// how our document look like
const userLogsSchema = mongoose.Schema({
        security_id: {type:String,required: true},
        operation_type: {type:String,required: true},
        operated_by: {type:String},
        created_date_time:{ type : String}
});


const userLogsModel = mongoose.model('user_logs', userLogsSchema);

module.exports=userLogsModel;