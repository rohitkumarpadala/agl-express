const { constant, reject } = require("async");
let User = require("../model/student-model.js");
//let Oldstudent=require('../model/olddueSchema');
let branchfee = require("../model/branchfee_details-model");
let transaction = require("../model/transactions-model");
let studentconcession = require("../model/student_concession-model");
let Studentlog = require("../model/student_logs-model");
let allocate = require("../model/allocate_student_branch-model");
var ObjectID = require("mongodb").ObjectId;
let mongoose = require("mongoose");
let subfee = require("../model/sub_fee_details-model");
let allocstudent = require("../model/allocate_student_branch-model");
let ayear = require("../model/academic_years-model");
let cyear = require("../model/calendar_years-model");
var datevalue = require("./dateCodes.js");
const statusCodes = require("./statusCodes");
const { adddueamtJob } = require("./background_jobs");
const academicYearsModel = require("../model/academic_years-model");
const branch = require("../model/branch_details-model");
const {
  getCurrentCalendarYearIDByOrgId,
  getCurrentCalendarYearIDByOrgIdForBranchAssigning,
} = require("./commonfunction.js");
const {
  getdueamtdetails,
  getstudentfinaldueamount,
} = require("./transactionsController");
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
let olddue = require("../model/old_student-model.js");
let oldduelog = require("../model/old_student_logs-model");
let fee = require("../model/fee_details-model");
const promoteStudent = require("../model/promote_processed_student-model");
const mime = require("mime");
const checkID = (dobj) => {
  return new Promise(async (resolve, reject) => {
    let match = { status: { $nin: "0" } };
    if (dobj.org_id) match["org_id"] = dobj.org_id;
    if (dobj.student_id) match["_id"] = { $nin: dobj.student_id };
    if (dobj.id) match["id"] = { $regex: `^${dobj.id}$`, $options: "i" };
    let students = await User.find(match);
    resolve(students);
  });
};

const checkHallTicketNumber = (dobj) => {
  return new Promise(async (resolve, reject) => {
    let match = { status: { $nin: "0" } };
    if (dobj.org_id) match["org_id"] = dobj.org_id;
    if (dobj.student_id) match["_id"] = { $nin: dobj.student_id };
    if (dobj.id)
      match["hall_ticket_number"] = {
        $regex: `^${dobj.hall_ticket_number}$`,
        $options: "i",
      };
    let students = await User.find(match);
    resolve(students);
  });
};
const checkAdmissionNumber = (dobj) => {
  return new Promise(async (resolve, reject) => {
    let match = { status: { $nin: "0" } };
    if (dobj.org_id) match["org_id"] = dobj.org_id;
    if (dobj.student_id) match["_id"] = { $nin: dobj.student_id };
    if (dobj.id)
      match["admission_number"] = {
        $regex: `^${dobj.admission_number}$`,
        $options: "i",
      };
    let students = await User.find(match);
    resolve(students);
  });
};

