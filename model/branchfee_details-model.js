
const mongoose=require('mongoose');


// how our document look like
const branchfeeDetailsSchema = mongoose.Schema({
    branch_id:  {type: String,required: true},
    //branch_name:  {type: String, max: 10,required: true},

   
    sub_fee_id: {type: String,required: true},
    amount: {type: String,required: true},
    status: {type: String,required: true},
    org_id:{type:String,required:true},
    created_by:{type:String},
    updated_by:{type:String},
    deleted_by:{type:String},
    created_date_time:{ type : String },
    academic_years_id:{ type : String ,required: true},
    calendar_years_id:{ type : String ,required: true}
});


const branchfeeDetailsModel = mongoose.model('branchfee_details', branchfeeDetailsSchema);

module.exports=branchfeeDetailsModel;
