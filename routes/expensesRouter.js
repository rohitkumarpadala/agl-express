const express = require('express')
const router = express.Router()
var multer = require('multer')
var mime = require('mime')
var storage =multer.memoryStorage();
var upload = multer({ storage: storage });
var controller = require( '../controller/expensesController.js');
const { check, validationResult } = require("express-validator");
//customer routes
// router.post('/add',jwtverycontroller.verifyJWTUser,upload.none(),controller.add)

router.post('/addExpenses', controller.addExpenses);
router.post('/getExpenses', controller.getExpenses);
router.get('/expenseacceptance', controller.expensesAcceptance);
router.post('/changestatusvalue', controller.changestatusvalue);
router.post('/getTotalexpenses', controller.getTotalexpenses)

module.exports=router