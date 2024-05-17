const express = require('express')
const router = express.Router()
var multer = require('multer')
var mime = require('mime')
var storage =multer.memoryStorage();
var upload = multer({ storage: storage });
var controller = require( '../controller/feeController.js');
const { check, validationResult } = require("express-validator");
//customer routes
// router.post('/add',jwtverycontroller.verifyJWTUser,upload.none(),controller.add)

router.post('/addFee',  controller.addFee);
router.post('/updateFee', controller.updateFee);
router.post('/getFee', controller.getFee);
router.post('/deleteFee',controller.deletefee);
router.post('/updateaccessStatus',controller.updateaccessStatus);
module.exports=router