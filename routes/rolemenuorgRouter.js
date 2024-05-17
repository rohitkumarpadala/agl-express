const express = require('express')
const router = express.Router()
var multer = require('multer')
var mime = require('mime')
var storage =multer.memoryStorage();
var upload = multer({ storage: storage });
var controller = require( '../controller/rolemenuorgController.js');
const { check, validationResult } = require("express-validator");
//customer routes
// router.post('/add',jwtverycontroller.verifyJWTUser,upload.none(),controller.add)

router.post('/addrolemenuorg', controller.addrolemenuorg);
router.post('/getrolemenuorg', controller.getrolemenuorg);
router.post('/deleterolemenuorg', controller.deleterolemenuorg);
router.post('/dashboardbutton', controller.dashboardbutton);
module.exports=router