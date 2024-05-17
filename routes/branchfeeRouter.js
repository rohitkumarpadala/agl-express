const express = require('express')
const router = express.Router()
var multer = require('multer')
var mime = require('mime')
var storage =multer.memoryStorage();
var upload = multer({ storage: storage });
var controller = require( '../controller/branchfeeController.js');
const { check, validationResult } = require("express-validator");
//customer routes
// router.post('/add',jwtverycontroller.verifyJWTUser,upload.none(),controller.add)

router.post('/addbranchFee', controller.addBranchFee);
router.post('/updateBranchFee', controller.updateBranchFee);
router.post('/getBranchFee', controller.getBranchFee);
router.post('/deleteBranchFee', controller.deleteBranchFee);
module.exports=router