const addStud = async (request, response) => {
  try {
    let h_num = request.body.hall_ticket_number;
    let a_num = request.body.admission_number;
    let f_name = request.body.student_name;
    let m_number = request.body.student_phone_number;
    let aadhaar = request.body.aadhaar_number;
    let j_num = request.body.jnanbhumi_number;
    let ssc = request.body.ssc;
    let s_lang = request.body.second_language;
    let id = request.body.id;
    let org_id = request.body.org_id;
    let created_by = request.body.created_by;
    var dateTime = datevalue.currentDate();
    if (
      f_name &&
      f_name != "" &&
      m_number &&
      id &&
      id &&
      m_number != "" &&
      id != "" &&
      h_num &&
      h_num != "" &&
      org_id &&
      org_id != "" &&
      created_by &&
      created_by != ""
    ) {
      let dobj = {
        org_id: org_id,
        id: id,
        hall_ticket_number: h_num,
        admission_number: a_num,
      };
      // var value = await User.findOne({ "id": id, "org_id": org_id })
      let checkid = await checkID(dobj);
      if (checkid.length < 1) {
        let checkhall = await checkHallTicketNumber(dobj);
        if (checkhall.length < 1) {
          let checkadmission = await checkAdmissionNumber(dobj);
          if (checkadmission.length < 1) {
            await User.create({
              student_name: f_name,
              student_phone_number: m_number,
              status: "1",
              hall_ticket_number: h_num,
              admission_number: a_num,
              aadhaar_number: aadhaar,
              jnanbhumi_number: j_num,
              id: id,
              ssc: ssc,
              second_language: s_lang,
              second_language: s_lang,
              org_id: org_id,
              created_by: created_by,
              created_date_time: dateTime,
              normal_created_date_time: dateTime,
            });
            response
              .status(statusCodes.success)
              .json({ message: "Student created successfully" });
          } else {
            response
              .status(statusCodes.Dataexists)
              .json({ message: "Admission Number already assigned" });
          }
        } else {
          response
            .status(statusCodes.Dataexists)
            .json({ message: "Hall Ticket Number already assigned" });
        }
      } else {
        response
          .status(statusCodes.Dataexists)
          .json({ message: "Student ID already exist" });
      }
    } else {
      response
        .status(statusCodes.ProvideAllFields)
        .json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {
    response
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while creating student" });
  }
};

const getStud = async (request, response) => {
  try {
    let org_id = request.body.org_id;
    let status = request.body.status;
    let branch_id = request.body.branch_id;
    let calendar_years_id = request.body.calendar_years_id;
    let academic_years_id = request.body.academic_years_id;
    // let cyearcheck =request.body.cyearcheck;
    let cyearid = await getCurrentCalendarYearIDByOrgId(org_id);
    calendar_years_id = calendar_years_id || cyearid;
    if (mongoose.isValidObjectId(org_id)) {
      if (branch_id && academic_years_id) {
        let match = {
          org_id: org_id,
          branch_id: branch_id,
          academic_years_id: academic_years_id,
        };
        if (calendar_years_id) match["calendar_years_id"] = calendar_years_id;

        // if(!cyearcheck){
        //   // match['calendar_years_id']=calendar_years_id;
        //   match['status']= status;
        // }
        const users = await allocstudent.find(match);
        // console.log(users)
        // response.status(statusCodes.success).json(users);

        // const users = await allocstudent.find(
        //   {

        //     "org_id": org_id, "status": status, "branch_id": branch_id, "calendar_years_id": cyearid, "academic_years_id": academic_years_id

        //   })
        let userdetails = [];
        let itemsObj = [];
        for (let i = 0; i < users.length; i++) {
          // let item = users[i].student_id;
          userdetails.push(getstudsvalue(users[i]));
        }
        itemsObj = await Promise.all(userdetails);
        response.status(statusCodes.success).json(itemsObj);
      } else {
        // const users = await User.find();
        // console.log(users?.filter((v) => v?.created_by == 5));
        const users = await User.aggregate([
          {
            $match: {
              org_id: org_id,
              status: status,
            },
          },
          {
            $lookup: {
              from: "securities",
              let: { salId: { $toObjectId: "$created_by" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$_id", "$$salId"],
                        },
                        {
                          $eq: ["$status", "1"],
                        },
                      ],
                    },
                  },
                },
              ],
              as: "createdbyname",
            },
          },
          { $unset: "createdbyname.admin_password" },
        ]).sort({ _id: -1 });

        response.status(statusCodes.success).json(users);
      }
    } else {
      response
        .status(statusCodes.InvalidData)
        .json({ message: "Please give valid organization ID" });
    }
  } catch (error) {
    console.log("gautam debug:", error);
    response
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while getting student" });
  }
};
const getbranchStudents = async (request, response) => {
  try {
    if (request.body.org_id && request.body.status) {
      let org_id = request.body.org_id;
      let status = request.body.status;
      let branch_id = request.body.branch_id;
      let calendar_years_id = request.body.calendar_years_id;
      let academic_years_id = request.body.academic_years_id;
      let cyearid = await getCurrentCalendarYearIDByOrgId(org_id);
      calendar_years_id = calendar_years_id || cyearid;
      if (mongoose.isValidObjectId(org_id)) {
        let match = { org_id: org_id, status: "1" };
        if (branch_id) match["branch_id"] = branch_id;
        // if (academic_years_id) match["academic_years_id"] = academic_years_id;
        // if (calendar_years_id) match["calendar_years_id"] = calendar_years_id;
        let students = await allocstudent
          .aggregate([
            { $match: match },
            {
              $lookup: {
                from: "students",
                let: { salId: { $toObjectId: "$student_id" } },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$_id", "$$salId"] },
                          { $eq: ["$status", status] },
                        ],
                      },
                    },
                  },
                ],
                as: "student_details",
              },
            },
            { $unset: "student_details.created_date_time" },
            { $unset: "student_details.created_by" },
            { $unset: "student_details._id" },
            { $unwind: "$student_details" },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: ["$$ROOT", "$student_details"],
                },
              },
            },
            {
              $lookup: {
                from: "branch_details",
                let: { salId: { $toObjectId: "$branch_id" } },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$_id", "$$salId"] },
                          { $eq: ["$status", "1"] },
                        ],
                      },
                    },
                  },
                ],
                as: "branch_details",
              },
            },
            { $unwind: "$branch_details" },
            {
              $lookup: {
                from: "calendar_years",
                let: { salId: { $toObjectId: "$calendar_years_id" } },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$_id", "$$salId"] },
                          { $eq: ["$status", "1"] },
                        ],
                      },
                    },
                  },
                ],
                as: "calendar_years",
              },
            },
            { $unwind: "$calendar_years" },
            {
              $lookup: {
                from: "academic_years",
                let: { salId: { $toObjectId: "$academic_years_id" } },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$_id", "$$salId"] },
                          { $eq: ["$status", "1"] },
                        ],
                      },
                    },
                  },
                ],
                as: "academic_years",
              },
            },
            { $unwind: "$academic_years" },
            {
              $lookup: {
                from: "securities",
                let: { salId: { $toObjectId: "$created_by" } },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$_id", "$$salId"] },
                          { $eq: ["$status", "1"] },
                        ],
                      },
                    },
                  },
                ],
                as: "user_details",
              },
            },
            { $unwind: "$user_details" },
            {
              $set: {
                status: "$student_details.status",
                branch_name: "$branch_details.branch_name",
                academic_year: "$academic_years.academic_year",
                calendar_year: "$calendar_years.calendar_year",
                created_by_name: "$user_details.admin_name",
              },
            },
            {
              $unset: [
                "branch_details",
                "calendar_years",
                "academic_years",
                "student_details",
                "user_details",
              ],
            },
          ])
          .sort({ _id: -1 });
        response.status(statusCodes.success).json(students);
      } else {
        response
          .status(statusCodes.InvalidData)
          .json({ message: "Please give valid organization ID" });
      }
    } else {
      response
        .status(statusCodes.ProvideAllFields)
        .json({ message: "Please provide all mandatory fields" });
    }
  } catch (error) {
    console.log("venky debug:", error);
    response
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while getting student" });
  }
};
const getstudsvalue = async (item) => {
  let studentcheck = await User.aggregate([
    { $match: { _id: ObjectID(item.student_id) } },
  ]).sort({ _id: -1 });

  let studentobj = studentcheck[0];
  const branchname = await branch
    .aggregate([{ $match: { _id: ObjectID(item.branch_id), status: "1" } }])
    .sort({ _id: -1 });
  const aname = await ayear
    .aggregate([
      { $match: { _id: ObjectID(item.academic_years_id), status: "1" } },
    ])
    .sort({ _id: -1 });
  const cname = await cyear
    .aggregate([
      { $match: { _id: ObjectID(item.calendar_years_id), status: "1" } },
    ])
    .sort({ _id: -1 });
  let branch_name = "";
  let cyear_name = "";
  let acyear_name = "";
  if (branchname.length > 0) {
    branch_name = branchname[0].branch_name;
  }
  if (aname.length > 0) {
    acyear_name = aname[0].academic_year;
  }
  if (cname.length > 0) {
    cyear_name = cname[0].calendar_year;
  }
  studentobj["branch_name"] = branch_name;
  studentobj["aname"] = acyear_name;
  studentobj["cname"] = cyear_name;
  studentobj["branchdetails"] = item;
  // console.log(studentobj)
  return studentobj;
};

