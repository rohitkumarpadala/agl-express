const express = require('express')
const router = express.Router()
var multer = require('multer')
var mime = require('mime')
var storage = multer.memoryStorage();
// var upload = multer({ dest: './uploads'});
var upload = multer({ storage: storage });
 var controllers = require( '../controller/securitiesController.js');
 const { check, validationResult } = require("express-validator");
//customer routes
// router.post('/add',jwtverycontroller.verifyJWTUser,upload.none(),controller.add)
router.post('/loginuser', controllers.loginUser);
router.post('/addUser', controllers.addUser);
router.post('/updateUser', controllers.updateUser);
router.post('/editUserstatus', controllers.editUserstatus);//counter access control
router.post('/deleteUser', controllers.deleteUser);
router.post('/changepassword', controllers.changepassword);
router.post('/getUser', controllers.getUser);
router.post('/getsuperadmin', controllers.getsuperadmin);
router.post('/getvaluedetail', controllers.getvaluedetail);
router.post('/profileupload',upload.single('file') ,controllers.profileupload);
router.post('/getimage',controllers.getimage);

module.exports=router