const { constant, reject } = require('async');
let User = require('../model/branch_details-model');
var expressValidator = require('express-validator');
var ObjectID = require('mongodb').ObjectId;
let mongoose = require('mongoose');
var datevalue = require('./dateCodes.js')
const statusCodes = require("./statusCodes");
const addbranch = async (request, response) => {
    try {
        let branch_name = request.body.branch_name;
        let academic_years_value = request.body.academic_years_value;
        let org_id = request.body.org_id;
        let create_by = request.body.create_by;

        var dateTime = datevalue.currentDate();
        if (branch_name && branch_name != '' && org_id && org_id != '' && create_by && create_by != '' && academic_years_value) {
            var value = await User.findOne({ "branch_name": { "$regex": `^${branch_name}$`, "$options": "i" }, "org_id": org_id, "status": "1" })
            if (!value) {
                await User.create({ "branch_name": branch_name, "academic_years_value":academic_years_value, "status": "1", "org_id": org_id, "create_by": create_by, "created_date_time": dateTime })
                response.status(statusCodes.success).json({ message: "Branch  created Successfully" });

            } else {
                response.status(606).json({ message: "Branch name already exist" });
            }
        }
        else {
            response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
        }

    } catch (error) {

        response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while creating Branch" });
    }
}
const updatebranch = async (request, response) => {
    try {
        let branch_name = request.body.branch_name;
        let branch_id = request.body.branch_id;
        let org_id = request.body.org_id;
        let academic_years_value = request.body.academic_years_value;
        let updated_by = request.body.updated_by;
        var dateTime = datevalue.currentDate();
        let checkbranchname = await User.find(
            {

                _id: { $nin: ObjectID(branch_id) },
                "branch_name": { "$regex": `^${branch_name}$`, "$options": "i" }, "org_id": org_id, "status": "1"
            },

        );
        if (branch_name && branch_name != '' && academic_years_value && branch_id && branch_id != '' && updated_by && updated_by != '') {
            if (checkbranchname.length === 0) {
                if (mongoose.isValidObjectId(branch_id)) {
                    var value = await User.findOne({ _id: branch_id })
                    if (value) {
                        await User.updateOne(
                            { '_id': ObjectID(branch_id) },
                            { $set: { "branch_name": branch_name, "academic_years_value":academic_years_value, "updated_by": updated_by, "created_date_time": dateTime } });
                        response.status(statusCodes.success).json({ message: "Branch  updated successfully" });
                    }
                    else {
                        response.status(statusCodes.UserNotFound).json({ message: "Branch ID doesn't exist" });
                    }
                }
                else {
                    response.status(statusCodes.InvalidData).json({ message: "Please give valid Branch ID" });
                }

            }
            else {
                response.status(606).json({ message: "Branch name already exist" });
            }
        }
        else {
            response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });

        }
    } catch (error) {

        response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while updating branch" });
    }
}
const deletebranch = async (request, response) => {
    try {
        let delete_id = request.body.branch_id;
        let deleted_by = request.body.deleted_by;
        var dateTime = datevalue.currentDate();
        if (delete_id != '' && delete_id && deleted_by != '' && deleted_by) {
            if (mongoose.isValidObjectId(delete_id)) {
                var value = await User.findOne({ _id: delete_id })
                if (value) {
                    User.updateOne({ '_id': ObjectID(delete_id) },
                        { $set: { "status": "0", "deleted_by": deleted_by, "created_date_time": dateTime, } },
                        function (err, records) {
                            if (err) {
                                return false;
                            }
                        });
                    response.status(statusCodes.success).json({ message: "Branch deleted successfully" });
                }
                else {
                    response.status(statusCodes.UserNotFound).json({ message: "Branch doesn't exist" });
                }
            }
            else {
                response.status(statusCodes.InvalidData).json({ message: "Please give valid Branch" });
            }
        }
        else {
            response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
        }
    } catch (error) {
        response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while deleting Branch" });
    }
}
const getbranch = async (request, response) => {
    try {
        let org_id = request.body.org_id;
        if (mongoose.isValidObjectId(org_id)) {
            const users = await User.aggregate([
                {
                    $match: {
                        "org_id": org_id, "status": "1"
                    }
                }, {
                    "$lookup": {
                        "from": "securities",
                        "let": { "salId": { "$toObjectId": "$create_by" } },
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

                },
                { $unwind: "$createdbyname" },
                {
                    $set: {

                        created_by_name: "$createdbyname.admin_name"
                    },

                }]).sort({ _id: -1 });
            response.status(statusCodes.success).json(users);
        }
        else {
            response.status(statusCodes.InvalidData).json({ message: "Please Give valid Organization" });
        }
    } catch (error) {
        response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while getting Branch" });
    }
}

module.exports = { addbranch, deletebranch, getbranch, updatebranch };