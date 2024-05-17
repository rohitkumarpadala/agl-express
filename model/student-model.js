
const { ObjectId } = require('mongodb');
const mongoose=require('mongoose');


// how our document look like
const studentSchema = mongoose.Schema({
   
    hall_ticket_number:{type: String},
    admission_number: {type: String},
    student_name: {type: String},
    jnanbhumi_number: {type: String},
    aadhaar_number: {type: String},
    id: {type:String},
    student_phone_number: {type: String},
    ssc: {type: String},
    second_language:{type: String},
    status: {
        type: String,
        enum : ['0','1','2','3'],
        default: '1'
    },
    reg_type: { 
        type: String, 
        enum : ['N','M'],
        default: 'N'
    },
    is_excel:{
        type: String,
        enum:['0','1'],
        default: '0'
    },
    org_id:{type: String},
    created_by:{type: String},
    updated_by:{type: String},
    deleted_by:{type: String},
    created_date_time:{ type : String },
    manual_created_date_time:{type : String},
    normal_created_date_time:{type : String},

});


const studentModel = mongoose.model('student', studentSchema);

module.exports=studentModel;