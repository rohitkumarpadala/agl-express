
const mongoose=require('mongoose');


// how our document look like
const closeForTheDaySchema = mongoose.Schema({
    close_at:  { type : String },
    open_at: { type : String },
    status: {type: String,required: true},
    org_id:{type:String,required:true},
    created_date_time:{ type : String },
    created_by:{type:String,required:true},
});


const closeForTheDayModel = mongoose.model('closefortheday', closeForTheDaySchema);

module.exports=closeForTheDayModel;