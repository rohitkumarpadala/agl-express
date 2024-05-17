const { constant, reject } = require('async');
let User = require('../model/academic_years-model.js')

var expressValidator = require('express-validator');
let mongoose = require('mongoose');
const { request } = require('chai');
const { response } = require('express');
var ObjectID = require('mongodb').ObjectId;
var datevalue=require('./dateCodes.js')
const statusCodes = require("./statusCodes");
const addacademicyear = async (request, response) => {
  try {

    var academic_year = request.body.academic_year;
    var academic_year_value = request.body.academic_year_value;
    var order = request.body.order;
    var org_id = request.body.org_id;
    let created_by = request.body.created_by;
    var dateTime =datevalue.currentDate();
    var value = await User.findOne({ "academic_year_value": { "$regex": `^${academic_year_value}$`, "$options": "i" },"org_id":org_id,"status":1 })
    if (!value) {
    if (academic_year && academic_year != '' && academic_year_value && academic_year_value != '' && org_id && org_id != '' && created_by && created_by != '' && order && order != '' ) {

      await User.create({ "academic_year": academic_year, "academic_year_value": academic_year_value, "created_by": created_by, "status": "1", "created_date_time": dateTime, "org_id": org_id,"order":order })

      response.status(statusCodes.success).json({ message: "Academic Year added successfully" });

    }else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    } }else {
      response.status(409).json({ message: "Academic year for this organization already exist" });
    }
  }
  catch (error) {
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while adding Academic Year" });
  }
}

const updateacademicyear = async (request, response) => {
  try {
    let academic_year_id = request.body.academic_year_id;
    var academic_year = request.body.academic_year;
    var academic_year_value = request.body.academic_year_value;
    var order = request.body.order;
    let updated_by = request.body.updated_by;
    var org_id = request.body.org_id;
    var dateTime =datevalue.currentDate();
    let checkbasename=await User.find(
      {
          _id: { $nin: ObjectID(academic_year_id) },
          "academic_year_value": { "$regex": `^${academic_year_value}$`, "$options": "i" },"status":1,"org_id":org_id},
      );
      if(checkbasename.length===0){
    if (academic_year && academic_year != '' && academic_year_value && academic_year_value != '' && academic_year_id && academic_year_id != '' && order && order != '') {
      if (mongoose.isValidObjectId(academic_year_id)) {
        var value = await User.findOne({ _id: ObjectID(academic_year_id) })
        if (value) {
          await User.updateOne({ '_id': ObjectID(academic_year_id) }, { $set: { "academic_year": academic_year, "academic_year_value": academic_year_value, "updated_by": updated_by, "created_date_time": dateTime ,"order":order} });
          response.status(statusCodes.success).json({ message: "Academic Year updated successfully" });
        }
        else {
          response.status(409).json({ message: "Academic Year  doesn't exist" });
        }
      }
      else {
        response.status(409).json({ message: "Please give valid Academic Year" });
      }
    }
    else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }}
    else{
      response.status(606).json({ message: "Academic year for this organization already exist" });
    }
  } catch (error) {
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while updating Academic Year" });
  }
}

const getacademicyear = async (request, response) => {
  try {
    let org_id = request.body.org_id;
    let academic_year = request.body.academic_years_value;
    if (mongoose.isValidObjectId(org_id)) {
        let match = {"org_id":org_id,"status":"1"};
        if(academic_year){
          match['academic_year_value'] = {$lte: academic_year}
        }
      const users = await User.aggregate([
        {
          $match: match
        },{
          "$lookup": {
              "from": "securities",
              "let": { "salId": { "$toObjectId": "$created_by" } },
              "pipeline": [
                  { "$match": { "$expr":{ $and: [
                      {
                        $eq: [
                          '$_id', '$$salId',
                        ],
                      },
                      {
                        $eq: ["$status", "1"],
                      },
                    ], }} }
              ],
              "as": "createdbyname"
          }
        }
          , { $unwind: "$createdbyname" },
        {
          $set: {

            created_by_name: "$createdbyname.admin_name"
          },

        }
      ]).sort({ _id: -1 });
      response.status(statusCodes.success).json(users);
    }
    else {
      response.status(statusCodes.UserNotFound).json({ message: "Please Give valid Organization ID" });
    }
  } catch (error) {
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while getting Academic Year" })
  }
}
const deleteacademicyear = async (request, response) => {
  try {
    let delete_id = request.body.academic_year_id;
    let deleted_by = request.body.deleted_by;
    var dateTime =datevalue.currentDate();
    if (delete_id && delete_id != '' && deleted_by && deleted_by != '') {
      if (mongoose.isValidObjectId(delete_id)) {
        var value = await User.findOne({ _id: delete_id })
        if (value) {
          await User.updateOne({ '_id': ObjectID(delete_id) }, { $set: { "status": "0", "deleted_by": deleted_by, "created_date_time": dateTime } });
          response.status(statusCodes.success).json({ message: "Academic Year deleted successfully" });
        }
        else {
          response.status(409).json({ message: "Academic Year doesn't exist" });
        }
      }
      else {
        response.status(409).json({ message: "Please give valid Academic Year" });
      }
    }
    else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while deleting Academic Year" });
  }
}


module.exports = { addacademicyear, updateacademicyear, getacademicyear, deleteacademicyear };