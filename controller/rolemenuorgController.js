
const { constant, reject } = require('async');
let User = require('../model/menu_role_org-model.js')

var expressValidator = require('express-validator');
let mongoose = require('mongoose');
const { request } = require('chai');
const { response } = require('express');
var ObjectID = require('mongodb').ObjectId;
let basemenuModel = require('../model/base_menu-model');
var datevalue = require('./dateCodes.js');
const statusCodes = require("./statusCodes");
const addrolemenuorg = async (request, response) => {
  try {
    var menu_object_id = JSON.parse(request.body.menu_object_id);
    var org_id = request.body.org_id;
    let created_by = request.body.created_by;
    var role_id = request.body.role_id;
    if (menu_object_id && menu_object_id != '' && org_id && org_id != '' && created_by && created_by != '' && role_id && role_id != '') {
      await User.updateMany(
        { 'org_id': org_id, "role_id": role_id },
        { $set: { "status": "0" } });
      const menu_details = [];
      for (var i = 0; i < menu_object_id.length; i++) {

        let menuid = menu_object_id[i];
        // console.log(menuid)
        menu_details.push(createmenuorg(menuid, org_id, created_by, role_id));
      }
      itemsObj = await Promise.all(menu_details);
      response.status(statusCodes.success).json({ message: "Organization's menu for the role added successfully" });
    } else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  }
  catch (error) {
    // console.log(error)
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while adding Organization's menu for roles" });
  }
}
const createmenuorg = async (menuid, org_id, created_by, role_id) => {

  var dateTime = datevalue.currentDate();
  await User.create({ "role_id": role_id, "org_id": org_id, "status": "1", "created_by": created_by, "created_date_time": dateTime, "menu_object_id": menuid });

}


const getrolemenuorg = async (request, response) => {
  try {
    let org_id = request.body.org_id;
    if (mongoose.isValidObjectId(org_id)) {
      let match_query = { "org_id": org_id, status: "1" };
      if (request.body.role_id != '') {
        match_query['role_id'] = request.body.role_id;
      }
      if (request.body.role_id == '') {
      }
      let userdetail = await User.aggregate([
        {
          $match: match_query
        },
        {
          "$lookup": {
            "from": "roles",
            "let": { "salId": { "$toObjectId": "$role_id" } },
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
            "as": "role_details"
          },

        },
        {
          "$lookup": {
            "from": "base_menus",
            "let": { "userId": { "$toObjectId": "$menu_object_id" } },
            pipeline: [{
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        '$_id', '$$userId',
                      ],
                    },
                    {
                      $eq: ["$status", "1"],
                    },
                  ],
                },
              }
            }],
            "as": "menu_details"
          },
        },
        {
          "$lookup": {
            "from": "org_details",
            "let": { "salId": { "$toObjectId": "$org_id" } },
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
            "as": "org_details"
          },
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
            org_name: "$org_details.org_name",
            menu_name: "$menu_details.menu_name",
            menu_type: "$menu_details.menu_type",
            created_by_name: "$createdbyname.admin_name"
          }
        },
        { $unset: ["org_details", "menu_details", "createdbyname"] },
      ]).sort({ _id: -1 })
      response.status(statusCodes.success).json(userdetail);
    }
    else {
      response.status(409).json({ message: "Please Give valid Organization ID" });
    }
  } catch (error) {
    response.status(404).json({ message: "Problem occurred while getting Organization's menu" })
  }
}
const deleterolemenuorg = async (request, response) => {
  try {
    let delete_id = request.body.role_org_menu_id;
    let deleted_by = request.body.deleted_by;
    var dateTime = datevalue.currentDate();
    if (delete_id && delete_id != '' && deleted_by && deleted_by != '') {
      if (mongoose.isValidObjectId(delete_id)) {
        var value = await User.findOne({ _id: delete_id })
        if (value) {
          await User.updateOne({ '_id': ObjectID(delete_id) }, { $set: { "status": "0", "deleted_by": deleted_by, "created_date_time": dateTime } });
          response.status(statusCodes.success).json({ message: "Organization's menu for this role deleted successfully" });
        }
        else {
          response.status(statusCodes.UserNotFound).json({ message: "Organization's menu doesn't exist" });
        }
      }
      else {
        response.status(statusCodes.InvalidData).json({ message: "Please give valid Organization's menu" });
      }
    }
    else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while deleting Organization's menu" });
  }
}

const dashboardbutton = async (request, response) => {
  try {
    if (request.body.org_id && request.body.org_id != '' && request.body.role_id && request.body.role_id != '') {
      let value = 0;
      let value1 = 0;
      let value2 = 0;
      let value3 = 0;
      var org_id = request.body.org_id;

      var role_id = request.body.role_id;
      let basemenuvalue = await basemenuModel.findOne({ menu_name: { "$regex": `^${'payments'}$`, "$options": "i" }, "org_id": org_id, "status": "1" })
      let basemenuvalue1 = await basemenuModel.findOne({ menu_name: { "$regex": `^${'edit bills'}$`, "$options": "i" }, "org_id": org_id, "status": "1" })
      let basemenuvalue2 = await basemenuModel.findOne({ menu_name: { "$regex": `^${'generate manual bills'}$`, "$options": "i" }, "org_id": org_id, "status": "1" })
      let basemenuvalue3 = await basemenuModel.findOne({ menu_name: { "$regex": `^${'edit manual bills'}$`, "$options": "i" }, "org_id": org_id, "status": "1" })
      if (basemenuvalue) {
        var menu_object_id = basemenuvalue._id.toString();
        let dashboardvalue = await User.findOne({ "role_id": role_id, "org_id": org_id, "status": "1", menu_object_id: menu_object_id })
        if (dashboardvalue) {
          value = 1;
        }
        else {
          value = 0;
        }
      }
      if (basemenuvalue1) {
        var menu_object_id1 = basemenuvalue1._id.toString();
        let dashboardvalue1 = await User.findOne({ "role_id": role_id, "org_id": org_id, "status": "1", menu_object_id: menu_object_id1 })
        if (dashboardvalue1) {
          value1 = 1;
        }
        else {
          value1 = 0;
        }
      }
      if (basemenuvalue2) {
        var menu_object_id2 = basemenuvalue2._id.toString();
        let dashboardvalue2 = await User.findOne({ "role_id": role_id, "org_id": org_id, "status": "1", menu_object_id: menu_object_id2 })
        if (dashboardvalue2) {
          value2 = 1;
        }
        else {
          value2 = 0;
        }
      } if (basemenuvalue3) {
        var menu_object_id3 = basemenuvalue3._id.toString();
        let dashboardvalue3 = await User.findOne({ "role_id": role_id, "org_id": org_id, "status": "1", menu_object_id: menu_object_id3 })
        if (dashboardvalue3) {
          value3 = 1;
        }
        else {
          value3 = 0;
        }
      }
      response.status(statusCodes.success).json({ valuename: value, valuename1: value1, valuename2: value2, valuename3: value3 });
    }

    else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {
    // console.log(error)
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while deleting Organization's menu" });
  }
}
module.exports = { dashboardbutton, addrolemenuorg, getrolemenuorg, deleterolemenuorg };