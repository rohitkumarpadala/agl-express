const { constant, reject } = require('async');
let User = require('../model/org-model.js')
let mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectId;
var expressValidator = require('express-validator');
var datevalue = require('./dateCodes.js');
const statusCodes = require("./statusCodes");
const subfee = require('../model/sub_fee_details-model');
const fee = require('../model/fee_details-model.js');
const con = require("../config/db");
const { getdueamtdetails, getstudentduepaidFeeamt, getoldduedetails} = require('./transactionsController');

const securityModel = require('../model/securities-model');
const studentModel = require('../model/student-model');
const oldstudentModel = require('../model/old_student-model');
const oldstudentlogsModel = require('../model/old_student_logs-model');
const feedetailsModel = require('../model/fee_details-model.js');
const subfeedetailsModel = require('../model/sub_fee_details-model');
const branchdetailsModel = require('../model/branch_details-model');
const branchfeedetailsModel = require('../model/branchfee_details-model');
const calendaryearsModel = require('../model/calendar_years-model');
const academicyearsModel = require('../model/academic_years-model');
const allocatestudentbranchModel = require('../model/allocate_student_branch-model');
const transactionModel = require('../model/transactions-model');
const duebillsModel = require('../model/due_bill-model');
const expensesModel = require('../model/expenses-model');

