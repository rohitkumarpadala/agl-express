
const mongoose=require('mongoose');


// how our document look like
const allocateStudentBranchSchema = mongoose.Schema({
   
    student_id: {type: String,required: true},
    branch_id: {type: String,required: true},
    status: {type: String,required: true},
    org_id:{type:String,required:true},
    created_date_time:{ type : String },
    created_by:{type:String,required:true},
    academic_years_id: {type:String,required:true},
    calendar_years_id: {type:String,required:true}
});


const allocateStudentBranchModel = mongoose.model('allocate_student_branch', allocateStudentBranchSchema);

module.exports=allocateStudentBranchModel;