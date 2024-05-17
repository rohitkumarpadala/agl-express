
const mongoose=require('mongoose');


// how our document look like
const staffDepartmentSchema = mongoose.Schema({
    staff_id:  {type: String, max: 10,required: true},
    dep_id: {type: String,required: true},
    org_id:{type:String,required:true},
    status:{type:String,required:true},
    created_date_time:{ type : String },
    created_by:{type:String},
    updated_by:{type:String},
    deleted_by:{type:String},
    
});


const staffDepartmentModel = mongoose.model('staff_department', staffDepartmentSchema);

module.exports=staffDepartmentModel;