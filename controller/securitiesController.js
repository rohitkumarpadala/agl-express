const { constant, reject } = require('async');
let User = require('../model/securities-model.js');
let Organization = require('../model/org-model.js')
const path = require('path');
let Userlog = require('../model/user_logs-model.js');
const bcrypt = require('bcrypt');
var ObjectID = require('mongodb').ObjectId;
let mongoose = require('mongoose');

const { addStaffJob, getJobs, reprocessFailedJobs, getstaffJobs } = require('./background_jobs');

var datevalue = require('./dateCodes.js')
const statusCodes = require("./statusCodes");
var fs = require('fs');
const profileModel= require('../model/profile-model');

const loginUser = async (request, response) => {
  try {
    if (request.body.admin_email && request.body.admin_email != '' && request.body.admin_password && request.body.admin_password != '') {
      User.findOne({ admin_email: { "$regex": `^${request.body.admin_email}$`, "$options": "i" },"status":"1"}).then(
        async (user) => {
          if (user) {
            let orgvalid = false;
            if (user?.security_type === 'SA') {
              orgvalid = true;
            } else {
              orgvalid = await Organization.findOne({ _id:user?.org_id, "status":"1"});
            }
            if (user?.access_status == "1") {
              bcrypt.compare(`` + request.body.admin_password, user.admin_password).then(
                (valid) => {
                  if (valid) {
                    if(orgvalid){
                      response.status(statusCodes.success).json({
                        security_id: user._id,
                        org_id: user.org_id,
                        admin_name: user.admin_name,
                        security_type:user.security_type,
                        role_id:user.role_id
                      });
                    } else {
                      response.status(409).json({ message: "Please contact administrator" });
                    }
                  } else {
                    response.status(409).json({ message: "Incorrect password" });
                  }
                }
              )
            } else {
              response.status(409).json({ message: "Please contact administrator" });
            }
          } else {
            response.status(409).json({ message: "User doesn't exist." });
          }
        }
      )
    } else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  }
  catch (error) {

    response.status(606).json({ message: "Problem occurred while login user" });
  }
}
const addUser = async (request, response) => {
  try {
    var username = request.body.admin_name;
    var email = request.body.admin_email;
    var role_id = request.body.role_id;
    var address = request.body.address;
    var security_password = request.body.admin_password;
    var security_type = request.body.security_type;
    var phone_number = request.body.admin_mobile;
    var access_status = request.body.access_status;
    var org_id = request.body.org_id;
    var dateTime = datevalue.currentDate();
    let created_by = request.body.created_by;
    if (username && username != '' && email && email != '' && role_id && role_id != '' && address && address != '' && phone_number && phone_number != '' && org_id && org_id != '' && created_by && created_by != '' && security_password && security_password != '') {
      var value = await User.findOne({ "admin_email": { "$regex": `^${email}$`, "$options": "i" }, "status":'1' });
      if (!value) {
        var value1 = await User.findOne({ "admin_mobile": phone_number, "status":'1' });

        if (!value1) {

          const salt = await bcrypt.genSalt(10);
          security_password = await bcrypt.hash(security_password.toString(), salt);
          await User.create({ "admin_name": username, "admin_email": email, "admin_password": security_password, "admin_mobile": phone_number, "address": address, "role_id": role_id, "status": "1", "security_type": security_type, "access_status": access_status, "org_id": org_id, "created_by": created_by, "created_date_time": dateTime });
          //addStaffJob({ "staff_name": String(username) });
          response.status(statusCodes.success).json({ message: "User created successfully" });
        } else {
          response.status(statusCodes.Dataexists).json({ message: "User phone number already exist" });
        }
      } else {
        response.status(statusCodes.Dataexists).json({ message: "User Email already exist" });
      }
    } else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  }

  catch (error) {

    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while adding user" });
  }
}
const updateUser = async (request, response) => {

  try {
    let security_id = request.body.security_id;
    var username = request.body.admin_name;
    var email = request.body.admin_email;
    var role_id = request.body.role_id;
    var address = request.body.address;
    var security_password = request.body.admin_password;
    var security_type = request.body.security_type;
    var phone_number = request.body.admin_mobile;
    var access_status = request.body.access_status;
    var org_id = request.body.org_id;
    var updated_by = request.body.updated_by;
    var dateTime = datevalue.currentDate();
    let checkadminemail = await User.find(
      {

        _id: { $nin: ObjectID(security_id) },
        "admin_email": { "$regex": `^${email}$`, "$options": "i" }, "status":'1'
      },

    );
    let checkadminphn = await User.find(
      {

        _id: { $nin: ObjectID(security_id) },
        "admin_mobile": phone_number, "status": '1' 
      },

    );
    if (security_id && security_id != '' && username && username != '' && email && email != '' && role_id && role_id != '' && address && address != '' && phone_number && phone_number != '' && updated_by && updated_by != '' ) {
      if (checkadminemail.length === 0) {
        if (checkadminphn.length === 0) {
          if (mongoose.isValidObjectId(security_id)) {
            var value = await User.findOne({ _id: security_id })
            if (value) {
              if (security_password == "") {
                await User.updateOne(
                  { '_id': ObjectID(security_id) },
                  { $set: { "admin_name": username, "admin_email": email, "admin_mobile": phone_number, "address": address, "role_id": role_id, "security_type": security_type, "access_status": access_status,  "updated_by": updated_by, "created_date_time": dateTime } });
              }
              else {
                const salt = await bcrypt.genSalt(10);
                security_password = await bcrypt.hash(security_password.toString(), salt);
                await User.updateOne(
                  { '_id': ObjectID(security_id) },
                  { $set: { "admin_name": username, "admin_email": email, "admin_mobile": phone_number, "address": address, "role_id": role_id, "security_type": security_type, "access_status": access_status,  "admin_password": security_password, "updated_by": updated_by, "created_date_time": dateTime } });
              }
              await Userlog.create({ "security_id": security_id, "operation_type": "U", "operated_by": updated_by, "created_date_time": dateTime })
              response.status(statusCodes.success).json({ message: "User updated successfully" });
            }
            else {
              response.status(statusCodes.UserNotFound).json({ message: "User doesn't exist" });
            }
          }
          else {
            response.status(statusCodes.InvalidData).json({ message: "Please give valid User" });
          }

        }
        else {
          response.status(statusCodes.Dataexists).json({ message: "User phone number already exist" });
        }
      }
      else {
        response.status(statusCodes.Dataexists).json({ message: "User email already exist" });
      }
    } else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });

    }

  } catch (error) {

    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while updating User" });
  }
}
const getUser = async (request, response) => {
  try {
    let org_id = request.body.org_id;
    if (mongoose.isValidObjectId(org_id)) {
      let match_query = { "org_id": org_id };
      if (request.body.security_type != '') {
        match_query['security_type'] = request.body.security_type;
      }
      let userdetail = await User.aggregate([
        {
          $match: match_query
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
          
              }, {
          "$lookup": {
            "from": "roles",
            "let": { "userId": { "$toObjectId": "$role_id" } },
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
            "as": "rolename"
          }
        }, { $unset: "admin_password" },{$unset: "createdbyname.admin_password"},
        
      ]).sort({ _id: -1 });
      response.status(statusCodes.success).json(userdetail);
    }
    else {
      response.status(409).json({ message: "Please Give valid Organization" });
    }
  } catch (error) {

    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while getting User" })
  }
}
const deleteUser = async (request, response) => {

  try {
    let delete_id = request.body.security_id;
    var deleted_by = request.body.deleted_by;
    var dateTime = datevalue.currentDate();
    if (delete_id && delete_id != '' && deleted_by && deleted_by != '') {
      if (mongoose.isValidObjectId(delete_id)) {
        var value = await User.findOne({ _id: delete_id })
        if (value) {
          User.updateOne({ '_id': ObjectID(delete_id) },
            { $set: { "status": "0", "deleted_by": deleted_by, "created_date_time": dateTime } },
            function (err, records) {
              if (err) {
                return false;
              }
            });
          await Userlog.create({ "security_id": delete_id, "operation_type": "D", "operated_by": deleted_by, "created_date_time": dateTime })
          response.status(statusCodes.success).json({ message: "User deleted successfully" });
        }
        else {
          response.status(606).json({ message: "User doesn't exist" });
        }
      }
      else {
        response.status(606).json({ message: "Please Give valid User " });
      }
    }
    else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {

    response.status(606).json({ message: "Problem occurred while deleting User" });
  }
}
//counter access control
const editUserstatus = async (request, response) => {
  try {
    let security_id = request.body.security_id;
    let access_status = request.body.access_status;
    if (security_id && security_id != '' && access_status && access_status != '') {
      if (mongoose.isValidObjectId(security_id)) {
        await User.updateOne({ '_id': security_id }, {
          $set: {
            "access_status": access_status
          }
        }
        )
        response.status(statusCodes.success).json({ message: "Status updated succcessfully" });
      }
      else {
        response.status(statusCodes.InvalidData).json({ message: "Please Give valid User" });
      }
    } else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while  updating status" });
  }
}
const changepassword = async (request, response) => {

  try {
    let security_id = request.body.security_id;
    let admin_password = request.body.admin_password;
    let old_admin_password= request.body.old_admin_password;
   let org_id=request.body.org_id;

   const salt = await bcrypt.genSalt(10);
 
        
    if (security_id && security_id != '' && admin_password && admin_password && old_admin_password && old_admin_password && org_id && org_id ) {
      const value = await User.findOne({ "_id": ObjectID(security_id),"status":"1","org_id":org_id })
      if (value) {
        let orgvalid = false;
            if (value?.security_type === 'SA') {
              orgvalid = true;
            } else {
              orgvalid = await Organization.findOne({ _id:value?.org_id, "status":"1"});
            }
        bcrypt.compare(`` + request.body.old_admin_password, value.admin_password).then(
          async  (valid) => {
            if (valid) {
              if(orgvalid){
              admin_password = await bcrypt.hash(admin_password.toString(), salt);
                await User.updateOne({ '_id': ObjectID(security_id) ,"status":"1","org_id":org_id }, {
                  $set: {
                    "admin_password": admin_password
                  }
                })
                response.status(statusCodes.success).json({ message: "Password updated succcessfully" });
              } else {
                response.status(409).json({ message: "Please contact administrator" });
              }
            } else {
              response.status(409).json({ message: "Incorrect password" });
            }
          }
        
        )
      }
       
        
      
    }
    else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  }
  catch (e) {
  
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while changing password" });
  }
}
const getsuperadmin = async (request, response) => {
  try {
    let security_type=request.body.security_type;
    if(security_type && security_type !=""){
    let userdetail = await User.aggregate([
      {
        $match: { "security_type": security_type }
      }
      , { $unset: "admin_password" },
    ]).sort({ _id: -1 });;
    response.status(statusCodes.success).json(userdetail);
  }
  else{
    response.status(statusCodes.InvalidData).json({ message: "Please provide correct security type" });
  }

  }
  catch (e) {
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while getting super admin" });
  }
}
const getvaluedetail=async(request,response)=>{
  try {
    let security_id=request.body.security_id;
    if(security_id && security_id !=""){
      
  let userdetail = await User.aggregate([
    {
      $match:  { _id: ObjectID(security_id) }
    }
    ,{
      "$lookup": {
          "from": "org_details",
          "let": { "salId": { "$toObjectId": "$org_id" } },
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
          "as": "orgname"
      },
      
          }, { $unwind: "$orgname" }, {
      "$lookup": {
        "from": "roles",
        "let": { "userId": { "$toObjectId": "$role_id" } },
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
        "as": "rolename"
      }
    }, { $unset: "admin_password" },{ $unwind: "$rolename" },
    {
      $set: {
        role_name: "$rolename.role_name",
        organization_name: "$orgname.org_name",
        
      }
    },
    { $unset: ["rolename", "orgname"] },
    
  ]).sort({ _id: -1 });
  response.status(statusCodes.success).json(userdetail);
  }
  else{
    response.status(statusCodes.InvalidData).json({ message: "Please provide correct security id" });
  }

  }
  catch (e) {
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while getting user" });
  }

}
const profileupload=async(request,response)=>{
  try {
      if( request.body.security_id && request.body.org_id && request.file){

        let org_id=request.body.org_id;
        let security_id=request.body.security_id;
        var extension = path.parse(request.file.originalname).ext;
        let file_name = request.body.security_id + extension;
        const writeStream = fs.createWriteStream('uploads/' + file_name);
        writeStream.write(request.file.buffer);
        writeStream.end();
      
        var dateTime = request.currentDate;
        let orgvalid = await profileModel.findOne({ org_id:org_id,security_id:security_id,});
        if(orgvalid){
          await profileModel.updateOne({ org_id:org_id,security_id:security_id, },{path:file_name,})
          response.status(statusCodes.success).json({message:"Photo uploaded successfully"});
        }else{
          await profileModel.create({org_id:org_id,security_id:security_id,path:file_name,created_date_time:dateTime})
          response.status(statusCodes.success).json({message:"Photo uploaded successfully"});
        }
      }else {
        response.status(statusCodes.ProvideAllFields).json({ message: "Provide mandatory fields" });
      }
    } catch (e) {
      // console.log(e)
      response.status(statusCodes.SomethingWentWrong).json({ message:e.message });
    }
        
}
const getimage=async (request,response)=>{
  try {
    if(request.body.security_id && request.body.org_id){
      let org_id=request.body.org_id;
      let security_id=request.body.security_id;
      let orgvalid = await profileModel.findOne({ org_id:org_id,security_id:security_id,});
      response.status(statusCodes.success).json(orgvalid);
      
    }else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Provide mandatory fields" });
    }
    } catch (e) {
      //  console.log(e)
      response.status(statusCodes.SomethingWentWrong).json({ message:e.message });
    }
}
module.exports = {getimage,profileupload, getvaluedetail,loginUser, editUserstatus, deleteUser, getUser, addUser, changepassword, updateUser, getsuperadmin };