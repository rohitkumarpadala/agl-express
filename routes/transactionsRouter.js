const express = require('express')
const router = express.Router()
var multer = require('multer')
var mime = require('mime')
var storage =multer.memoryStorage();
var upload = multer({ storage: storage });
var controller = require( '../controller/transactionsController.js');
const { check, validationResult } = require("express-validator");
//customer routes
// router.post('/add',jwtverycontroller.verifyJWTUser,upload.none(),controller.add)

router.post('/addTransaction', controller.addTransaction);
router.post('/getTransaction', controller.getTransaction);
router.post('/addmanualbillTransaction', controller.addmanualbillTransaction);
router.post('/updatemanualbillTransaction', controller.updatemanualbillTransaction);
router.post('/updateTransaction', controller.updateTransaction);
router.post('/getfinalamtstudent', controller.getfinalamtstudent);
router.post('/settlestudent', controller.settlestudent);
router.post('/finalamtsettlement', controller.finalamtsettlement);
router.post('/deleteTransaction', controller.deleteTransaction);
router.post('/getbilldetails',controller.getbilldetails)
router.post('/getdatevaluesforeditbills',controller.getdatevaluesforeditbills)
router.post('/getStudamtdetails', controller.getStudamtdetails);
router.post('/getrelievestudentdetails', controller.getrelievestudentdetails);
router.post('/closefortheday', controller.closefortheday);
//reports
router.post('/getStudFeedetails', controller.getStudFeedetails);
router.post('/getStudTransactiondetails', controller.getStudTransactiondetails);
router.post('/OverAllReport', controller.OverAllReport);
router.post('/DayWiseTotals', controller.DayWiseTotals);
router.post('/FeeWiseTotals', controller.FeeWiseTotals);
router.post('/DateAndFeeWiseTotals', controller.DateAndFeeWiseTotals);
router.post('/CounterDayWiseTotals', controller.CounterDayWiseTotals);
router.post('/TransactionsReport', controller.TransactionsReport);
router.post('/DayBookReport', controller.DayBookReport);
router.post('/expenseReport', controller.expenseReport);
router.post('/settlementreport', controller.settlementreport);
router.post('/logreport', controller.logreport);
router.post('/pendingOldDueReport', controller.pendingOldDueReport);
router.post('/cashInHand', controller.cashInHand);
router.post('/getrelievestudentdashboarddetails', controller.getrelievestudentdashboarddetails);
router.post('/getdatevalue', controller.getdatevalue);
router.post('/getdayvalue', controller.getdayvalue);
router.post('/Totalamountvalue', controller.Totalamountvalue);
router.post('/cummulativereport', controller.cummulativereport);
router.post('/getduebill', controller.getduebill);
router.post('/dashboardvalue', controller.dashboardvalue);
router.post('/GetOlduesLogs', controller.GetOlduesLogs);

module.exports=router