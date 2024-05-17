const express = require('express')
const router = express.Router()
var multer = require('multer')
var mime = require('mime')
var storage =multer.memoryStorage();
var upload = multer({ storage: storage });
var controller = require( '../controller/concessionController.js');
const { check, validationResult } = require("express-validator");
//customer routes
// router.post('/add',jwtverycontroller.verifyJWTUser,upload.none(),controller.add)

router.post('/addconcession',controller.addconcession);
router.post('/addstudentconcession',controller.addstudentconcession);
router.post('/getconcession',controller.getconcession);
router.post('/updateconcession',controller.updateconcession);
router.post('/updateconcessionName',controller.updateconcessionName);
router.post('/deleteconcession',controller.deleteconcession);
router.post('/getstudconcession',controller.getstudconcession);
router.post('/updatestudconcession',controller.updatestudconcession);
router.post('/deletestudconcession',controller.deletestudconcession);
module.exports=router