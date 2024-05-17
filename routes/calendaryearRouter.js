const express = require('express')
const router = express.Router()
var multer = require('multer')
var mime = require('mime')
var storage =multer.memoryStorage();
var upload = multer({ storage: storage });
var controller = require( '../controller/calendaryearController.js');
const { check, validationResult } = require("express-validator");
//customer routes
// router.post('/add',jwtverycontroller.verifyJWTUser,upload.none(),controller.add)

router.post('/addcalendaryear', controller.addcalendaryear);
router.post('/getcalendaryear', controller.getcalendaryear);
router.post('/deletecalendaryear', controller.deletecalendaryear);
router.post('/updatecalendaryear', controller.updatecalendaryear);
module.exports=router