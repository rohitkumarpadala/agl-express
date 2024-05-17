const express = require('express')
const router = express.Router()
var multer = require('multer')
var mime = require('mime')
var storage =multer.memoryStorage();
var upload = multer({ storage: storage });
var controller = require( '../controller/studentController.js');
const { check, validationResult } = require("express-validator");
//customer routes
// router.post('/add',jwtverycontroller.verifyJWTUser,upload.none(),controller.add)

router.post('/addStudent',controller.addStud);
router.post('/updatestud', controller.updatestud);
router.post('/getStudent', controller.getStud);
router.post('/relieveStudents', controller.relieveStudents);

router.post('/deleteStudent', controller.deletestudDetails);
router.post('/allocatebranchTostudent', controller.allocatebranchTostudent);
router.post('/uploadallocatebranchTostudent', controller.uploadallocatebranchTostudent);
router.post('/getbranchStudents', controller.getbranchStudents);

router.post('/promotestudent', controller.promotestudent);
router.post('/editmobilenumber', controller.editmobilenumber);
router.post('/uploadexcel', controller.uploadexcel);
module.exports=router