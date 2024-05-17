const express = require('express')
const router = express.Router()
var multer = require('multer')
var mime = require('mime')
var storage =multer.memoryStorage();
var upload = multer({ storage: storage });
var controller = require( '../controller/basemenuController.js');
const { check, validationResult } = require("express-validator");
//customer routes
// router.post('/add',jwtverycontroller.verifyJWTUser,upload.none(),controller.add)

router.post('/addbasemenu', controller.addbasemenu);
router.post('/getbasemenu', controller.getbasemenu);
router.post('/deletebasemenu', controller.deletebasemenu);
router.post('/updatebasemenu', controller.updatebasemenu);
module.exports=router