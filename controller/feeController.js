const { constant, reject } = require('async');
let User = require('../model/fee_details-model.js')
var ObjectID = require('mongodb').ObjectId;
const mongoose = require('mongoose');
const feelog = require('../model/fee_logs-model.js');
const subfee = require('../model/sub_fee_details-model');
const branchfee = require('../model/branchfee_details-model');
var mongodb = require('mongodb');
const { response } = require('express');
var datevalue = require('./dateCodes.js');
const statusCodes = require("./statusCodes");
const addFee = async (request, response) => {
  var fee_type = request.body.fee_type;
  var access_status = request.body.access_status;
  var org_id = request.body.org_id;
  var fee_order = request.body.fee_order;
  let created_by = request.body.created_by;
  let subfeetype = JSON.parse(request.body.subfeetype);
  let other_fee_id = '0'
  var dateTime = datevalue.currentDate();
  try {
    if (subfeetype.length > 0) {

      if (fee_type && fee_type != '' && access_status && access_status != '' && org_id && org_id != '' && fee_order && fee_order != '' && created_by && created_by != '') {
        var value = await User.findOne({ "fee_type": { "$regex": `^${fee_type}$`, "$options": "i" }, "org_id": org_id })
        if (!value) {
          const feevalues = await User.create({ "fee_type": fee_type, "access_status": access_status, "status": "1", "org_id": org_id, "fee_order": fee_order, "created_by": created_by, "created_date_time": dateTime, "other_fee_id": other_fee_id });
          const feeidvalue = feevalues._id;
          const fee_details = [];
          for (var i = 0; i < subfeetype.length; i++) {
            let subfeename = subfeetype[i];
            fee_details.push(await createsubfee(subfeename, feeidvalue, access_status, org_id, fee_order, created_by));
          }
          itemsObj = await Promise.all(fee_details);
        } else {
          response.status(606).json({ message: "Fee name already exist" });
        }
      }
      else {
        response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });

      }
    }
    else {
      if (fee_type && fee_type != '' && access_status && access_status != '' && org_id && org_id != '' && fee_order && fee_order != '') {
        var value = await User.findOne({ "fee_type": fee_type, "org_id": org_id, "status": "1" })
        if (!value) {
          const feevalues = await User.create({ "fee_type": fee_type, "access_status": access_status, "status": "1", "org_id": org_id, "fee_order": fee_order, "created_by": created_by, "created_date_time": dateTime });
          const feeidvalue = feevalues._id;
          await subfee.create({ "fee_type_id": feeidvalue, "access_status": access_status, "status": "1", "org_id": org_id, "fee_order": fee_order, "created_by": created_by, "created_date_time": dateTime, "sub_fee_type": fee_type });
        } else {
          response.status(606).json({ message: "Fee name already exist" });
        }
      } else {
        response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
      }
    }
    response.status(statusCodes.success).json({ message: "Fee Type created successfully" });
  } catch (error) {
    // console.log(error)
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while creating fee" });
  }

}
const createsubfee = async (subfeename, fee_type_id, access_status, org_id, fee_order, created_by) => {
  var dateTime = datevalue.currentDate();
  // console.log(subfeename);
  await subfee.create({ "fee_type_id": fee_type_id, "access_status": access_status, "status": "1", "org_id": org_id, "fee_order": fee_order, "created_by": created_by, "created_date_time": dateTime, "sub_fee_type": subfeename });
}
const updateFee = async (request, response) => {
  var fee_id = request.body.fee_id;
  var fee_type = request.body.fee_type;
  var status = request.body.status;
  var fee_order = request.body.fee_order;
  let updated_by = request.body.updated_by;
  var access_status = request.body.access_status;
  var org_id = request.body.org_id;
  var dateTime = datevalue.currentDate();
  let subfeetype = JSON.parse(request.body.subfeetype);
  let checkfeename = await User.find(
    {
      _id: { $nin: ObjectID(fee_id) },
      "fee_type": { "$regex": `^${fee_type}$`, "$options": "i" }, "org_id": org_id
    },
  );

  try {
    let feeid = await User.findOne({ "other_fee_id": "1", "org_id": org_id, "status": "1" });
    let feeidvalue = feeid._id.toString()
    // console.log(delete_id)
    // console.log(subfeeidvalue)

    if (feeidvalue.localeCompare(fee_id)) {
      if (subfeetype.length > 0) {

        if (fee_id && fee_id != '' && fee_type && fee_type != '' && fee_order && fee_order != '' && updated_by && updated_by != '') {
          if (checkfeename.length === 0) {
            if (mongoose.isValidObjectId(fee_id)) {
              var value = await User.findOne({ _id: fee_id })
              if (value) {
                await User.updateOne(
                  { '_id': ObjectID(fee_id) },
                  { $set: { "fee_type": fee_type, "status": status, "fee_order": fee_order, "updated_by": updated_by, "created_date_time": dateTime } });
                await subfee.updateMany(
                  { 'fee_type_id': fee_id },
                  { $set: { "status": "0" } });
                const fee_details = [];
                for (var i = 0; i < subfeetype.length; i++) {
                  let subfeename = subfeetype[i];
                  // console.log(subfeename);
                  fee_details.push(updatesubfee(subfeename, fee_id, access_status, org_id, fee_order, updated_by));
                }
                itemsObj = await Promise.all(fee_details);
                await feelog.create({ "fee_id": fee_id, "operation_type": "U", "operated_by": updated_by, "created_date_time": dateTime })
                response.status(statusCodes.success).json({ message: "Fee Type updated successfully" });
              } else {
                response.status(statusCodes.UserNotFound).json({ message: "Fee doesn't exist" });
              }
            }

            else {
              response.status(statusCodes.InvalidData).json({ message: "Please Give valid Fee " });
            }
          }
          else {
            response.status(606).json({ message: "Fee name already exist" });
          }
        }
        else {
          response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
        }

      } else {
        if (fee_id && fee_id != '' && fee_type && fee_type != '' && org_id && org_id != '' && fee_order && fee_order != '' && updated_by && updated_by != '') {
          if (checkfeename.length === 0) {
            if (mongoose.isValidObjectId(request.body.fee_id)) {
              var value = await User.findOne({ _id: request.body.fee_id })
              if (value) {
                await User.updateOne(
                  { '_id': ObjectID(request.body.fee_id) },
                  { $set: { "fee_type": fee_type, "status": status, "org_id": org_id, "fee_order": fee_order, "updated_by": updated_by, "created_date_time": dateTime } });
                await subfee.updateMany(
                  { 'fee_type_id': request.body.fee_id },
                  { $set: { "status": "0" } });
                await subfee.create({ "fee_type_id": fee_id, "access_status": access_status, "status": "1", "org_id": org_id, "fee_order": fee_order, "created_by": updated_by, "created_date_time": dateTime, "sub_fee_type": fee_type });

                await feelog.create({ "fee_id": fee_id, "operation_type": "U", "operated_by": operated_by, "created_date_time": dateTime })
                response.status(statusCodes.success).json({ message: "Fee Type updated successfully" });
              } else {
                response.status(statusCodes.UserNotFound).json({ message: "Fee doesn't exist" });
              }
            }
            else {
              response.status(statusCodes.InvalidData).json({ message: "Please Give valid Fee" });
            }
          } else {
            response.status(606).json({ message: "Fee name already exist" });
          }
        }
        else {
          response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
        }
      }
    }
    else {
      response.status(statusCodes.InvalidData).json({ message: "Old dues fee type can't be deleted" });
    }
  } catch (error) {
    // console.log(error)
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while updating fee" });
  }

}
const updatesubfee = async (subfeename, fee_type_id, access_status, org_id, fee_order, created_by) => {
  var dateTime = datevalue.currentDate();
  await subfee.create({ "fee_type_id": fee_type_id, "access_status": access_status, "status": "1", "org_id": org_id, "fee_order": fee_order, "created_by": created_by, "created_date_time": dateTime, "sub_fee_type": subfeename });
}
const getFee = async (request, response) => {
  try {
    let org_id = request.body.org_id;
    let access_status = request.body.access_status;
    let match = {
      org_id: org_id,
    };
    if (access_status) match['access_status'] = access_status
    if (mongoose.isValidObjectId(org_id)) {
      let userdetail = await User.aggregate([
        {
          $match: match
        }, {
          "$lookup": {
            "from": "sub_fee_details",
            "let": { "userId": { "$toString": "$_id" } },
            pipeline: [{
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        '$fee_type_id', '$$userId',
                      ],
                    },
                    {
                      $eq: ["$status", "1"],
                    },
                  ],
                },


              }
            }],
            "as": "subfeename"
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

        }
      ]).sort({ _id: -1 });

      response.status(statusCodes.success).json(userdetail);
    }
    else {
      response.status(409).json({ message: "Please Give valid Organization ID" });
    }
  } catch (error) {
    response.status(404).json({ message: error.message })
  }
}
const updateaccessStatus = async (request, response) => {
  var adFeeId = request.body.fee_id;
  var adFeeTypeStatus = request.body.access_status;
  let updated_by = request.body.updated_by;
  var dateTime = datevalue.currentDate();
  let org_id = request.body.org_id;
  if (adFeeId && adFeeId != '' && updated_by && updated_by != '') {
    if (mongoose.isValidObjectId(adFeeId)) {
      var value = await User.findOne({ _id: adFeeId })
      let feeid = await User.findOne({ "other_fee_id": "1", "org_id": org_id, "status": "1" });


      let feeidvalue = feeid._id.toString()


      if (feeidvalue.localeCompare(adFeeId)) {
        if (value) {
          await User.updateOne({ '_id': ObjectID(adFeeId), "org_id": org_id, "status": "1" },
            { $set: { "access_status": adFeeTypeStatus, "updated_by": updated_by, "created_date_time": dateTime } });
          await subfee.updateMany(
            { 'fee_type_id': adFeeId, "org_id": org_id, "status": "1" },
            { $set: { "access_status": adFeeTypeStatus } });
          let subfeevalue = await subfee.find({ 'fee_type_id': adFeeId, "org_id": org_id })
          // console.log(subfeevalue)
          for (var i = 0; i < subfeevalue.length; i++) {
            await branchfee.updateMany(
              { 'sub_fee_id': subfeevalue[i]._id.toString(), "org_id": org_id },
              { $set: { "status": adFeeTypeStatus } });
          }
          response.status(statusCodes.success).json({ message: "Access status updated successfully" });
        }
        else {
          response.status(statusCodes.UserNotFound).json({ message: "Fee Type  doesn't exist" });
        }
      }

      else {
        response.status(statusCodes.InvalidData).json({ message: "Old dues fee type can't be updated" });
      }
    }
    else {
      response.status(statusCodes.InvalidData).json({ message: "Please give valid Fee Type  ID" });
    }
  }
  else {
    response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
  }
}


