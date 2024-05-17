const { constant, reject } = require('async');
let User = require('../model/role-model.js')

var expressValidator = require('express-validator');
let mongoose = require('mongoose');
const { request } = require('chai');
const { response } = require('express');
var ObjectID = require('mongodb').ObjectId;
var menu = require('../model/base_menu-model');
var datevalue=require('./dateCodes.js');
const statusCodes = require("./statusCodes");
const addRole = async (request, response) => {
  try {
    var role_name = request.body.role_name;
    var created_by = request.body.created_by;
    var org_id = request.body.org_id;

    var dateTime =datevalue.currentDate();
    if (role_name && role_name != '' && created_by && created_by != '' && org_id && org_id != '') {
      var value = await User.findOne({ "role_name":{ "$regex": `^${role_name}$`, "$options": "i" }, "org_id": org_id , "status": "1"})
      if (!value) {
         await User.create({ "role_name": role_name, "created_by": created_by, "status": "1", "org_id": org_id, "created_date_time": dateTime })

        response.status(statusCodes.success).json({ message: "Role created successfully" });
      } else {
        response.status(statusCodes.Dataexists).json({ message: "Role name already exist" });
      }
    } else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  }
  catch (error) {
    console.log(error)
    response.status(409).json({ message: "Problem occurred while adding Role" });
  }
}

const updateRole = async (request, response) => {
  try {
    var role_id = request.body.role_id;
    var role_name = request.body.role_name;
    var org_id = request.body.org_id;

    let updated_by = request.body.updated_by;
    var dateTime =datevalue.currentDate();
    let checkrolename=await User.find(
      {
     
          _id: { $nin: ObjectID(role_id) },
          "role_name":{ "$regex": `^${role_name}$`, "$options": "i" },"org_id": org_id , "status": "1" },
        
      );
      console.log(checkrolename.length)
    if (role_id && role_id != '' && role_name && role_name != '' && updated_by && updated_by != '') {
      if(checkrolename.length===0){
      if (mongoose.isValidObjectId(role_id)) {
        var value = await User.findOne({ _id: ObjectID(role_id) })
        if (value) {
          await User.updateOne({ '_id': ObjectID(role_id) }, { $set: { "role_name": role_name, "created_date_time": dateTime,  "updated_by": updated_by, "created_date_time": dateTime } });
   
          response.status(statusCodes.success).json({ message: "Role updated successfully" });
        }
        else {
          response.status(statusCodes.UserNotFound).json({ message: "Role ID doesn't exist" });
        }
      }
      else {
        response.status(statusCodes.InvalidData).json({ message: "Please give valid Role ID" });
      }
    }
  else{
    response.status(statusCodes.Dataexists).json({ message: "Role name already exist" });
  }
}
    else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });

    }
  } catch (error) {
    console.log(error)
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while updating Role" });
  }
}

const getRole = async (request, response) => {
  try {
    let org_id = request.body.org_id;
    if (mongoose.isValidObjectId(org_id)) {
      const users = await User.aggregate([
        {
          $match: {
            "org_id":org_id,"status":"1"
          }
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
          },
          
              },{$unset: "createdbyname.admin_password"},]).sort({ _id: -1 });
      response.status(statusCodes.success).json(users);
    }
    else {
      response.status(409).json({ message: "Please Give valid Organization ID" });
    }
  } catch (error) {
    response.status(404).json({ message: error.message })
  }
}
const deleteRole = async (request, response) => {
  try {
    let delete_id = request.body.role_id;
    let deleted_by = request.body.deleted_by;
    var dateTime =datevalue.currentDate();
    if (delete_id && delete_id != '' && deleted_by && deleted_by != '') {
      if (mongoose.isValidObjectId(delete_id)) {
        var value = await User.findOne({ _id: delete_id })
        if (value) {
          await User.updateOne({ '_id': ObjectID(delete_id) }, { $set: { "status": "0", "deleted_by": deleted_by, "created_date_time": dateTime } });
          response.status(statusCodes.success).json({ message: "Role deleted successfully" });
        }
        else {
          response.status(statusCodes.UserNotFound).json({ message: "Role ID doesn't exist" });
        }
      }
      else {
        response.status(statusCodes.InvalidData).json({ message: "Please give valid Role ID" });
      }
    }
    else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while deleting Role" });
  }
}
const getRolebystatus = async (request, response) => {
  try {
    const users = await User.find({ "status": "1" }).sort({ _id: -1 });
    response.status(statusCodes.success).json(users);
  } catch (error) {
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while getting Role" })
  }
}

module.exports = { addRole, getRole, deleteRole, updateRole, getRolebystatus };