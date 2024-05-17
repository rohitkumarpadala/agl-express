
const mongoose=require('mongoose');


// how our document look like
const promoteprocessedStudentSchema = mongoose.Schema({
   
    student_id: {type: String,required: true},
    branch_id: {type: String,required: true},
    status: {type: String,required: true},
    org_id:{type:String,required:true},
    created_date_time:{ type : String },
    created_by:{type:String,required:true},
    from_academic_years_id: {type:String,required:true},
    to_academic_years_id: {type:String,required:true},
    from_calendar_years_id: {type:String,required:true},
    to_calendar_years_id: {type:String,required:true},
    created_date_time:{ type : String }
});


const promoteprocessedStudentModel = mongoose.model('promote_processed_student', promoteprocessedStudentSchema);

module.exports=promoteprocessedStudentModel;