const { constant, reject } = require('async');
let User = require('../model/department-model.js')
var expressValidator = require('express-validator');
var ObjectID = require('mongodb').ObjectId;
let mongoose = require('mongoose');
var datevalue=require('./dateCodes.js')
const statusCodes = require("./statusCodes");
const adddep = async (request, response) => {
    try {
        let dep_name = request.body.dep_name;
        let org_id = request.body.org_id;
        let create_by = request.body.create_by;
        var dateTime =datevalue.currentDate();
        if ( dep_name && dep_name != '' && org_id && org_id != '' && create_by && create_by != '') {
            var value = await User.find({ "dep_name": { "$regex": `^${dep_name}$`, "$options": "i" }, "org_id": org_id ,"status":"1"})
            console.log(value)
      if (value.length==0) {
            await User.create({ "dep_name": dep_name, "status": "1", "org_id": org_id, "create_by": create_by, "created_date_time": dateTime })
            response.status(statusCodes.success).json({ message: "Department  created successfully" });
        
    } else {
        response.status(statusCodes.Dataexists).json({ message: "Department name already exist" });
      }
    }else {
            response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
        }
    } catch (error) {
        console.log(error)
        response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while creating department" });
    }
}
const updatedep = async (request, response) => {
    try {
        let dep_name = request.body.dep_name;
        let dep_id = request.body.dep_id;
        let org_id = request.body.org_id;
        let updated_by = request.body.updated_by;
        var dateTime =datevalue.currentDate();
        let checkdepname=await User.find(
            {
           
                _id: { $nin: ObjectID(dep_id) },
                "dep_name": { "$regex": `^${dep_name}$`, "$options": "i" }, "org_id": org_id ,"status":"1"},
              
            );
           
        if ( dep_name && dep_name != ''  && dep_id && dep_id != ''&& updated_by && updated_by != '') {
            if(checkdepname.length===0){
            if (mongoose.isValidObjectId(dep_id)) {

                var value = await User.findOne({ _id:dep_id })
                if (value) {
                    await User.updateOne(
                        { '_id': ObjectID(dep_id) },
                        { $set: { "dep_name": dep_name, "updated_by": updated_by, "created_date_time": dateTime  } });
                    response.status(statusCodes.success).json({ message: "Department  updated successfully" });
                }
                else {
                    response.status(409).json({ message: "Department doesn't exist" });
                }
            }
            else {
                response.status(statusCodes.InvalidData).json({ message: "Please Give valid Department ID" });
            }

        }
        
    else{
      response.status(statusCodes.Dataexists).json({ message: "Department name already exist" });
    }
  }  else {
            response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });

        }
    } catch (error) {
        console.log(error)
        response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while updating department" });
    }
}
const deletedepDetails = async (request, response) => {
    try {
        let delete_id = request.body.dep_id;
        let deleted_by = request.body.deleted_by;
        var dateTime =datevalue.currentDate();
        if (delete_id && delete_id  != ''&& deleted_by && deleted_by != '') {
            if (mongoose.isValidObjectId(delete_id)) {

                var value = await User.findOne({ _id: delete_id })
                if (value) {
                    User.updateOne({ '_id': ObjectID(delete_id) },
                        { $set: { "status": "0","deleted_by": deleted_by, "created_date_time": dateTime} },
                        function (err, records) {
                            if (err) {
                                return false;
                            }
                        });
                    response.status(statusCodes.success).json({ message: "Department deleted successfully" });
                }
                else {
                    response.status(statusCodes.UserNotFound).json({ message: "Department doesn't exist" });
                }
            }
            else {
                response.status(statusCodes.InvalidData).json({ message: "Please give valid Department" });
            }
        }
        else {
            response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
        }
    } catch (error) {
        response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while deleting department" });
    }
}
const getdep = async (request, response) => {
    try {
        let org_id = request.body.org_id;
        if (mongoose.isValidObjectId(org_id)) {
            const users = await User.aggregate([
                {
                  $match: {
                    "org_id":org_id, "status": '1'
                  }
                },{
                  "$lookup": {
                      "from": "securities",
                      "let": { "salId": { "$toObjectId": "$create_by" } },
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
              
                          created_by_name: "$createdbyname.admin_name"
                        },
              
                      }
              ]).sort({ _id: -1 })
            response.status(statusCodes.success).json(users);
        }
        else {
            response.status(statusCodes.UserNotFound).json({ message: "Please Give valid Organization" });
        }
    } catch (error) {

        response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while getting department" });
    }
}

module.exports = { adddep, deletedepDetails, getdep, updatedep };