// const getdueamt = async (item, student_id, org_id, calendar_years_id, academic_years_id, branch_id) => {

// console.log(item)
//   let transactionamt = await transaction.aggregate([{ "$unwind": "$paiddetails" }, { $match: { "paiddetails.student_id": student_id, "paiddetails.sub_fee_id": item, "paiddetails.status": "1", "paiddetails.academic_years_id": academic_years_id, "paiddetails.calendar_years_id": calendar_years_id, "paiddetails.org_id": org_id } }, { $project: { emit: { key: "$paiddetails.sub_fee_id", value: "$paiddetails.amount" } } },
//   {
//     $group: {                                                    // equivalent to the reduce function
//       _id: "$emit.key",
//       valuesPrices: {
//         $accumulator: {
//           init: function () { return 0; },
//           initArgs: [],
//           accumulate: function (state, value) { return parseFloat(state) + parseFloat(value); },
//           accumulateArgs: ["$emit.value"],
//           merge: function (state1, state2) { return parseFloat(state1) + parseFloat(state2); },
//           lang: "js"
//         }
//       }

//     }
//   },])

//   let actual_amount = await branchfee.aggregate([{ $match: { "sub_fee_id": item.toString(), "status": "1", "academic_years_id": academic_years_id, "calendar_years_id": calendar_years_id, "org_id": org_id, "branch_id": branch_id } }, {
//     "$group": {
//       _id: "$_id",
//       "data": { "$addToSet": "$$ROOT" }

//     }
//   }, { "$unwind": "$data" }, {
//     "$project": {
//       "amount": "$data.amount"
//     }
//   }])
//   // console.log(actual_amount)
//   if (actual_amount.length === 0) {
//     let feeid = await fee.findOne({ "other_fee_id": "1", "status": "1", "org_id": paiddetails.org_id });

//     let subfeeid = await subfee.findOne({ "fee_type_id": feeid._id.toString() })

//     if (item.toString().localeCompare(subfeeid)) {
//       actual_amount=await olddue.aggregate([{match:{"student_id":student_id,"org_id":org_id,"status":"1"},
//       "$group": {
//         _id: "$_id",
//         "data": { "$addToSet": "$$ROOT" }

//       }
//     }, { "$unwind": "$data" }, {
//       "$project": {
//         "amount": "$data.old_due_amount"
//       }
//     }])
//     }
//   }

//   let concessionvalue = 0.0;
//   let concession_amount = await studentconcession.aggregate([{ "$unwind": "$concessions" },
//   { $match: { "concessions.sub_fee_id": item.toString(), "concessions.concession_status": "a", "academic_years_id": academic_years_id, "calendar_years_id": calendar_years_id, "student_id": student_id, "org_id": org_id } }])

//   if (concession_amount.length > 0) {

//     // if (!concession_amount[0].concession_slab_id) {
//     //   concessionvalue = concession_amount[0].concessions.concession;
//     // } else {
//     // let percentage = await concession.aggregate([{ "$unwind": "$concessions" },
//     // { $match: { "concessions.sub_fee_id": item.toString(), _id: ObjectId(concession_amount[0].concession_slab_id) } }])
//     concessionvalue = (concession_amount[0].concessions.concession / 100) * actual_amount[0].amount;
//   }

//   let transamt = 0.0;
//   let pendingamount = 0.0;
//   if (concessionvalue > 0) {
//     actual_amount[0].amount = parseFloat(actual_amount[0].amount).toFixed(2) - parseFloat(concessionvalue).toFixed(2);

