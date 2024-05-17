const { constant, reject } = require('async');
let User = require('../model/old_student-model.js')
let mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectId;
const mime = require("mime");
var expressValidator = require('express-validator');
var datevalue = require('./dateCodes.js');
const statusCodes = require("./statusCodes");
let oldduelog = require('../model/old_student_logs-model')
const { getoldduedetails } = require('./transactionsController')
const { checkID } = require('./studentController');
let olddue = require('../model/old_student-model.js');
let subfee = require('../model/sub_fee_details-model');
let fee = require('../model/fee_details-model');
const xlstojson = require("xls-to-json-lc");
const xlsxtojson = require("xlsx-to-json-lc");

const addOldstuddue = async (request, response) => {
    try {
        let student_id = request.body.student_id;
        let old_due_amount = request.body.old_due_amount;
        let org_id = request.body.org_id;
        let dateTime = request.currentDate;
        let created_by = request.body.created_by;
        if(student_id && old_due_amount && org_id && created_by){
            let value = await User.findOne({ "student_id": student_id, "org_id": org_id, "status": "1" })
            if (!value) {
                let olddueidvalue = await User.create({ "student_id": student_id, "old_due_amount": old_due_amount, "status": "1", "created_by": created_by, "org_id": org_id, "created_date_time": dateTime })
                await oldduelog.create({ "old_due_id": olddueidvalue._id.toString(), "student_id": student_id, "prev_amount": "0", "new_amount": old_due_amount, "amount": old_due_amount, "status": "1", "created_by": created_by, "org_id": org_id, "created_date_time": dateTime, "ayear_id": "0", "cyear_id": "0", "type": "N", "transaction_id": "0" })
                response.status(statusCodes.success).json({ message: "OldDue created successfully" });
            } else {
                response.status(statusCodes.Dataexists).json({ message: "OldDue for this Student already exist" });
            }
        } else {
            response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
        }
    }
    catch (error) {
        console.log(error)
        response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while Adding OldDue" });
    }
}
const updateOldstuddue = async (request, response) => {
    try {
        var autoid = request.body.autoid;
        var student_id = request.body.student_id;
        var old_due_amount = request.body.old_due_amount;
        let updated_by = request.body.updated_by;
        let org_id = request.body.org_id;
        var dateTime = request.currentDate;
        if (autoid && autoid != '' && student_id && student_id != '' && old_due_amount && old_due_amount != '' && updated_by && updated_by != '') {
            if (mongoose.isValidObjectId(autoid)) {
                let updatevalue = await User.find(
                    {
                        _id: { $nin: ObjectID(autoid) },
                        "student_id": student_id, "org_id": org_id, "status": "1"
                    },
                );
                if (updatevalue.length === 0) {
                    let value = await User.findOne({ _id: autoid, org_id: org_id, "status": "1" })
                    if (value) {
                        let old_due = 0;
                        let prev = await User.findOne({ "student_id": student_id, "status": "1" });
                        if(prev){
                            olddue = prev.old_due_amount;
                        }
                        // if (prev_amount) {
                            await User.updateOne({ '_id': ObjectID(autoid) },{ $set: { "student_id": student_id, "old_due_amount": old_due_amount, "updated_by": updated_by, "created_date_time": dateTime } });
                            await oldduelog.create({ "old_due_id": autoid, "student_id": student_id, "prev_amount": old_due, "new_amount": old_due_amount, "amount": old_due_amount, "status": "1",  "created_by": updated_by, "created_date_time": dateTime, "ayear_id": "0", "cyear_id": "0", "type": "U", "transaction_id": "0", "org_id": org_id })
                            response.status(statusCodes.success).json({ message: "OldDue updated successfully" });
                        // } else {
                        //     response.status(statusCodes.UserNotFound).json({ message: "Student doesn't exist" });
                        // }
                    } else {
                        response.status(statusCodes.UserNotFound).json({ message: "OldDue doesn't exist" });
                    }

                } else {
                    response.status(statusCodes.Dataexists).json({ message: "OldDue for this Student already exist" });
                }
            } else {
                response.status(statusCodes.InvalidData).json({ message: "Please Give valid OldDue" });
            }
        } else {
            response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
        }
    } catch (error) {
        console.log(error)
        response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while updating OldDue" });
    }
}
const getOldstuddue = async (request, response) => {
    try {
        let org_id = request.body.org_id;
        if (mongoose.isValidObjectId(org_id)) {
            //let studolddue = await olddue.findOne({ "student_id": student_id, "status": "1" })
            let feeid = await fee.findOne({ "other_fee_id": "1", "org_id": org_id, "status": "1" });
            let subfeeid = '';
            let subfeevalue='';
            if (feeid) {
                subfeeid = await subfee.findOne({ "fee_type_id": feeid._id.toString(), "org_id": org_id, "status": "1" });
                 subfeevalue=await subfeeid?._id.toString();
            }
            
            const users = await User.aggregate([
                {
                    $match: {
                        "org_id": org_id, status: "1",
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
                                { $eq: ['$_id', '$$salId'] },
                                { $eq: ["$status", "1"] },
                                { $eq: ["$org_id", org_id] },
                              ],
                            }
                          },
                        }
                      ],
                      "as": "created_by_details"
                    },
                  },
                 { $unwind: "$created_by_details" },
                {
                    "$lookup": {
                        "from": "transactions",
                        "let": { "student_id": "$student_id" },
                        "pipeline": [
                            { "$unwind": "$paiddetails" },
                            {
                                "$match": {
                                "$expr": {
                                    $and: [
                                    { $eq: ['$paiddetails.student_id', '$$student_id'] },
                                    { $eq: ["$paiddetails.status", "1"] },
                                    { $eq: ["$paiddetails.org_id", org_id] },
                                    { $eq: ["$paiddetails.sub_fee_id",subfeevalue ] },
                                    ],
                                }
                                }
                            },
                            { $group: { '_id': { student_id: '$paiddetails.student_id' }, total_amount: { $sum: { "$toDouble": "$paiddetails.amount" } } } }, 
                        ],
                        "as": "trans_details"
                    },
                },
                { "$unwind": { "path": "$trans_details", "preserveNullAndEmptyArrays": true } },
                {
                    "$lookup": {
                        "from": "students",
                        "let": { "salId": { "$toObjectId": "$student_id" } },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        $and: [
                                            { $eq: ['$_id', '$$salId'] },
                                            { $eq: ["$org_id", org_id] },
                                            { $ne: ["$status", "0"] },
                                        ],
                                    }
                                }
                            },
                        ],
                        "as": "student_details"
                    },
                },
                { $unwind: "$student_details" },
                {
                    $set: {
                        student_name: "$student_details.student_name",
                        created_by_name: "$created_by_details.admin_name",
                        student_ID: "$student_details.id",
                        hall_ticket_number: "$student_details.hall_ticket_number",
                        admission_number: "$student_details.admission_number",
                        jnanbhumi_number: "$student_details.jnanbhumi_number",
                        aadhaar_number: "$student_details.aadhaar_number",
                        ssc: "$student_details.ssc",
                        second_language: "$student_details.second_language",
                        totatamt:"$trans_details.total_amount",
                        totalold_dueamt:"$old_due_amount",
                        pending_due_amount:{$subtract:[{ "$toDouble":"$old_due_amount"}, { $ifNull: [ "$trans_details.total_amount", 0 ] }]}
                    }
                },
                { $unset: ["student_details",/* "created_by_details",*/"trans_details"] },
            ]).sort({ _id: -1 });
            response.status(statusCodes.success).json(users);
        } else {
            response.status(statusCodes.InvalidData).json({ message: "Please Give valid Organization" });
        }
    } catch (error) {
        console.log(error)
        response.status(statusCodes.SomethingWentWrong).json({message:error});
    }
}

