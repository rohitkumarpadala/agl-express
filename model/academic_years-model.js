const mongoose=require('mongoose');
const academicYearsSchema = mongoose.Schema({
    academic_year: {type: String,required: true},
    academic_year_value: { type: String, required: true },
    org_id:{type:String,required:true},
    created_by:{type:String},
    updated_by:{type:String},
    deleted_by:{type:String},
    status:{type:String},
    order:{type:String},
    created_date_time:{ type : String },  
});
const academicYearsModel = mongoose.model('academic_years', academicYearsSchema);

module.exports=academicYearsModel;