//   }

//   if (transactionamt.length !== 0 && actual_amount.length !== 0) {
//     transamt = transactionamt[0].valuesPrices.toFixed(2)
//     pendingamount = parseFloat(actual_amount[0].amount).toFixed(2) - transamt;

//   }
//   else {
//     pendingamount = parseFloat(actual_amount[0].amount).toFixed(2);

//   }
//   let subfeedetail = await subfee.aggregate([

//     {
//       $match: {
//         "_id": ObjectID(item), "status": "1"
//       }
//     }, {
//       "$lookup": {
//         "from": "fee_details",
//         "let": { "userId": { "$toObjectId": "$fee_type_id" } },
//         pipeline: [{
//           $match: {
//             $expr: {
//               $and: [
//                 {
//                   $eq: [
//                     '$_id', '$$userId',
//                   ],
//                 },
//                 {
//                   $eq: ["$status", "1"],
//                 },
//               ],
//             },
//           }
//         }],
//         "as": "feename"
//       }
//     }
//     ,])
//   // console.log(subfeedetail);
//   // console.log(actual_amount[0].amount);

//   let user_obj = {}
//   user_obj["paid_amt"] = transamt;
//   user_obj["subfeename"] = subfeedetail[0].sub_fee_type;
//   user_obj["feename"] = subfeedetail[0].feename[0].fee_type;
//   user_obj["due_amt"] = parseFloat(pendingamount).toFixed(2);
//   user_obj["actual_amt"] = parseFloat(actual_amount[0].amount).toFixed(2);

//   return user_obj;

// }