con.on('connection', function (connection) {
  //console.log('DB Connection established');

  connection.on('error', function (err) {
    console.error(new Date(), 'MySQL error', err.code);
  });
  connection.on('close', function (err) {
    console.error(new Date(), 'MySQL close', err);
  });

});
const addOrg = async (request, response) => {
  try {
    var org_name = request.body.org_name;
    var created_by = request.body.created_by;
    var dateTime = datevalue.currentDate();
    if (org_name && org_name != '' && created_by && created_by != '') {
      var value = await User.findOne({ "org_name": { "$regex": `^${org_name}$`, "$options": "i" }, })
      if (!value) {
        let ordid = await User.create({ "org_name": org_name, "created_by": created_by, "status": "1", "created_date_time": dateTime })

        var fee_type = 'Old dues';
        var access_status = '1';
        var org_id = ordid._id;
        var fee_order = '1';

        let subfeetype = 'Old dues';
        let other_fee_id = '1'

        const feevalues = await fee.create({ "fee_type": fee_type, "access_status": access_status, "status": "1", "org_id": org_id, "fee_order": fee_order, "created_by": created_by, "created_date_time": dateTime, "other_fee_id": other_fee_id });
        const feeidvalue = feevalues._id;
        await subfee.create({ "fee_type_id": feeidvalue, "access_status": access_status, "status": "1", "org_id": org_id, "fee_order": fee_order, "created_by": created_by, "created_date_time": dateTime, "sub_fee_type": subfeetype });
        response.status(statusCodes.success).json({ message: "Organization created successfully" });
      } else {
        response.status(statusCodes.Dataexists).json({ message: "Organization name already exist" });
      }

    } else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  }

  catch (error) {
    console.log(error)
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while adding organization" });
  }
}
const updateOrg = async (request, response) => {
  try {
    var org_id = request.body.org_id;
    var org_name = request.body.org_name;
    var updated_by = request.body.updated_by;
    var status = request.body.status;
    var dateTime = datevalue.currentDate();
    if (org_name && org_name != '' && updated_by && updated_by != '' && org_id && org_id != '' && status && status != '') {
      var value = await User.findOne({ "org_name": { "$regex": `^${org_name}$`, "$options": "i" }, })
      if (!value) {
        await User.updateOne(
          { '_id': ObjectID(request.body.org_id) },
          { $set: { "org_name": org_name, "updated_by": updated_by, "status": status, "created_date_time": dateTime } })

        response.status(statusCodes.success).json({ message: "Organization updated successfully" });
      } else {
        response.status(statusCodes.Dataexists).json({ message: "Organization name already exist" });
      }
    } else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }

  }
  catch (error) {
    console.log(error)
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while updating organization" });
  }
}
const getorg = async (request, response) => {
  try {
    const users = await User.aggregate([
      {
        "$lookup": {
          "from": "securities",
          "let": { "salId": { "$toObjectId": "$created_by" } },
          "pipeline": [
            {
              "$match": {
                "$expr": {
                  $and: [
                    {
                      $eq: [
                        '$_id', '$$salId',
                      ],
                    },
                    {
                      $eq: ["$status", "1"],
                    },
                  ],
                }
              }
            }
          ],
          "as": "createdbyname"
        },

      }, { $unwind: "$createdbyname" },
      {
        $set: {

          created_by_name: "$createdbyname.admin_name"
        },

      }]).sort({ _id: -1 });
    response.status(statusCodes.success).json(users);
  } catch (error) {

    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while getting organization" });
  }
}
const updateorgstatus = async (request, response) => {
  try {
    var org_id = request.body.org_id;
    var status = request.body.status;
    var updated_by = request.body.updated_by;
    var dateTime = datevalue.currentDate();
    if (org_id && org_id != '' && updated_by && updated_by != '' && status && status != '') {
      if (mongoose.isValidObjectId(org_id)) {
        var value = await User.findOne({ _id: org_id })
        if (value) {
          User.updateOne({ '_id': ObjectID(org_id) },
            { $set: { "status": status, "updated_by": updated_by, "created_date_time": dateTime } },
            function (err, records) {
              if (err) {
                return false;
              }
            });

          response.status(statusCodes.success).json({ message: "Organization status updated successfully" });
        }
        else {
          response.status(606).json({ message: "Organization doesn't exist" });
        }
      }
      else {
        response.status(606).json({ message: "Please Give valid Organization" });
      }
    }
    else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {
    console.log(error)
    response.status(606).json({ message: "Problem occurred while deleting Organization" });
  }
}
//security table
const addSecuirtyDocuments = (result, org_id, created_by) => {
  return new Promise(async (resolve, reject) => {
    let promises = [];
    for (let i = 0; i < result.length; i++) {
      let itemObj = result[i];
      let resObj = {};
      resObj['admin_name'] = itemObj.admin_name;
      resObj['admin_email'] = itemObj.admin_email;
      resObj['admin_mobile'] = itemObj.admin_mobile;
      resObj['address'] = itemObj.address ? itemObj.address : '-';
      resObj['admin_password'] = itemObj.admin_password;
      resObj['status'] = itemObj.status;
      resObj['role_id'] = itemObj.role_id;
      resObj['security_type'] = itemObj.security_type;
      resObj['access_status'] = itemObj.access_status;
      resObj['create_date_time'] = itemObj.created_date_time;
      resObj['created_by'] = created_by;
      resObj['org_id'] = org_id;
      resObj['old_security_id'] = itemObj.security_id;
      const addDocument = async (itemObj, resObj) => {
        await securityModel.create(resObj);
        await con.query(`Update security set migrate_yes='1' where security_id='${itemObj.security_id}'`);
        console.log('processed ' + itemObj.security_id);
      }
      promises.push(await addDocument(itemObj, resObj));
    }
    await Promise.all(promises);
    resolve(1);
  })
}

//student_info table
const addStudentInfoDocuments = (result, org_id, created_by) => {
  return new Promise(async (resolve, reject) => {
    let promises = [];
    for (let i = 0; i < result.length; i++) {
      let itemObj = result[i];
      let resObj = {};
      resObj['student_name'] = itemObj.student_name;
      resObj['student_phone_number'] = itemObj.student_phone_number;
      resObj['hall_ticket_number'] = itemObj.hall_ticket_number;
      resObj['admission_number'] = itemObj.admission_number;
      resObj['id'] = itemObj.id;
      //resObj['gender'] = itemObj.gender;
      // resObj['dob'] = itemObj.dob;
      //resObj['caste'] = itemObj.caste;
      resObj['jnanbhumi_number'] = itemObj.jnanbhumi_number;
      resObj['aadhaar_number'] = itemObj.aadhaar_number;
      resObj['ssc'] = itemObj.ssc;
      resObj['second_language'] = itemObj.second_language;
      resObj['created_date_time'] = itemObj.create_date_time;
      resObj['created_by'] = created_by;
      resObj['status'] = itemObj.status;
      resObj['org_id'] = org_id;
      resObj['reg_type'] = 'N';
      const addDocument = async (itemObj, resObj) => {
        await studentModel.create(resObj);
        await con.query(`Update student_info set migrate_yes='1' where student_id='${itemObj.student_id}'`);
        console.log('processed ' + itemObj.student_id);
      }
      promises.push(await addDocument(itemObj, resObj));
    }
    await Promise.all(promises);
    resolve(1);
  })
}
//old_student_info table
const addOldStudentInfoDocuments = (result, org_id, created_by) => {
  return new Promise(async (resolve, reject) => {
    let promises = [];
    for (let i = 0; i < result.length; i++) {
      let itemObj = result[i];
      let student_id;
      let query = { "id": { "$regex": `^${itemObj.id}$`, "$options": "i" }, "org_id": org_id };
      let check = await getMongondbData('student', query, '_id');

      // const check = await studentModel.findOne({ "id": { "$regex": `^${itemObj.id}$`, "$options": "i" }, "org_id": org_id });
        if (!check) {
          let resObj = {};
          resObj['student_name'] = itemObj.student_name;
          resObj['student_phone_number'] = '';
          resObj['hall_ticket_number'] = '';
          resObj['admission_number'] = '';
          resObj['id'] = itemObj.id;
          resObj['jnanbhumi_number'] = '';
          resObj['aadhaar_number'] = '';
          resObj['ssc'] = '';
          resObj['second_language'] = '';
          resObj['created_by'] = created_by;
          resObj['created_date_time'] = itemObj.create_date_time;
          resObj['manual_created_date_time'] = itemObj.create_date_time;
          resObj['status'] = itemObj.status;
          resObj['org_id'] = org_id;
          resObj['reg_type'] = 'M';
          let student = await studentModel.create(resObj);
          // let student = await studentModel.create({ "org_id": org_id, "reg_type": 'M', "student_name": student_name, "student_phone_number": '', "status": "1", "hall_ticket_number": '', "admission_number": '', "aadhaar_number": '', "jnanbhumi_number": '', "id": id, "ssc": '', "second_language": '', "created_by": created_by, "created_date_time": current_date_time, "manual_created_date_time": current_date_time });
          student_id = (student?._id).toString();
        } else {
          student_id = check
        }

        let oldresObj = {};
        oldresObj['student_id'] = student_id;
        oldresObj['old_due_amount']= itemObj.original_due;
        oldresObj['status'] = '1';
        oldresObj['org_id'] = org_id;
        oldresObj['created_date_time'] = itemObj.create_date_time;
        oldresObj['created_by'] = created_by;

      const addDocument = async (stuObj, oldstuObj) => {
        let oldstudent = await oldstudentModel.create(oldstuObj);
        if(oldstudent){
          let logresObj = {};
          logresObj['student_id'] = oldstuObj.student_id;
          logresObj['prev_amount'] = '0';
          logresObj['new_amount']= stuObj.original_due;
          logresObj['amount']= stuObj.original_due;
          logresObj['status'] = '1';
          logresObj['org_id'] = oldstuObj.org_id;
          logresObj['created_date_time'] = stuObj.create_date_time;
          logresObj['created_by'] = created_by;
          logresObj['ayear_id'] = '0';
          logresObj['cyear_id'] = '0';
          logresObj['type'] = 'N';
          logresObj['transaction_id'] = '0';
          logresObj['old_due_id'] = (oldstudent._id).toString();
          await oldstudentlogsModel.create(logresObj);
        }

        await con.query(`Update old_student_info set migrate_yes='1' where student_id='${stuObj.student_id}'`);
        console.log('processed ' + stuObj.student_id);
      }
      promises.push(await addDocument(itemObj, oldresObj));
    }
    await Promise.all(promises);
    resolve(1);
  })
}
// fee_details table
const addFeeDetailsDocuments = (result, org_id, created_by) => {
  return new Promise(async (resolve, reject) => {
    let promises = [];
    for (let i = 0; i < result.length; i++) {
      let itemObj = result[i];
      let resObj = {};
      resObj['fee_type'] = itemObj.fee_type;
      resObj['access_status'] = itemObj.access_status;
      resObj['fee_order'] = itemObj.fee_order;
      resObj['created_date_time'] = itemObj.create_date_time;
      resObj['created_by'] = created_by;
      resObj['status'] = '1';
      resObj['org_id'] = org_id;
      resObj['other_fee_id'] = '0';
      const addDocument = async (item, resObj) => {
        let fees = await feedetailsModel.create(resObj);
        if(fees){
          const fee_id = fees._id;
          let subres = {};
          subres['fee_type_id'] = fee_id;
          subres['sub_fee_type'] = item.fee_type;
          subres['access_status'] = item.access_status;
          subres['fee_order'] = item.fee_order;
          subres['created_date_time'] = item.create_date_time;
          subres['created_by'] = created_by;
          subres['status'] = '1';
          subres['org_id'] = org_id;
          await subfeedetailsModel.create(subres);
          await con.query(`Update fee_details set migrate_yes='1' where fee_id='${item.fee_id}'`);
          console.log('processed ' + item.fee_id);
  
        }
      }
      promises.push(await addDocument(itemObj, resObj));
    }
    await Promise.all(promises);
    resolve(1);
  })
}
//branch_details table
const addBranchdetailsDocuments = (result, org_id, created_by, createDate) => {
  return new Promise(async (resolve, reject) => {
    let promises = [];
    for (let i = 0; i < result.length; i++) {
      let itemObj = result[i];
      let resObj = {};
      resObj['branch_name'] = itemObj;
      resObj['academic_years_value'] = '3';
      resObj['created_date_time'] = createDate;
      resObj['create_by'] = created_by;
      resObj['status'] = '1';
      resObj['org_id'] = org_id;

      const addDocument = async (branch_name, resObj) => {
        await branchdetailsModel.create(resObj);
        console.log('processed ' + branch_name);
      }
      promises.push(await addDocument(itemObj, resObj));
    }
    await Promise.all(promises);
    resolve(1);
  })
}
//branch_fees table
const addBranchfeedetailsDocuments = (result, org_id, created_by, createDate) => {
  return new Promise(async (resolve, reject) => {
    let academic_years = await academicyearsModel.find({org_id});
    // console.log(academic_years.length)
    let promises = [];
    for (let i = 0; i < result.length; i++) {
      let itemObj = result[i];
      let resObj = {};
      let branch_query = { "branch_name": { "$regex": `^${itemObj.branch_name}$`, "$options": "i" }, "org_id": org_id };
      let branch_id = await getMongondbData('branch_details', branch_query, '_id');
      // console.log('branch_id', branch_id)
      let fee_query = { "sub_fee_type": { "$regex": `^${itemObj.fee_type}$`, "$options": "i" }, "org_id": org_id };
      let sub_fee_id = await getMongondbData('sub_fee_details', fee_query, '_id');
      // console.log('sub_fee_id', sub_fee_id)

      let calendar_query = { "calendar_year_value": { "$regex": `^20${itemObj.year}$`, "$options": "i" }, "org_id": org_id };
      let calendar_years_id = await getMongondbData('calendar_years', calendar_query, '_id');
      // console.log('calendar_years_id', calendar_years_id)

      resObj['amount'] = itemObj.amount
      resObj['created_date_time'] = createDate;
      resObj['create_by'] = created_by;
      resObj['status'] = itemObj.status;
      resObj['org_id'] = org_id;
      const addDocument = async (item, resObj) => {
        await branchfeedetailsModel.create(resObj);
        await con.query(`Update branch_fees set migrate_yes='1' where branch_fee_id='${item.branch_fee_id}'`);
        console.log('processed ' + item.branch_name);
      }
      if(branch_id && sub_fee_id && calendar_years_id){
        resObj['branch_id'] = branch_id;
        resObj['sub_fee_id'] = sub_fee_id;
        resObj['calendar_years_id'] = calendar_years_id;
        academic_years.forEach(async (val, index)=>{

          resObj['academic_years_id'] = val._id;
          // console.log(resObj);
          promises.push(await addDocument(itemObj, resObj));

        })

      }
    }
    await Promise.all(promises);
    resolve(1);
  })
}

const allocatebranchstudentsDocuments = (result, org_id, created_by, createDate) => {
  return new Promise(async (resolve, reject) => {
    let query = {org_id, academic_year_value:'1'}
    let academic_years_id = await getMongondbData('academic_years', query, '_id');

    const addDocument = async (item, reqObj) => {
      await allocatestudentbranchModel.create(reqObj);
      console.log('processed ' + item.id);
    }
    let promises = [];
    for (let i = 0; i < result.length; i++) {
      let itemObj = result[i];
      let resObj = {};
      resObj['student_id'] = itemObj._id;
      resObj['status'] = '1';
      resObj['org_id'] = org_id;
      resObj['created_by'] = created_by;
      resObj['created_date_time'] = createDate;
      let branch_name = itemObj.id.split('-')[1];
      let branch_query = { "branch_name": { "$regex": `^${branch_name}$`, "$options": "i" }, "org_id": org_id };
      let branch_id = await getMongondbData('branch_details', branch_query, '_id');
      let year = itemObj.id.split('-')[0];
      let calendar_query = { "calendar_year_value": { "$regex": `^20${year}$`, "$options": "i" }, "org_id": org_id };
      let calendar_years_id = await getMongondbData('calendar_years', calendar_query, '_id');

      if(branch_id && calendar_years_id && academic_years_id){
        resObj['branch_id'] = branch_id;
        resObj['calendar_years_id'] = calendar_years_id;
        resObj['academic_years_id'] = academic_years_id;
          // console.log(resObj);
          promises.push(await addDocument(itemObj, resObj));
      }
    }
    await Promise.all(promises);
    resolve(1);
  })
}
// expenses table
const addExpensesDocuments = (result, org_id) => {
  return new Promise(async (resolve, reject) => {

    const addDocument = async (item, reqObj) => {
      await expensesModel.create(reqObj);
      await con.query(`Update expenses set migrate_yes='1' where expenses_id='${item.expenses_id}'`);
      console.log('processed ' + item.expenses_id);
    }
    let promises = [];
    for (let i = 0; i < result.length; i++) {
      let itemObj = result[i];
      let security_query = { "old_security_id": itemObj.created_by };
      let created_by = await getMongondbData('securities', security_query, '_id');

      let resObj = {};
      
      resObj['amount'] = itemObj.amount;
      resObj['expenses_to'] = itemObj.expenses_to;
      resObj['reason'] = itemObj.reason;
      resObj['expense_type'] = itemObj.expense_type;
      resObj['type'] = itemObj.type;
      resObj['status'] = itemObj.status;
      resObj['mail_status'] = itemObj.mail_status;
      resObj['updated_date_time'] = itemObj.updated_date_time;
      resObj['wait_url'] = itemObj.wait_url;
      resObj['accept_url'] = itemObj.accept_url;
      resObj['reject_url'] = itemObj.reject_url;
      resObj['created_date_time'] = itemObj.create_date_time;
      resObj['created_by'] = created_by;
      resObj['org_id'] = org_id;
      resObj['date'] = itemObj.create_date_time.split(" ")[0];
      if(created_by){
        promises.push(await addDocument(itemObj, resObj));
      }
    }
    await Promise.all(promises);
    resolve(1);
  })
}
const getMongondbData = (collectionname, query, resvalue) => {
  //for collections student,securities  
  return new Promise(async (resolve, reject) => {
    let collection;
    if (collectionname == 'student') {
      collection = studentModel;
    } else if (collectionname == 'securities') {
      collection = securityModel;
    } else if(collectionname == 'branch_details'){
      collection = branchdetailsModel;
    } else if(collectionname == 'sub_fee_details'){
      collection = subfeedetailsModel;
    } else if(collectionname == 'calendar_years'){
      collection = calendaryearsModel;
    } else if(collectionname == 'academic_years'){
      collection = academicyearsModel;
    } else if(collectionname == 'due_bills'){
      collection = duebillsModel;
    }
    
    let result = await collection.findOne(query);
    if (result) {
      let resval = result[resvalue];
      if(resvalue == '_id'){
        resolve(resval.toString());
      }else{
        resolve(resval);
      }
    } else {
      resolve('');
    }
  })
}
const getMysqlData = (querystr, fieldvalue) => {
  return new Promise(async (resolve, reject) => {
    con.query(querystr, async function (err, result, fields) {
      if (err) {
        resolve('');
      } else {
        if (result.length > 0) {
          if (result[0][fieldvalue]) {
            resolve(result[0][fieldvalue]);
          } else {
            resolve('');
          }

        } else {
          resolve('');
        }

      }
    })
  })
}



//transactions table
const addTransactionsDocuments = (result, org_id) => {
  return new Promise(async (resolve, reject) => {
    let academic_query = {org_id, academic_year_value:'1'}
    let academic_years_id = await getMongondbData('academic_years', academic_query, '_id');
    let academic = 1;
    let curr = 2022;

    const getPaidDetails = async (item) => {
      return new Promise(async (resolve, reject) => {
        con.query(`SELECT t.*, (select fee_type from fee_details where fee_id=t.fee_id)as fee_type FROM transactions t where  t.bill_number='${item.bill_number}'`, async function (err, res, fields) {
          if (err) {
            resolve([]);
          } else {
            const paiddetailsObj = (reqdata ) => {
              return new Promise(async (resolve, reject) => {
                let paidItemobj = reqdata;
                // console.log(paidItemobj);
                let resObj = {};
                let student_id = await getMongondbData('student',{"id":{"$regex":`^${paidItemobj.student_id}$`,"$options":"i"}},'_id');
                // console.log(student_id);
                let fee_query = { "sub_fee_type": { "$regex": `^${paidItemobj.fee_type}$`, "$options": "i" }, "org_id": org_id };
                let sub_fee_id = await getMongondbData('sub_fee_details', fee_query, '_id');
                let branch_name = paidItemobj.student_id.split('-')[1];
                let branch_query = { "branch_name": { "$regex": `^${branch_name}$`, "$options": "i" }, "org_id": org_id };
                let branch_id = await getMongondbData('branch_details', branch_query, '_id');
                let year = paidItemobj.student_id.split('-')[0];
                let currentcalyear = parseInt(`20${year}`);
                let diff = curr - currentcalyear;
                if(diff>0 && diff==3){
                    academic = diff;
                    currentcalyear = currentcalyear + (diff-1)
                }else if(diff>0 && diff<3) {
                    academic = diff+1;
                    currentcalyear = currentcalyear + diff;
                }else if(diff>0 && diff>3){
                    academic = 3;
                    currentcalyear = currentcalyear + 2;
                }
                academic_years_id = await getMongondbData('academic_years', {org_id, academic_year_value:academic}, '_id');

                
                let calendar_query = { "calendar_year_value": { "$regex": `^${currentcalyear}$`, "$options": "i" }, "org_id": org_id };
                let calendar_years_id = await getMongondbData('calendar_years', calendar_query, '_id');
          
                let security_query = { "old_security_id": paidItemobj.created_by };
                let created_by = await getMongondbData('securities', security_query, '_id');

                if(paidItemobj.transaction_type == 'M'){
                  // let query = { "id": { "$regex": `^${paidItemobj.id}$`, "$options": "i" }, "org_id": org_id };
                  // let check = await getMongondbData('student', query, '_id');
            
                    if (!student_id) {
                      let sturesObj = {};
                      sturesObj['student_name'] = paidItemobj.student_name;
                      sturesObj['student_phone_number'] = '';
                      sturesObj['hall_ticket_number'] = '';
                      sturesObj['admission_number'] = '';
                      sturesObj['id'] = paidItemobj.student_id;
                      sturesObj['jnanbhumi_number'] = '';
                      sturesObj['aadhaar_number'] = '';
                      sturesObj['ssc'] = '';
                      sturesObj['second_language'] = '';
                      sturesObj['created_by'] = created_by;
                      sturesObj['created_date_time'] = paidItemobj.create_date_time;
                      sturesObj['manual_created_date_time'] = paidItemobj.create_date_time;
                      sturesObj['status'] = '1';
                      sturesObj['org_id'] = org_id;
                      sturesObj['reg_type'] = 'M';
                      let student = await studentModel.create(sturesObj);
                      student_id = (student?._id).toString();
                    }
                }
                resObj['branch_id'] ='';
                resObj['academic_years_id'] = '';
                resObj['calendar_years_id'] = '';
                resObj['student_id'] = student_id;
                resObj['sub_fee_id'] = sub_fee_id;
                resObj['payment_method'] =paidItemobj.payment_method;
                resObj['amount'] =paidItemobj.amount;
                resObj['cash'] =paidItemobj.cash;
                resObj['bank'] =paidItemobj.bank;
                resObj['upi'] =paidItemobj.upi;
                resObj['bill_type'] =paidItemobj.bill_type;
                resObj['status'] =paidItemobj.status;
                resObj['transaction_type'] =paidItemobj.transaction_type;
                resObj['org_id'] = org_id;
                resObj['created_date_time'] =paidItemobj.create_date_time;
                resObj['date'] =paidItemobj.date;
                resObj['payment_method'] =paidItemobj.payment_method;
                resObj['created_by'] =created_by;
                resObj['transaction_number'] = paidItemobj.transaction_number;
                resObj['transaction_id'] = paidItemobj.transaction_id;
                if(paidItemobj.transaction_type !== 'M'){
                  resObj['branch_id'] =branch_id;
                  resObj['academic_years_id'] =academic_years_id;
                  resObj['calendar_years_id'] =calendar_years_id;
                }

                // need to get sub_fee_id based on fee_id;
                // need to get branch_id , calendar_year_id, academic_year_id 

                if(student_id && branch_id && academic_years_id && calendar_years_id && created_by && paidItemobj.transaction_type !== 'M'){
                  resolve(resObj);
                }else if(student_id && created_by && paidItemobj.transaction_type == 'M'){
                  resolve(resObj);
                }else{
                  resolve({});
                }

              })
            }

            let promises = [];
            for (let j = 0; j < res.length; j++) {
              let itemObj = res[j];
              promises.push(await paiddetailsObj(itemObj));
            }
            
            let paiddetails = await Promise.all(promises);
            let verifypaiddetails = paiddetails.filter((value) => Object.keys(value).length !== 0);
            if(paiddetails.length == verifypaiddetails.length){
              resolve(paiddetails);
            }else{
              resolve([]);
            }
          }

        });
      })
    }
    const addDocument = async (itemObj, resObjdata, stud_id) => {
      await transactionModel.create(resObjdata);
      // let student_status=await getMongondbData('student',{"_id":stud_id},'status');
      // let dueamt = await getdueamtdetails(stud_id, student_status);
      let branchstudent = await allocatestudentbranchModel.aggregate([{ $match: { "student_id": stud_id, "status": '1'} }]).sort({ _id: -1 });
      if (branchstudent.length > 0) {
        let branch_details =branchstudent[0];
        let branch_fee = await branchfeedetailsModel.aggregate([{ $match: { "branch_id": branch_details?.branch_id, "status": "1", org_id: org_id, calendar_years_id: branch_details?.calendar_years_id, academic_years_id: branch_details?.academic_years_id } }])
        const fees_details = [];
        let itemsObj = [];
        for (let i = 0; i < branch_fee.length; i++) {
          let sub_fee_id = branch_fee[i]?.sub_fee_id;
          let amount = branch_fee[i]?.amount;
          branch_details['sub_fee_id'] = sub_fee_id;
          branch_details['amount'] = amount;
          fees_details.push(await getstudentduepaidFeeamt(branch_details));
        }
        itemsObj = await Promise.all(fees_details);
        itemsObj = itemsObj.filter((value) => Object.keys(value).length !== 0);
        let oldduevalue = await getoldduedetails(stud_id, org_id)
        if (oldduevalue) {
          itemsObj.push(oldduevalue)
        }
        let duebillvalue=await getMongondbData('due_bills',{ bill_number: resObjdata.bill_number, org_id: org_id },'_id');
        if (!duebillvalue) {
          for (let i = 0; i < itemsObj.length; i++) {
            let subfeeid = itemsObj[i].sub_fee_id;
            let due_amount = itemsObj[i].due_amount;
            if (parseFloat(due_amount) > 0) {
              await duebillsModel.create({ "org_id": org_id, "bill_number":resObjdata.bill_number, "sub_fee_id": subfeeid, "due_amount": due_amount, created_date_time:resObjdata.created_date_time_value, "status": "1" })
            }
          }
        }
      }

      await con.query(`Update transactions set migrate_yes='1' where bill_number='${itemObj.bill_number}'`);
      console.log('processed ' + itemObj.bill_number);
    }
    let promises = [];
    for (let i = 0; i < result.length; i++) {
      let itemObj = result[i];
      let tranresObj = {};
      tranresObj['bill_number'] = itemObj.bill_number;
      // tranresObj['transaction_number'] = itemObj.transaction_number;
      tranresObj['transactionidvalue'] = itemObj.transaction_id;
      tranresObj['created_date_time_value'] = itemObj.create_date_time;
      tranresObj['tot_amt'] = itemObj.sumamount;
      let paiddetails = await getPaidDetails(itemObj);
      if(paiddetails && paiddetails.length>0){
        let stu_id = paiddetails[0].student_id;
        tranresObj['paiddetails']=paiddetails;
        promises.push(await addDocument(itemObj, tranresObj, stu_id));
      }
    }
    await Promise.all(promises);
    resolve(1);
  })
}

const migrateDb = async (request, response) => {
  /*Request tables
  securities
  student_info
  old_student_info
  fee_details
  branch_details
  branch_fees
  transactions
  */
  let request_table = request.body.request_table;
  let org_id = request.body.org_id;
  let created_by = request.body.created_by;
  if (con) {
    console.log(request_table)
    if (request_table != '' && org_id != '' && created_by) {
      if (request_table == 'securities') {
        con.query("SELECT * FROM security where migrate_yes='0'", async function (err, result, fields) {
          if (err) {
            response.status(statusCodes.SomethingWentWrong).json({ message: err.message });
          } else {
            await addSecuirtyDocuments(result, org_id, created_by);
            response.status(statusCodes.success).json({ message: "Secuirty Table Migrated successfully !!!" });
          }

        });
      } else if (request_table == 'student_info') {
        con.query("SELECT * FROM student_info where migrate_yes='0'", async function (err, result, fields) {
          if (err) {
            response.status(statusCodes.SomethingWentWrong).json({ message: err.message });
          } else {
            await addStudentInfoDocuments(result, org_id, created_by);
            response.status(statusCodes.success).json({ message: "Student Info Migrated successfully !!!" });
          }

        });
      } else if (request_table == 'transactions') {
        con.query(`SELECT *, max(transaction_id)as transaction_id, IFNULL(SUM(amount),0) as sumamount FROM transactions where migrate_yes='0' group by bill_number`, async function (err, result, fields) {
          if (err) {
            response.status(statusCodes.SomethingWentWrong).json({ message: err.message });
          } else {
            await addTransactionsDocuments(result, org_id);
            response.status(statusCodes.success).json({ message: "Transactions  Migrated successfully !!!" });
          }
        });
      } else if(request_table == 'old_student_info'){
        con.query("SELECT * FROM old_student_info where migrate_yes='0'", async function (err, result, fields) {
          if (err) {
            response.status(statusCodes.SomethingWentWrong).json({ message: err.message });
          } else {

            await addOldStudentInfoDocuments(result, org_id, created_by);
            response.status(statusCodes.success).json({ message: "Old Student Info Migrated successfully !!!" });
          }

        });
      } else if(request_table == 'fee_details'){
        //  skipping olddues
        con.query("UPDATE fee_details SET migrate_yes = '1' WHERE fee_id = 10", async function (err1, result1, fields1) {
          if (err1) {
            response.status(statusCodes.SomethingWentWrong).json({ message: err.message });
          } else {
            con.query("SELECT * FROM fee_details where migrate_yes='0'", async function (err, result, fields) {
              if (err) {
                response.status(statusCodes.SomethingWentWrong).json({ message: err.message });
              } else {
    
                await addFeeDetailsDocuments(result, org_id, created_by);
                response.status(statusCodes.success).json({ message: "Fee Types Migrated successfully !!!" });
              }
            });
          }
        });
      }else if(request_table == 'branch_details'){

        con.query("SELECT DISTINCT(id) FROM ( SELECT DISTINCT(id) FROM student_info UNION SELECT DISTINCT(id) FROM old_student_info) t", async function (err, result, fields) {
          if (err) {
            response.status(statusCodes.SomethingWentWrong).json({ message: err.message });
          } else {
            const uniquebranches = Array.from(new Set(result.map(str => str.id.split('-')[1])));
            await addBranchdetailsDocuments(uniquebranches, org_id, created_by, request.currentDate);
            response.status(statusCodes.success).json({ message: "Branches Migrated successfully !!!" });
          }
        });

      } else if(request_table == 'branch_fees'){
        con.query("SELECT bf.*, fd.fee_type FROM branch_fees bf INNER JOIN fee_details fd where bf.migrate_yes='0'", async function (err, result, fields) {
          if (err) {
            response.status(statusCodes.SomethingWentWrong).json({ message: err.message });
          } else {
            await addBranchfeedetailsDocuments(result, org_id, created_by, request.currentDate);
            response.status(statusCodes.success).json({ message: "Branch Fees Migrated successfully !!!" });
          }
        });

      } else if(request_table == 'allocate_branches'){
        let result  = await studentModel.find({org_id, status:{ $in: ["1", "2"] }});

        await allocatebranchstudentsDocuments(result, org_id, created_by, request.currentDate);
        response.status(statusCodes.success).json({ message: "allocate_branches Migrated successfully !!!" });

      } else if(request_table == 'expenses'){

        con.query("SELECT * FROM expenses where migrate_yes='0' ", async function (err, result, fields) {
          if (err) {
            response.status(statusCodes.SomethingWentWrong).json({ message: err.message });
          } else {

            await addExpensesDocuments(result, org_id);
            response.status(statusCodes.success).json({ message: "Expenses Migrated successfully !!!" });
          }
        });


      } else {
        response.status(statusCodes.SomethingWentWrong).json({ message: "Requested tables not yet done." });
      }

    } else {
      response.status(statusCodes.SomethingWentWrong).json({ message: "Please provide request table and org id" });
    }

  } else {
    response.status(statusCodes.SomethingWentWrong).json({ message: "Mysql Db connection issue !!!" });
  }

  // if (request.body.org_id) {
  //   try {

  //     const org_id = request.body.org_id;

  //     let unwind = { "$unwind": "$paiddetails" };
  //     let match = { "paiddetails.org_id": org_id, "paiddetails.status": "1" };

  //     let dateTime = request.currentDate;
  //     match['paiddetails.date'] = { $lte: dateTime };


  //     let groupby = {
  //       $group: { '_id': { org_id: '$paiddetails.org_id' }, cash: { $sum: { "$toDouble": "$paiddetails.cash" } }, bank: { $sum: { "$toDouble": "$paiddetails.bank" } }, upi: { $sum: { "$toDouble": "$paiddetails.upi" } }, total_amount: { $sum: { "$toDouble": "$paiddetails.amount" } } }
  //     }
  //     let final_res = { $project: { "_id": 0, cash: { $round: ["$cash", 2] }, bank: { $round: ["$bank", 2] }, upi: { $round: ["$upi", 2] }, total_amount: { $round: ["$total_amount", 2] } } };
  //     // let final_res = { $project: { "_id": 0, "date": "$_id.date", cash: "$cash", bank: "$bank", upi: "$upi", total_amount: "$total_amount" } };


  //     let day_wise_totals = await transaction.aggregate([
  //       unwind,
  //       {
  //         $match: match
  //       },
  //       groupby,
  //       final_res,
  //     ]).sort({ "date": -1 });
  //     response.status(statusCodes.success).json(day_wise_totals);

  //   } catch (e) {

  //     response.status(statusCodes.SomethingWentWrong).json({ message: e.message });
  //   }
  // }
}
module.exports = { addOrg, updateOrg, getorg, updateorgstatus, migrateDb };