const { constant, reject } = require('async');
const ExpensesModel = require('../model/expenses-model.js')
var expressValidator = require('express-validator');
var datevalue=require('./dateCodes.js');
let ObjectID = require('mongodb').ObjectId;
const statusCodes = require("./statusCodes");
require("dotenv").config();
const MAIL_ID = process.env.MAIL_ID;
const { getPaymentType, getUserNamebyId } = require('./commonfunction.js');

const { TotalCashIN } = require('./transactionsController');
function addLeadingZeros(num, totalLength) {
  return String(num).padStart(totalLength, '0');
}
const Datevalue = () => {
  var date = new Date();
  var current_date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + addLeadingZeros(date.getDate(), 2);
  return current_date;
}

const Sendmail = (mailtransporter, options)=>{
  return new Promise(async (resolve, reject) => {
      try {
        // console.log(options);
        let mailOptions = {
            from: MAIL_ID,
            to: [],
            subject:'',
            html: '',
            attachments:null
        };
        mailOptions['to']= options.mails;
        mailOptions['subject']= options.name;
        mailOptions['html']= options.html

        await mailtransporter.sendMail(mailOptions, function(error, info){
            if (error) {
            // console.log(error);
            resolve(false);
            } else {
            resolve(true);
            }
        });
      }
      catch (e) {
          // console.log(e);
          resolve(false);
      }
  })
}
const addExpenses = async (request, response) => {
  try {
    let amount = request.body.amount;
    let expenses_to = request.body.expenses_to;
    let expense_type = request.body.expense_type;
    let reason = request.body.reason;
    let type = request.body.type;
    let created_by = request.body.created_by;
    let org_id = request.body.org_id;
    let dateTime = request.currentDate;
    let date=dateTime.split(" ")[0]
      if (amount && amount != '' && expenses_to && expenses_to != '' && reason && reason != '' && type && type != '' && created_by && created_by != ''&& org_id && org_id != '') {
        let payment_method = getPaymentType(type); 
        let check = true;
        
        if(expense_type == 'E'){
          let TotalCash = await TotalCashIN(request);
          let cashInHand = TotalCash?.cashInHand ?? 0;
          let cashInBank = TotalCash?.cashInBank ?? 0;
          let cashInupi = TotalCash?.cashInupi ?? 0;
          if(type == 'C' && (parseFloat(cashInHand) < parseFloat(amount))){
            check = false;
          }else if(type == 'B' && (parseFloat(cashInBank) < parseFloat(amount))){
            check = false;
          }else if(type == 'U' && (parseFloat(cashInupi) <  parseFloat(amount))){
            check = false;
          }
        }
        if(check){
          let expense = await ExpensesModel.create({ "amount": amount, "expenses_to": expenses_to, "expense_type": expense_type, "org_id": org_id, "reason": reason, "created_by": created_by, "created_date_time": dateTime,
          "accept_url": '', "reject_url": '', "wait_url": '', 
          "status": "P", type, date , mail_status:'0'});
          response.status(statusCodes.success).json({ message: "Expenses created successfully" });

        }else{
          response.status(statusCodes.InvalidData).json({ message: `Expense amount is greater than Cash-in ${payment_method} available.` });
        }
        // let insertId = expense.id.toString();
        // let payment_method = getPaymentType(type); 
        // let accept_url = `${request.master_server}/expenses/expenseacceptance?status=A&expenses_id=${insertId}`;
        // let reject_url = `${request.master_server}/expenses/expenseacceptance?status=R&expenses_id=${insertId}`;
        // let wait_url = `${request.master_server}/expenses/expenseacceptance?status=W&expenses_id=${insertId}`;
        // await ExpensesModel.updateMany({ 'org_id': org_id, _id:insertId }, { $set: { accept_url,reject_url,wait_url } });
        // let message = '';
        // let security_name = await getUserNamebyId(created_by);
        // if(expense_type=='E') {     
        //   message = `AGL College - Vizianagaram, ${security_name} wishes to pay Rs ${amount} /- to ${expenses_to} via ${payment_method} for ${reason},<br/>CH: 10,000 <br/>CB: 20,000 <br/>CU: 25,000 <br/> <a href='${accept_url}'><font color='#00ff00'><b><u>Accept</u></b></font></a> &nbsp;&nbsp;&nbsp; <a href='${wait_url}'><font color='#ffa500'><b><u>Wait</u></b></font></a> &nbsp;&nbsp;&nbsp; <a href='${reject_url}'><font color='#ff0000'><b><u>Reject</u></b></font></a>`;
        // } else if(expense_type=='C'){
        //   message = `AGL College - Vizianagaram, ${security_name} wishes to collect Rs ${amount} /- from ${expenses_to} via ${payment_method} for ${reason},<br/>CH: 10,000 <br/>CB: 20,000 <br/>CU: 25,000 <br/> <a href='${accept_url}'><font color='#00ff00'><b><u>Accept</u></b></font></a> &nbsp;&nbsp;&nbsp; <a href='${wait_url}'><font color='#ffa500'><b><u>Wait</u></b></font></a> &nbsp;&nbsp;&nbsp; <a href='${reject_url}'><font color='#ff0000'><b><u>Reject</u></b></font></a>`;  
        // }
        // message = `<div><span>Mr. Admin,</span><br><br><span>The accountant wants to pay Rs ${amount} /- to Mr/Ms. ${expenses_to} for ${reason} is awaiting your response. </span><br><br> <a href='${accept_url}'><font color='#00ff00'><b><u>Accept</u></b></font></a> &nbsp;&nbsp;&nbsp; <a href='${wait_url}'><font color='#ffa500'><b><u>Wait</u></b></font></a> &nbsp;&nbsp;&nbsp; <a href='${reject_url}'><font color='#ff0000'><b><u>Reject</u></b></font></a><br><br><span>Regards,<br>AGL College</span></div>`;  

        // let Htmlmailbody = '<!DOCTYPE html>'+
        // '<html lang="en">'+
        // '<head>'+
        // '<title>Report</title>'+
        // '<meta charset="utf-8">'+
        // '<meta name="viewport" content="width=device-width, initial-scale=1">'+
        // '</head>'+
        // '<body>'+
        // '<div class="container">'+ message +
        // // '<br/><p>This is a system generated email. Please do not reply to this mail.</p>'+
        // // '</br><h4>DISCLAIMER:</h4></br>'+
        // // '<p>This mail and/or attachments may contain confidential and/or privileged information and is intended solely for the addressee. Any unauthorized use is strictly prohibited and may be unlawful. If you receive this message in error, please delete it immediately and notify us. The Company accepts no liability for any damage caused by any virus transmitted by this mail.</p>'+
        // '</div>'+
        // '</body>'+
        // '</html>';
        // let mailbody={mails:[MAIL_ID], name:'AGL Expenses', html:Htmlmailbody };
        // // const sendmail = await Sendmail(request.mailtransporter, mailbody);

      } else {
        response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
      }

  } catch (e) {
    // console.log(e)
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while creating Expenses" });
  }
}
const changestatusvalue=async(request, response)=>{
  try {
    let org_id = request.body.org_id;
    let expenses_id = request.body.expenses_id;
    let status = request.body.status;
    // console.log(expenses_id);
    // console.log(status);
      if (expenses_id && status){
        let dateTime =request.currentDate;
        let expense = await ExpensesModel.findOne({ _id:ObjectID(expenses_id), status:{ $in: ["P", "W"] } });
        if(expense){
          let type = expense.type;
          let amount  = expense.amount;
          let expense_type = expense.expense_type;
          let org_id = expense.org_id;
          let check = true;
          if(org_id)request.body['org_id'] =org_id;
          if(expense_type == 'E'){
            let TotalCash = await TotalCashIN(request);
            let cashInHand = TotalCash?.cashInHand ?? 0;
            let cashInBank = TotalCash?.cashInBank ?? 0;
            let cashInupi = TotalCash?.cashInupi ?? 0;
            if(type == 'C' && (parseFloat(cashInHand) < parseFloat(amount))){
              check = false;
            }else if(type == 'B' && (parseFloat(cashInBank) < parseFloat(amount))){
              check = false;
            }else if(type == 'U' && (parseFloat(cashInupi) <  parseFloat(amount))){
              check = false;
            }
          }
          if(check){
            await ExpensesModel.updateOne(
              { '_id': ObjectID(expenses_id) },
              { $set: {"status": status,"updated_date_time": dateTime } });
              response.status(statusCodes.success).send({ message: "Status updated successfully" });
          }else{
            response.status(statusCodes.InvalidData).json({ message: "Expense amount is greater than cash-in available." });
          }
        }else{
          response.status(statusCodes.InvalidData).json({message: "Invalid expense/collection or processed"});
        }
    }else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  }catch (e) {
    // console.log(e)
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while creating Expenses" });
  }
}
  const getTotalexpenses=async(request, response) => {
    try {
    let org_id = request.body.org_id;
    
    if (org_id && org_id != ''){
      let dateTime =request.currentDate;
      let match = {  "org_id": org_id,"status":"A", "date": {
       
        $lte: dateTime
      }};
      let groupby = {
        $group: { '_id': { expense_type: "$expense_type" }, expenses_amount: { $sum: { "$toDouble": "$amount" } } },
      }
      let final_res = { $project: { "_id": 0, "expense_type": "$_id.expense_type", expenses_amount: { $round: ["$expenses_amount", 2] } } };
      
      let expense = await ExpensesModel.aggregate([
        {$match: match },
        groupby,
        final_res
      ]).sort({_id : -1});

      response.status(statusCodes.success).json(expense);
    } else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  } catch (e) {
    // console.log(e)
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while creating Expenses" });
  }
}

