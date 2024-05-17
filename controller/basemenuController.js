const { constant, reject } = require('async');
let User = require('../model/base_menu-model.js')

var expressValidator = require('express-validator');
let mongoose = require('mongoose');
const { request } = require('chai');
const { response } = require('express');
var ObjectID = require('mongodb').ObjectId;
var datevalue = require('./dateCodes.js')
const statusCodes = require("./statusCodes");
const addbasemenu = async (request, response) => {
  try {

    var menu_name = request.body.menu_name;
    var menu_type = request.body.menu_type;
    var menu_order = request.body.menu_order;
    var menu_web_url = request.body.menu_web_url;
    var parent_id = request.body.parent_id;
    var web_class_name = request.body.web_class_name;
    var web_icon = request.body.web_icon;
    let created_by = request.body.created_by;
    var dateTime = datevalue.currentDate();
    if (menu_name && menu_name != '' && menu_type && menu_type != '' && menu_order && menu_order != '' && created_by && created_by != '') {
      var value = await User.findOne({ "menu_name": { "$regex": `^${menu_name}$`, "$options": "i" }, "status": 1 })
      if (!value) {
        await User.create({ "menu_name": menu_name, "menu_type": menu_type, "menu_order": menu_order, "menu_web_url": menu_web_url, "parent_id": parent_id, "web_class_name": web_class_name, "web_icon": web_icon, "created_by": created_by, "status": "1", "created_date_time": dateTime })

        response.status(statusCodes.success).json({ message: "Basemenu added successfully" });
      } else {
        response.status(606).json({ message: "Basemenu name already exist" });
      }
    } else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  }
  catch (error) {
    console.log(error)
    response.status(409).json(error);
  }
}

const updatebasemenu = async (request, response) => {
  try {
    let menu_object_id = request.body.menu_object_id;
    var menu_type = request.body.menu_type;
    var menu_name = request.body.menu_name;
    var menu_order = request.body.menu_order;
    var menu_web_url = request.body.menu_web_url;
    var parent_id = request.body.parent_id;
    var web_class_name = request.body.web_class_name;
    var web_icon = request.body.web_icon;
    let updated_by = request.body.updated_by;
    var dateTime = datevalue.currentDate();
    let checkbasename = await User.find(
      {
        _id: { $nin: ObjectID(menu_object_id) },
        "menu_name": { "$regex": `^${menu_name}$`, "$options": "i" }, "status": 1
      },
    );
    if (menu_type && menu_type != '' && menu_object_id && menu_object_id != '' && menu_name && menu_name != '' && menu_order && menu_order != '' && updated_by && updated_by != '') {
      if (checkbasename.length === 0) {
        if (mongoose.isValidObjectId(menu_object_id)) {
          var value = await User.findOne({ _id: ObjectID(menu_object_id) })
          if (value) {
            await User.updateOne({ '_id': ObjectID(menu_object_id) }, { $set: { "menu_name": menu_name, "menu_type": menu_type, "menu_order": menu_order, "menu_web_url": menu_web_url, "parent_id": parent_id, "web_class_name": web_class_name, "web_icon": web_icon, "updated_by": updated_by, "created_date_time": dateTime } });
            response.status(statusCodes.success).json({ message: "Basemenu updated successfully" });
          }
          else {
            response.status(statusCodes.InvalidData).json({ message: "Basemenu doesn't exist" });
          }
        }
        else {
          response.status(statusCodes.InvalidData).json({ message: "Please give valid Basemenu" });
        }
      }
      else {
        response.status(statusCodes.Dataexists).json({ message: "Basemenu name already exist" });
      }
    }
    else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {
    console.log(error)
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while updating Basemenu" });
  }
}

const getbasemenu = async (request, response) => {
  try {

    const users = await User.aggregate([
      {
        $match: {
          "status": "1"
        }
      },
      {
        "$lookup": {
          "from": "securities",
          "let": { "salId": { "$toObjectId": "$created_by" } },
          "pipeline": [
            {
              "$match": {
                "$expr": {
                  $and: [
                    { $eq: ['$_id', '$$salId']},
                    { $eq: ["$status", "1"]},
                  ],
                }
              }
            }
          ],
          "as": "createdbyname"
        },

      }, { $unset: "createdbyname.admin_password" }, { $unwind: {"path":"$createdbyname", "preserveNullAndEmptyArrays": true} },
      {
        "$lookup": {
          "from": "base_menus",
          "let": { "salId": { "$toObjectId": "$parent_id" } },
          "pipeline": [
            {
              "$match": {
                "$expr": {
                  $and: [
                    {$eq: ['$_id', '$$salId']},
                    {$eq: ["$status", "1"]},
                  ],
                }
              }
            }
          ],
          "as": "parent"
        },
      },
      { "$unwind": { "path": "$parent", "preserveNullAndEmptyArrays": true } },
      {
        $set: {
          parent_name:{ $ifNull: [ "$parent.menu_name", '' ] },
          created_by_name: { $ifNull: [ "$createdbyname.admin_name", '' ] },
        }
      },
      { $unset: ["createdbyname", "parent"] },
    ]).sort({ _id: -1 });
    response.status(statusCodes.success).json(users);
  } catch (error) {
    response.status(404).json({ message: "Problem occurred while getting Basemenu" })
  }
}
const deletebasemenu = async (request, response) => {
  try {
    let delete_id = request.body.menu_object_id;
    let deleted_by = request.body.deleted_by;
    var dateTime = datevalue.currentDate();
    if (delete_id && delete_id != '' && deleted_by && deleted_by != '') {
      if (mongoose.isValidObjectId(delete_id)) {
        var value = await User.findOne({ _id: delete_id })
        if (value) {
          await User.updateOne({ '_id': ObjectID(delete_id) }, { $set: { "status": "0", "deleted_by": deleted_by, "created_date_time": dateTime } });
          response.status(statusCodes.success).json({ message: "Basemenu deleted successfully" });
        }
        else {
          response.status(409).json({ message: "Basemenu ID doesn't exist" });
        }
      }
      else {
        response.status(409).json({ message: "Please give valid Basemenu ID" });
      }
    }
    else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while deleting Basemenu" });
  }
}


module.exports = { addbasemenu, getbasemenu, deletebasemenu, updatebasemenu };