const { constant, reject } = require('async');
let studentconcession = require('../model/student_concession-model');
let concession = require('../model/concession-model')
var expressValidator = require('express-validator');
let branchfee = require('../model/branchfee_details-model');
var ObjectID = require('mongodb').ObjectId;
let mongoose = require('mongoose');
var datevalue = require('./dateCodes.js')
const statusCodes = require("./statusCodes");
const { getCurrentCalendarYearIDByOrgId } = require('./commonfunction.js');


const addconcession = async (request, response) => {
  try {

    if (request.body.org_id && request.body.org_id != '' && request.body.concession_slab && request.body.created_by && request.body.created_by != '') {
      const org_id = request.body.org_id;
      // let cyearid = await getCurrentCalendarYearIDByOrgId(org_id);
      // request.body.calendar_years_id = cyearid ?? '';

      const concessionobject = new concession(request.body);
      const dateTime = request.currentDate;
      const value = await concession.findOne({ "concession_slab": { "$regex": `^${request.body.concession_slab}$`, "$options": "i" }, "status": "1", "org_id": request.body.org_id })
      if (!value) {
        concessionobject['created_date_time'] = dateTime;
        if (request.body.concessions.length != 0) {
          await concessionobject.save().then(
            () => {
              response.status(statusCodes.success).json({
                message: 'Concession  created successfully'
              });
            }
          )
        } else {
          response.status(statusCodes.ProvideAllFields).json({ message: "Please provide atleast a fee type" });
        }
      } else {
        response.status(statusCodes.Dataexists).json({ message: "Concession name already exist" });
      }
    } else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {
    
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while creating concession" });
  }
}
const updateconcessionName = async (request, response) => {
  try {
    const concession_slab_id = request.body.concession_slab_id;
    const concession_slab = request.body.concession_slab;
    const dateTime = request.currentDate;
    const updated_by = request.body.updated_by;
    const org_id = request.body.org_id;
    // const branch_id = request.body.branch_id;
    // const academic_years_id = request.body.academic_years_id;
    let obj = {}
    obj['concession_slab'] = concession_slab;
    obj['updated_by'] = updated_by;
    obj['updated_date_time'] = dateTime;
    // if (branch_id) {
    //   obj['branch_id'] = branch_id;
    // }
    // if (academic_years_id) {
    //   obj['academic_years_id'] = academic_years_id;
    // }
    if (concession_slab_id && concession_slab_id != '' && concession_slab && concession_slab != '' && updated_by && org_id) {
      if (mongoose.isValidObjectId(concession_slab_id)) {
        let checkconcessionname = await concession.find({_id: { $nin: ObjectID(concession_slab_id) },
            "concession_slab": { "$regex": `^${concession_slab}$`, "$options": "i" }, "org_id": org_id, "status": "1"});
        if (checkconcessionname.length === 0) {
          const value = await concession.findOne({ _id: concession_slab_id })
          if (value) {
            await concession.updateOne({ '_id': ObjectID(concession_slab_id) },
              { $set: obj })
              // function (err, records) {
              //   if (err) {
              //     response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while updating Concession Name" });
              //   } else {
              //     response.status(statusCodes.success).json({ message: "Concession name updated successfully" });
              //   }
              // });
              response.status(statusCodes.success).json({ message: "Concession name updated successfully" });

          } else {
            response.status(statusCodes.InvalidData).json({ message: "Concession ID doesn't exist" });
          }
        } else {
          response.status(statusCodes.Dataexists).json({ message: "Concession name already exist" });
        }
      } else {
        response.status(statusCodes.UserNotFound).json({ message: "Please Give valid Concession ID" });
      }
    } else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {
    
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while updating Concession Name" });
  }
}
const updateconcession = async (request, response) => {
  const dateTime = request.currentDate;
  const updated_by = request.body.updated_by;
  const org_id = request.body.org_id;
  const concession_slab_id = request.body.concession_slab_id;
  const concessions = request.body.concessions;

  if (concessions && concessions.length != 0 && concession_slab_id != '' && org_id && updated_by) {
    let percentage = await studentconcession.aggregate([
      { $match: { concession_slab_id: concession_slab_id, status:'1' } }])
    if (percentage.length === 0) {
      await concession.updateOne({ _id: ObjectID(concession_slab_id) },
        { $set: { "concessions": concessions, updated_date_time:dateTime, updated_by } });
        for (var i = 0; i < concessions.length; i++) {
          let stud = concessions[i].sub_fee_id;
          let percentage = concessions[i].percentage;
  
        await studentconcession.updateMany({"concession_slab_id": concession_slab_id },
        { $set: { "concessions.$[element].concession": percentage } },
        { multi: true, arrayFilters: [{ "element.sub_fee_id": stud }], new: true })
        }
      response.status(statusCodes.success).json({ message: "Concession updated successfully" });
    } else {
      response.status(statusCodes.SomethingWentWrong).json({
        message: 'Concession already allocated to the student'
      });
    }
  } else {
    response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
  }
}
const deleteconcession = async (request, response) => {
  try {
    const delete_id = request.body.concession_slab_id;
    const deleted_by = request.body.deleted_by;
    const dateTime = request.currentDate;
    if (delete_id && delete_id != '' && deleted_by && deleted_by != '') {
      if (mongoose.isValidObjectId(delete_id)) {
        let percentage = await studentconcession.aggregate([{ $match: { concession_slab_id: delete_id, status:'1' } }])
        if (percentage.length === 0) {
          const value = await concession.findOne({ _id: delete_id })
          if (value) {
            await concession.updateOne({ '_id': ObjectID(delete_id) },
              { $set: { "status": "0", "deleted_by": deleted_by, "created_date_time": dateTime } });
            //   function (err, records) {
            //     if (err) {
            //       response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while deleting Concession" });
            //     }else{
            //       response.status(statusCodes.success).json({ message: "Concession deleted successfully" });
            //     }
            // });
            response.status(statusCodes.success).json({ message: "Concession deleted successfully" });
          } else {
            response.status(statusCodes.InvalidData).json({ message: "Concession ID doesn't exist" });
          }
        } else {
          response.status(statusCodes.Dataexists).json({
            message: 'Concession already allocated to the student'
          });
        }
      } else {
        response.status(statusCodes.UserNotFound).json({ message: "Please Give valid Concession ID" });
      }

    } else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {
   
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while deleting Concession" });
  }

}
const addstudentconcession = async (request, response) => {
  try {
    if (request.body.student_id && request.body.student_id != '' && request.body.org_id && request.body.org_id != '' && request.body.created_by && request.body.created_by != '' && request.body.academic_years_id && request.body.academic_years_id != '') {
      const org_id = request.body.org_id;
      let cyearid = await getCurrentCalendarYearIDByOrgId(org_id);
      request.body.calendar_years_id = cyearid ?? '';
      if(request.body.calendar_years_id ){
        let check = await studentconcession.findOne({ "student_id": request.body.student_id, "org_id": org_id, "status": "1" });
        if(check){
          response.status(statusCodes.InvalidData).json({ message: "Concession already allocated for the student." });
        }else{
          let concessionobject = new studentconcession(request.body);
          let dateTime = request.currentDate;
          concessionobject['created_date_time'] = dateTime;
          if (request.body.concessions.length != 0 && request.body.concession_slab_id == '') {
            await concessionobject.save().then(
              () => {
                response.status(statusCodes.success).json({
                  message: 'Concession allocated for the student created successfully'
                });
              }
            )
          }
          else {

            let percentage = await concession.aggregate([
              { $match: { _id: ObjectID(request.body.concession_slab_id) } }])
           
            if (percentage.length !== 0) {

              for (var i = 0; i < percentage[0].concessions.length; i++) {

                let obj = {};
                obj['sub_fee_id'] = percentage[0].concessions[i].sub_fee_id;
                obj['concession'] = percentage[0].concessions[i].percentage;
                obj['concession_status'] = 'p';
                concessionobject['concessions'].push(obj);

              }
              await concessionobject.save().then(
                () => {
                  response.status(statusCodes.success).json({
                    message: 'Concession allocated for the student created successfully'
                  });
                }
              )

            } else {
              response.status(statusCodes.SomethingWentWrong).json({
                message: 'Please provide correct concession Id'
              });
            }
          }
        }
      }else{
        response.status(statusCodes.InvalidData).json({ message: "No active calender year" });
      }
    }
    else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
    }

  }
  catch (error) {
    
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while creating concession" });
  }
}
const getconcession = async (request, response) => {
  try {
    let org_id = request.body.org_id;
    if (mongoose.isValidObjectId(org_id)) {
      const users = await concession.aggregate([
        { "$unwind": "$concessions" },
        {
          $match: {
            org_id: org_id, "status": "1"
          }
        }, {
          "$lookup": {
            "from": "sub_fee_details",
            "let": { "userId": { "$toObjectId": "$concessions.sub_fee_id" }, "concessions": "$concessions" },
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
              },

            }, { $replaceRoot: { newRoot: { $mergeObjects: ["$$concessions", "$$ROOT"] } } },
            {
              "$lookup": {
                "from": "fee_details",
                "let": { "userId": { "$toObjectId": "$fee_type_id" } },
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
                "as": "feename"
              }
            }],
            "as": "subfeename"
          },

        },

        {
          $group: {
            _id: "$_id",
            concession_slab: { "$first": "$concession_slab" },
            // branch_id: { "$first": "$branch_id" },
            // academic_years_id: { "$first": "$academic_years_id" },
            // calendar_years_id: { "$first": "$calendar_years_id" },
            created_by: { "$first": "$created_by" },
            concessions: { $push: { $first: "$subfeename" } },
            updated_by: { "$first": "$updated_by" },
            deleted_by: { "$first": "$deleted_by" },
            status: { "$first": "$status" },
            created_date_time: { "$first": "$created_date_time" },
          }
        },
        // {
        //   "$lookup": {
        //     "from": "branch_details",
        //     "let": { "salId": { "$toObjectId": "$branch_id" } },
        //     "pipeline": [
        //       {
        //         "$match": {
        //           "$expr": {
        //             $and: [
        //               {
        //                 $eq: [
        //                   '$_id', '$$salId',
        //                 ],
        //               },
        //               {
        //                 $eq: ["$status", "1"],
        //               },

        //             ],
        //           }
        //         }
        //       }
        //     ],
        //     "as": "branchname"
        //   }
        // },
         {
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
        // {
        //   "$lookup": {
        //     "from": "calendar_years",
        //     "let": { "calendar_years_id": { "$toObjectId": "$calendar_years_id" } },
        //     "pipeline": [
        //       {
        //         "$match": {
        //           "$expr": {
        //             $and: [
        //               { $eq: ['$_id', '$$calendar_years_id'] },
        //               { $eq: ["$status", "1"] },
        //             ],
        //           }
        //         }
        //       }
        //     ],
        //     "as": "calendarname"
        //   }
        // },
        // { "$unwind": { "path": "$calendarname", "preserveNullAndEmptyArrays": true } },
        // {
        //   "$lookup": {
        //     "from": "academic_years",
        //     "let": { "academic_years_id": { "$toObjectId": "$academic_years_id" } },
        //     "pipeline": [
        //       {
        //         "$match": {
        //           "$expr": {
        //             $and: [
        //               { $eq: ['$_id', '$$academic_years_id'] },
        //               { $eq: ["$status", "1"] },
        //             ],
        //           }
        //         }
        //       }
        //     ],
        //     "as": "academicname"
        //   }
        // },
        // { "$unwind": { "path": "$academicname", "preserveNullAndEmptyArrays": true } },
        // {
        //   $set: {
        //     academic_year: "$academicname.academic_year",
        //     calendar_year: "$calendarname.calendar_year",
        //   }
        // },
        // { $unset: ["calendarname", "academicname"] },
      ]).sort({_id : -1});
      response.status(statusCodes.success).json(users);
    }
    else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please Give valid Organization ID" });
    }
  } catch (error) {
  
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while getting consession for student" });
  }
}
const getstudconcession = async (request, response) => {

  try {
    let org_id = request.body.org_id;
    if (mongoose.isValidObjectId(org_id)) {

      const users = await studentconcession.aggregate([
        { "$unwind": "$concessions" },
        {
          $match: {
            org_id: request.body.org_id
          }
        }
        , {
          "$lookup": {
            "from": "sub_fee_details",
            "let": { "userId": { "$toObjectId": "$concessions.sub_fee_id" }, "concessions": "$concessions" },
            pipeline: [{
              $match: {
                $expr: {
                  $and: [
                    {$eq: ['$_id', '$$userId']},
                    {$eq: ["$status", "1"]},
                  ],
                },
              },

            }, { $replaceRoot: { newRoot: { $mergeObjects: ["$$concessions", "$$ROOT"] } } },
            {
              "$lookup": {
                "from": "fee_details",
                "let": { "userId": { "$toObjectId": "$fee_type_id" } },
                pipeline: [{
                  $match: {
                    $expr: {
                      $and: [
                        {$eq: ['$_id', '$$userId']},
                        {$eq: ["$status", "1"]}],
                    },
                  }
                }],
                "as": "feename"
              }
            }],
            "as": "subfeename"
          },
        },
        {
          $group: {
            _id: "$_id",
            student_id: { $first: "$student_id" },
            created_by: { $first: "$created_by" },
            concessions: { $push: { $first: "$subfeename" } },
            concession_slab_id: { $first: "$concession_slab_id" },
            academic_years_id: { $first: "$academic_years_id" },
            calendar_years_id: { $first: "$calendar_years_id" },
            created_date_time: { "$first": "$created_date_time" },
          }
        },
        {
          "$lookup": {
            "from": "students",
            "let": { "salId": { "$toObjectId": "$student_id" } },
            "pipeline": [
              {
                "$match": {
                  "$expr": {
                    $and: [
                      {$eq: ['$_id', '$$salId']},
                      // {$eq: ["$status", "1"]},
                    ],
                  }
                }
              }
            ],
            "as": "studentname"
          }
        }
        , {
          "$lookup": {
            "from": "securities",
            "let": { "salId": { "$toObjectId": "$created_by" } },
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
            "as": "createdbyname"
          },

        }, { $unset: "createdbyname.admin_password" },
        {
          "$lookup": {
            "from": "calendar_years",
            "let": { "salId": { "$toObjectId": "$calendar_years_id" } },
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
            "as": "calendarname"
          }
        },
        {
          "$lookup": {
            "from": "academic_years",
            "let": { "salId": { "$toObjectId": "$academic_years_id" } },
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
            "as": "academicname"
          }
        },
        {
          "$lookup": {
            "from": "concessions",
            "let": { "salId": { $convert: { input: '$concession_slab_id', to: 'objectId', onError: '', onNull: '' } } },
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
            "as": "concessionname"
          }
        },
        {
          $set: {
            student_name:"$studentname.student_name",
            id:"$studentname.id",
            concession_slab:"$concessionname.concession_slab",
            academic_year: "$academicname.academic_year",
            calendar_year:"$calendarname.calendar_year",
            calendar_year_value:"$calendarname.calendar_year_value",
            created_by_name: "$createdbyname.admin_name"
          }
        },
        { $unset: ["studentname","concessionname","calendarname","academicname", "createdbyname"] },
      ]).sort({_id : -1});
      response.status(statusCodes.success).json(users);
    }
    else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please Give valid Organization ID" });
    }
  } catch (error) {
    
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while getting consession for student" });
  }
}
const updatestudconcession = async (request, response) => {
  try {
    let stringObjectIdArray = JSON.parse(request.body.sub_fee_id);
    let concession_slab_id = request.body.studconcession_id;
    //let objectIdArray = stringObjectIdArray.map(s => mongoose.Types.ObjectId(s));
    if (stringObjectIdArray.length != 0) {
      
      for (var i = 0; i < stringObjectIdArray.length; i++) {
        let stud = stringObjectIdArray[i];

        await studentconcession.findOneAndUpdate({ _id: ObjectID(concession_slab_id) },
          { $set: { "concessions.$[element].concession_status": request.body.concession_status } },
          { multi: true, arrayFilters: [{ "element.sub_fee_id": stud }], new: true })

      }
      if(stringObjectIdArray[0]){
      response.status(statusCodes.success).json({ message: "Concession updated successfully" });
      }
    } else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please provide atleast a consession Id" });
    }
  } catch (error) {
   
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while updating consession for student" });
  }
}
const deletestudconcession = async (request, response) => {
  try {
    let stringObjectIdArray = request.body.sub_fee_id;
    let concession_slab_id = request.body.studconcession_id;
    let studconcessionstatus = request.body.concession_status;

    if (stringObjectIdArray && concession_slab_id && studconcessionstatus) {
      await studentconcession.findOneAndUpdate({ _id: ObjectID(concession_slab_id) },
        { $set: { "concessions.$[element].concession_status": studconcessionstatus } },
        { arrayFilters: [{ "element.sub_fee_id": stringObjectIdArray }] });
      response.status(statusCodes.success).json({ message: "Concession deleted successfully" });
    } else {
      response.status(statusCodes.ProvideAllFields).json({ message: "Please provide atleast a student Id" });
    }
  } catch (error) {
   
    response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while deleting consession for student" });
  }
}

module.exports = { addconcession, addstudentconcession, getstudconcession, updatestudconcession, deletestudconcession, getconcession, updateconcession, deleteconcession, updateconcessionName };