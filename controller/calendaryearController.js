const { constant, reject } = require('async');
let User = require('../model/calendar_years-model')

var expressValidator = require('express-validator');
let mongoose = require('mongoose');
const { request } = require('chai');
const { response } = require('express');
var ObjectID = require('mongodb').ObjectId;

var datevalue = require('./dateCodes.js');
const statusCodes = require("./statusCodes");
const addcalendaryear = async (request, response) => {
  try {
    var calendar_year = request.body.calendar_year;
    var calendar_year_value = request.body.calendar_year_value;
    var org_id = request.body.org_id;
    let created_by = request.body.created_by;
    let current_active = request.body.current_active;
    var dateTime = datevalue.currentDate();
    var value = await User.findOne({ "calendar_year_value": calendar_year_value, "org_id": org_id, "status": 1 })
    if (!value) {

      if (calendar_year && calendar_year != '' && calendar_year_value && calendar_year_value != '' && org_id && org_id != '' && created_by && created_by != '') {
        let active = await User.create({ "calendar_year": calendar_year, "calendar_year_value": calendar_year_value, "created_by": created_by, "status": "1", "created_date_time": dateTime, "org_id": org_id, "current_active": current_active })
        if (current_active == '1') {
          await User.updateMany(
            {
              _id: { $nin: ObjectID(active._id) }, org_id: org_id
            },
            { "current_active": "0" },
          );
        }
        response.status(statusCodes.success).json({ message: "Calendar Year added successfully" });
        // }else{
        //   await User.create({ "calendar_year": calendar_year, "calendar_year_value": calendar_year_value, "created_by": created_by, "status": "1", "created_date_time": dateTime, "org_id": org_id,"current_active":"0" })

        //    response.status(statusCodes.success).json({ message: "Calendar Year added successfully" }); 
        // }
      } else {
        response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
      }
    } else {
      response.status(statusCodes.Dataexists).json({ message: "calendar year for this organization already exist" });
    }
  }
  catch (error) {

    response.status(409).json({ message: "Problem occurred while adding Calendar Year" });
  }
}

const updatecalendaryear = async (request, response) => {
  try {
    let calendar_year_id = request.body.calendar_year_id;
    var calendar_year = request.body.calendar_year;
    var calendar_year_value = request.body.calendar_year_value;
    var org_id = request.body.org_id;
    let updated_by = request.body.updated_by;
    var dateTime = datevalue.currentDate();
    let current_active = request.body.current_active;
    let checkbasename = await User.find(
      {
        _id: { $nin: ObjectID(calendar_year_id) },
        "calendar_year_value": calendar_year_value, "status": 1, "org_id": org_id
      },
    );

    if (calendar_year && calendar_year != '' && calendar_year_value && calendar_year_value != '' && calendar_year_id && calendar_year_id != '') {
      if (checkbasename.length === 0) {
        if (mongoose.isValidObjectId(calendar_year_id)) {
          var value = await User.findOne({ _id: ObjectID(calendar_year_id) })
          if (value) {
            if (current_active == '1') {
              await User.updateMany(
                {
                  _id: { $nin: ObjectID(calendar_year_id) }, org_id: org_id
                },
                { "current_active": "0" },
              );
            }
            await User.updateOne({ '_id': ObjectID(calendar_year_id) }, { $set: { "calendar_year": calendar_year, "calendar_year_value": calendar_year_value, "updated_by": updated_by, "created_date_time": dateTime, "current_active": current_active } });
            response.status(statusCodes.success).json({ message: "Calendar Year updated successfully" });

            // }else{
            //   await User.updateOne({ '_id': ObjectID(calendar_year_id) }, { $set: { "calendar_year": calendar_year, "calendar_year_value": calendar_year_value, "updated_by": updated_by,  "created_date_time": dateTime,"current_active":"0"} });
            //   response.status(statusCodes.success).json({ message: "Calendar Year updated successfully" });
            // }
          }
          else {
            response.status(statusCodes.UserNotFound).json({ message: "Calendar Year doesn't exist" });
          }
        }
        else {
          response.status(statusCodes.InvalidData).json({ message: "Please give valid Calendar Year" });
        }
      }
      else {
        response.status(statusCodes.Dataexists).json({ message: "calendar year for this organization already exist" });
      }
    }
    else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {

    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while updating Calendar Year" });
  }
}

const getcalendaryear = async (request, response) => {
  try {
    let org_id = request.body.org_id;
    if (mongoose.isValidObjectId(org_id)) {
      const users = await User.aggregate([
        {
          $match: {
            "org_id": org_id,
          }
        }, {
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

        }]).sort({ calendar_year_value: -1 });
      response.status(statusCodes.success).json(users);
    }
    else {
      response.status(409).json({ message: "Please Give valid Organization ID" });
    }
  } catch (error) {
    response.status(404).json({ message: error.message })
  }
}
const deletecalendaryear = async (request, response) => {
  try {
    let delete_id = request.body.calendar_year_id;
    let deleted_by = request.body.deleted_by;
    var dateTime = datevalue.currentDate();
    if (delete_id && delete_id != '' && deleted_by && deleted_by != '') {
      if (mongoose.isValidObjectId(delete_id)) {
        var value = await User.findOne({ _id: delete_id })
        if (value) {
          await User.updateOne({ '_id': ObjectID(delete_id) }, { $set: { "status": "0", "deleted_by": deleted_by, "created_date_time": dateTime } });
          response.status(statusCodes.success).json({ message: "Calendar Year deleted successfully" });
        }
        else {
          response.status(statusCodes.UserNotFound).json({ message: "Calendar Year doesn't exist" });
        }
      }
      else {
        response.status(statusCodes.Dataexists).json({ message: "Please give valid Calendar Year " });
      }
    }
    else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while deleting Calendar Year" });
  }
}


module.exports = { addcalendaryear, updatecalendaryear, getcalendaryear, deletecalendaryear };