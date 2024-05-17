
const mongoose=require('mongoose');


// how our document look like
const dueAmountSchema = mongoose.Schema({
    student_id:   {type: String, required: true},
    due_amount: {type: String,required: true},
    status: {type: String,required: true},
    org_id:{type:String,required:true},
    created_date_time:{ type : String },
    created_by:{type:String,required:true},
});


const dueAmountModel = mongoose.model('due_amount', dueAmountSchema);

module.exports=dueAmountModel;