const getExpenses= async (request, response) => {
  try {
    
    let org_id = request.body.org_id;
    // console.log(org_id);
    let date = request.body.date;
    let status_id=request.body.status_ids;
    if (org_id && org_id != ''){
      // let dateTime =request.currentDate;
      // let date=dateTime.split(" ")[0];
      
      // let expense = await ExpensesModel.find({ "date": date, "org_id": org_id }).sort({_id : -1});
      let match = {  "org_id": org_id };
      if (date) match['date'] = date;
      if (status_id) match['status'] =  { $in: status_id};
      let expense = await ExpensesModel.aggregate([
        {$match: match },
        {
          "$lookup": {
              "from": "securities",
              "let": { "salId": { "$toObjectId": "$created_by" } },
              "pipeline": [
                  {
                      "$match": {
                          "$expr": {
                              $and: [
                                  {$eq: ['$_id', '$$salId']},
                              ],
                          }
                      }
                  }
              ],
              "as": "created_by_details"
          },
      },
      { $unwind: "$created_by_details" },
      {
        $set: {
          created_by_name: "$created_by_details.admin_name",
        }
      },
      { $unset: ["created_by_details"] },
      ]).sort({_id : -1});
      response.status(statusCodes.success).json(expense);
    } else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  } catch (e) {
    // console.log(e)
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while creating Expenses" });
  }
}

