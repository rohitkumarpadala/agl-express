const express = require('express')
const router = express.Router()
var multer = require('multer')
var mime = require('mime')
var storage =multer.memoryStorage();
var upload = multer({ storage: storage });
var controller = require( '../controller/orgController.js');
const { check, validationResult } = require("express-validator");
router.post('/addOrg', controller.addOrg);
router.post('/updateOrg', controller.updateOrg);
router.post('/getorg', controller.getorg);
router.post('/updateorgstatus', controller.updateorgstatus);
router.post('/migrateDb', controller.migrateDb);
module.exports=router