
const mongoose=require('mongoose');


// how our document look like
const profileSchema = mongoose.Schema({
   
   
    org_id:{type:String},
    created_date_time:{ type : String },
    security_id:{type:String},
    path: {type:String},
   
});


const profileModel = mongoose.model('profile', profileSchema);

module.exports=profileModel;