const mongoose=require('mongoose');


// how our document look like
const departmentSchema = mongoose.Schema({
    
    dep_name:  {type: String,required: true},
    create_by:{type:String},
    updated_by:{type:String},
    deleted_by:{type:String},
    status: {type: String,required: true},
    org_id:{type:String,required:true},
    created_date_time:{ type : String },
    
});


const departmentModel = mongoose.model('Department', departmentSchema);

module.exports=departmentModel;