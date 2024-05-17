let User = require('../model/branch_details-model');
let Student = require('../model/student-model.js');
let transaction = require('../model/transactions-model');
var ObjectID = require('mongodb').ObjectId;
let branchfee = require('../model/branchfee_details-model');
let concession = require('../model/student_concession-model.js');
let subfee = require('../model/sub_fee_details-model');
let studentconcession = require('../model/student_concession-model');
let CalendarYears = require('../model/calendar_years-model');
let Securities = require('../model/securities-model.js');


const getCurrentCalendarYearIDByOrgIdForBranchAssigning = (org_id, calendar_year) => {
  return new Promise(async (resolve, reject) => {
    // let activecalendaryear = await CalendarYears.aggregate([{$match: {org_id:org_id, status:'1', current_active:"1"}}]);

    let activecalendaryear = await CalendarYears.aggregate([
      {
        $match: {
          org_id: org_id,
          status: "1",
          calendar_year_value: calendar_year,
        },
      },
    ]);

    if (activecalendaryear && activecalendaryear.length > 0) {
      resolve(activecalendaryear[0]._id.toString());
    } else {
      resolve("");
    }
  });
};

const getCurrentCalendarYearIDByOrgId = (org_id) => {
  return new Promise(async (resolve, reject) => {
    let activecalendaryear = await CalendarYears.aggregate([{$match: {org_id:org_id, status:'1', current_active:"1"}}]);

    // let activecalendaryear = await CalendarYears.aggregate([
    //   {
    //     $match: {
    //       org_id: org_id,
    //       status: "1",
    //       calendar_year_value: calendar_year,
    //     },
    //   },
    // ]);

    if (activecalendaryear && activecalendaryear.length > 0) {
      resolve(activecalendaryear[0]._id.toString());
    } else {
      resolve("");
    }
  });
};
const getStudentByIDOrgId = (student_id, org_id) => {
  return new Promise(async(resolve, reject) => {
    let match = { _id: ObjectID(student_id)};
    if(org_id)match['org_id']=org_id;
    let students = await Student.aggregate([{$match: match }]);
    if(students && students.length>0){
      resolve(students[0]);
    }else{
      resolve({});
    }
  })
}
const getPaymentType = (val) => {
  if(val === 'U'){
      return 'UPI';
  }else if(val === 'B'){
      return 'Bank';
  }else if(val === 'C'){
      return 'Hand';
  }else{
    return val;
  }
}
const getUserNamebyId = (user_id, org_id) => {
  return new Promise(async(resolve, reject) => {
    let match = { _id: ObjectID(user_id)};
    if(org_id)match['org_id']=org_id;
    let User = await Securities.aggregate([{$match: match }, { $unset: "admin_password" }]);
    if(User && User.length>0){
      resolve(User[0].admin_name);
    }else{
      resolve('');
    }
  })
}
module.exports = {
  getCurrentCalendarYearIDByOrgId,getStudentByIDOrgId,getPaymentType,getUserNamebyId,getCurrentCalendarYearIDByOrgIdForBranchAssigning,
  StudFinal: async function (studid) {
    console.log(studid);
    let student = await Student.aggregate([{ $match: { _id: ObjectID(studid) } }, {
      "$project": {
        "studentid": "$id",
      }
    }])

    var studID = student[0].studentid;
    var dID = studID.split('-');
    var branchname = dID[1];
    const branchid = await User.aggregate([{ $match: { 'branch_name': branchname } }, {
      "$project": {
        "branchid": "$_id",
      }
    }]);
    let concessionvalue = 0;
   
    let concession_amount = await studentconcession.aggregate([{ "$unwind": "$concessions" },
  { $match: { "concessions.sub_fee_id": item.toString(), "concessions.concession_status": "a", "academic_years_id": academic_years_id, "calendar_years_id": calendar_years_id, "student_id": studID, "org_id": org_id } }])

  if (concession_amount.length > 0) {
    concessionvalue = (concession_amount[0].concessions.concession / 100) * actual_amount[0].amount;
  }

    let transactionamt = await transaction.aggregate([
      { $match: { "status": "1", "student_id": studid } },
      {
        $group: {
          _id: "$_id",
          amount: { $sum: "$amount" }
        }
      }
    ])
    let actual_amount = await branchfee.aggregate([{ $match: { "status": 1, "branch_id": branchid[0].branchid.toString() } }, {
      $group: {
        _id: "$_id",
        amount: { $sum: "$amount" }
      }
    }
    ])
    var dueamt = actual_amount[0].amount - transactionamt[0].amount;
    console.log(dueamt)
    return dueamt;
  },
  getTrasactionamt: async function (studid, date, sub_fee_id) {
    let transaction = await transaction.aggregate([
      { $match: { "status": "1", "student_id": studid, "date": date, "sub_fee_id": sub_fee_id } },
      {
        $group: {
          _id: "$_id",
          amount: { $sum: "$amount" }
        }
      }
    ])
    return transaction[0].amount;

  },

  getbranchamt: async function (studid) {
    let student = await Student.aggregate([{ $match: { _id: ObjectID(studid) } }, {
      "$project": {
        "studentid": "$id",

      }
    }])
    //console.log(student);
    var studID = student[0].studentid;
    var dID = studID.split('-');
    var branchname = dID[1];
    const branchid = await User.aggregate([{ $match: { 'branch_name': branchname } }, {
      "$project": {
        "branchid": "$_id",

      }
    }]);
    let actual_amount = await branchfee.aggregate([{ $match: { "status": "1", "branch_id": branchid[0].branchid.toString() } }, {
      $group: {
        _id: "$_id",
        amount: { $sum: "$amount" }
      }
    }
    ])
    var branchamt = 0;
    if (actual_amount != 0 || actual_amount[0].amount != "undefined") {
      branchamt = actual_amount[0].amount;
    }
    let concessionfee = await concession.aggregate([{ $match: { "student_id": studid, "concessions.concession_status": "p" } },
    {
      $group: {
        _id: "$_id",
        amount: { $sum: "$concessions.concession_amt" }
      }
    }
    ])

    var concessionamt = 0;

    if (concessionfee[0].amount != 0) {
      concessionamt = concessionfee[0].amount;
    }

    let totalamt = 0;
    if (branchamt != 0) {
      totalamt = branchamt - concessionamt;
    }
    return totalamt

  },
  studentwisebillReport: async function (studid) {
    let student = await Student.aggregate([{ $match: { _id: ObjectID(studid) } }, {
      "$project": {
        "studentid": "$id",

      }
    }])
    //console.log(student);
    var studID = student[0].studentid;
    var dID = studID.split('-');
    var branchname = dID[1];
    var year = parseInt(dID[0].padStart(4, "20"));
    console.log(typeof year)
    const branchid = await User.aggregate([{ $match: { 'branch_name': branchname } }, {
      "$project": {
        "branchid": "$_id",
      }
    }]);
    console.log(branchid[0].branchid)

    let userdetail1 = await transaction.aggregate([{ $match: { "branch_id": branchid[0].branchid.toString(), "student_id": studid } }, { $project: { emit: { key: "$sub_fee_id", value: "$amount" } } },
    {
      $group: {                                                    // equivalent to the reduce function
        _id: "$emit.key",
        valuesPrices: {
          $accumulator: {
            init: function () { return 0; },
            initArgs: [],
            accumulate: function (state, value) { return state + value; },
            accumulateArgs: ["$emit.value"],
            merge: function (state1, state2) { return state1 + state2; },
            lang: "js"
          }
        }

      }
    },])
    for (let i = 0; i < userdetail1.length; i++) {
      const users = await subfee.find({ '_id': ObjectID(userdetail1[i]._id) });
      console.log(users);
    }
  }

}


