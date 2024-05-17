const { constant, reject } = require('async');
let User = require('../model/staffdepartment-model.js')
var expressValidator = require('express-validator');
let mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectId;
var dep = require('../model/department-model');

var datevalue = require('./dateCodes.js')
const statusCodes = require("./statusCodes");
const addStaffdep = async (request, response) => {
    try {
        let staff_id = request.body.staff_id;
        let dep_id = request.body.dep_id;
        let org_id = request.body.org_id;

        let created_by = request.body.created_by;
        var dateTime = datevalue.currentDate();

        if (mongoose.isValidObjectId(staff_id) && mongoose.isValidObjectId(dep_id)) {
            if (staff_id && staff_id != '' && dep_id && dep_id != '' && org_id && org_id != '' && created_by && created_by != '') {
                var value = await User.findOne({ "dep_id": dep_id, "org_id": org_id, "status": "1", "staff_id": staff_id })
                if (!value) {
                    await User.create({ "staff_id": staff_id, "dep_id": dep_id, "status": "1", "org_id": org_id, "created_by": created_by, "created_date_time": dateTime });
                    response.status(statusCodes.success).json({ message: "Staff allocation for the department was created successfully" });
                } else {
                    response.status(statusCodes.Dataexists).json({ message: "Department already allocated to the staff" });
                }
            }
            else {
                response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });

            }
        }
        else {
            response.status(statusCodes.InvalidData).json({ message: "Please Give valid Department for Staff" });
        }
    } catch (error) {
        response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while creating department for staff" });
    }
}
const deletestaffdepDetails = async (request, response) => {
    try {
        let delete_id = request.body.alloc_id;
        var deleted_by = request.body.deleted_by;
        var dateTime = datevalue.currentDate();
        if (delete_id && delete_id != '' && deleted_by && deleted_by != '') {
            if (mongoose.isValidObjectId(delete_id)) {

                var value = await User.findOne({ _id: delete_id })
                if (value) {
                    await User.updateOne(
                        { '_id': ObjectID(delete_id) },
                        { $set: { "status": "0", "deleted_by": deleted_by, "created_date_time": dateTime } });
                    response.status(statusCodes.success).json({ message: "Staff allocation for the department was deleted successfully" });
                }
                else {
                    response.status(statusCodes.UserNotFound).json({ message: "Department for Staff doesn't exist" });
                }
            }
            else {
                response.status(statusCodes.InvalidData).json({ message: "Please Give valid Department for Staff" });
            }
        }
        else {
            response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });
        }
    } catch (error) {
        response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while deleting Department for Staff Allocating" });
    }
}
const updateStaffdep = async (request, response) => {
    try {
        let alloc_id = request.body.alloc_id;
        let staff_id = request.body.staff_id;
        let dep_id = request.body.dep_id;
        let org_id = request.body.org_id;
        var updated_by = request.body.updated_by;
        var dateTime = datevalue.currentDate();
        let checkdepname = await User.find(
            {
                _id: { $nin: ObjectID(alloc_id) },
                "dep_id": dep_id, "staff_id": staff_id, "org_id": org_id, "status": "1"
            },

        );
        if (alloc_id && alloc_id != '' && staff_id && staff_id != '' && dep_id && dep_id != '' && updated_by && updated_by != '') {
            if (checkdepname.length === 0) {
                if (mongoose.isValidObjectId(alloc_id)) {
                    var value = await User.findOne({ _id: alloc_id })
                    if (value) {
                        await User.updateOne(
                            { '_id': ObjectID(alloc_id) },
                            { $set: { "staff_id": staff_id, "dep_id": dep_id, "updated_by": updated_by, "created_date_time": dateTime } });
                        response.status(statusCodes.success).json({ message: "Staff allocation for the department was updated successfully" });
                    }
                    else {
                        response.status(statusCodes.UserNotFound).json({ message: "Department for Staff doesn't exist" });
                    }
                }
                else {
                    response.status(statusCodes.InvalidData).json({ message: "Please Give valid Department for Staff" });
                }
            } else {
                response.status(statusCodes.Dataexists).json({ message: "Department already allocated to the staff" });
            }
        }
        else {
            response.status(statusCodes.ProvideAllFields).json({ message: "Please fill all mandatory fields" });

        }
    } catch (error) {
        console.log(error)
        response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while updating department for staff" });
    }
}
const getStaffdep = async (request, response) => {
    try {
        let org_id = request.body.org_id;
        if (mongoose.isValidObjectId(org_id)) {
            let userdetail = await User.aggregate([
                {
                    $match: {
                        org_id: org_id
                    }
                }, {
                    "$lookup": {
                        "from": "securities",
                        "let": { "salId": { "$toObjectId": "$staff_id" } },
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
                        "as": "username"
                    }


                }, { $unset: "username.admin_password" },

                {
                    "$lookup": {
                        "from": "departments",
                        "let": { "salId": { "$toObjectId": "$dep_id" } },
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
                        "as": "departmentname"
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

                }, {
                    $set: {
                        dep_name: "$departmentname.dep_name",
                        staff_name: "$username.admin_name",
                        created_by_name: "$createdbyname.admin_name"
                    }
                },
                { $unset: ["username", "departmentname", "createdbyname"] },
            ]).sort({ _id: -1 })

            response.status(statusCodes.success).json(userdetail);
        }
        else {
            response.status(statusCodes.InvalidData).json({ message: "Please Give valid Organization ID" });
        }
    } catch (error) {
        response.status(statusCodes.SomethingWentWrong).json({ message: "Problem occurred while getting department for staff" })
    }
}

module.exports = { addStaffdep, deletestaffdepDetails, getStaffdep, updateStaffdep };