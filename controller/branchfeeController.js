const { constant, reject } = require('async');
let User = require('../model/branchfee_details-model.js')
var expressValidator = require('express-validator');
let mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectId;
var subfee = require('../model/sub_fee_details-model');
var feedetail = require('../model/fee_details-model');
const { addbranchamtJob } = require('./background_jobs');
var datevalue=require('./dateCodes.js')
const statusCodes = require("./statusCodes");
const {getCurrentCalendarYearIDByOrgId} = require('./commonfunction.js');


const addBranchFee = async (request, response) => {
 
  let branches = request.body.branch_id;
  let amount = request.body.amount;
  let sub_fee_id = request.body.sub_fee_id;
  let org_id = request.body.org_id;
  let created_by = request.body.created_by;
  let academic_years_id = request.body.academic_years_id;
  let cyearid = await getCurrentCalendarYearIDByOrgId(org_id);

  let calendar_years_id = request.body.calendar_years_id || cyearid;

  var dateTime =datevalue.currentDate();
  if(calendar_years_id){
    if ( branches && branches != '' && academic_years_id && amount && amount != '' && sub_fee_id && sub_fee_id != '' && org_id && org_id != '' ) {
      var value = await User.findOne({ "branch_id": branches,  "sub_fee_id": sub_fee_id, "status": '1', "org_id": org_id,"calendar_years_id":calendar_years_id,"academic_years_id":academic_years_id})
        if (!value) {
      await User.create({ "branch_id": branches,  "sub_fee_id": sub_fee_id, "amount": amount, "status": '1', "org_id": org_id, "created_by": created_by, "created_date_time": dateTime,"calendar_years_id":calendar_years_id,"academic_years_id":academic_years_id})
      addbranchamtJob(branches)
      response.status(statusCodes.success).json({ message: "Branch fees created successfully" });
    } else {
      response.status(statusCodes.Dataexists).json({ message: "Amount already exist" });
    }
    } else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  }else{
    response.status(statusCodes.InvalidData).json({ message: "No active calender year" });
  }
}
const updateBranchFee = async (request, response) => {
  let branch_fee_id = request.body.branch_fee_id;
  let branches = request.body.branch_id;
  let amount = request.body.amount;
  let sub_fee_id = request.body.sub_fee_id;
  let updated_by = request.body.updated_by;
  let academic_years_id = request.body.academic_years_id;
  let calendar_years_id = request.body.calendar_years_id;
  let org_id = request.body.org_id;
  var dateTime =datevalue.currentDate();
  let checkbranchfeeamt=await User.find(
    {
   
        _id: { $nin: ObjectID(branch_fee_id) },
         "branch_id": branches,  "sub_fee_id": sub_fee_id,"calendar_years_id":calendar_years_id,"academic_years_id":academic_years_id,"org_id":org_id,"status":"1" },
      
    );
  if ( branches && branches != '' && academic_years_id && calendar_years_id && amount && amount != '' && sub_fee_id && sub_fee_id != '' && branch_fee_id && branch_fee_id != '' && updated_by && updated_by != '' ) {
    if(checkbranchfeeamt.length===0){
    if (mongoose.isValidObjectId(branch_fee_id)) {
      var value = await User.findOne({ _id: branch_fee_id })
      if (value) {
        await User.updateOne(
          { '_id': ObjectID(branch_fee_id) },
          { $set: { "branch_id": branches, "amount": amount, "sub_fee_id": sub_fee_id, "updated_by": updated_by, "created_date_time": dateTime,"calendar_years_id":calendar_years_id,"academic_years_id":academic_years_id} });
        addbranchamtJob(branches)
        response.status(statusCodes.success).json({ message: "Branch Fees updated successfully" });
      }
      else {
        response.status(statusCodes.UserNotFound).json({ message: "Branch ID doesn't exist" });
      }
    }
    else {
      response.status(statusCodes.InvalidData).json({ message: "Please give valid Branch ID" });
    }
  }
    else {
      response.status(statusCodes.Dataexists).json({ message: "Branch Fee already exist" });
    }
  } else {
    response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
  }

}
const getBranchFee = async (request, response) => {
  try {
    const org_id=request.body.org_id;
    const branch_id = request.body.branch_id;
    const academic_years_id = request.body.academic_years_id;
    let cyearid = await getCurrentCalendarYearIDByOrgId(org_id);
    // calendar_years_id = cyearid ?? calendar_years_id;
    let calendar_years_id = request.body.calendar_years_id || cyearid;

    if(mongoose.isValidObjectId(org_id)){

      let match = { org_id:org_id, status:'1'};
      if(branch_id && academic_years_id && calendar_years_id){
        match['branch_id'] = branch_id;
        match['academic_years_id'] = academic_years_id;
        match['calendar_years_id'] = calendar_years_id;
      }
      // console.log(match)
    let userdetail = await User.aggregate([
      {
        $match: match
      },
       {
        "$lookup": {
          "from": "sub_fee_details",
          "let": { "userId": { "$toObjectId": "$sub_fee_id" } },
          pipeline: [{
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$_id', '$$userId'] },
                  { $eq: ["$status", "1"] },
                   { $eq: ["$access_status","1"] },
                ],
              },
            }
          }, {
            "$lookup": {
              "from": "fee_details",
              "let": { "fee_type_id": { "$toObjectId": "$fee_type_id" } },
              pipeline: [{
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$fee_type_id'] },
                      { $eq: ["$status","1"] },
                      { $eq: ["$access_status","1"] },
                    ],
                  },
                }
              }],
              "as": "fee_details"
            }
          },
          { $unwind: "$fee_details" },
          { $set: {fee_type: "$fee_details.fee_type"}},
          { $unset: ["fee_details"] },
        ],
          "as": "sub_fee_details"
        }
      },
      { $unwind: "$sub_fee_details" },
       {
        "$lookup": {
          "from": "branch_details",
          "let": { "branch_id": { "$toObjectId": "$branch_id" } },
          "pipeline": [
            {
              "$match": {
                "$expr": {
                  $and: [
                    { $eq: ['$_id', '$$branch_id'] },
                    { $eq: ["$status", "1"] },
                  ]
                }
              }
            }
          ],
          "as": "branch_details"
        }
      },
      { $unwind: "$branch_details" },
      {
        "$lookup": {
          "from": "calendar_years",
          "let": { "calendar_years_id": { "$toObjectId": "$calendar_years_id" } },
          "pipeline": [
            { "$match": { "$expr":{ $and: [
                    { $eq: ['$_id', '$$calendar_years_id']},
                    { $eq: ["$status", "1"] },
                  ],
                }
              }
            }
          ],
        "as": "calendarname"
        }
      },
      { $unwind: "$calendarname" },
      {
        "$lookup": {
          "from": "academic_years",
          "let": { "academic_years_id": { "$toObjectId": "$academic_years_id" } },
          "pipeline": [
            { "$match": { "$expr":{ $and: [
                    { $eq: ['$_id', '$$academic_years_id']},
                    { $eq: ["$status", "1"] },
                  ],
                }
              }
            }
          ],
          "as": "academicname"
        }
      },
      { $unwind: "$academicname" },
      {
        "$lookup": {
          "from": "securities",
          "let": { "salId": { "$toObjectId": "$created_by" } },
          "pipeline": [
            { "$match": { "$expr":{ $and: [
                    { $eq: ['$_id', '$$salId']},
                    { $eq: ["$status", "1"] },
                  ],
                }
              }
            }
          ],
          "as": "createdbyname"
        },
      },
      { $unwind: "$createdbyname" },
      {
        $set: {
          branch_name:"$branch_details.branch_name",
          sub_fee_type: "$sub_fee_details.sub_fee_type",
          fee_type: "$sub_fee_details.fee_type",
          fee_type_id: "$sub_fee_details.fee_type_id",
          academic_year: "$academicname.academic_year",
          calendar_year:"$calendarname.calendar_year",
          calendar_year_value:"$calendarname.calendar_year_value",
          created_by_name: "$createdbyname.admin_name"
        }
      },
      { $unset: ["sub_fee_details","branch_details","calendarname","academicname", "createdbyname"] },

    ]).sort({ _id: -1 })
    response.status(statusCodes.success).json(userdetail);
  }else {
    response.status(statusCodes.InvalidData).json({ message: "Please Give valid Organization ID" });
  }
  }catch(error){
    // console.log(error)
    response.status(statusCodes.InvalidData).json({ message: "Problem occurred while getting BranchFee" })
  }
}
const deleteBranchFee = async (request, response) => {
  try {
    let delete_id = request.body.branch_fee_id;
    let deleted_by = request.body.deleted_by;
    var dateTime =datevalue.currentDate();
    if (delete_id && delete_id != '') {
      if (mongoose.isValidObjectId(delete_id)) {
        var value = await User.findOne({ _id: delete_id })
        if (value) {
          await User.updateOne(
            { '_id': ObjectID(delete_id) },
            { $set: { "status": "0", "deleted_by": deleted_by, "created_date_time": dateTime } });
          response.status(statusCodes.success).json({ message: "BranchFee deleted successfully" });
        }
        else {
          response.status(statusCodes.UserNotFound).json({ message: "BranchFee doesn't exist" });
        }
      }
      else {
        response.status(statusCodes.InvalidData).json({ message: "Please give valid BranchFee" });
      }
    } else {
      await User.updateMany(
        {},
        { $set: { "status": 0 } });
      response.status(statusCodes.success).json({ message: "BranchFee deleted successfully" });
    }
  } catch (error) {
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while deleting BranchFee" });
  }

}
module.exports = { addBranchFee, updateBranchFee, getBranchFee, deleteBranchFee };