const updatestud = async (request, response) => {
  try {
    let student_id = request.body.student_id;
    let h_num = request.body.hall_ticket_number;
    let a_num = request.body.admission_number;
    let f_name = request.body.student_name;
    let m_number = request.body.student_phone_number;
    let aadhaar = request.body.aadhaar_number;
    let j_num = request.body.jnanbhumi_number;
    let ssc = request.body.ssc;
    let s_lang = request.body.second_language;
    let id = request.body.id;
    let updated_by = request.body.updated_by;

    var dateTime = datevalue.currentDate();
    let org_id = request.body.org_id;
    if (
      student_id &&
      org_id &&
      f_name != "" &&
      f_name &&
      m_number &&
      id != "" &&
      id &&
      m_number != "" &&
      id &&
      h_num &&
      h_num != "" &&
      a_num &&
      updated_by &&
      updated_by != ""
    ) {
      let dobj = {
        student_id: student_id,
        org_id: org_id,
        id: id,
        hall_ticket_number: h_num,
        admission_number: a_num,
      };
      let checkid = await checkID(dobj);
      if (checkid.length < 1) {
        let checkhall = await checkHallTicketNumber(dobj);
        if (checkhall.length < 1) {
          let checkadmission = await checkAdmissionNumber(dobj);
          if (checkadmission.length < 1) {
            var value = await User.findOne({ _id: student_id });
            if (value) {
              await User.updateOne(
                { _id: ObjectID(student_id) },
                {
                  $set: {
                    student_name: f_name,
                    student_phone_number: m_number,
                    hall_ticket_number: h_num,
                    admission_number: a_num,
                    aadhaar_number: aadhaar,
                    jnanbhumi_number: j_num,
                    id: id,
                    ssc: ssc,
                    second_language: s_lang,
                    updated_by: updated_by,
                    created_date_time: dateTime,
                  },
                }
              );
              await Studentlog.create({
                student_id: student_id,
                operation_type: "U",
                operated_by: updated_by,
                created_date_time: dateTime,
              });
              response
                .status(statusCodes.success)
                .json({ message: "Student updated successfully" });
            } else {
              response
                .status(statusCodes.UserNotFound)
                .json({ message: "Student ID doesn't exist" });
            }
          } else {
            response
              .status(statusCodes.Dataexists)
              .json({ message: "Admission Number already assigned" });
          }
        } else {
          response
            .status(statusCodes.Dataexists)
            .json({ message: "Hall Ticket Number already assigned" });
        }
      } else {
        response
          .status(statusCodes.Dataexists)
          .json({ message: "Student ID already exist" });
      }
    } else {
      response
        .status(statusCodes.ProvideAllFields)
        .json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {
    response
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while updating student" });
  }
};

const relieveStudents = async (request, response) => {
  try {
    if (request.body.org_id && request.body.student_id) {
      let org_id = request.body.org_id;
      let cyearid = await getCurrentCalendarYearIDByOrgId(org_id);
      if (cyearid) {
        let stringObjectIdArray = JSON.parse(request.body.student_id);
        if (stringObjectIdArray.length > 0) {
          let objectIdArray = stringObjectIdArray.map((s) =>
            mongoose.Types.ObjectId(s)
          );
          await User.updateMany(
            { _id: { $in: objectIdArray } },
            { $set: { status: request.body.status } }
          );
          await allocstudent.updateMany(
            {
              student_id: { $in: stringObjectIdArray },
              org_id: request.body.org_id,
              calendar_years_id: cyearid,
            },
            { $set: { status: request.body.status } }
          );
          if (request.body.status == "2") {
            response
              .status(statusCodes.success)
              .json({ message: "Student relieved successfully" });
          } else {
            response
              .status(statusCodes.success)
              .json({ message: "Student unrelieved successfully" });
          }
        } else {
          response
            .status(statusCodes.InvalidData)
            .json({ message: "Please send atleast a student" });
        }
      } else {
        response
          .status(statusCodes.InvalidData)
          .json({ message: "No active calender year" });
      }
    } else {
      response
        .status(statusCodes.ProvideAllFields)
        .json({ message: "Please fill all mandatory fields" });
    }
  } catch (e) {
    response
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while reliving student" });
  }
};
// const unrelieveStudents = async (request, response) => {
//   try {
//     let stringObjectIdArray = JSON.parse(request.body.student_id);
//     let objectIdArray = stringObjectIdArray.map(s => mongoose.Types.ObjectId(s));
//     await User.updateMany(
//       { "_id": { $in: objectIdArray } ,org_id:request.body.org_id,branch_id:request.body.branch_id,academic_years_id:request.body.academic_years_id,calendar_years_id:request.body.calendar_years_id},
//       { $set: { "status": "1" } },

//     )

//     await allocstudent.updateOne({ "student_id": student_id, org_id:request.body.org_id,branch_id:request.body.branch_id,academic_years_id:request.body.academic_years_id,calendar_years_id:request.body.calendar_years_id}, { $set: { "status": "1" } });
//     response.status(statusCodes.success).json({ message: "Student unrelieved successfully" });

//   } catch (e) {
//     console.log(e)
//     response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while unreliving student" });
//   }
// }
const deletestudDetails = async (request, response) => {
  try {
    let delete_id = request.body.student_id;
    let deleted_by = request.body.deleted_by;
    var dateTime = datevalue.currentDate();
    if (delete_id && delete_id != "" && deleted_by && deleted_by != "") {
      if (mongoose.isValidObjectId(request.body.student_id)) {
        var value = await User.findOne({ _id: request.body.student_id });
        if (value) {
          await User.updateOne(
            { _id: ObjectID(request.body.student_id) },
            {
              $set: {
                deleted_by: deleted_by,
                created_date_time: dateTime,
                status: 0,
              },
            }
          );
          await Studentlog.create({
            student_id: delete_id,
            operation_type: "D",
            operated_by: deleted_by,
            created_date_time: dateTime,
          });
          response
            .status(statusCodes.success)
            .json({ message: "Student deleted successfully" });
        } else {
          response
            .status(statusCodes.UserNotFound)
            .json({ message: "Student ID doesn't exist" });
        }
      } else {
        response
          .status(statusCodes.InvalidData)
          .json({ message: "Please give valid Student ID" });
      }
    } else {
      response
        .status(statusCodes.ProvideAllFields)
        .json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {
    response
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while deleting student" });
  }
};
const editmobilenumber = async (request, response) => {
  try {
    let student_id = request.body.student_id;
    let m_number = request.body.student_phone_number;
    let updated_by = request.body.updated_by;

    var dateTime = datevalue.currentDate();
    // console.log(student_id)
    if (
      student_id &&
      student_id != "" &&
      m_number &&
      m_number != "" &&
      updated_by &&
      updated_by != ""
    ) {
      await User.updateOne(
        { _id: ObjectID(student_id) },
        {
          $set: {
            student_phone_number: m_number,
            updated_by: updated_by,
            created_date_time: dateTime,
          },
        }
      );
      response
        .status(statusCodes.success)
        .json({ message: "Student mobile number updated successfully" });
    } else {
      response
        .status(statusCodes.ProvideAllFields)
        .json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {
    response
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while deleting student" });
  }
};
const allocatebranchTostudent = async (request, response) => {
  try {
    let student_id = request.body.student_id;
    let branch_id = request.body.branch_id;
    let org_id = request.body.org_id;
    let created_by = request.body.created_by;
    let academic_years_id = request.body.academic_years_id;
    let calendar_years_id = request.body.calendar_years_id;
    let cyearid = await getCurrentCalendarYearIDByOrgId(org_id);
    // let cyearid = await getCurrentCalendarYearIDByOrgIdForBranchAssigning(
    //   org_id
    // );

    calendar_years_id = calendar_years_id || cyearid;
    let dateTime = request.currentDate;

    if (calendar_years_id) {
      if (
        mongoose.isValidObjectId(student_id) &&
        mongoose.isValidObjectId(branch_id)
      ) {
        if (
          student_id &&
          student_id != "" &&
          branch_id &&
          branch_id != "" &&
          academic_years_id &&
          org_id != "" &&
          created_by &&
          created_by != ""
        ) {
          var value = await allocate.findOne({
            student_id: student_id,
            org_id: org_id,
            status: "1",
          });
          if (!value) {
            let result = await allocate.create({
              student_id: student_id,
              branch_id: branch_id,
              status: "1",
              org_id: org_id,
              created_by: created_by,
              created_date_time: dateTime,
              academic_years_id: academic_years_id,
              calendar_years_id: calendar_years_id,
            });
            if (result) {
              let find = await User.findOne({
                _id: ObjectID(student_id),
                org_id: org_id,
                status: "1",
              });
              if (find && find.reg_type == "M") {
                await User.updateOne(
                  { _id: ObjectID(student_id) },
                  {
                    $set: { reg_type: "N", normal_created_date_time: dateTime },
                  }
                );
              }
            }
            response
              .status(statusCodes.success)
              .json({ message: "Branch allocated to student successfully" });
            //adddueamtJob({ "student_id": student_id, "org_id": org_id, "academic_years_id": academic_years_id, "calendar_years_id": calendar_years_id });
          } else {
            response
              .status(statusCodes.Dataexists)
              .json({ message: "Already student got allocated to the branch" });
          }
        } else {
          response
            .status(statusCodes.ProvideAllFields)
            .json({ message: "Please fill all mandatory fields" });
        }
      } else {
        response
          .status(statusCodes.InvalidData)
          .json({ message: "Please give valid  ID" });
      }
    } else {
      response
        .status(statusCodes.InvalidData)
        .json({ message: "No active calender year" });
    }
  } catch (error) {
    response.status(statusCodes.SomethingWentWrong).json({
      message: "Problem occurred while allocating branches to student",
    });
  }
};
const uploadallocatebranchTostudent = async (request, response) => {
  try {
    request.upload(request, response, async function (err) {
      if (err) {
        //console.log(err);
        response.status(statusCodes.SomethingWentWrong).json({ message: err });
      } else {
        let org_id = request.body.org_id;
        let created_by = request.body.created_by;
        let dateTime = request.currentDate;
        let excelfile = request.file;
        let branch_id = request.body.branch_id;
        let academic_years_id = request.body.academic_years_id;
        //let calendar_years_id = request.body.calendar_years_id;
        let cyearid = await getCurrentCalendarYearIDByOrgId(org_id);
        //calendar_years_id = calendar_years_id || cyearid;

        if (cyearid) {
          if (
            org_id &&
            org_id != "" &&
            branch_id &&
            branch_id != "" &&
            academic_years_id &&
            created_by &&
            created_by != "" &&
            excelfile
          ) {
            let fileextension = mime.getExtension(excelfile.mimetype);
            let exceltojson;
            if (fileextension == "xlsx") {
              exceltojson = xlsxtojson;
            } else {
              exceltojson = xlstojson;
            }
            exceltojson(
              {
                input: request.file.path,
                output: null, //since we don't need output.json
                lowerCaseHeaders: true,
              },
              async function (err, result) {
                if (err) {
                  response
                    .status(statusCodes.SomethingWentWrong)
                    .json({ message: err });
                } else {
                  const allocate_students = [];
                  let itemsObj = [];
                  let reqdata = {};
                  reqdata["org_id"] = org_id;
                  reqdata["created_by"] = created_by;
                  reqdata["branch_id"] = branch_id;
                  reqdata["academic_years_id"] = academic_years_id;
                  reqdata["calendar_years_id"] = cyearid;
                  reqdata["dateTime"] = dateTime;

                  for (let i = 0; i < result.length; i++) {
                    allocate_students.push(
                      await saveallocatebranchTostudent(result[i], reqdata)
                    );
                  }
                  itemsObj = await Promise.all(allocate_students);
                  response.status(statusCodes.success).json({
                    message: "Student allocated to branch successfully",
                  });
                }
              }
            );
          } else {
            response
              .status(statusCodes.ProvideAllFields)
              .json({ message: "Please fill all mandatory fields" });
          }
        } else {
          response
            .status(statusCodes.InvalidData)
            .json({ message: "No active calender year" });
        }
      }
    });
  } catch (e) {
    // console.log(e)
    response.status(statusCodes.SomethingWentWrong).json({
      message: "Problem occurred while allocating branches to student",
    });
  }
};
const saveallocatebranchTostudent = async (student, reqdata) => {
  return new Promise(async (resolve, reject) => {
    let dobj = { org_id: reqdata.org_id, id: student?.id };
    let checkid = await checkID(dobj);

    if (checkid.length > 0) {
      let student_id = checkid[0]?._id.toString();

      let branchcheck = await allocate.findOne({
        student_id: student_id,
        org_id: reqdata.org_id,
        status: "1",
      });
      if (!branchcheck) {
        let result = await allocate.create({
          student_id: student_id,
          branch_id: reqdata.branch_id,
          status: "1",
          org_id: reqdata.org_id,
          created_by: reqdata.created_by,
          created_date_time: reqdata.dateTime,
          academic_years_id: reqdata.academic_years_id,
          calendar_years_id: reqdata.calendar_years_id,
        });

        if (result) {
          let find = await User.findOne({
            _id: ObjectID(student_id),
            org_id: reqdata.org_id,
            status: "1",
          });
          if (find && find.reg_type == "M") {
            await User.updateOne(
              { _id: ObjectID(student_id) },
              { $set: { reg_type: "N", normal_created_date_time: dateTime } }
            );
          }
        }
        resolve(1);
      } else {
        resolve(0);
      }
    } else {
      resolve(0);
    }
  });
};
const promotestudent = async (request, response) => {
  try {
    let student_id = JSON.parse(request.body.student_id);
    let branch_id = request.body.branch_id;
    let org_id = request.body.org_id;
    let created_by = request.body.created_by;
    var academic_years_id = request.body.academic_years_id;
    if (
      request.body.student_id &&
      branch_id &&
      academic_years_id &&
      org_id &&
      created_by
    ) {
      var dateTime = request.currentDate;
      let branch_value = await branch.findOne({
        _id: ObjectID(branch_id),
        org_id: org_id,
      });
      let academicvalue = await ayear.findOne({
        _id: ObjectID(academic_years_id),
        org_id: org_id,
        status: "1",
      });
      let ordervalue = parseInt(academicvalue.order) + 1;
      if (ordervalue <= branch_value?.academic_years_value) {
        let academicyearid = await ayear.findOne({
          order: ordervalue,
          org_id: org_id,
          status: "1",
        });
        if (academicyearid) {
          let calendar_years_id = await cyear.findOne({
            current_active: "1",
            org_id: org_id,
            status: "1",
          });
          let calval = parseInt(calendar_years_id.calendar_year_value) + 1;
          let next_calendar_year_value = await cyear.findOne({
            calendar_year_value: calval.toString(),
            org_id: org_id,
            status: "1",
          });
          if (next_calendar_year_value) {
            if (student_id.length == 0) {
              student_id = await allocstudent.find({
                branch_id: branch_id,
                org_id: org_id,
                academic_years_id: academic_years_id,
                calendar_years_id: calendar_years_id._id.toString(),
                status: "1",
              });
            }
            if (student_id.length > 0) {
              for (let j = 0; j < student_id.length; j++) {
                let studvalue = student_id[j];
                if (typeof studvalue === "object") {
                  studvalue = studvalue.student_id;
                }
                let stdobj = {};
                stdobj.student_id = studvalue;
                stdobj.status = "1";
                let dueamt = await getstudentfinaldueamount(stdobj, true);
                await allocstudent.updateMany(
                  {
                    student_id: studvalue,
                    branch_id: branch_id,
                    org_id: org_id,
                    academic_years_id: academic_years_id,
                  },
                  { status: "0" }
                );
                await allocstudent.create({
                  student_id: studvalue,
                  branch_id: branch_id,
                  org_id: org_id,
                  academic_years_id: academicyearid._id.toString(),
                  calendar_years_id: next_calendar_year_value._id.toString(),
                  created_by: created_by,
                  created_date_time: dateTime,
                  status: "1",
                });
                await promoteStudent.create({
                  student_id: studvalue,
                  branch_id: branch_id,
                  org_id: org_id,
                  created_by: created_by,
                  created_date_time: dateTime,
                  status: "1",
                  from_academic_years_id: academic_years_id,
                  from_calendar_years_id: calendar_years_id._id.toString(),
                  to_academic_years_id: academicyearid._id.toString(),
                  to_calendar_years_id: next_calendar_year_value._id.toString(),
                });
                let obj = {
                  student_id: studvalue,
                  branch_id: branch_id,
                  org_id: org_id,
                  created_by,
                };
                if (dueamt && dueamt.total_due_amt > 0) {
                  updatestudolddue(obj, dueamt.total_due_amt, dateTime);
                }
                if (j == student_id.length - 1) {
                  response
                    .status(statusCodes.success)
                    .json({ message: "Students promoted sucessfully" });
                }
              }
            } else {
              response
                .status(statusCodes.InvalidData)
                .json({ message: "No student allocated for this branch" });
            }
          } else {
            response
              .status(statusCodes.InvalidData)
              .json({ message: "Currently there is no next calendar year" });
          }
        } else {
          response.status(statusCodes.InvalidData).json({
            message: "Currently there is no next academic year for the student",
          });
        }
      } else {
        response.status(statusCodes.InvalidData).json({
          message: "Currently there is no next academic year for this branch",
        });
      }
    } else {
      response
        .status(statusCodes.ProvideAllFields)
        .json({ message: "Please fill all mandatory fields" });
    }
  } catch (e) {
    response
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while promoting students" });
  }
};
const updatestudolddue = (rdata, dueamt, dateTime) => {
  return new Promise(async (resolve, reject) => {
    let prev_amount = 0;
    let stddue = await olddue.findOne({
      student_id: rdata.student_id,
      status: "1",
    });
    if (stddue) {
      prev_amount = stddue?.old_due_amount;
      let nowamt = (parseFloat(prev_amount) + parseFloat(dueamt)).toFixed(2);
      await olddue.updateOne(
        { student_id: ObjectID(rdata.student_id), status: "1" },
        {
          $set: {
            old_due_amount: nowamt,
            updated_by: rdata.created_by,
            org_id: rdata.org_id,
            created_date_time: dateTime,
          },
        }
      );
      await oldduelog.create({
        old_due_id: stddue._id.toString(),
        student_id: rdata.student_id,
        prev_amount: prev_amount,
        new_amount: nowamt,
        amount: dueamt,
        status: "1",
        created_by: rdata.created_by,
        org_id: rdata.org_id,
        created_date_time: dateTime,
        ayear_id: "0",
        cyear_id: "0",
        type: "U",
        transaction_id: "0",
      });
      resolve(1);
    } else {
      let olddueidvalue = await olddue.create({
        student_id: rdata.student_id,
        old_due_amount: dueamt,
        status: "1",
        created_by: rdata.created_by,
        org_id: rdata.org_id,
        created_date_time: dateTime,
      });
      await oldduelog.create({
        old_due_id: olddueidvalue._id.toString(),
        student_id: rdata.student_id,
        prev_amount: "0",
        new_amount: dueamt,
        amount: dueamt,
        status: "1",
        created_by: rdata.created_by,
        org_id: rdata.org_id,
        created_date_time: dateTime,
        ayear_id: "0",
        cyear_id: "0",
        type: "N",
        transaction_id: "0",
      });
      resolve(1);
    }
  });
};

const uploadexcel = async (request, response) => {
  try {
    request.upload(request, response, function (err) {
      if (err) {
        //console.log(err);
        response.status(statusCodes.SomethingWentWrong).json({ message: err });
      } else {
        let org_id = request.body.org_id;
        let created_by = request.body.created_by;
        let dateTime = request.currentDate;
        let excelfile = request.file;

        if (
          org_id &&
          org_id != "" &&
          created_by &&
          created_by != "" &&
          excelfile
        ) {
          let fileextension = mime.getExtension(excelfile.mimetype);
          let exceltojson;
          if (fileextension == "xlsx") {
            exceltojson = xlsxtojson;
          } else {
            exceltojson = xlstojson;
          }
          exceltojson(
            {
              input: request.file.path,
              output: null, //since we don't need output.json
              lowerCaseHeaders: true,
            },
            async function (err, result) {
              if (err) {
                response
                  .status(statusCodes.SomethingWentWrong)
                  .json({ message: err });
              } else {
                const add_olddues = [];
                let itemsObj = [];
                for (var i = 0; i < result.length; i++) {
                  add_olddues.push(
                    await saveexcel(result[i], created_by, org_id, dateTime)
                  );
                }
                itemsObj = await Promise.all(add_olddues);
                response
                  .status(statusCodes.success)
                  .json({ message: "Student's data saved successfully" });
              }
            }
          );
        } else {
          response
            .status(statusCodes.ProvideAllFields)
            .json({ message: "Please fill all mandatory fields" });
        }
      }
    });
  } catch (e) {
    // console.log(e)
    response
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while uploading student details" });
  }
};
const saveexcel = async (student, created_by, org_id, dateTime) => {
  let dobj = {
    org_id: org_id,
    id: student?.id,
    hall_ticket_number: student?.hall_ticket_number,
    admission_number: student?.admission_number,
  };
  let checkid = await checkID(dobj);
  if (checkid.length < 1) {
    let checkhall = await checkHallTicketNumber(dobj);
    if (checkhall.length < 1) {
      let checkadmission = await checkAdmissionNumber(dobj);
      if (checkadmission.length < 1) {
        await User.create({
          student_name: student.student_name,
          student_phone_number: student.student_phone_number,
          is_excel: "1",
          hall_ticket_number: student.hall_ticket_number,
          admission_number: student.admission_number,
          aadhaar_number: student.aadhaar_number,
          jnanbhumi_number: student.jnanbhumi_number,
          id: student.id,
          ssc: student.ssc,
          second_language: student.second_language,
          org_id: org_id,
          created_by: created_by,
          created_date_time: dateTime,
          normal_created_date_time: dateTime,
        });
      }
    }
  }
};
const getoldduedetails = async (student_id, org_id) => {
  return new Promise(async (resolve, reject) => {
    let studolddue = await olddue.findOne({
      student_id: student_id,
      status: "1",
    });
    let feeid = await fee.findOne({
      other_fee_id: "1",
      org_id: org_id,
      status: "1",
    });
    let subfeeid = await subfee.findOne({ fee_type_id: feeid._id.toString() });
    let transaction_amount = await transaction.aggregate([
      { $unwind: "$paiddetails" },
      {
        $match: {
          "paiddetails.student_id": student_id,
          "paiddetails.sub_fee_id": subfeeid._id.toString(),
          "paiddetails.status": "1",
          "paiddetails.org_id": org_id,
        },
      },
      {
        $project: {
          emit: {
            key: "$paiddetails.sub_fee_id",
            value: "$paiddetails.amount",
          },
        },
      },
      {
        $group: {
          // equivalent to the reduce function
          _id: "$emit.key",
          paid_amount: {
            $accumulator: {
              init: function () {
                return 0;
              },
              initArgs: [],
              accumulate: function (state, value) {
                return parseFloat(state) + parseFloat(value);
              },
              accumulateArgs: ["$emit.value"],
              merge: function (state1, state2) {
                return parseFloat(state1) + parseFloat(state2);
              },
              lang: "js",
            },
          },
        },
      },
    ]);

    let obj = {};
    obj["other_fee_id"] = feeid?.other_fee_id ?? 1;
    obj["sub_fee_id"] = subfeeid._id.toString();
    obj["sub_fee_name"] = subfeeid?.sub_fee_type ?? "";
    obj["fee_name"] = feeid?.fee_type ?? "";
    obj["due_amount"] = studolddue
      ? parseFloat(studolddue?.old_due_amount).toFixed(2)
      : 0.0;
    obj["paid_amount"] =
      transaction_amount && transaction_amount.length > 0
        ? parseFloat(transaction_amount[0]?.paid_amount).toFixed(2)
        : 0.0;
    obj["actual_amt"] = "0.00";
    resolve(obj);
  });
};
module.exports = {
  uploadallocatebranchTostudent,
  checkID,
  getbranchStudents,
  addStud,
  getStud,
  relieveStudents,
  deletestudDetails,
  updatestud,
  allocatebranchTostudent,
  promotestudent,
  editmobilenumber,
  uploadexcel,
  getoldduedetails,
};
