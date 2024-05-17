
const { constant, reject } = require('async');
let User = require('../model/org_menu-model.js')

var expressValidator = require('express-validator');
let mongoose = require('mongoose');
const { request } = require('chai');
const { response } = require('express');
var ObjectID = require('mongodb').ObjectId;

var datevalue=require('./dateCodes.js');
const statusCodes = require("./statusCodes");
const addmenuorg = async (request, response) => {
  try {
    var menu_object_id =JSON.parse(request.body.menu_object_id);
    var org_id = request.body.org_id;
    let created_by = request.body.created_by;
    
    if (menu_object_id && menu_object_id != '' && org_id && org_id != '' && created_by && created_by != '') {
      await User.updateMany(
        { 'org_id': org_id },
        { $set: { "status": "0" } });
     const menu_details = [];
     for (var i = 0; i < menu_object_id.length; i++) {
    
       let menuid = menu_object_id[i];
       
       menu_details.push(createmenuorg(menuid, org_id, created_by));
       
     }
     itemsObj = await Promise.all(menu_details); 
     
     if(itemsObj== "false")
     {
      response.status(statusCodes.Dataexists).json({ message: "Already selected menu allocated to this organization" });
     }else{
      response.status(statusCodes.success).json({ message: "Organization's menu added successfully" });
     }
    } else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  }
  catch (error) {

    response.status(409).json({ message: "Problem occured while adding menu to the organization" });
  }
}
const createmenuorg = async (menuid, org_id, created_by) => {
  var dateTime =datevalue.currentDate();
  await User.create({ "org_id":org_id,"status":1,"created_by": created_by,"created_date_time":dateTime,"menu_object_id": menuid});

}

const getmenuorg = async (request, response) => {
  try {
    let org_id=request.body.org_id;
    if (mongoose.isValidObjectId(org_id)) {
    let userdetail = await User.aggregate([
      {
        $match: {org_id:org_id,status:"1"}
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
                        $eq: ["$status","1"],
                      },
                    ],
                  },
                }
              }],
              "as": "menu_details"
            }
         
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

      }
      ,{
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
    response.status(statusCodes.InvalidData).json({ message: "Please Give valid Organization ID" });
}
  } catch (error) {
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while getting Organization's menu" });
  }
}
// const deletemenuorg = async (request, response) => {
//   try {
//     let delete_id = request.body.org_menu_id;
//     let deleted_by = request.body.deleted_by;
//     var dateTime =datevalue.currentDate();
//     if (delete_id && delete_id != '' && deleted_by && deleted_by != '') {
//       if (mongoose.isValidObjectId(delete_id)) {
//         var value = await User.findOne({ _id: delete_id })
//         if (value) {
//           await User.updateOne({ '_id': ObjectID(delete_id) }, { $set: { "status": "0", "deleted_by": deleted_by, "created_date_time": dateTime } });
//           response.status(statusCodes.success).json({ message: "Organization's menu  deleted successfully" });
//         }
//         else {
//           response.status(409).json({ message: "Organization's menu ID doesn't exist" });
//         }
//       }
//       else {
//         response.status(409).json({ message: "Please give valid Organization's menu ID" });
//       }
//     }
//     else {
//       response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
//     }
//   } catch (error) {
//     response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while deleting Organization's menu" });
//   }
// }


module.exports = { addmenuorg, getmenuorg };