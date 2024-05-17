const express = require('express')
const router = express.Router()
var multer = require('multer')
var mime = require('mime')
var storage =multer.memoryStorage();
var upload = multer({ storage: storage });
var controller = require( '../controller/departmentController.js');
const { check, validationResult } = require("express-validator");
//customer routes
// router.post('/add',jwtverycontroller.verifyJWTUser,upload.none(),controller.add)

router.post('/adddep', controller.adddep);
router.post('/deletedepDetails', controller.deletedepDetails);
router.post('/getdep', controller.getdep);
router.post('/updatedep', controller.updatedep);
module.exports=router