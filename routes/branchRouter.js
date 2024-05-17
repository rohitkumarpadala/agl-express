const express = require('express')
const router = express.Router()
var multer = require('multer')
var mime = require('mime')
var storage =multer.memoryStorage();
var upload = multer({ storage: storage });
var controller = require( '../controller/branchController.js');
const { check, validationResult } = require("express-validator");
//customer routes
// router.post('/add',jwtverycontroller.verifyJWTUser,upload.none(),controller.add)

router.post('/addbranch', controller.addbranch);
router.post('/deletebranch', controller.deletebranch);
router.post('/getbranch', controller.getbranch);
router.post('/updatebranch', controller.updatebranch);
module.exports=router