const deleteOldstuddue = async (request, response) => {
    try {
        let delete_id = request.body.autoid;
            let deleted_by = request.body.deleted_by;
        var dateTime = request.currentDate;
        if (delete_id && delete_id != '' && deleted_by && deleted_by != '') {
            if (mongoose.isValidObjectId(delete_id)) {
                var value = await User.findOne({ _id: delete_id })
                if (value) {
                    await User.updateOne(
                        { '_id': ObjectID(delete_id) },
                        { $set: { "created_date_time": dateTime, "status": "0", "deleted_by": deleted_by } });

                    response.status(statusCodes.success).json({ message: "OldDue deleted successfully" });
                }
                else {
                    response.status(statusCodes.UserNotFound).json({ message: "OldDue ID doesn't exist" });
                }
            }
            else {
                response.status(statusCodes.InvalidData).json({ message: "Please give valid OldDue ID" });
            }
        }
        else {
            response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
        }
    } catch (error) {
        console.log(error)
        response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while deleting OldDue" });
    }
}
const uploadOldstuddue = async (request, response) => {
    try {
        request.upload(request, response, function (err) {
            if (err) {
                 //console.log(err);
                response.status(statusCodes.SomethingWentWrong).json({message: err });
            }else{
                
                let org_id = request.body.org_id;
                let created_by = request.body.created_by;
                let dateTime = request.currentDate;
                let excelfile = request.file;
               
                if (org_id && org_id != '' && created_by && created_by != '' && excelfile) {
                    let fileextension = mime.getExtension(excelfile.mimetype);
                    let exceltojson;
                    if ( fileextension == 'xlsx') {
                        exceltojson = xlsxtojson;
                    } else {
                        exceltojson = xlstojson;
                    }
                    exceltojson({
                        input: request.file.path,
                        output: null, //since we don't need output.json
                        lowerCaseHeaders: true
                    }, async function (err, result) {
                        if (err) {
                            response.status(statusCodes.SomethingWentWrong).json({message: err });
                        }else{
                            const add_olddues = [];
                            let itemsObj = [];
                            for (var i = 0; i < result.length; i++) {
                                add_olddues.push(await saveexcelolddue(result[i], created_by, org_id, dateTime))
                            }
                            itemsObj = await Promise.all(add_olddues);
                            response.status(statusCodes.success).json({ message: "Student olddues data saved successfully" });
                        }
                    });
                } else {
                    response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
                }
            }
        })
    } catch (e) {
        // console.log(e)
        response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while uploading OldDue" });
    }
}
// const checkID = (dobj) => {
//     return new Promise(async (resolve, reject) => {
//         let match = { status: { $nin: '0' } };
//         if (dobj.org_id) match['org_id'] = dobj.org_id;
//         if (dobj.student_id) match['_id'] = { $nin: dobj.student_id };
//         if (dobj.id) match['id'] = { "$regex": `^${dobj.id}$`, "$options": "i" };
//         let students = await User.find(match);
//         resolve(students)
//     })
// }
const saveexcelolddue = async (student, created_by, org_id, dateTime) => {
    return new Promise(async (resolve, reject) => {
        let dobj = { org_id: org_id, id: student?.id};
        let checkid = await checkID(dobj);  
        if (checkid.length>0) {
            let student_id = checkid[0]?._id.toString();   
            let prev_amount = 0;
            let stddue = await olddue.findOne({ "student_id": student_id, "status":"1","org_id":org_id });
            if (stddue) {
                prev_amount= stddue?.old_due_amount;
                let nowamt = (parseFloat(prev_amount) + parseFloat(student?.due_amount)).toFixed(2);
                await olddue.updateOne(
                { 'student_id': ObjectID(student_id), "status":"1" },
                { $set: { "old_due_amount": nowamt, "updated_by": created_by, "org_id": org_id, "created_date_time": dateTime } });
                await oldduelog.create({ "old_due_id": stddue._id.toString(), "student_id": student_id, "prev_amount": prev_amount, "new_amount": nowamt, "amount": student?.due_amount, "status": "1", "created_by": created_by, "org_id": org_id, "created_date_time": dateTime, "ayear_id": "0", "cyear_id": "0", "type": "U", "transaction_id": "0" });
                resolve(1);
            } else {
                let olddueidvalue = await olddue.create({ "student_id": student_id, "old_due_amount": student?.due_amount, "status": "1", "created_by": created_by, "org_id": org_id, "created_date_time": dateTime });
                await oldduelog.create({ "old_due_id": olddueidvalue._id.toString(), "student_id": student_id, "prev_amount": "0", "new_amount": student?.due_amount, "amount": student?.due_amount, "status": "1", "created_by": created_by, "org_id": org_id, "created_date_time": dateTime, "ayear_id": "0", "cyear_id": "0", "type": "N", "transaction_id": "0" });
                resolve(1);
            }
        }else{
            resolve(0); 
        }
    })
}
module.exports = { addOldstuddue, getOldstuddue, updateOldstuddue, deleteOldstuddue, uploadOldstuddue };