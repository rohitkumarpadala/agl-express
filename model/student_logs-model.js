const { ObjectId } = require('mongodb');
const mongoose=require('mongoose');


// how our document look like
const studentsLogsSchema = mongoose.Schema({
        student_id: {type:String,required: true},
        operation_type: {type:String,required: true},
        operated_by: {type:String},
        created_date_time:{ type : String }
});


const studentsLogsModel = mongoose.model('student_logs', studentsLogsSchema);

module.exports=studentsLogsModel;