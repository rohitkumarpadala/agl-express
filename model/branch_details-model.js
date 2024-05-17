const mongoose=require('mongoose');


// how our document look like
const branchDetailsSchema = mongoose.Schema({
    branch_name:{type: String,required: true},
    academic_years_value: {type: String,required: true},
    status: {type: String,required: true},
    org_id:{type:String,required:true},
    created_date_time:{ type : String },
    create_by:{type:String,required:true},
    updated_by:{type:String},
    deleted_by:{type:String},
});


const branchDetailsModel = mongoose.model('branch_details', branchDetailsSchema);
module.exports=branchDetailsModel;