const express = require('express')
const router = express.Router()
var multer = require('multer')
var mime = require('mime')
var storage =multer.memoryStorage();
var upload = multer({ storage: storage });
var controller = require( '../controller/staffDepartmentController.js');
const { check, validationResult } = require("express-validator");
//customer routes
// router.post('/add',jwtverycontroller.verifyJWTUser,upload.none(),controller.add)

router.post('/addStaffdep', controller.addStaffdep);
  router.post('/deletestaffdepDetails', controller.deletestaffdepDetails);
  router.post('/getStaffdep', controller.getStaffdep);
  router.post('/updateStaffdep', controller.updateStaffdep);
module.exports=router