
const mongoose = require('mongoose');


// how our document look like
const concessionSchema = mongoose.Schema({
    concession_slab:{ type: String, required: true },
    concessions: [{
        sub_fee_id: { type: String, required: true },
        percentage: { type: String, required: true },    
    }],
    org_id: { type: String, required: true },
    created_date_time: { type: String },
    created_by:{ type: String, required: true },
    updated_by: { type: String },
    updated_date_time: { type: String },
    deleted_by:{type:String },
    // branch_id: { type: String, required: true },
    // academic_years_id:{ type : String , required: true},
    // calendar_years_id:{ type : String, required: true},
    status: { type: String },
    
});


const concessionModel = mongoose.model('concession', concessionSchema);

module.exports = concessionModel;