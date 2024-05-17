const express = require('express')
const router = express.Router()
var multer = require('multer')
var mime = require('mime')
var storage =multer.memoryStorage();
var upload = multer({ storage: storage });
var controller = require( '../controller/academicyearController.js');
const { check, validationResult } = require("express-validator");
//customer routes
// router.post('/add',jwtverycontroller.verifyJWTUser,upload.none(),controller.add)

router.post('/addacademicyear', controller.addacademicyear);
router.post('/getacademicyear', controller.getacademicyear);
router.post('/deleteacademicyear', controller.deleteacademicyear);
router.post('/updateacademicyear', controller.updateacademicyear);
module.exports=router