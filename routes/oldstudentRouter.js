const express = require('express')
const router = express.Router()
var multer = require('multer')
var mime = require('mime')
var storage =multer.memoryStorage();
var upload = multer({ storage: storage });
var controller = require( '../controller/oldstudentController.js');
const { check, validationResult } = require("express-validator");
//customer routes
// router.post('/add',jwtverycontroller.verifyJWTUser,upload.none(),controller.add)

router.post('/addOldstuddue', controller.addOldstuddue);
router.post('/getOldstuddue', controller.getOldstuddue);
router.post('/updateOldstuddue', controller.updateOldstuddue);
router.post('/deleteOldstuddue', controller.deleteOldstuddue);
router.post('/uploadOldstuddue',  controller.uploadOldstuddue);
module.exports=router