
const mongoose=require('mongoose');


// how our document look like
const oldStudentSchema = mongoose.Schema({
    student_id: {type: String, required: true},
    old_due_amount: {type: String,required: true},
    status: {type: String,required: true},
    org_id:{type:String,required:true},
    created_date_time:{ type : String },
    created_by:{type:String},
    updated_by:{type:String},
    deleted_by:{type:String},
});


const oldStudentModel = mongoose.model('old_student', oldStudentSchema);

module.exports=oldStudentModel;