const expensesAcceptance = async (request, response) => {
  // console.log(request.query);
  try {
    let expenses_id = request.query.expenses_id;
    let status = request.query.status;
    if (expenses_id && status){
      let msg = ``;
      let color = ``;
      if (status == 'A') {
        msg = "Accepted";
        color = "green";
      } else if (status == 'R') {
        msg = "Rejected";
        color = "red";
      } else {
        msg = "put on hold";
        color = "orange";
      }
      let dateTime =request.currentDate;
      let expense = await ExpensesModel.findOne({ _id:expenses_id, status:'P', mail_status:'0'});
      if(expense){
        await ExpensesModel.updateOne(
        { '_id': ObjectID(expenses_id) },
        { $set: { status,"updated_date_time": dateTime, mail_status:'1' } });

      let message = `<div style='text-align:center;color:${color}'><b>The amount of ₹ ${expense.amount} to Mr/Ms. ${expense.expenses_to} as an expense for ${expense.reason} has been ${msg}.</b><div>`;

      response.status(statusCodes.success).send(message);

      }else{
        response.status(statusCodes.InvalidData).send("<div style='text-align:center;color:red'><b>This Request has been already Processed</b><div>");
      }
    } else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  } catch (e) {
    // console.log(e)
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while creating Expenses" });
  }
}
module.exports = { addExpenses ,getExpenses, expensesAcceptance,changestatusvalue,getTotalexpenses};