const deletefee = async (request, response) => {
  try {
    let delete_id = request.body.fee_id;
    let deleted_by = request.body.deleted_by;
    let org_id = request.body.org_id;
    var dateTime = datevalue.currentDate();
    let feeid = await User.findOne({ "other_fee_id": "1", "org_id": org_id, "status": "1" });
    // console.log(feeid)
    //let subfeeid=await subfee.findOne({"fee_type_id":feeid._id.toString()})
    //let subfeeidvalue=subfeeid._id.toString()
    let feeidvalue = feeid._id.toString()
    // console.log(delete_id)
    // console.log(subfeeidvalue)

    if (feeidvalue.localeCompare(delete_id)) {
      if (delete_id && delete_id != '' && deleted_by && deleted_by != '') {
        if (mongoose.isValidObjectId(delete_id)) {
          var value = await User.findOne({ _id: delete_id })
          if (value) {
            await User.updateOne({ '_id': ObjectID(delete_id) },
              { $set: { "status": 0, "deleted_by": deleted_by, "created_date_time": dateTime, } });
            await subfee.updateMany(
              { 'fee_type_id': delete_id },
              { $set: { "status": "0" } });
            await feelog.create({ "fee_id": delete_id, "operation_type": "D", "operated_by": deleted_by, "created_date_time": dateTime })
            response.status(statusCodes.success).json({ message: "Fee Type deleted successful" });
          }
          else {
            response.status(statusCodes.UserNotFound).json({ message: "Fee Type ID doesn't exist" });
          }
        }
        else {
          response.status(statusCodes.InvalidData).json({ message: "Please give valid Fee Type ID" });
        }
      }
      else {
        response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
      }
    }
    else {
      response.status(statusCodes.InvalidData).json({ message: "Old dues fee type can't be deleted" });
    }
  } catch (error) {
    // console.log(error)
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while deleting Fee Type" });
  }
}

module.exports = { addFee, getFee, updateaccessStatus, deletefee, updateFee };