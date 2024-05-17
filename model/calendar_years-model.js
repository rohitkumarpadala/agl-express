
const mongoose=require('mongoose');
const calendarYearsSchema = mongoose.Schema({
    calendar_year: {type: String,required: true},
    calendar_year_value: { type: String, required: true },
    org_id:{type:String,required:true},
    created_by:{type:String},
    updated_by:{type:String},
    deleted_by:{type:String},
    created_date_time:{ type : String },
    status:{ type : String },
    current_active :{ type : String },
});
const calendarYearsModel = mongoose.model('calendar_years', calendarYearsSchema);

module.exports=calendarYearsModel;