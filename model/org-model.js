
const mongoose = require('mongoose');
const orgSchema = mongoose.Schema({
    org_name: { type: String },
    status: { type: String },
    created_date_time: { type: String },
    created_by: { type: String },
    updated_by:{type:String},
})

const orgModel = mongoose.model('org_details', orgSchema);
module.exports = orgModel;