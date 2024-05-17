
const mongoose=require('mongoose');


// how our document look like
const expensesSchema = mongoose.Schema({
    amount:  {type: Number,required: true},
    expenses_to: {type: String,required: true},
    expense_type: {type: String,required: true,
      enum : ['E','C']  
    },
    reason: {type: String,required: true},
    type: {type: String,required: true,
      enum : ['B','C','U'],   
    },
    status: {
      type: String,
      required: true,
      enum : ['P','W','A','R'],
      default: 'P'
    },
    created_by: {type: String,required: true},
    accept_url: {type: String},
    reject_url: {type: String},
    wait_url: {type: String},
    org_id:{type:String,required:true},
    created_date_time:{ type :String },
    created_by:{type:String,required:true},
    updated_date_time:{ type :String },
    resend_date_time:{ type :String,},
    mail_status:{
      type: String,
      required:true,
      enum:['0','1'],
      default: '0'
    },
    date:{type:String,required:true},

});


const expensesModel = mongoose.model('expenses', expensesSchema);

module.exports=expensesModel;