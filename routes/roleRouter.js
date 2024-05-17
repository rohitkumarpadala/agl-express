const express = require('express')
const router = express.Router()
var multer = require('multer')
var mime = require('mime')
var storage =multer.memoryStorage();
var upload = multer({ storage: storage });
var controller = require( '../controller/roleController.js');
const { check, validationResult } = require("express-validator");
//customer routes
// router.post('/add',jwtverycontroller.verifyJWTUser,upload.none(),controller.add)

router.post('/addRole', controller.addRole);
router.post('/getRole', controller.getRole);
router.post('/deleteRole', controller.deleteRole);
router.post('/updateRole', controller.updateRole);
module.exports=router