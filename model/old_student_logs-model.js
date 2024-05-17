
const mongoose=require('mongoose');


// how our document look like
const oldStudentlogSchema = mongoose.Schema({
    student_id:   {type: String, required: true},
    prev_amount: {type: String,required: true},
    new_amount: {type: String,required: true},
    amount : {type: String,required: true},
    status: {type: String,required: true},
    org_id:{type:String,required:true},
    created_date_time:{ type : String },
    created_by:{type:String},
    updated_by:{type:String},
    deleted_by:{type:String},
    ayear_id:{type:String},
    cyear_id:{type:String},
    type:{type:String},
    status:{type:String},
    transaction_id:{type:String},
    old_due_id:{type:String}
});


const oldStudentlogModel = mongoose.model('old_student_log', oldStudentlogSchema);

module.exports=oldStudentlogModel;