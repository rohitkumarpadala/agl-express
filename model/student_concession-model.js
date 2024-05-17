
const mongoose = require('mongoose');


// how our document look like
const studentConcessionSchema = mongoose.Schema({
    student_id: { type: String, required: true },
    concession_slab_id:{ type: String},
    concessions: [{
        sub_fee_id: { type: String, required: true },
        concession: { type: String, required: true },
        concession_status: { type: String, required: true },
    }],
    org_id: { type: String, required: true },
    created_date_time: { type: String },
    created_by:{ type: String, required: true },
    updated_by: { type: String },
    deleted_by:{type:String },
    academic_years_id:{ type : String , required: true},
    calendar_years_id:{ type : String , required: true}

    
});


const studentConcessionModel = mongoose.model('student_concession', studentConcessionSchema);

module.exports = studentConcessionModel;