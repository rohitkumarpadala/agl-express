const { constant, reject } = require("async");
let studentinfo = require("../model/student-model.js");
let transaction = require("../model/transactions-model");
let branchfee = require("../model/branchfee_details-model");
let subfee = require("../model/sub_fee_details-model");
var ObjectID = require("mongodb").ObjectId;
const { adddueamtJob, getdueamtJobs } = require("./background_jobs");
let studentconcession = require("../model/student_concession-model");
let allocstudent = require("../model/allocate_student_branch-model");
let mongoose = require("mongoose");
var datevalue = require("./dateCodes.js");
const statusCodes = require("./statusCodes");
const { updateOne } = require("../model/student-model.js");
const user = require("../model/securities-model.js");
let olddue = require("../model/old_student-model.js");
let oldduelog = require("../model/old_student_logs-model");
let fee = require("../model/fee_details-model");
const ObjectId = require("mongoose").Types.ObjectId;
const {
  getCurrentCalendarYearIDByOrgId,
  getCurrentCalendarYearIDByOrgIdForBranchAssigning,
  getStudentByIDOrgId,
} = require("./commonfunction.js");
let closetoday = require("../model/closefortheday-model");
let expenses = require("../model/expenses-model");
let log = require("../model/transaction_logs-model");
let duebill = require("../model/due_bill-model");
let cyear = require("../model/calendar_years-model");
function addLeadingZeros(num, totalLength) {
  return String(num).padStart(totalLength, "0");
}
const Datevalue = (date) => {
  var current_date =
    date.getFullYear() +
    "-" +
    addLeadingZeros(date.getMonth() + 1, 2) +
    "-" +
    addLeadingZeros(date.getDate(), 2);
  return current_date;
};

const settlestudent = async (request, response) => {
  try {
    let student_id_value = request.body.student_id;
    let status = request.body.status;
    if (student_id_value && status) {
      let value = await getfinalsettlestudentdetails(student_id_value, status);
      response.status(statusCodes.success).json(value);
    } else {
      response
        .status(statusCodes.ProvideAllFields)
        .json({ message: "Please fill all mandatory fields" });
    }
  } catch (e) {
    response
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while transaction" });
  }
};

const finalamtsettlement = async (request, response) => {
  //var value = JSON.parse(request.body);
  try {
    var dateTime = request.currentDate;
    //if (value.length > 0) {
    var value = request.body;
    var amount = value.amount;
    var student_id = value.student_id;
    var cash = value.cash;
    var upi = value.upi;
    var bank = value.bank;
    var payment_method = value.payment_method;
    var created_by = value.created_by;
    var transaction_type = value.transaction_type;
    var bill_type = value.bill_type;
    var org_id = value.org_id;
    var due_amount = value.due_amount;

    let calendar_years_id = await getCurrentCalendarYearIDByOrgId(org_id);
    if (calendar_years_id) {
      let allocvalue = await allocstudent.findOne({
        student_id: student_id,
        calendar_years_id: calendar_years_id,
        status: "1",
      });
      if (allocvalue) {
        var branch_id = allocvalue.branch_id;
        var academic_years_id = allocvalue.academic_years_id;
      } else {
        response
          .status(statusCodes.InvalidData)
          .json({ message: "Please allocate the student to branch first" });
        return;
      }
      let totamt = (
        parseFloat(upi) +
        parseFloat(bank) +
        parseFloat(cash)
      ).toFixed(2);
      if (parseFloat(amount) != parseFloat(totamt)) {
        response
          .status(statusCodes.InvalidData)
          .json({ message: "Amounts are not matching" });
        return;
      }
      if (parseFloat(amount) > parseFloat(due_amount)) {
        response
          .status(statusCodes.InvalidData)
          .json({ message: "Please give valid amount " });
        return;
      }
      if (
        amount &&
        amount != 0 &&
        student_id &&
        student_id != "" &&
        payment_method &&
        payment_method != "" &&
        org_id &&
        org_id != ""
      ) {
        const tranvalue = await transaction
          .find()
          .sort({ transactionidvalue: -1 })
          .limit(1);

        let present_date = dateTime.split(" ")[0];
        let todaydate = present_date.replace(/-/g, "");
        let transactionidvalue = 1;
        let billno;
        if (tranvalue.length == 0) {
          billno = todaydate + addLeadingZeros(transactionidvalue, 3);
        } else {
          transactionidvalue = parseInt(tranvalue[0].transactionidvalue) + 1;
          billno = tranvalue[0].bill_number;
          let date = tranvalue[0]?.created_date_time_value ?? dateTime;
          let date1 = date.split(" ")[0];
          let date2 = date1.replace(/-/g, "");
          if (date2 == todaydate) {
            billno = parseInt(billno) + 1;
            // billno = todaydate + addLeadingZeros(transactionidvalue, 3);
          } else {
            billno = todaydate + addLeadingZeros(1, 3);
          }
        }
        let transaction_number =
          "STDTRNS" + addLeadingZeros(transactionidvalue, 5);
        var objvalue = {};
        let array = [];

        objvalue["tot_amt"] = parseFloat(amount).toFixed(2);
        objvalue["bill_number"] = billno;
        // objvalue['transaction_number'] = transaction_number;
        objvalue["transactionidvalue"] = transactionidvalue;
        objvalue["created_date_time_value"] = dateTime;
        // objvalue['totamt']=totamt;
        const date = dateTime.split(" ")[0];
        let itemObj = {
          student_id: student_id,
          sub_fee_id: "0",
          branch_id: branch_id,
          payment_method: payment_method,
          amount: amount,
          cash: cash,
          bank: bank,
          upi: upi,
          bill_type: bill_type,
          status: "2",
          transaction_type: transaction_type,
          created_by: created_by,
          org_id: org_id,
          created_date_time: dateTime,
          academic_years_id: academic_years_id,
          calendar_years_id: calendar_years_id,
          date: date,
        };
        array.push(itemObj);
        objvalue["paiddetails"] = array;

        let value = await transaction.create(objvalue);
        if (value) {
          await addTransactionnumber(value);
        }

        await studentinfo.updateOne(
          { _id: ObjectID(student_id) },
          { $set: { status: "3" } }
        );
        await allocstudent.updateOne(
          {
            student_id: student_id,
            calendar_years_id: calendar_years_id,
            status: "1",
            academic_years_id: academic_years_id,
          },
          { $set: { status: "0" } }
        );
        response
          .status(statusCodes.success)
          .json({
            message: "Transaction created successfully",
            bill_number: value?.bill_number,
          });
      } else {
        response
          .status(statusCodes.ProvideAllFields)
          .json({ message: "Please provide all mandatory fields" });
      }
    } else {
      response
        .status(statusCodes.InvalidData)
        .json({ message: "No active calender year" });
    }
  } catch (error) {
    response
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while transaction" });
  }
};
const getdatevaluesforeditbills = async (request, response) => {
  try {
    let from_date = request.body.fromdate;
    let to_date = request.body.todate;
    if (from_date == to_date) {
      to_date = new Date(request.body.todate).toISOString();
      from_date = new Date(request.body.todate).toISOString();
    } else {
      to_date = new Date(request.body.todate).toISOString();
      from_date = new Date(request.body.fromdate).toISOString();
    }
    let paid_details = await transaction.aggregate([
      { $unwind: "$paiddetails" },
      {
        $match: {
          "paiddetails.created_date_time": {
            $gte: from_date,
            $lte: to_date,
          },
        },
      },
    ]);

    let itemsObj = [];
    let obj = {};
    for (let i = 0; i < paid_details.length; i++) {
      let sub_fee_id = paid_details[i]?.paiddetails.sub_fee_id;
      let student_id = paid_details[i]?.paiddetails.student_id;
      let created_by = paid_details[i]?.paiddetails.created_by;
      let student_details = await getStudentByIDOrgId(student_id);

      let subfeedetail = await getFeedetaisbyID(sub_fee_id);
      let createddetails = await getuserdetils(created_by);
      obj = paid_details[i]?.paiddetails;
      obj["created_by_name"] = createddetails?.admin_name;
      obj["bill_number"] = paid_details[i]?.bill_number;
      obj["student_name"] = student_details?.student_name;
      obj["student_id"] = student_details?.id;
      obj["sub_fee_name"] = subfeedetail[0].sub_fee_type;
      obj["fee_name"] = subfeedetail[0].fee_type;
      itemsObj.push(obj);
    }
    response.status(statusCodes.success).json(itemsObj);
  } catch (error) {
    response.status(404).json({ message: error.message });
  }
};
const addTransaction = async (request, response) => {
  try {
    if (
      request.body.org_id &&
      request.body.student_id &&
      request.body.payment_method &&
      request.body.transaction_type &&
      request.body.bill_type &&
      request.body.created_by
    ) {
      if (request.body.transaction && request.body.transaction.length > 0) {
        const org_id = request.body.org_id;
        const student_id = request.body.student_id;
        const created_by = request.body.created_by;
        const dateTime = request.currentDate;

        let calendar_year = await getStudentByIDOrgId(student_id, org_id);

        calendar_year = 20 + calendar_year.id.split("-")[0];
        //  console.log(calendar_year);

        const calendar_years_id =
          await getCurrentCalendarYearIDByOrgIdForBranchAssigning(
            org_id,
            calendar_year
          );
        const transactions = request.body.transaction;
        const total_amount = transactions
          .map(({ amount }) => parseFloat(amount))
          .reduce((a, b) => a + b, 0)
          .toFixed(2);
        const payment_method = request.body.payment_method;
        const transaction_type = request.body.transaction_type;
        const bill_type = request.body.bill_type;
        if (calendar_years_id) {
          let allocvalue = await allocstudent.findOne({
            student_id: student_id,
            status: "1",
            calendar_years_id: calendar_years_id,
          });

          if (allocvalue) {
            let academic_years_id = allocvalue.academic_years_id;
            let branch_id = allocvalue.branch_id;
            const fees_details = [];
            let itemsObj = [];
            for (let i = 0; i < transactions.length; i++) {
              let item = transactions[i];
              let sub_fee_id = item.sub_fee_id;
              let amountv = parseFloat(item.amount).toFixed(2);
              let cash = parseFloat(item.cash).toFixed(2);
              let upi = parseFloat(item.upi).toFixed(2);
              let bank = parseFloat(item.bank).toFixed(2);
              fees_details.push(
                checkandsavefee(
                  sub_fee_id,
                  amountv,
                  student_id,
                  cash,
                  upi,
                  bank,
                  payment_method,
                  created_by,
                  transaction_type,
                  bill_type,
                  org_id,
                  calendar_years_id,
                  academic_years_id,
                  branch_id,
                  dateTime
                )
              );
            }
            itemsObj = await Promise.all(fees_details);
            if (itemsObj.includes("false5")) {
              response
                .status(statusCodes.Dataexists)
                .json({ message: "Amount exceeds" });
            } else if (itemsObj.includes("false4")) {
              response
                .status(statusCodes.ProvideAllFields)
                .json({ message: "Please allocate student first" });
            } else if (itemsObj.includes("false1")) {
              response
                .status(statusCodes.ProvideAllFields)
                .json({ message: "Please fill all mandatory fields" });
            } else if (itemsObj.includes("false")) {
              response
                .status(statusCodes.Dataexists)
                .json({ message: "Transaction amount exceeds" });
            } else if (itemsObj.length == 0) {
              response
                .status(statusCodes.SomethingWentWrong)
                .json({ message: "Problem occurred while transaction" });
            } else {
              const tranvalue = await transaction
                .find()
                .sort({ transactionidvalue: -1 })
                .limit(1);

              let present_date = dateTime.split(" ")[0];
              let todaydate = present_date.replace(/-/g, "");
              let transactionidvalue = 1;
              let billno;
              if (tranvalue.length == 0) {
                billno = todaydate + addLeadingZeros(transactionidvalue, 3);
              } else {
                transactionidvalue =
                  parseInt(tranvalue[0].transactionidvalue) + 1;
                billno = tranvalue[0].bill_number;
                let date = tranvalue[0]?.created_date_time_value ?? dateTime;
                let date1 = date.split(" ")[0];
                let date2 = date1.replace(/-/g, "");
                if (date2 == todaydate) {
                  billno = parseInt(billno) + 1;
                  // billno = todaydate + addLeadingZeros(transactionidvalue, 3);
                } else {
                  billno = todaydate + addLeadingZeros(1, 3);
                }
              }
              // let transaction_number = 'STDTRNS' + addLeadingZeros(transactionidvalue, 5);

              let objvalue = {};
              objvalue["tot_amt"] = total_amount;
              objvalue["bill_number"] = billno;
              // objvalue['transaction_number'] = transaction_number;
              objvalue["transactionidvalue"] = transactionidvalue;
              objvalue["created_date_time_value"] = dateTime;
              // objvalue['totamt']=totamt;
              objvalue["paiddetails"] = itemsObj;
              let value = await transaction.create(objvalue);
              if (value) {
                await addTransactionnumber(value);
              }

              let dueamt = await getdueamtdetails(student_id, "1");
              if (dueamt) {
                let duebillvalue = await duebill.findOne({
                  bill_number: billno,
                  org_id: org_id,
                });
                if (!duebillvalue) {
                  for (var i = 0; i < dueamt.length; i++) {
                    let subfeeid = dueamt[i].sub_fee_id;
                    let due_amount = dueamt[i].due_amount;
                    if (parseFloat(due_amount) > 0) {
                      await duebill.create({
                        org_id: org_id,
                        bill_number: billno,
                        sub_fee_id: subfeeid,
                        due_amount: due_amount,
                        created_date_time: dateTime,
                        status: "1",
                      });
                    } //  await duebill.updateMany({"org_id": org_id, "bill_number": billno},
                    //  { $set: { "sub_fee_id": subfeeid, "due_amount": due_amount} },
                    // )
                  }
                }
              }
              response
                .status(statusCodes.success)
                .json({
                  message: "Transaction created successfully",
                  bill_number: value?.bill_number,
                });
            }
          } else {
            response
              .status(statusCodes.InvalidData)
              .json({ message: "Please allocate the student to branch first" });
          }
        } else {
          response
            .status(statusCodes.ProvideAllFields)
            .json({ message: "Please provide atleast a subfee" });
        }
      } else {
        response
          .status(statusCodes.InvalidData)
          .json({ message: "No active calender year" });
      }
    } else {
      response
        .status(statusCodes.ProvideAllFields)
        .json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {
    console.log(error);
    response
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while transaction" });
  }
};
const addTransactionnumber = (reqdata) => {
  return new Promise(async (resolve, reject) => {
    // let transvalue1 =await transaction.aggregate([unwind, {
    //   $group: {
    //     _id: null,
    //     // max: {
    //     //   $ifNull: [{$max: "$paiddetails.transaction_id"},0]
    //     // }
    //     max: {
    //       $max: "$paiddetails.transaction_id"
    //     }
    //   }
    // }])
    // console.log(transvalue1)

    const updateDocument = async (resObj) => {
      let unwind = { $unwind: "$paiddetails" };
      let tranvalue = await transaction
        .aggregate([unwind])
        .sort({ "paiddetails.transaction_id": -1 })
        .limit(1);
      let transaction_id = 1;
      if (tranvalue.length > 0) {
        let tran_id = tranvalue[0]?.paiddetails?.transaction_id ?? 0;
        transaction_id = parseInt(tran_id) + 1;
      }
      let tran_id = resObj._id;
      let transaction_number = "STDTRNS" + addLeadingZeros(transaction_id, 5);
      await transaction.updateOne(
        { "paiddetails._id": tran_id },
        {
          $set: {
            "paiddetails.$.transaction_id": transaction_id,
            "paiddetails.$.transaction_number": transaction_number,
          },
        }
      );
      // transaction_id ++;
    };
    let paiddetails = reqdata.paiddetails;
    let promises = [];
    for (let i = 0; i < paiddetails.length; i++) {
      let val = paiddetails[i];
      promises.push(await updateDocument(val));
    }
    await Promise.all(promises);
    resolve(1);
  });
};
const getbilldetails = async (request, response) => {
  try {
    let due_details = [];

    let bill_number = request.body.bill_number;
    let match = {};
    let org_id = request.body.org_id;
    if (org_id) match["paiddetails.org_id"] = org_id;
    if (bill_number) match["bill_number"] = bill_number;
    let unwind = { $unwind: "$paiddetails" };
    let billdetails = await transaction.aggregate([unwind, { $match: match }]);

    if (billdetails.length > 0) {
      let value_details = [];
      for (let i = 0; i < billdetails.length; i++) {
        if (billdetails[i].paiddetails.sub_fee_id !== "0") {
          due_details.push(await getpaidamt(billdetails[i].paiddetails));
        }
      }

      value_details = await Promise.all(due_details);

      let dueobj = {};
      let student_details = await getStudentByIDOrgId(
        billdetails[0]?.paiddetails?.student_id
      );

      let studentname = student_details?.student_name;
      let student_id = student_details?.id;

      dueobj["studentname"] = studentname;
      dueobj["student_id"] = student_id;
      dueobj["date"] = billdetails[0]?.paiddetails.date;
      dueobj["bill_number"] = billdetails[0]?.bill_number;
      dueobj["total_paid_amt"] = billdetails[0]?.tot_amt;

      if (value_details.length > 0) {
        dueobj["trans_values"] = value_details;
        if (billdetails[0]?.paiddetails?.transaction_type == "N") {
          let dueamt = await getdueamtdetails(
            billdetails[0]?.paiddetails?.student_id,
            student_details?.status
          );

          dueobj["due_details"] = dueamt;
          let totaldueamt = 0.0;
          for (let i = 0; i < dueamt.length; i++) {
            totaldueamt =
              parseFloat(totaldueamt) + parseFloat(dueamt[i].due_amount);
          }
          dueobj["total_due_amt"] = totaldueamt.toFixed(2);
        }
      } else {
        dueobj["trans_values"] = [];
      }

      response.status(statusCodes.success).json(dueobj);
    } else {
      response
        .status(statusCodes.UserNotFound)
        .json({ message: "no valid transacation details available" });
    }
  } catch (e) {
    response
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while getting transaction details" });
  }
};
const addmanualbillTransaction = async (request, response) => {
  try {
    if (
      request.body.org_id &&
      request.body.id &&
      request.body.student_name &&
      request.body.payment_method &&
      request.body.transaction_type &&
      request.body.transaction_type === "M" &&
      request.body.bill_type &&
      request.body.created_by
    ) {
      let org_id = request.body.org_id;
      const calendar_years_id = await getCurrentCalendarYearIDByOrgId(org_id);
      if (calendar_years_id) {
        if (request.body.transaction && request.body.transaction.length > 0) {
          const org_id = request.body.org_id;
          const id = request.body.id;
          const student_name = request.body.student_name;
          const created_by = request.body.created_by;
          const current_date_time = request.currentDate;
          const present_date = current_date_time.split(" ")[0];
          const transactions = request.body.transaction;
          const total_amount = transactions
            .map(({ amount }) => parseFloat(amount))
            .reduce((a, b) => a + b, 0)
            .toFixed(2);
          const payment_method = request.body.payment_method;
          const transaction_type = request.body.transaction_type;
          const bill_type = request.body.bill_type;
          const fees_details = [];
          let itemsObj = await transactions.map((item, index) => {
            let sub_fee_id = item?.sub_fee_id;
            let amount = parseFloat(item?.amount).toFixed(2);
            let cash = parseFloat(item.cash).toFixed(2);
            let upi = parseFloat(item.upi).toFixed(2);
            let bank = parseFloat(item.bank).toFixed(2);
            if (sub_fee_id && amount) {
              if (payment_method == "U") {
                let tot_amt = (
                  parseFloat(upi) +
                  parseFloat(bank) +
                  parseFloat(cash)
                ).toFixed(2);
                if (parseFloat(amount) != parseFloat(tot_amt)) {
                  fees_details.push("false5");
                }
              } else if (payment_method == "B") {
                if (parseFloat(amount) != parseFloat(bank)) {
                  fees_details.push("false5");
                }
              } else if (payment_method == "C") {
                if (parseFloat(amount) != parseFloat(cash)) {
                  fees_details.push("false5");
                }
              }
              let obj = {};
              // obj['student_id'] = student_id;
              obj["sub_fee_id"] = sub_fee_id;
              obj["date"] = present_date;
              obj["payment_method"] = payment_method;
              obj["amount"] = amount;
              obj["cash"] = cash;
              obj["bank"] = bank;
              obj["upi"] = upi;
              obj["bill_type"] = bill_type;
              obj["transaction_type"] = transaction_type;
              obj["status"] = "1";
              obj["created_by"] = created_by;
              obj["org_id"] = org_id;
              obj["created_date_time"] = current_date_time;
              obj["academic_years_id"] = "";
              obj["calendar_years_id"] = calendar_years_id;
              obj["branch_id"] = "";
              fees_details.push(obj);
            } else {
              fees_details.push("false1");
            }
            return fees_details;
          });
          if (fees_details.includes("false5")) {
            response
              .status(statusCodes.Dataexists)
              .json({ message: "Amount exceeds" });
          } else if (fees_details.includes("false1")) {
            response
              .status(statusCodes.ProvideAllFields)
              .json({ message: "Please fill all mandatory fields1" });
          } else if (fees_details.length == 0) {
            response
              .status(statusCodes.SomethingWentWrong)
              .json({ message: "Problem occurred while transaction" });
          } else {
            let student_id;
            const check = await studentinfo.findOne({
              id: { $regex: `^${id}$`, $options: "i" },
              org_id: org_id,
              status: "1",
            });
            if (check && check.reg_type == "N") {
              // student_id = (check?._id).toString();
              response
                .status(statusCodes.Dataexists)
                .json({ message: "Student with ID already registered" });
            } else {
              if (!check) {
                let student = await studentinfo.create({
                  org_id: org_id,
                  reg_type: "M",
                  student_name: student_name,
                  student_phone_number: "",
                  status: "1",
                  hall_ticket_number: "",
                  admission_number: "",
                  aadhaar_number: "",
                  jnanbhumi_number: "",
                  id: id,
                  ssc: "",
                  second_language: "",
                  created_by: created_by,
                  created_date_time: current_date_time,
                  manual_created_date_time: current_date_time,
                });
                student_id = (student?._id).toString();
              } else {
                student_id = check._id.toString();
              }
              let paiddetails = fees_details.map((item, i) => ({
                ...item,
                student_id: student_id,
              }));
              const tranvalue = await transaction
                .find()
                .sort({ transactionidvalue: -1 })
                .limit(1);

              let todaydate = present_date.replace(/-/g, "");
              let transactionidvalue = 1;
              let billno;
              if (tranvalue.length == 0) {
                billno = todaydate + addLeadingZeros(transactionidvalue, 3);
              } else {
                transactionidvalue =
                  parseInt(tranvalue[0].transactionidvalue) + 1;
                billno = tranvalue[0].bill_number;
                let date = tranvalue[0]?.created_date_time_value ?? dateTime;
                let date1 = date.split(" ")[0];
                let date2 = date1.replace(/-/g, "");
                if (date2 == todaydate) {
                  billno = parseInt(billno) + 1;
                  // billno = todaydate + addLeadingZeros(transactionidvalue, 3);
                } else {
                  billno = todaydate + addLeadingZeros(1, 3);
                }
              }
              let transaction_number =
                "STDTRNS" + addLeadingZeros(transactionidvalue, 5);
              const dateTime = request.currentDate;
              let objvalue = {};
              objvalue["tot_amt"] = total_amount;
              objvalue["bill_number"] = billno;
              // objvalue['transaction_number'] = transaction_number;
              objvalue["transactionidvalue"] = transactionidvalue;
              objvalue["created_date_time_value"] = current_date_time;
              objvalue["paiddetails"] = paiddetails;
              let value = await transaction.create(objvalue);
              if (value) {
                await addTransactionnumber(value);
              }

              response
                .status(statusCodes.success)
                .json({
                  message: "Transaction created successfully",
                  bill_number: value?.bill_number,
                });
            }
          }
        } else {
          response
            .status(statusCodes.ProvideAllFields)
            .json({ message: "Please provide atleast a subfee" });
        }
      } else {
        response
          .status(statusCodes.InvalidData)
          .json({ message: "No active calender year" });
      }
    } else {
      response
        .status(statusCodes.ProvideAllFields)
        .json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {
    response
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while transaction" });
  }
};

const checkandsavefee = async (
  sub_fee_id,
  amountv,
  student_id,
  cash,
  upi,
  bank,
  payment_method,
  created_by,
  transtype,
  bill_type,
  org_id,
  calendar_years_id,
  academic_years_id,
  branch_id,
  dateTime
) => {
  if (payment_method == "U") {
    let totamt = (
      parseFloat(upi) +
      parseFloat(bank) +
      parseFloat(cash)
    ).toFixed(2);
    if (parseFloat(amountv) != parseFloat(totamt)) {
      return "false5";
    }
  }
  if (payment_method == "B") {
    if (parseFloat(amountv) != parseFloat(bank)) {
      return "false5";
    }
  }
  if (payment_method == "C") {
    if (parseFloat(amountv) != parseFloat(cash)) {
      return "false5";
    }
  }
  let transamt = 0.0;
  let pendingamount = 0.0;
  let concessionvalue = 0.0;

  let amountsend = parseFloat(amountv).toFixed(2);
  let transactionamt = await transaction.aggregate([
    { $unwind: "$paiddetails" },
    {
      $match: {
        "paiddetails.student_id": student_id,
        "paiddetails.sub_fee_id": sub_fee_id,
        "paiddetails.status": "1",
        "paiddetails.academic_years_id": academic_years_id,
        "paiddetails.calendar_years_id": calendar_years_id,
        "paiddetails.org_id": org_id,
      },
    },
    {
      $project: {
        emit: { key: "$paiddetails.sub_fee_id", value: "$paiddetails.amount" },
      },
    },
    {
      $group: {
        // equivalent to the reduce function
        _id: "$emit.key",
        valuesPrices: {
          $accumulator: {
            init: function () {
              return 0;
            },
            initArgs: [],
            accumulate: function (state, value) {
              return parseFloat(state) + parseFloat(value);
            },
            accumulateArgs: ["$emit.value"],
            merge: function (state1, state2) {
              return parseFloat(state1) + parseFloat(state2);
            },
            lang: "js",
          },
        },
      },
    },
  ]);

  let actual_amount = [];

  let subfeeid = await subfee.findOne({ _id: sub_fee_id.toString() });
  let feeid = await fee.findOne({
    other_fee_id: "1",
    status: "1",
    _id: subfeeid?.fee_type_id,
  });
  if (feeid) {
    let studolddue = await olddue.findOne({
      student_id: student_id,
      status: "1",
    });
    actual_amount = [{ amount: studolddue?.old_due_amount ?? 0.0 }];
  } else {
    actual_amount = await branchfee.aggregate([
      {
        $match: {
          sub_fee_id: sub_fee_id.toString(),
          status: "1",
          academic_years_id: academic_years_id,
          calendar_years_id: calendar_years_id,
          org_id: org_id,
          branch_id: branch_id,
        },
      },
      {
        $group: {
          _id: "$_id",
          data: { $addToSet: "$$ROOT" },
        },
      },
      { $unwind: "$data" },
      {
        $project: {
          amount: "$data.amount",
        },
      },
    ]);
  }
  let concession_amount = await studentconcession.aggregate([
    { $unwind: "$concessions" },
    {
      $match: {
        "concessions.sub_fee_id": sub_fee_id.toString(),
        "concessions.concession_status": "a",
        academic_years_id: academic_years_id,
        calendar_years_id: calendar_years_id,
        student_id: student_id,
        org_id: org_id,
      },
    },
  ]);

  let actual_amt = 0.0;

  if (actual_amount.length > 0) {
    if (transactionamt.length > 0) {
      transamt = transactionamt[0].valuesPrices ?? 0;
    }
    actual_amt = parseFloat(actual_amount[0].amount);
    if (concession_amount.length > 0) {
      let concession = concession_amount[0]?.concessions?.concession ?? 0;
      concessionvalue = (concession / 100) * actual_amt;
      pendingamount = (
        parseFloat(actual_amt) - parseFloat(concessionvalue)
      ).toFixed(2);
    } else {
      pendingamount = parseFloat(actual_amt).toFixed(2);
    }
    pendingamount = (parseFloat(pendingamount) - parseFloat(transamt)).toFixed(
      2
    );
  }

  if (parseFloat(amountsend) <= parseFloat(pendingamount)) {
    const date = dateTime.split(" ")[0];

    if (
      amountsend &&
      amountsend != 0 &&
      student_id &&
      student_id != "" &&
      payment_method &&
      payment_method != "" &&
      org_id &&
      org_id != "" &&
      sub_fee_id &&
      sub_fee_id != "" &&
      created_by &&
      created_by != "" &&
      academic_years_id &&
      academic_years_id != "" &&
      calendar_years_id &&
      calendar_years_id != ""
    ) {
      let obj = {};
      obj["student_id"] = student_id;
      obj["sub_fee_id"] = sub_fee_id;
      obj["date"] = date;
      obj["payment_method"] = payment_method;
      obj["amount"] = amountsend;
      obj["cash"] = cash;
      obj["bank"] = bank;
      obj["upi"] = upi;
      obj["bill_type"] = bill_type;
      obj["transaction_type"] = transtype;
      obj["status"] = "1";
      obj["created_by"] = created_by;
      obj["org_id"] = org_id;
      obj["created_date_time"] = dateTime;
      obj["academic_years_id"] = academic_years_id;
      obj["calendar_years_id"] = calendar_years_id;
      obj["branch_id"] = branch_id;
      return obj;
    } else {
      return "false1";
    }
  } else {
    return "false";
  }
};
const updateTransaction = async (request, response) => {
  try {
    let value = request.body;
    if (
      value.transaction_id &&
      value.update_sub_fee_id &&
      value.sub_fee_id &&
      value.amount &&
      value.payment_method &&
      value.updated_by &&
      value.transaction_type &&
      value.bill_type &&
      value.org_id &&
      value.student_id
    ) {
      let transactionid = value.transaction_id;
      let update_sub_fee_id = value.update_sub_fee_id;
      let sub_fee_id = value.sub_fee_id;
      let amountv = parseFloat(value.amount).toFixed(2);
      let student_id = value.student_id;
      let cash = parseFloat(value.cash).toFixed(2);
      let upi = parseFloat(value.upi).toFixed(2);
      let bank = parseFloat(value.bank).toFixed(2);
      let payment_method = value.payment_method;
      let updated_by = value.updated_by;
      let transaction_type = value.transaction_type;
      let bill_type = value.bill_type;
      let org_id = value.org_id;
      let dateTime = request.currentDate;
      const date = dateTime.split(" ")[0];
      let allocvalue = await allocstudent.findOne({
        student_id: student_id,
        status: "1",
      });
      const calendar_years_id = await getCurrentCalendarYearIDByOrgId(org_id);
      if (calendar_years_id) {
        if (allocvalue) {
          let academic_years_id = allocvalue.academic_years_id;
          let branch_id = allocvalue.branch_id;

          let itemsObj = await checkandsavefee(
            sub_fee_id,
            amountv,
            student_id,
            cash,
            upi,
            bank,
            payment_method,
            updated_by,
            transaction_type,
            bill_type,
            org_id,
            calendar_years_id,
            academic_years_id,
            branch_id,
            dateTime
          );

          if (itemsObj == "false5") {
            response
              .status(statusCodes.Dataexists)
              .json({ message: "Amount exceeds" });
          } else if (itemsObj == "false4") {
            response
              .status(statusCodes.ProvideAllFields)
              .json({ message: "Please allocate student first" });
          } else if (itemsObj == "false1") {
            response
              .status(statusCodes.ProvideAllFields)
              .json({ message: "Please provide all mandatory fields" });
          } else if (itemsObj == "false") {
            response
              .status(statusCodes.Dataexists)
              .json({ message: "Transaction amount exceeds" });
          } else {
            //let prevvalues=await transaction.find({paiddetails: {$elemMatch: {_id:ObjectID(transactionid)}}})
            let prevvalues = await transaction.findOne({
              "paiddetails._id": ObjectID(transactionid),
              "paiddetails.org_id": org_id,
              "paiddetails.status": "1",
              "paiddetails.sub_fee_id": update_sub_fee_id,
            });

            let transvalue = await transaction.findOneAndUpdate(
              { "paiddetails._id": ObjectID(transactionid) },
              {
                $set: {
                  "paiddetails.$[element].student_id": student_id,
                  "paiddetails.$[element].sub_fee_id": sub_fee_id,
                  "paiddetails.$[element].payment_method": payment_method,
                  "paiddetails.$[element].amount": amountv,
                  "paiddetails.$[element].cash": cash,
                  "paiddetails.$[element].bank": bank,
                  "paiddetails.$[element].upi": upi,
                  "paiddetails.$[element].bill_type": bill_type,
                  "paiddetails.$[element].transaction_type": transaction_type,
                  "paiddetails.$[element].updated_by": updated_by,
                  "paiddetails.$[element].updated_date_time": dateTime,
                  "paiddetails.$[element].academic_years_id": academic_years_id,
                  "paiddetails.$[element].calendar_years_id": calendar_years_id,
                  "paiddetails.$[element].branch_id": branch_id,
                },
              },
              {
                multi: true,
                arrayFilters: [{ "element.sub_fee_id": update_sub_fee_id }],
                new: true,
              }
            );
            if (prevvalues) {
              await log.create({
                date: date,
                bill_number: prevvalues.bill_number,
                transaction_id: transactionid,
                prev_amount: prevvalues.paiddetails[0].amount,
                modified_amount: amountv,
                prev_cash: prevvalues.paiddetails[0].cash,
                modified_cash: cash,
                prev_bank: prevvalues.paiddetails[0].bank,
                modified_bank: bank,
                prev_upi: prevvalues.paiddetails[0].upi,
                modified_upi: upi,
                prev_sub_fee_id: update_sub_fee_id,
                modified_sub_fee_id: sub_fee_id,
                operation_type: "U",
                operated_by: updated_by,
                updated_date_time: dateTime,
                org_id: org_id,
                payment_method: payment_method,
                student_id: student_id,
                created_date_time: prevvalues.paiddetails[0].created_date_time,
              });
            }
            let idofupdate = transvalue._id;
            let transactionamt = await transaction.aggregate([
              { $unwind: "$paiddetails" },
              {
                $match: {
                  _id: ObjectID(idofupdate),
                  "paiddetails.status": "1",
                },
              },
              {
                $project: {
                  emit: {
                    key: "$paiddetails.sub_fee_id",
                    value: "$paiddetails.amount",
                  },
                },
              },
              {
                $group: {
                  // equivalent to the reduce function
                  _id: "$emit.key",
                  valuesPrices: {
                    $accumulator: {
                      init: function () {
                        return 0;
                      },
                      initArgs: [],
                      accumulate: function (state, value) {
                        return parseFloat(state) + parseFloat(value);
                      },
                      accumulateArgs: ["$emit.value"],
                      merge: function (state1, state2) {
                        return parseFloat(state1) + parseFloat(state2);
                      },
                      lang: "js",
                    },
                  },
                },
              },
            ]);
            if (transactionamt.length > 0) {
              await transaction.updateOne(
                { _id: ObjectID(idofupdate) },
                { $set: { tot_amt: transactionamt[0].valuesPrices } }
              );
            } else {
              await transaction.updateOne(
                { _id: ObjectID(idofupdate) },
                { $set: { tot_amt: "0.0" } }
              );
            }
            let dueamt = await getdueamtdetails(student_id, "1");
            if (dueamt) {
              let duebillvalue = await duebill.findOne({
                bill_number: prevvalues.bill_number,
                org_id: org_id,
              });
              if (duebillvalue) {
                await duebill.updateMany(
                  { org_id: org_id, bill_number: prevvalues.bill_number },
                  { $set: { status: "0" } }
                );
                for (var i = 0; i < dueamt.length; i++) {
                  let subfeeid = dueamt[i].sub_fee_id;
                  let due_amount = dueamt[i].due_amount;
                  //await duebill.create({"org_id": org_id, "bill_number": billno,"sub_fee_id": subfeeid, "due_amount": due_amount,created_date_time:dateTime})
                  if (parseFloat(due_amount) > 0) {
                    await duebill.create({
                      org_id: org_id,
                      bill_number: prevvalues.bill_number,
                      sub_fee_id: subfeeid,
                      due_amount: due_amount,
                      created_date_time: dateTime,
                      status: "1",
                    });
                  }
                }
              }
            }

            response
              .status(statusCodes.success)
              .json({ message: "Transaction updated successfully" });
          }
        } else {
          response
            .status(statusCodes.InvalidData)
            .json({ message: "Please allocate the student to branch first" });
        }
      } else {
        response
          .status(statusCodes.InvalidData)
          .json({ message: "No active calender year" });
      }
    } else {
      response
        .status(statusCodes.Dataexists)
        .json({ message: "Please provide all mandatory fields" });
    }
  } catch (error) {
    response
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while transaction" });
  }
};

const deleteTransaction = async (request, response) => {
  try {
    let delete_id = request.body.transaction_id;
    let sub_fee_id = request.body.sub_fee_id;
    if (delete_id && delete_id != "" && sub_fee_id && sub_fee_id != "") {
      if (mongoose.isValidObjectId(delete_id)) {
        var value = await transaction.findOne({
          "paiddetails._id": ObjectID(delete_id),
        });
        if (value) {
          let transvalue = await transaction.findOneAndUpdate(
            { "paiddetails._id": ObjectID(delete_id) },
            {
              $set: {
                "paiddetails.$[element].status": "0",
              },
            },
            {
              multi: true,
              arrayFilters: [{ "element.sub_fee_id": sub_fee_id }],
              new: true,
            }
          );

          let idofupdate = transvalue._id;
          let transactionamt = await transaction.aggregate([
            { $unwind: "$paiddetails" },
            {
              $match: { _id: ObjectID(idofupdate), "paiddetails.status": "1" },
            },
            {
              $project: {
                emit: {
                  key: "$paiddetails.sub_fee_id",
                  value: "$paiddetails.amount",
                },
              },
            },
            {
              $group: {
                // equivalent to the reduce function
                _id: "$emit.key",
                valuesPrices: {
                  $accumulator: {
                    init: function () {
                      return 0;
                    },
                    initArgs: [],
                    accumulate: function (state, value) {
                      return parseFloat(state) + parseFloat(value);
                    },
                    accumulateArgs: ["$emit.value"],
                    merge: function (state1, state2) {
                      return parseFloat(state1) + parseFloat(state2);
                    },
                    lang: "js",
                  },
                },
              },
            },
          ]);
          if (transactionamt.length > 0) {
            await transaction.updateOne(
              { _id: ObjectID(idofupdate) },
              { $set: { tot_amt: transactionamt[0]?.valuesPrices } }
            );
          } else {
            await transaction.updateOne(
              { _id: ObjectID(idofupdate) },
              { $set: { tot_amt: "0.0" } }
            );
          }
          response
            .status(statusCodes.success)
            .json({ message: "Transaction deleted successfully" });
        } else {
          response
            .status(statusCodes.UserNotFound)
            .json({ message: "Transaction ID doesn't exist" });
        }
      } else {
        response
          .status(statusCodes.InvalidData)
          .json({ message: "Please give valid transaction ID" });
      }
    } else {
      response
        .status(statusCodes.ProvideAllFields)
        .json({ message: "Please fill all mandatory fields" });
    }
  } catch (error) {
    response
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while deleting transaction" });
  }
};
const getTransaction = async (request, response) => {
  if (request.body.org_id) {
    try {
      const from_date = request.body?.from_date;
      const to_date = request.body?.to_date;
      const org_id = request.body?.org_id;
      const transaction_type = request.body?.transaction_type;

      let unwind = { $unwind: "$paiddetails" };
      let match = { "paiddetails.org_id": org_id, "paiddetails.status": "1" };
      if (transaction_type)
        match["paiddetails.transaction_type"] = transaction_type;
      if (from_date) {
        match["paiddetails.date"] = { $gte: from_date };
      }
      if (to_date) {
        match["paiddetails.date"] = { $lte: to_date };
      }
      if (from_date && to_date) {
        match["paiddetails.date"] = { $gte: from_date, $lte: to_date };
      }
      let Transactions = await transaction
        .aggregate([
          unwind,
          { $match: match },
          { $set: { paiddetails_id: "$paiddetails._id" } },
          { $unset: "paiddetails._id" },
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: ["$$ROOT", "$paiddetails"],
              },
            },
          },
          {
            $lookup: {
              from: "students",
              let: { salId: { $toObjectId: "$student_id" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$salId"] },
                        // { $eq: ["$status", "1"] },
                        { $eq: ["$org_id", org_id] },
                      ],
                    },
                  },
                },
              ],
              as: "student_details",
            },
          },
          { $unwind: "$student_details" },
          {
            $lookup: {
              from: "sub_fee_details",
              let: { salId: { $toObjectId: "$sub_fee_id" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$salId"] },
                        // { $eq: ["$status", "1"] },
                        { $eq: ["$org_id", org_id] },
                      ],
                    },
                  },
                },
              ],
              as: "sub_fee_name",
            },
          },
          { $unwind: "$sub_fee_name" },
          {
            $lookup: {
              from: "securities",
              let: { salId: { $toObjectId: "$created_by" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$salId"] },
                        // { $eq: ["$status", "1"] },
                        { $eq: ["$org_id", org_id] },
                      ],
                    },
                  },
                },
              ],
              as: "created_by_details",
            },
          },
          { $unwind: "$created_by_details" },
          {
            $set: {
              sub_fee_type: "$sub_fee_name.sub_fee_type",
              student_ID: "$student_details.id",
              student_name: "$student_details.student_name",
              created_by_name: "$created_by_details.admin_name",
              fee_type_id: "$sub_fee_name.fee_type_id",
            },
          },
          {
            $unset: [
              "paiddetails",
              "sub_fee_name",
              "student_details",
              "created_by_details",
            ],
          },
        ])
        .sort({ _id: -1 });
      response.status(statusCodes.success).json(Transactions);
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: e.message });
    }
  } else {
    response
      .status(statusCodes.ProvideAllFields)
      .json({ message: "Provide mandatory fields" });
  }
};
const getTransactionold = async (request, response) => {
  try {
    var org_id = request.body.org_id;
    const page = request.body.page || 0;
    const perpage = request.body.perpage;
    let query = await transaction
      .aggregate([
        { $unwind: "$paiddetails" },
        {
          $match: {
            "paiddetails.org_id": org_id,
            "paiddetails.status": "1",
          },
        },
      ])
      .sort({ _id: -1 });

    let itemsObj = [];
    let obj = {};
    //let value=paid_details.docs.flat();
    let value = query;
    for (let i = 0; i < value.length; i++) {
      let sub_fee_id = value[i]?.paiddetails.sub_fee_id;
      let student_id = value[i]?.paiddetails.student_id;
      let created_by = value[i]?.paiddetails.created_by;

      let student_details = await getStudentByIDOrgId(student_id, org_id);
      // let student_details = await getStudentdetailsById(student_id);
      let subfeedetail = await getFeedetaisbyID(sub_fee_id);
      let createddetails = await getuserdetils(created_by);
      obj = value[i]?.paiddetails;
      obj["created_by_name"] = createddetails?.admin_name;
      obj["bill_number"] = value[i].bill_number;
      obj["student_name"] = student_details?.student_name ?? "";
      obj["student_id"] = student_details?.id ?? "";
      obj["sub_fee_name"] = subfeedetail[0]?.sub_fee_type ?? "";
      obj["fee_name"] = subfeedetail[0]?.fee_type ?? "";
      itemsObj.push(obj);
    }
    response.status(statusCodes.success).json(itemsObj);
  } catch (error) {
    response
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while transaction" });
  }
};

const updatemanualbillTransaction = async (request, response) => {
  try {
    //var value = JSON.parse(request.body);
    var value = request.body;
    if (value) {
      let transactionid = value.transaction_id;
      let update_sub_fee_id = value.update_sub_fee_id;
      let sub_fee_id = value.sub_fee_id;
      let amountv = parseFloat(value.amount).toFixed(2);
      let student_id = value.student_id;
      let cash = parseFloat(value.cash).toFixed(2);
      let upi = parseFloat(value.upi).toFixed(2);
      let bank = parseFloat(value.bank).toFixed(2);
      let payment_method = value.payment_method;
      let updated_by = value.updated_by;
      let transaction_type = value.transaction_type;
      let bill_type = value.bill_type;
      let org_id = value.org_id;
      let dateTime = request.currentDate;
      const date = dateTime.split(" ")[0];
      const calendar_years_id = await getCurrentCalendarYearIDByOrgId(org_id);
      if (calendar_years_id) {
        // let actual_amount = await branchfee.aggregate([{ $match: { "sub_fee_id": sub_fee_id.toString(), "status": "1",  "calendar_years_id": calendar_years_id, "org_id": org_id } }, {
        //   "$group": {
        //     _id: "$_id",
        //     "data": { "$addToSet": "$$ROOT" }

        //   }
        // }, { "$unwind": "$data" }, {
        //   "$project": {
        //     "amount": "$data.amount"
        //   }
        // }])
        // if (actual_amount.length > 0) {

        //if (parseFloat(amountv).toFixed(2) <= parseFloat(actual_amount[0].amount).toFixed(2)) {

        if (
          amountv &&
          amountv != 0 &&
          student_id &&
          student_id != "" &&
          payment_method &&
          payment_method != "" &&
          transactionid &&
          transactionid != "" &&
          updated_by &&
          updated_by != "" &&
          calendar_years_id &&
          calendar_years_id != ""
        ) {
          let prevvalues = await transaction.findOne({
            "paiddetails._id": ObjectID(transactionid),
            "paiddetails.org_id": org_id,
            "paiddetails.status": "1",
            "paiddetails.sub_fee_id": update_sub_fee_id,
          });

          let transvalue = await transaction.findOneAndUpdate(
            { "paiddetails._id": ObjectID(transactionid) },
            {
              $set: {
                "paiddetails.$[element].student_id": student_id,
                "paiddetails.$[element].sub_fee_id": sub_fee_id,
                "paiddetails.$[element].payment_method": payment_method,
                "paiddetails.$[element].amount": amountv,
                "paiddetails.$[element].cash": cash,
                "paiddetails.$[element].bank": bank,
                "paiddetails.$[element].upi": upi,
                "paiddetails.$[element].bill_type": bill_type,
                "paiddetails.$[element].transaction_type": transaction_type,
                "paiddetails.$[element].updated_by": updated_by,
                "paiddetails.$[element].updated_date_time": dateTime,
                "paiddetails.$[element].calendar_years_id": calendar_years_id,
              },
            },
            {
              multi: true,
              arrayFilters: [{ "element.sub_fee_id": update_sub_fee_id }],
              new: true,
            }
          );
          if (prevvalues) {
            await log.create({
              date: date,
              bill_number: prevvalues.bill_number,
              transaction_id: transactionid,
              prev_amount: prevvalues.paiddetails[0].amount,
              modified_amount: amountv,
              prev_cash: prevvalues.paiddetails[0].cash,
              modified_cash: cash,
              prev_bank: prevvalues.paiddetails[0].bank,
              modified_bank: bank,
              prev_upi: prevvalues.paiddetails[0].upi,
              modified_upi: upi,
              prev_sub_fee_id: update_sub_fee_id,
              modified_sub_fee_id: sub_fee_id,
              operation_type: "U",
              operated_by: updated_by,
              updated_date_time: dateTime,
              org_id: org_id,
              payment_method: payment_method,
              student_id: student_id,
              created_date_time: prevvalues.paiddetails[0].created_date_time,
            });
          }
          let idofupdate = transvalue._id;
          let transactionamt = await transaction.aggregate([
            { $unwind: "$paiddetails" },
            {
              $match: { _id: ObjectID(idofupdate), "paiddetails.status": "1" },
            },
            {
              $project: {
                emit: {
                  key: "$paiddetails.sub_fee_id",
                  value: "$paiddetails.amount",
                },
              },
            },
            {
              $group: {
                // equivalent to the reduce function
                _id: "$emit.key",
                valuesPrices: {
                  $accumulator: {
                    init: function () {
                      return 0;
                    },
                    initArgs: [],
                    accumulate: function (state, value) {
                      return parseFloat(state) + parseFloat(value);
                    },
                    accumulateArgs: ["$emit.value"],
                    merge: function (state1, state2) {
                      return parseFloat(state1) + parseFloat(state2);
                    },
                    lang: "js",
                  },
                },
              },
            },
          ]);
          if (transactionamt.length > 0) {
            await transaction.updateOne(
              { _id: ObjectID(idofupdate) },
              { $set: { tot_amt: transactionamt[0].valuesPrices } }
            );
          } else {
            await transaction.updateOne(
              { _id: ObjectID(idofupdate) },
              { $set: { tot_amt: "0.0" } }
            );
          }
          let itemsObj = {
            student_id: student_id,
            sub_fee_id: sub_fee_id,
            amount: amountv,
          };

          response
            .status(statusCodes.success)
            .json({ message: "Transaction updated successfully" });
        } else {
          response
            .status(statusCodes.Dataexists)
            .json({ message: "Please fill all mandatory fields" });
        }
      }
    } else {
      response
        .status(statusCodes.Dataexists)
        .json({ message: "Please send atleast one fee type" });
    }
  } catch (error) {
    response
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while transaction" });
  }
};
const getuserdetils = async (created_by) => {
  return new Promise(async (resolve, reject) => {
    var userdetail = await user.findOne({ _id: ObjectID(created_by) });

    resolve(userdetail);
  });
};
const getconcessionByStudentId = async (reqdata) => {
  return new Promise(async (resolve, reject) => {
    let concession = 0;
    let student_fee_concession = await studentconcession.aggregate([
      { $unwind: "$concessions" },
      {
        $match: {
          "concessions.concession_status": "a",
          academic_years_id: reqdata?.academic_years_id,
          calendar_years_id: reqdata?.calendar_years_id,
          student_id: reqdata?.student_id,
          org_id: reqdata?.org_id,
        },
      },
    ]);
    if (student_fee_concession.length > 0) {
      let std_concession = student_fee_concession[0]?.concessions?.concession;
      if (std_concession) {
        resolve(std_concession);
      } else {
        resolve(concession);
      }
    } else {
      resolve(concession);
    }
  });
};
const getStudentconncessionByFeeType = (reqdata) => {
  return new Promise(async (resolve, reject) => {
    let concession = 0;
    let student_fee_concession = await studentconcession.aggregate([
      { $unwind: "$concessions" },
      {
        $match: {
          "concessions.sub_fee_id": reqdata?.sub_fee_id.toString(),
          "concessions.concession_status": "a",
          academic_years_id: reqdata?.academic_years_id,
          calendar_years_id: reqdata?.calendar_years_id,
          student_id: reqdata?.student_id,
          org_id: reqdata?.org_id,
        },
      },
    ]);
    if (student_fee_concession.length > 0) {
      let std_concession = student_fee_concession[0]?.concessions?.concession;
      if (std_concession) {
        resolve(std_concession);
      } else {
        resolve(concession);
      }
    } else {
      resolve(concession);
    }
  });
};
const getStudentpaidamtByStudentid = async (reqdata) => {
  return new Promise(async (resolve, reject) => {
    let paidamount = 0;
    let transaction_amount = await transaction.aggregate([
      { $unwind: "$paiddetails" },
      {
        $match: {
          "paiddetails.student_id": reqdata?.student_id,
          "paiddetails.status": "1",
          "paiddetails.academic_years_id": reqdata?.academic_years_id,
          "paiddetails.calendar_years_id": reqdata?.calendar_years_id,
          "paiddetails.org_id": reqdata?.org_id,
        },
      },
      {
        $project: {
          emit: {
            key: "$paiddetails.sub_fee_id",
            value: "$paiddetails.amount",
          },
        },
      },
      {
        $group: {
          // equivalent to the reduce function
          _id: "$emit.key",
          paid_amount: {
            $accumulator: {
              init: function () {
                return 0;
              },
              initArgs: [],
              accumulate: function (state, value) {
                return parseFloat(state) + parseFloat(value);
              },
              accumulateArgs: ["$emit.value"],
              merge: function (state1, state2) {
                return parseFloat(state1) + parseFloat(state2);
              },
              lang: "js",
            },
          },
        },
      },
    ]);
    if (transaction_amount.length > 0) {
      let total_paid_amount = transaction_amount[0]?.paid_amount.toFixed(2);
      if (total_paid_amount) {
        resolve(total_paid_amount);
      } else {
        resolve(paidamount);
      }
    } else {
      resolve(paidamount);
    }
  });
};

const getStudentTotalpaidamtByStudentid = async (reqdata) => {
  return new Promise(async (resolve, reject) => {
    let paidamount = 0;
    let transaction_amount = await transaction.aggregate([
      { $unwind: "$paiddetails" },
      {
        $match: {
          "paiddetails.student_id": reqdata?.student_id,
          "paiddetails.status": "1",
          "paiddetails.academic_years_id": reqdata?.academic_years_id,
          "paiddetails.calendar_years_id": reqdata?.calendar_years_id,
          "paiddetails.org_id": reqdata?.org_id,
        },
      },
      {
        $project: {
          emit: {
            key: "$paiddetails.sub_fee_id",
            value: "$paiddetails.amount",
          },
        },
      },
      {
        $group: {
          // equivalent to the reduce function
          _id: "$emit.key",
          paid_amount: {
            $accumulator: {
              init: function () {
                return 0;
              },
              initArgs: [],
              accumulate: function (state, value) {
                return parseFloat(state) + parseFloat(value);
              },
              accumulateArgs: ["$emit.value"],
              merge: function (state1, state2) {
                return parseFloat(state1) + parseFloat(state2);
              },
              lang: "js",
            },
          },
        },
      },
    ]);
    if (transaction_amount.length > 0) {
      let total_paid_amount = transaction_amount[0]?.paid_amount.toFixed(2);
      if (total_paid_amount) {
        resolve(total_paid_amount);
      } else {
        resolve(paidamount);
      }
    } else {
      resolve(paidamount);
    }
  });
};
const getAllbranchfeeByBranchid = async (reqdata) => {
  return new Promise(async (resolve, reject) => {
    let branchamount = 0;
    let branch_amount = await branchfee.aggregate([
      {
        $match: {
          branch_id: reqdata?.branch_id,
          sub_fee_id: reqdata?.sub_fee_id,
          status: "1",
          academic_years_id: reqdata?.academic_years_id,
          calendar_years_id: reqdata?.calendar_years_id,
          org_id: reqdata?.org_id,
        },
      },
      { $project: { emit: { key: "$sub_fee_id", value: "$amount" } } },
      {
        $group: {
          // equivalent to the reduce function
          _id: "$emit.key",
          paid_amount: {
            $accumulator: {
              init: function () {
                return 0;
              },
              initArgs: [],
              accumulate: function (state, value) {
                return parseFloat(state) + parseFloat(value);
              },
              accumulateArgs: ["$emit.value"],
              merge: function (state1, state2) {
                return parseFloat(state1) + parseFloat(state2);
              },
              lang: "js",
            },
          },
        },
      },
    ]);

    if (branch_amount.length > 0) {
      let total_branch_amount = branch_amount[0]?.paid_amount.toFixed(2);
      if (total_branch_amount) {
        resolve(total_branch_amount);
      } else {
        resolve(branchamount);
      }
    }
  });
};
const getStudentTotalpaidamtByFeeType = async (reqdata) => {
  return new Promise(async (resolve, reject) => {
    let paidamount = 0;
    let transaction_amount = await transaction.aggregate([
      { $unwind: "$paiddetails" },
      {
        $match: {
          "paiddetails.student_id": reqdata?.student_id,
          "paiddetails.sub_fee_id": reqdata?.sub_fee_id,
          "paiddetails.status": "1",
          "paiddetails.academic_years_id": reqdata?.academic_years_id,
          "paiddetails.calendar_years_id": reqdata?.calendar_years_id,
          "paiddetails.org_id": reqdata?.org_id,
        },
      },
      {
        $project: {
          emit: {
            key: "$paiddetails.sub_fee_id",
            value: "$paiddetails.amount",
          },
        },
      },
      {
        $group: {
          // equivalent to the reduce function
          _id: "$emit.key",
          paid_amount: {
            $accumulator: {
              init: function () {
                return 0;
              },
              initArgs: [],
              accumulate: function (state, value) {
                return parseFloat(state) + parseFloat(value);
              },
              accumulateArgs: ["$emit.value"],
              merge: function (state1, state2) {
                return parseFloat(state1) + parseFloat(state2);
              },
              lang: "js",
            },
          },
        },
      },
    ]);
    if (transaction_amount.length > 0) {
      let total_paid_amount = transaction_amount[0]?.paid_amount.toFixed(2);
      if (total_paid_amount) {
        resolve(total_paid_amount);
      } else {
        resolve(paidamount);
      }
    } else {
      resolve(paidamount);
    }
  });
};

const getFeedetaisbyID = async (sub_fee_id) => {
  return new Promise(async (resolve, reject) => {
    if (ObjectId.isValid(sub_fee_id)) {
      sub_fee_id = ObjectID(sub_fee_id);
    } else {
      sub_fee_id = "";
    }
    let subfeedetail = await subfee.aggregate([
      { $match: { _id: sub_fee_id, status: "1" } },
      {
        $lookup: {
          from: "fee_details",
          let: { fee_type_id: { $toObjectId: "$fee_type_id" } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$fee_type_id"] },
                    { $eq: ["$status", "1"] },
                  ],
                },
              },
            },
          ],
          as: "fee_type_details",
        },
      },
      { $unwind: "$fee_type_details" },
      {
        $set: {
          fee_type: "$fee_type_details.fee_type",
          other_fee_id: "$fee_type_details.other_fee_id",
        },
      },
      { $unset: ["fee_type_details"] },
    ]);
    resolve(subfeedetail);
  });
};
const getstudentduepaidFeeamt = (reqdata) => {
  return new Promise(async (resolve, reject) => {
    let sub_fee_id = reqdata?.sub_fee_id;
    let actual_amt = reqdata?.amount;
    let paid_amount = await getStudentTotalpaidamtByFeeType(reqdata);
    let subfeedetail = await getFeedetaisbyID(sub_fee_id);
    if (subfeedetail.length > 0) {
      reqdata["sub_fee_id"] = sub_fee_id;
      let concession = await getStudentconncessionByFeeType(reqdata);

      let concessionvalue = 0;
      if (concession > 0) {
        concessionvalue = (concession / 100) * actual_amt;
      }
      let obj = {};
      obj["access_status"] = subfeedetail[0]?.access_status;
      obj["other_fee_id"] = subfeedetail[0]?.other_fee_id ?? "0";
      obj["sub_fee_id"] = sub_fee_id;
      obj["sub_fee_name"] = subfeedetail[0].sub_fee_type ?? "";
      obj["fee_name"] = subfeedetail[0].fee_type ?? "";
      obj["paid_amount"] = paid_amount;
      obj["actual_amount"] = actual_amt;
      obj["due_amount"] = (
        parseFloat(actual_amt) -
        parseFloat(concessionvalue) -
        parseFloat(paid_amount)
      ).toFixed(2);
      resolve(obj);
    } else {
      resolve({});
    }
  });
};
const getstudentpaidFeeamt = async (reqdata) => {
  return new Promise(async (resolve, reject) => {
    let sub_fee_id = reqdata?.sub_fee_id;
    let paid_amount = await getStudentTotalpaidamtByFeeType(reqdata);
    let subfeedetail = await getFeedetaisbyID(sub_fee_id);
    let obj = {};
    obj["sub_fee_name"] = subfeedetail[0].sub_fee_type;
    obj["fee_name"] = subfeedetail[0].fee_type[0];
    obj["actual_amount"] = paid_amount;
    obj["student_id"] = reqdata?.id ?? "";
    obj["student_name"] = reqdata?.student_name ?? "";
    resolve(obj);
  });
};

const getStudentdetailsById = async (stud_id, status, nostatuscheck) => {
  return new Promise(async (resolve, reject) => {
    let responseObj = {};
    responseObj["data"] = "";
    const student_id = stud_id;
    let student_find = { _id: student_id };
    if (!nostatuscheck) {
      student_find["status"] = status == "0" ? status : status ? status : "1";
    }
    let students = await studentinfo.find(student_find);

    // let students = await studentinfo.find({ _id: ObjectID(student_id), "status": status == '0' ? status : status ? status : '1' });
    if (students.length > 0) {
      let student_obj = students[0];
      let user_obj = {};
      user_obj["student_id"] = student_obj?.id;
      user_obj["hall_ticket_number"] = student_obj?.hall_ticket_number;
      user_obj["student_phone_number"] = student_obj?.student_phone_number;
      user_obj["admission_number"] = student_obj?.admission_number;
      user_obj["student_name"] = student_obj?.student_name;
      user_obj["_id"] = student_obj?._id;
      user_obj["org_id"] = student_obj?.org_id;

      let branchstudent = await allocstudent
        .aggregate([
          {
            $match: {
              student_id: student_id,
              status: status,
              org_id: student_obj?.org_id,
            },
          },
        ])
        .sort({ _id: -1 });
      let branch_fee = [];
      if (branchstudent.length > 0) {
        branch_fee = await branchfee.aggregate([
          {
            $match: {
              branch_id: branchstudent[0]?.branch_id,
              status: "1",
              org_id: branchstudent[0]?.org_id,
              calendar_years_id: branchstudent[0]?.calendar_years_id,
              academic_years_id: branchstudent[0]?.academic_years_id,
            },
          },
        ]);
      }

      user_obj["branch_fee"] = branch_fee;
      user_obj["branch_student"] = branchstudent[0] ?? {};
      responseObj["statusCode"] = statusCodes.success;
      responseObj["message"] = "";
      responseObj["data"] = user_obj;

      resolve(responseObj);
      // } else {
      //   responseObj['statusCode'] = statusCodes.InvalidData;
      //   responseObj['message'] = "Student not allocated to branch";
      //   responseObj['data'] = '';
      //   resolve(responseObj);
      // }
    } else {
      responseObj["statusCode"] = statusCodes.InvalidData;
      responseObj["message"] = "Student ID doesn't exist";
      responseObj["data"] = "";
      resolve(responseObj);
    }
  });
};
const getdueamtdetails = async (
  student_id,
  status,
  due_status,
  alloc_status
) => {
  try {
    let student_details = await getStudentdetailsById(
      student_id,
      status,
      alloc_status
    );

    if (student_details.statusCode == 200) {
      let studentdata = student_details?.data;
      let branch_fee = studentdata?.branch_fee;
      let branchstudent = studentdata?.branch_student;
      const fees_details = [];
      let itemsObj = [];
      for (let i = 0; i < branch_fee.length; i++) {
        let sub_fee_id = branch_fee[i]?.sub_fee_id;
        let amount = branch_fee[i]?.amount;
        branchstudent["sub_fee_id"] = sub_fee_id;
        branchstudent["amount"] = amount;

        fees_details.push(await getstudentduepaidFeeamt(branchstudent));
      }

      itemsObj = await Promise.all(fees_details);
      itemsObj = itemsObj.filter((value) => Object.keys(value).length !== 0);
      if (!due_status) {
        let oldduevalue = await getoldduedetails(
          studentdata?._id.toString(),
          studentdata?.org_id
        );
        if (oldduevalue) {
          itemsObj.push(oldduevalue);
        }
        return itemsObj;
      } else {
        return itemsObj;
      }
    } else {
      return [];
    }
  } catch (e) {
    return [];
  }
};
const getStudFeedetails = async (request, response) => {
  if (
    request.body.student_id &&
    request.body.student_id &&
    request.body.branch_id &&
    request.body.academic_years_id
  ) {
    try {
      const org_id = request.body.org_id;
      const student_id = request.body?.student_id;
      const branch_id = request.body?.branch_id;
      const academic_years_id = request.body?.academic_years_id;

      let branchstudent = await allocstudent
        .aggregate([
          { $match: { student_id: student_id, branch_id, academic_years_id } },
          {
            $lookup: {
              from: "students",
              let: { salId: { $toObjectId: "$student_id" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$_id", "$$salId"] }],
                    },
                  },
                },
              ],
              as: "student_details",
            },
          },
          { $unset: "student_details.created_date_time" },
          { $unset: "student_details.created_by" },
          { $unset: "student_details._id" },
          { $unwind: "$student_details" },
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: ["$$ROOT", "$student_details"],
              },
            },
          },
          { $unset: ["student_details"] },
        ])
        .sort({ _id: -1 });
      if (branchstudent.length > 0) {
        let studentdata = branchstudent[0];
        let branch_fee = await branchfee.aggregate([
          {
            $match: {
              branch_id: studentdata?.branch_id,
              status: "1",
              org_id: org_id,
              calendar_years_id: studentdata?.calendar_years_id,
              academic_years_id: studentdata?.academic_years_id,
            },
          },
        ]);
        const fees_details = [];
        let itemsObj = [];
        for (let i = 0; i < branch_fee.length; i++) {
          let sub_fee_id = branch_fee[i]?.sub_fee_id;
          let amount = branch_fee[i]?.amount;
          studentdata["sub_fee_id"] = sub_fee_id;
          studentdata["amount"] = amount;
          fees_details.push(getstudentpaidFeeamt(studentdata));
        }
        itemsObj = await Promise.all(fees_details);
        let oldduevalue = await getoldduedetails(
          student_id,
          org_id,
          academic_years_id
        );
        if (oldduevalue) {
          let olddue = {};
          olddue.sub_fee_name = oldduevalue.sub_fee_name;
          olddue.fee_name = oldduevalue.fee_name;
          olddue.actual_amount = oldduevalue.paid_amount;
          olddue.student_id = studentdata?.id;
          olddue.student_name = studentdata?.student_name;
          itemsObj.push(olddue);
        }
        response.status(statusCodes.success).json(itemsObj);
      } else {
        response
          .status(statusCodes.InvalidData)
          .json({
            message: "Student ID doesn't exist or not allocated to branch",
          });
      }
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: e.message });
    }
  } else {
    response
      .status(statusCodes.ProvideAllFields)
      .json({ message: "Provide mandatory fields" });
  }
};
const getstudentTranssactiondetails = async (reqdata) => {
  return new Promise(async (resolve, reject) => {
    let actual_amount = reqdata?.amount;
    let sub_fee_id = reqdata?.sub_fee_id;
    let paid_amount = await getStudentTotalpaidamtByFeeType(reqdata);
    let subfeedetail = await getFeedetaisbyID(sub_fee_id);
    let obj = {};
    obj["sub_fee_name"] = subfeedetail[0].sub_fee_type;
    obj["fee_name"] = subfeedetail[0].fee_type;
    obj["actual_amount"] = paid_amount;
    resolve(obj);
  });
};
const addfeedetailsToObj = async (reqdata) => {
  return new Promise(async (resolve, reject) => {
    let sub_fee_id = reqdata?.sub_fee_id;
    let obj = reqdata;
    let subfeedetail = await getFeedetaisbyID(sub_fee_id);
    obj["sub_fee_name"] = subfeedetail[0]?.sub_fee_type ?? "";
    obj["fee_name"] = subfeedetail[0]?.fee_type ?? "";
    resolve(obj);
  });
};
const getStudTransactiondetails = async (request, response) => {
  if (
    request.body.student_id &&
    request.body.student_id &&
    request.body.branch_id &&
    request.body.academic_years_id
  ) {
    try {
      const org_id = request.body.org_id;
      const student_id = request.body?.student_id;
      const branch_id = request.body?.branch_id;
      const academic_years_id = request.body?.academic_years_id;

      let cyearid = await getCurrentCalendarYearIDByOrgId(org_id);

      let match = {
        "paiddetails.student_id": student_id,
        "paiddetails.status": "1",
        "paiddetails.org_id": org_id,
        "paiddetails.branch_id": branch_id,
        "paiddetails.academic_years_id": academic_years_id,
      };
      if (cyearid) match["paiddetails.calendar_years_id"] = cyearid;
      let studenttransactions = await transaction.aggregate([
        { $unwind: "$paiddetails" },
        { $match: match },
        {
          $lookup: {
            from: "students",
            let: { student_id: { $toObjectId: "$paiddetails.student_id" } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$student_id"] },
                      // { $eq: ["$status", "1"] }
                    ],
                  },
                },
              },
            ],
            as: "student_details",
          },
        },
        { $unwind: "$student_details" },
        {
          $lookup: {
            from: "sub_fee_details",
            let: {
              sub_fee_id: {
                $toObjectId: "$paiddetails.sub_fee_id",
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$sub_fee_id"] },
                      // { $eq: ["$status", "1"] }
                    ],
                  },
                },
              },
            ],
            as: "sub_fee_details",
          },
        },
        { $unwind: "$sub_fee_details" },
        {
          $set: {
            sub_fee_name: "$sub_fee_details.sub_fee_type",
            amount: { $round: [{ $toDouble: "$paiddetails.amount" }, 2] },
            // amount: "$paiddetails.amount",
            created_date_time: "$created_date_time_value",
            student_id: "$student_details.id",
            student_name: "$student_details.student_name",
          },
        },
        { $unset: ["sub_fee_details", "paiddetails", "student_details"] },
      ]);
      // const trans = studenttransactions.map(({ sub_fee_type, ...ref }) => ({
      //   ...ref, amount: ref?.paiddetails?.amount ?? 0, created_date_time: ref?.created_date_time_value, sub_fee_name: sub_fee_type[0]?.sub_fee_type ?? '', student_id: studentdata?.student_id ?? '', student_name: studentdata?.student_name
      // }))
      response.status(statusCodes.success).json(studenttransactions);
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: e.message });
    }
  } else {
    response
      .status(statusCodes.ProvideAllFields)
      .json({ message: "Provide mandatory fields" });
  }
};

const OverAllReport = async (request, response) => {
  if (
    request.body.from_date ||
    request.body.to_date ||
    (request.body.org_id && request.body.sub_fee_id)
  ) {
    try {
      const from_date = request.body.from_date;
      const to_date = request.body.to_date;
      const org_id = request.body.org_id;
      const student_id = request.body?.student_id;
      const sub_fee_id = JSON.parse(request.body.sub_fee_id);
      let students_ids = [];
      if (student_id) {
        students_ids = await studentinfo.find({
          id: { $regex: student_id, $options: "i" },
          status: "1",
        });
      }
      let unwind = { $unwind: "$paiddetails" };
      let match = { "paiddetails.org_id": org_id, "paiddetails.status": "1" };
      if (students_ids.length > 0)
        match["paiddetails.student_id"] = {
          $in: students_ids.map((item) => item._id.toString()),
        };
      if (sub_fee_id && sub_fee_id.length > 0) {
        match["paiddetails.sub_fee_id"] = { $in: sub_fee_id };
      }
      if (from_date) {
        match["paiddetails.date"] = { $gte: from_date };
      }
      if (to_date) {
        match["paiddetails.date"] = { $lte: to_date };
      }
      if (from_date && to_date) {
        match["paiddetails.date"] = { $gte: from_date, $lte: to_date };
      }
      let groupby = {
        $group: {
          _id: {
            student_id: "$paiddetails.student_id",
            sub_fee_id: "$paiddetails.sub_fee_id",
          },
          sum: { $sum: { $toDouble: "$paiddetails.amount" } },
        },
      };
      let final_res = {
        $project: {
          _id: 0,
          student_id: "$_id.student_id",
          sub_fee_id: "$_id.sub_fee_id",
          sum: "$sum",
        },
      };
      let paid_details = await transaction.aggregate([
        unwind,
        {
          $match: match,
        },
        groupby,
        final_res,
        {
          $lookup: {
            from: "students",
            let: { salId: { $toObjectId: "$student_id" } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$salId"] },
                      { $eq: ["$status", "1"] },
                    ],
                  },
                },
              },
            ],
            as: "student_details",
          },
        },
        { $unwind: "$student_details" },
        {
          $lookup: {
            from: "sub_fee_details",
            let: { salId: { $toObjectId: "$sub_fee_id" } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$salId"] },
                      { $eq: ["$status", "1"] },
                    ],
                  },
                },
              },
            ],
            as: "sub_fee_name",
          },
        },
        { $unwind: "$sub_fee_name" },
        {
          $set: {
            sub_fee_type: "$sub_fee_name.sub_fee_type",
            student_ID: "$student_details.id",
            student_name: "$student_details.student_name",
            hall_ticket_number: "$student_details.hall_ticket_number",
          },
        },
        { $unset: ["sub_fee_name", "student_details"] },
      ]);

      let fee_types = paid_details.map((item, index) => ({
        amount: 0,
        sub_fee_type: item.sub_fee_type,
        sub_fee_id: item.sub_fee_id,
      }));
      const unique = (arr, props = []) => [
        ...new Map(
          arr.map((entry) => [props.map((k) => entry[k]).join("|"), entry])
        ).values(),
      ];
      const sub_fees = unique(fee_types, ["sub_fee_id"]);
      let result = paid_details.reduce((item, value) => {
        let temp = item.find(
          (sub_item) => sub_item.student_id === value.student_id
        );
        const fee = {};
        fee["sub_fee_id"] = value?.sub_fee_id;
        fee["sub_fee_type"] = value?.sub_fee_type;
        fee["amount"] = (value?.sum).toFixed(2);
        if (!temp) {
          const student = {};
          student["student_id"] = value?.student_id;
          student["student_ID"] = value?.student_ID;
          student["student_name"] = value?.student_name;
          student["hall_ticket_number"] = value?.hall_ticket_number;
          student["fee_details"] = sub_fees.map((u) =>
            u.sub_fee_id !== fee.sub_fee_id ? u : fee
          );
          // student.fee_details.push(fee);
          item.push(student);
        } else {
          temp["fee_details"] = temp.fee_details.map((u) =>
            u.sub_fee_id !== fee.sub_fee_id ? u : fee
          );
          // temp.fee_details.push(fee);
        }
        return item;
      }, []);

      response
        .status(statusCodes.success)
        .json({ columns: sub_fees, report: result });
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: e.message });
    }
  } else {
    response
      .status(statusCodes.ProvideAllFields)
      .json({ message: "Provide mandatory fields" });
  }
};

const DayWiseTotals = async (request, response) => {
  if ((request.body.from_date || request.body.to_date) && request.body.org_id) {
    try {
      const from_date = request.body.from_date;
      const to_date = request.body.to_date;
      const org_id = request.body.org_id;

      let unwind = { $unwind: "$paiddetails" };
      let match = { "paiddetails.org_id": org_id, "paiddetails.status": "1" };
      if (from_date) {
        match["paiddetails.date"] = { $gte: from_date };
      }
      if (to_date) {
        match["paiddetails.date"] = { $lte: to_date };
      }
      if (from_date && to_date) {
        match["paiddetails.date"] = { $gte: from_date, $lte: to_date };
      }
      let groupby = {
        $group: {
          _id: { date: "$paiddetails.date" },
          cash: { $sum: { $toDouble: "$paiddetails.cash" } },
          bank: { $sum: { $toDouble: "$paiddetails.bank" } },
          upi: { $sum: { $toDouble: "$paiddetails.upi" } },
          total_amount: { $sum: { $toDouble: "$paiddetails.amount" } },
        },
      };
      let final_res = {
        $project: {
          _id: 0,
          date: "$_id.date",
          cash: { $round: ["$cash", 2] },
          bank: { $round: ["$bank", 2] },
          upi: { $round: ["$upi", 2] },
          total_amount: { $round: ["$total_amount", 2] },
        },
      };
      // let final_res = { $project: { "_id": 0, "date": "$_id.date", cash: "$cash", bank: "$bank", upi: "$upi", total_amount: "$total_amount" } };

      let day_wise_totals = await transaction
        .aggregate([
          unwind,
          {
            $match: match,
          },
          groupby,
          final_res,
        ])
        .sort({ date: -1 });
      response.status(statusCodes.success).json(day_wise_totals);
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: e.message });
    }
  } else {
    response
      .status(statusCodes.ProvideAllFields)
      .json({ message: "Provide mandatory fields" });
  }
};

const FeeWiseTotals = async (request, response) => {
  if (request.body.org_id) {
    try {
      const org_id = request.body.org_id;
      let sort = { $sort: { sub_fee_type: -1 } };

      let unwind = { $unwind: "$paiddetails" };
      let aggregate = [
        { $match: { org_id: org_id, status: "1" } },
        {
          $project: {
            sub_fee_id: { $toString: "$_id" },
            sub_fee_type: "$sub_fee_type",
          },
        },
        {
          $lookup: {
            from: "transactions",
            let: { sub_fee_id: "$sub_fee_id" },
            pipeline: [
              unwind,
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$paiddetails.sub_fee_id", "$$sub_fee_id"] },
                      { $eq: ["$paiddetails.status", "1"] },
                      { $eq: ["$paiddetails.org_id", org_id] },
                    ],
                  },
                },
              },
            ],
            as: "trans_details",
          },
        },
        {
          $unwind: { path: "$trans_details", preserveNullAndEmptyArrays: true },
        },
        {
          $group: {
            _id: { sub_fee_id: "$sub_fee_id", sub_fee_type: "$sub_fee_type" },
            distinct_count: {
              $sum: {
                $cond: [
                  { $gt: ["$trans_details.paiddetails.sub_fee_id", null] },
                  1,
                  0,
                ],
              },
            },
            total_amount: {
              $sum: { $toDouble: "$trans_details.paiddetails.amount" },
            },
          },
        },
        {
          $project: {
            _id: 0,
            sub_fee_type: "$_id.sub_fee_type",
            total_amount: { $round: ["$total_amount", 2] },
            distinct_count: "$distinct_count",
          },
        },
      ];

      let draw = parseInt(request.body?.draw);
      if (draw) draw = parseInt(draw);

      if (draw) {
        let row = request.body.start;
        let rowperpage = request.body.length; // Rows display per page
        let columnIndex = request.body.order[0]["column"]; // Column index
        let columnName = request.body.columns[columnIndex]["data"]; // Column name
        let columnSortOrder = request.body.order[0]["dir"]; // asc or desc
        let searchStr = request.body.search.value;
        let final_result = [];
        if (searchStr) {
          let regex = new RegExp(searchStr, "i");
          searchStr = {
            $or: [
              { sub_fee_type: regex },
              { total_amount: regex },
              { distinct_count: regex },
            ],
          };
        } else {
          searchStr = {};
        }
        let search = { $match: searchStr };
        final_result.push(search);
        if (columnSortOrder == "asc") {
          columnSortOrder = 1;
        } else {
          columnSortOrder = -1;
        }
        if (columnName) {
          sort = { $sort: { [columnName]: columnSortOrder } };
        }
        let skip = { $skip: Number(row) };
        final_result.push(skip);
        let limit = { $limit: Number(rowperpage) };
        if (rowperpage && rowperpage != "-1") {
          final_result.push(limit);
        }
        let faceit = {
          $facet: {
            totalCount: [{ $count: "count" }],
            searchCount: [search, { $count: "count" }],
            aaData: final_result,
          },
        };
        let addfields = {
          $addFields: {
            iTotalRecords: {
              $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
            },
            iTotalDisplayRecords: {
              $ifNull: [{ $arrayElemAt: ["$searchCount.count", 0] }, 0],
            },
          },
        };
        aggregate.push(sort);
        aggregate.push(faceit);
        aggregate.push(addfields);
        aggregate.push({ $unset: ["totalCount", "searchCount"] });
        let result = await subfee.aggregate(aggregate);

        let res1 = result[0];
        if (!res1) {
          res1 = {
            iTotalRecords: 0,
            iTotalDisplayRecords: 0,
            aaData: [],
          };
        }
        res1["draw"] = draw;
        response.status(statusCodes.success).send(res1);
      } else {
        aggregate.push(sort);
        let result = await subfee.aggregate(aggregate);

        response.status(statusCodes.success).json(result);
      }
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: e.message });
    }
  } else {
    response
      .status(statusCodes.ProvideAllFields)
      .json({ message: "Provide mandatory fields" });
  }
};

// const FeeWiseTotals = async (request, response) => {

//   if (request.body.org_id) {
//     try {
//       const org_id = request.body.org_id;

//       let unwind = { "$unwind": "$paiddetails" };
//       let result = await subfee.aggregate([{ $match: { "org_id": org_id, "status": "1" } }, { $project: { sub_fee_id: { $toString: "$_id" }, sub_fee_type: "$sub_fee_type" } },
//       {
//         "$lookup": {
//           "from": "transactions",
//           "let": { "sub_fee_id": "$sub_fee_id" },
//           "pipeline": [
//             unwind,
//             {
//               "$match": {
//                 "$expr": {
//                   $and: [
//                     { $eq: ['$paiddetails.sub_fee_id', '$$sub_fee_id'] },
//                     { $eq: ["$paiddetails.status", "1"] },
//                     { $eq: ["$paiddetails.org_id", org_id] },
//                   ],
//                 }
//               }
//             }
//           ],
//           "as": "trans_details"
//         },
//       },
//       { "$unwind": { "path": "$trans_details", "preserveNullAndEmptyArrays": true } },
//       { $group: { '_id': { sub_fee_id: '$sub_fee_id', sub_fee_type: '$sub_fee_type' }, distinct_count: { "$sum": { "$cond": [{ "$gt": ["$trans_details.paiddetails.sub_fee_id", null] }, 1, 0] } }, total_amount: { $sum: { "$toDouble": "$trans_details.paiddetails.amount" } } } },
//       { $project: { "_id": 0, "sub_fee_id": "$_id.sub_fee_id", "sub_fee_type": "$_id.sub_fee_type", total_amount: { $round: ["$total_amount", 2] }, distinct_count: "$distinct_count" } }
//       ]);
//       response.status(statusCodes.success).json(result);

//     } catch (e) {
//
//       response.status(statusCodes.SomethingWentWrong).json({ message: e.message });
//     }
//   } else {
//     response.status(statusCodes.ProvideAllFields).json({ message: "Provide mandatory fields" });
//   }
// }

const DateAndFeeWiseTotals = async (request, response) => {
  if (request.body.org_id) {
    try {
      const org_id = request.body.org_id;
      let unwind = { $unwind: "$paiddetails" };
      let match = { "paiddetails.org_id": org_id, "paiddetails.status": "1" };
      let groupby = {
        $group: {
          _id: {
            date: "$paiddetails.date",
            sub_fee_id: "$paiddetails.sub_fee_id",
          },
          distinct_count: { $sum: 1 },
          total_amount: { $sum: { $toDouble: "$paiddetails.amount" } },
        },
      };
      let final_res = {
        $project: {
          _id: 0,
          date: "$_id.date",
          sub_fee_id: "$_id.sub_fee_id",
          total_amount: { $round: ["$total_amount", 2] },
          distinct_count: "$distinct_count",
        },
      };
      let day_wise_totals = await transaction
        .aggregate([
          unwind,
          {
            $match: match,
          },
          groupby,
          final_res,
          {
            $lookup: {
              from: "sub_fee_details",
              let: { salId: { $toObjectId: "$sub_fee_id" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$salId"] },
                        { $eq: ["$status", "1"] },
                        { $eq: ["$org_id", org_id] },
                      ],
                    },
                  },
                },
              ],
              as: "sub_fee_details",
            },
          },
          { $unwind: "$sub_fee_details" },
          {
            $lookup: {
              from: "fee_details",
              let: { salId: { $toObjectId: "$sub_fee_details.fee_type_id" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$salId"] },
                        { $eq: ["$status", "1"] },
                      ],
                    },
                  },
                },
              ],
              as: "fee_details",
            },
          },
          { $unwind: "$fee_details" },

          {
            $set: {
              sub_fee_type: "$sub_fee_details.sub_fee_type",
              fee_type_id: "$sub_fee_details.fee_type_id",
              fee_order: "$fee_details.fee_order",
              sub_fee_order: "$sub_fee_details.fee_order",
            },
          },
          { $unset: ["sub_fee_details", "fee_details"] },
        ])
        .sort({ date: -1, fee_order: 1, sub_fee_order: 1 });
      response.status(statusCodes.success).json(day_wise_totals);
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: e.message });
    }
  } else {
    response
      .status(statusCodes.ProvideAllFields)
      .json({ message: "Provide mandatory fields" });
  }
};
const CounterDayWiseTotals = async (request, response) => {
  if (request.body.org_id) {
    try {
      const org_id = request.body.org_id;

      let unwind = { $unwind: "$paiddetails" };
      let match = { "paiddetails.org_id": org_id, "paiddetails.status": "1" };
      let groupby = {
        $group: {
          _id: {
            date: "$paiddetails.date",
            created_by: "$paiddetails.created_by",
          },
          cash: { $sum: { $toDouble: "$paiddetails.cash" } },
          bank: { $sum: { $toDouble: "$paiddetails.bank" } },
          upi: { $sum: { $toDouble: "$paiddetails.upi" } },
          total_amount: { $sum: { $toDouble: "$paiddetails.amount" } },
        },
      };
      let final_res = {
        $project: {
          _id: 0,
          date: "$_id.date",
          created_by: "$_id.created_by",
          cash: { $round: ["$cash", 2] },
          bank: { $round: ["$bank", 2] },
          upi: { $round: ["$upi", 2] },
          total_amount: { $round: ["$total_amount", 2] },
        },
      };
      let counter_day_wise_totals = await transaction
        .aggregate([
          unwind,
          {
            $match: match,
          },
          groupby,
          final_res,
          {
            $lookup: {
              from: "securities",
              let: { salId: { $toObjectId: "$created_by" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$salId"] },
                        { $eq: ["$status", "1"] },
                        { $eq: ["$org_id", org_id] },
                      ],
                    },
                  },
                },
              ],
              as: "created_by_details",
            },
          },
          { $unwind: "$created_by_details" },
          {
            $set: {
              created_by_name: "$created_by_details.admin_name",
            },
          },
          { $unset: ["created_by_details"] },
        ])
        .sort({ date: -1 });
      response.status(statusCodes.success).json(counter_day_wise_totals);
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: e.message });
    }
  } else {
    response
      .status(statusCodes.ProvideAllFields)
      .json({ message: "Provide mandatory fields" });
  }
};
const TransactionsReport = async (request, response) => {
  if (request.body.from_date || request.body.to_date || request.body.org_id) {
    try {
      const from_date = request.body?.from_date;
      const to_date = request.body?.to_date;
      const org_id = request.body?.org_id;
      const student_id = request.body?.student_id;
      let students_ids = [];
      if (student_id) {
        students_ids = await studentinfo.find({
          id: { $regex: student_id, $options: "i" },
          status: "1",
        });
      }
      let unwind = { $unwind: "$paiddetails" };
      let match = { "paiddetails.org_id": org_id, "paiddetails.status": "1" };
      if (students_ids.length > 0)
        match["paiddetails.student_id"] = {
          $in: students_ids.map((item) => item._id.toString()),
        };
      if (from_date) {
        match["paiddetails.date"] = { $gte: from_date };
      }
      if (to_date) {
        match["paiddetails.date"] = { $lte: to_date };
      }
      if (from_date && to_date) {
        match["paiddetails.date"] = { $gte: from_date, $lte: to_date };
      }
      let Transactions = await transaction
        .aggregate([
          unwind,
          { $match: match },
          { $set: { paiddetails_id: "$paiddetails._id" } },
          { $unset: "paiddetails._id" },
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: ["$$ROOT", "$paiddetails"],
              },
            },
          },
          {
            $lookup: {
              from: "students",
              let: { salId: { $toObjectId: "$student_id" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$salId"] },
                        { $eq: ["$status", "1"] },
                        { $eq: ["$org_id", org_id] },
                      ],
                    },
                  },
                },
              ],
              as: "student_details",
            },
          },
          { $unwind: "$student_details" },
          {
            $lookup: {
              from: "sub_fee_details",
              let: { salId: { $toObjectId: "$sub_fee_id" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$salId"] },
                        { $eq: ["$status", "1"] },
                        { $eq: ["$org_id", org_id] },
                      ],
                    },
                  },
                },
              ],
              as: "sub_fee_name",
            },
          },
          { $unwind: "$sub_fee_name" },
          {
            $lookup: {
              from: "securities",
              let: { salId: { $toObjectId: "$created_by" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$salId"] },
                        { $eq: ["$status", "1"] },
                        { $eq: ["$org_id", org_id] },
                      ],
                    },
                  },
                },
              ],
              as: "created_by_details",
            },
          },
          { $unwind: "$created_by_details" },
          {
            $set: {
              sub_fee_type: "$sub_fee_name.sub_fee_type",
              student_ID: "$student_details.id",
              student_name: "$student_details.student_name",
              created_by_name: "$created_by_details.admin_name",
              fee_type_id: "$sub_fee_name.fee_type_id",
            },
          },
          {
            $unset: [
              "paiddetails",
              "sub_fee_name",
              "student_details",
              "created_by_details",
            ],
          },
        ])
        .sort({ date: -1 });
      response.status(statusCodes.success).json(Transactions);
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: e.message });
    }
  } else {
    response
      .status(statusCodes.ProvideAllFields)
      .json({ message: "Provide mandatory fields" });
  }
};
const DayBookReport = async (request, response) => {
  if (request.body.org_id) {
    try {
      const org_id = request.body.org_id;
      const date = request.body?.date;
      let unwind = { $unwind: "$paiddetails" };
      let match = { "paiddetails.org_id": org_id, "paiddetails.status": "1" };
      if (date) match["paiddetails.date"] = date;
      let group = {};
      if (date) {
        group["date"] = "$paiddetails.date";
      }
      group["created_by"] = "$paiddetails.created_by";
      let groupby = {
        $group: {
          _id: group,
          cash: { $sum: { $toDouble: "$paiddetails.cash" } },
          bank: { $sum: { $toDouble: "$paiddetails.bank" } },
          upi: { $sum: { $toDouble: "$paiddetails.upi" } },
          total_amount: { $sum: { $toDouble: "$paiddetails.amount" } },
        },
      };
      let final_res = {
        $project: {
          _id: 0,
          date: "$_id.date",
          created_by: "$_id.created_by",
          cash: { $round: ["$cash", 2] },
          bank: { $round: ["$bank", 2] },
          upi: { $round: ["$upi", 2] },
          total_amount: { $round: ["$total_amount", 2] },
        },
      };
      let counter_day_wise_totals = await transaction
        .aggregate([
          unwind,
          {
            $match: match,
          },
          { $set: { paiddetails_id: "$paiddetails._id" } },
          { $unset: "paiddetails._id" },
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: ["$$ROOT", "$paiddetails"],
              },
            },
          },
          groupby,
          final_res,
          {
            $lookup: {
              from: "securities",
              let: { salId: { $toObjectId: "$created_by" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$salId"] },
                        { $eq: ["$status", "1"] },
                        { $eq: ["$org_id", org_id] },
                      ],
                    },
                  },
                },
              ],
              as: "created_by_details",
            },
          },
          { $unwind: "$created_by_details" },
          {
            $set: {
              created_by_name: "$created_by_details.admin_name",
            },
          },
          { $unset: ["created_by_details"] },
        ])
        .sort({ date: -1 });
      response.status(statusCodes.success).json(counter_day_wise_totals);
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: e.message });
    }
  } else {
    response
      .status(statusCodes.ProvideAllFields)
      .json({ message: "Provide mandatory fields" });
  }
};
// const getdueamount= async (item) => {
// let branchfeeid=await branchfee.find({branch_id:item?.branch_id})

// let due_details = [];
// let value_details = [];
// for (let i = 0; i < branchfeeid.length; i++) {
//   let branchobj=branchfeeid[i];
//   branchobj['student_id']=item?.student_id
//   let feeamt=getStudentTotalpaidamtByFeeType(branchobj)
//
//   due_details.push(await getAllbranchfeeByBranchid(branchfeeid[i]))
// }

// value_details = await Promise.all(due_details);

// }
// const gettotaldueamt = async (item) => {

//   let branchamt = await getAllbranchfeeByBranchid(item)
//   let transactionamt = await getStudentTotalpaidamtByStudentid(item)

//   let concession_amt = await getconcessionByStudentId(item);
//   let concessionvalue = 0;
//   if (concession_amt > 0) {
//     concessionvalue = (concession_amt / 100) * branchamt;
//   }
//   let total_due_amt = 0.0;
//   total_due_amt = parseFloat(branchamt) - parseFloat(transactionamt) - parseFloat(concessionvalue);
//   return total_due_amt;

// }
const getpaidamt = async (item) => {
  let obj = {};
  obj["paid_amount"] = item?.amount;
  let feedetails = await getFeedetaisbyID(item?.sub_fee_id);

  obj["subfeename"] = feedetails[0].sub_fee_type ?? "";
  obj["fee_name"] = feedetails[0].fee_type ?? "";

  return obj;
};
const getStudamtdetails = async (request, response) => {
  try {
    var student_id = request.body.student_id;
    //var users = await User.find({ _id: ObjectID(searchedId) });

    let student_details = await getStudentdetailsById(student_id, "1", true);
    if (student_details.statusCode == 200) {
      let studentdata = student_details?.data;
      let branch_fee = studentdata?.branch_fee;
      let branchstudent = studentdata?.branch_student;

      const fees_details = [];
      let itemsObj = [];
      for (let i = 0; i < branch_fee.length; i++) {
        let sub_fee_id = branch_fee[i]?.sub_fee_id;
        let amount = branch_fee[i]?.amount;
        branchstudent["sub_fee_id"] = sub_fee_id;
        branchstudent["amount"] = amount;
        fees_details.push(getstudentduepaidFeeamt(branchstudent));
      }
      //var newArray = fees_details.filter(value => Object.keys(value).length !== 0);
      itemsObj = await Promise.all(fees_details);
      itemsObj = itemsObj.filter((value) => Object.keys(value).length !== 0);

      let oldduevalue = await getoldduedetails(
        studentdata?._id.toString(),
        studentdata?.org_id
      );
      if (oldduevalue) {
        itemsObj.push(oldduevalue);
      }

      let user_obj = {};

      user_obj["old_due"] = oldduevalue?.due_amount ?? 0.0;
      user_obj["student_id"] = studentdata.student_id;
      user_obj["hall_ticket_number"] = studentdata.hall_ticket_number;
      user_obj["student_phone_number"] = studentdata.student_phone_number;
      user_obj["admission_number"] = studentdata.admission_number;
      user_obj["student_name"] = studentdata.student_name;
      user_obj["_id"] = studentdata._id;
      user_obj["feedetails"] = itemsObj;

      response.status(statusCodes.success).json(user_obj);
    } else {
      response
        .status(student_details.statusCode)
        .json({ message: student_details.message });
    }
  } catch (error) {
    response.status(404).json({ message: error.message });
  }
};
const getoldduedetails = async (student_id, org_id, academic_years_id) => {
  return new Promise(async (resolve, reject) => {
    let studolddue = await olddue.findOne({
      student_id: student_id,
      status: "1",
    });
    let feeid = await fee.findOne({
      other_fee_id: "1",
      org_id: org_id,
      status: "1",
    });
    if (feeid) {
      let subfeeid = await subfee.findOne({
        fee_type_id: feeid._id.toString(),
      });
      let match = {
        "paiddetails.student_id": student_id,
        "paiddetails.sub_fee_id": subfeeid._id.toString(),
        "paiddetails.status": "1",
        "paiddetails.org_id": org_id,
      };
      if (academic_years_id)
        match["paiddetails.academic_years_id"] = academic_years_id;
      let transaction_amount = await transaction.aggregate([
        { $unwind: "$paiddetails" },
        { $match: match },
        {
          $project: {
            emit: {
              key: "$paiddetails.sub_fee_id",
              value: "$paiddetails.amount",
            },
          },
        },
        {
          $group: {
            // equivalent to the reduce function
            _id: "$emit.key",
            paid_amount: {
              $accumulator: {
                init: function () {
                  return 0;
                },
                initArgs: [],
                accumulate: function (state, value) {
                  return parseFloat(state) + parseFloat(value);
                },
                accumulateArgs: ["$emit.value"],
                merge: function (state1, state2) {
                  return parseFloat(state1) + parseFloat(state2);
                },
                lang: "js",
              },
            },
          },
        },
      ]);
      let actual_amt = studolddue
        ? parseFloat(studolddue?.old_due_amount).toFixed(2)
        : 0;
      let paid_amount =
        transaction_amount && transaction_amount.length > 0
          ? parseFloat(transaction_amount[0]?.paid_amount).toFixed(2)
          : 0;
      let due_amount = (
        parseFloat(actual_amt) - parseFloat(paid_amount)
      ).toFixed(2);
      let obj = {};
      obj["access_status"] = "1";
      obj["other_fee_id"] = feeid?.other_fee_id ?? "1";
      obj["sub_fee_id"] = subfeeid._id.toString();
      obj["sub_fee_name"] = subfeeid?.sub_fee_type ?? "";
      obj["fee_name"] = feeid?.fee_type ?? "";
      obj["due_amount"] = due_amount;
      obj["paid_amount"] = paid_amount;
      obj["actual_amount"] = actual_amt;

      resolve(obj);
    } else {
      resolve(false);
    }
  });
};
const getfinalamtstudent = async (request, response) => {
  if (request.body.org_id) {
    try {
      let org_id = request.body.org_id;
      let calendar_years_id = await getCurrentCalendarYearIDByOrgId(org_id);
      if (calendar_years_id) {
        let match = { org_id: org_id, status: "1" };
        if (calendar_years_id) match["calendar_years_id"] = calendar_years_id;
        let students = await allocstudent
          .aggregate([
            { $match: match },
            {
              $lookup: {
                from: "students",
                let: { salId: { $toObjectId: "$student_id" } },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$_id", "$$salId"] }],
                      },
                    },
                  },
                ],
                as: "student_details",
              },
            },
            { $unset: "status" },
            { $unset: "student_details.created_date_time" },
            { $unset: "student_details.created_by" },
            { $unset: "student_details._id" },
            { $unwind: "$student_details" },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: ["$$ROOT", "$student_details"],
                },
              },
            },
            { $unset: ["student_details"] },
          ])
          .sort({ student_id: -1 });
        students = students.filter(
          (item) => item.status == 1 || item.status == 2
        );

        // let finalamtstudent = await studentinfo.find({ $or: [{ "status": 1 }, { "status": 2 }], "org_id": org_id }).sort({ _id: -1 });
        let itemsObj = [];
        let feedetails = [];
        for (let i = 0; i < students.length; i++) {
          let value = await getfinalsettlestudentdetails(
            students[i].student_id,
            students[i].status
          );
          feedetails.push(value);
        }
        itemsObj = await Promise.all(feedetails);
        let checkvalue = itemsObj.filter((item) => item.total_due_amt > 0);
        response.status(statusCodes.success).json(checkvalue);
      } else {
        response
          .status(statusCodes.InvalidData)
          .json({ message: "No active calender year" });
      }
    } catch (e) {
      console.log(e);
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: "Problem occurred while transaction" });
    }
  } else {
    response
      .status(statusCodes.ProvideAllFields)
      .json({ message: "Provide mandatory fields." });
  }
};
const getfinalsettlestudentdetails = async (
  student_id_value,
  status,
  org_id
) => {
  return new Promise(async (resolve, reject) => {
    let student_details = await getStudentByIDOrgId(student_id_value, org_id);
    let dueobj = {};
    dueobj["hall_ticket_number"] = student_details?.hall_ticket_number;
    dueobj["student_phone_number"] = student_details?.student_phone_number;
    dueobj["admission_number"] = student_details?.admission_number;
    dueobj["student_name"] = student_details?.student_name;
    dueobj["id"] = student_details?.id;
    dueobj["student_id"] = student_id_value;
    dueobj["status"] = status;
    dueobj["total_due_amt"] = "0.00";
    let dueamt = await getdueamtdetails(student_id_value, status);
    if (dueamt.length > 0) {
      let totaldueamt = 0.0;
      for (let i = 0; i < dueamt.length; i++) {
        totaldueamt =
          parseFloat(totaldueamt) + parseFloat(dueamt[i].due_amount);
      }
      dueobj["total_due_amt"] = totaldueamt.toFixed(2);
    }
    resolve(dueobj);
  });
};
const getstudentfinaldueamount = (stud_data, oldue_status) => {
  return new Promise(async (resolve, reject) => {
    stud_data["total_due_amt"] = "0.00";
    let dueamt = await getdueamtdetails(
      stud_data?.student_id,
      stud_data?.status,
      oldue_status
    );

    if (dueamt.length > 0) {
      let totaldueamt = 0.0;
      for (let i = 0; i < dueamt.length; i++) {
        totaldueamt =
          parseFloat(totaldueamt) + parseFloat(dueamt[i].due_amount);
      }
      stud_data["total_due_amt"] = totaldueamt.toFixed(2);

      resolve(stud_data);
    } else {
      resolve(stud_data);
    }
  });
};
const getrelievestudentdashboarddetails = async (request, response) => {
  if (request.body.org_id && request.body.status) {
    try {
      let org_id = request.body.org_id;
      let cyearid = await getCurrentCalendarYearIDByOrgId(org_id);
      // let cyearid
      console.log("cyear id is ",cyearid)
      let allocstatus = request.body.status;

      let match = { org_id: org_id, status: request.body.status };
      if (cyearid) {
        match["calendar_years_id"] = cyearid;
      }
      const relievestudentvalue = await allocstudent
        .aggregate([
          // {
          //   $match: match,
          // },

          {
            $lookup: {
              from: "students",
              let: { salId: { $toObjectId: "$student_id" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$salId"] },
                        { $eq: ["$status", allocstatus] },
                      ],
                    },
                  },
                },
              ],
              as: "student_details",
            },
          },

          { $unset: ["student_details"] },
        ])
        .sort({ id: 1 });

      let itemsObj = [];
      let feedetails = [];
      for (let i = 0; i < relievestudentvalue.length; i++) {
        let item = relievestudentvalue[i];
        feedetails.push(await getstudentfinaldueamount(item));
      }
      itemsObj = await Promise.all(feedetails);
      // console.log("itemsObj is", itemsObj.length);
      // console.log("relievestudentvalue is", relievestudentvalue.length);

      let totaldueamount = 0;
      for (let i = 0; i < itemsObj.length; i++) {
        totaldueamount += parseFloat(itemsObj[i].total_due_amt);
      }
      // console.log("feedetails ---->", totaldueamount);
      response.status(statusCodes.success).json(totaldueamount);
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: "Problem occurred while transaction" });
    }
  } else {
    response
      .status(statusCodes.ProvideAllFields)
      .json({ message: "Provide mandatory fields." });
  }
};
const getdatevalue = async (request, response) => {
  if (request.body.org_id) {
    try {
      let org_id = request.body.org_id;
      let match = { status: "1", org_id: org_id };
      let now = new Date();
      let current_month_value = new Date(now.getFullYear(), now.getMonth());
      let currentmonth_value = current_month_value.getMonth() + 1;
      var prev_month_value = new Date(now.getFullYear() - 1, 11, 1);
      let prevmonth_value = prev_month_value.getMonth() + 1;
      const currentmonthvalue = await studentinfo.aggregate([
        {
          $match: match,
        },
        {
          $project: {
            month: { $substr: ["$created_date_time", 5, 2] },
          },
        },
        { $match: { month: currentmonth_value } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]);
      const prevmonthvalue = await studentinfo.aggregate([
        {
          $project: {
            month: { $substr: ["$created_date_time", 5, 2] },
          },
        },
        { $match: { month: prevmonth_value } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]);
      let studentcount = await studentinfo.find(match).count();

      let currentmonth = 0;
      let prevmonth = 0;
      if (currentmonthvalue.length > 0) {
        currentmonth = currentmonthvalue[0].count;
      }
      if (prevmonthvalue.length > 0) {
        prevmonth = prevmonthvalue[0].count;
      }
      let percentagecalc = await percentagevalue(
        currentmonth_value,
        prevmonth_value,
        studentcount
      );
      response.status(statusCodes.success).json(percentagecalc);
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: "Problem occurred while transaction" });
    }
  } else {
    response
      .status(statusCodes.ProvideAllFields)
      .json({ message: "Provide mandatory fields." });
  }
};
const dashboardvalue = async (request, response) => {
  if (request.body.org_id) {
    try {
      let org_id = request.body.org_id;
      const d = new Date();
      let match = { "paiddetails.status": "1", "paiddetails.org_id": org_id };
      let currentdate_value = addLeadingZeros(d.getDate(), 2);

      d.setDate(d.getDate() - 1);
      let yesterday = addLeadingZeros(d.getDate(), 2);

      let studentdatecount = await transaction.aggregate([
        { $unwind: "$paiddetails" },
        {
          $match: match,
        },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]);
      let studencountvalue = 0;
      if (studentdatecount.length > 0) {
        studencountvalue = studentdatecount[0].count;
      }
      let percentagedatecalc = await percentagevalue(
        currentdate_value,
        yesterday,
        studencountvalue,
        "Transaction per day"
      );
      let current_month_value = new Date(d.getFullYear(), d.getMonth());
      let currentmonth_value = current_month_value.getMonth() + 1;
      var prev_month_value = new Date(d.getFullYear() - 1, 11, 1);
      let prevmonth_value = prev_month_value.getMonth() + 1;

      let match1 = { status: "1", org_id: org_id };
      let studentcount = await studentinfo.find(match1).count();

      let percentagecalc = await percentagevalue(
        currentmonth_value,
        prevmonth_value,
        studentcount,
        "No of Students"
      );

      let calendar_years_id = await cyear.findOne({
        current_active: "1",
        org_id: org_id,
        status: "1",
      });
      let activeyear = calendar_years_id._id.toString();
      let calval = parseInt(calendar_years_id.calendar_year_value) - 1;
      let prev_calendar_year_value = await cyear.findOne({
        calendar_year_value: calval.toString(),
        org_id: org_id,
        status: "1",
      });
      let prevyear = calendar_years_id._id.toString();
      if (prev_calendar_year_value) {
        prevyear = prev_calendar_year_value._id.toString();
      }
      let activestudentcurrent = await getstudentdashboard(
        org_id,
        "1",
        activeyear
      );

      let relievedstudentcurrent = await getstudentdashboard(
        org_id,
        "2",
        activeyear
      );

      let activestudentprev = await getstudentdashboard(org_id, "1", prevyear);

      let relievedstudentprev = await getstudentdashboard(
        org_id,
        "2",
        prevyear
      );

      let percentagecalc2 = await percentagevalue(
        activestudentcurrent,
        activestudentprev,
        activestudentcurrent,
        "Active Students Due"
      );
      let percentagecalc3 = await percentagevalue(
        relievedstudentcurrent,
        relievedstudentprev,
        relievedstudentcurrent,
        "Relieved Students Dues"
      );
      let array = [];
      array.push(...percentagedatecalc);
      array.push(...percentagecalc);
      array.push(...percentagecalc2);
      array.push(...percentagecalc3);

      response.status(statusCodes.success).json(array);
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: e.message });
    }
  } else {
    response
      .status(statusCodes.ProvideAllFields)
      .json({ message: "Provide mandatory fields." });
  }
};
const getstudentdashboard = async (org_id, oldue_status, calendar_years_id) => {
  let allocstatus = oldue_status;
  let match = { org_id: org_id, status: oldue_status };
  if (calendar_years_id) {
    match["calendar_years_id"] = calendar_years_id;
  }
  const relievestudentvalue = await allocstudent
    .aggregate([
      {
        $match: match,
      },
      { $unset: ["status"] },
      {
        $lookup: {
          from: "students",
          let: { salId: { $toObjectId: "$student_id" } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$salId"] },
                    { $eq: ["$status", allocstatus] },
                  ],
                },
              },
            },
          ],
          as: "student_details",
        },
      },
      { $unwind: "$student_details" },
      {
        $set: {
          status: "$student_details.status",
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$$ROOT", "$student_details"],
          },
        },
      },
      { $unset: ["student_details"] },
    ])
    .sort({ id: 1 });

  let itemsObj = [];
  let feedetails = [];
  for (let i = 0; i < relievestudentvalue.length; i++) {
    let item = relievestudentvalue[i];
    feedetails.push(await getstudentfinaldueamount(item));
  }
  itemsObj = await Promise.all(feedetails);

  let totaldueamount = 0;
  for (let i = 0; i < itemsObj.length; i++) {
    totaldueamount += parseFloat(itemsObj[i].total_due_amt);
  }

  return totaldueamount;
};

const getdayvalue = async (request, response) => {
  if (request.body.org_id) {
    try {
      let org_id = request.body.org_id;
      const d = new Date();
      let match = { "paiddetails.status": "1", "paiddetails.org_id": org_id };
      let currentmonth_value = addLeadingZeros(d.getDate(), 2);

      d.setDate(d.getDate() - 1);
      let yesterday = addLeadingZeros(d.getDate(), 2);

      const currentmonthvalue = await transaction.aggregate([
        { $unwind: "$paiddetails" },
        {
          $match: match,
        },
        {
          $project: {
            month: { $substr: ["$paiddetails.created_date_time", 8, 2] },
          },
        },
        { $match: { month: currentmonth_value } },
        {
          $group: {
            _id: null,
            total_amount: { $sum: { $toDouble: "$paiddetails.amount" } },
          },
        },
      ]);
      const prevmonthvalue = await transaction.aggregate([
        { $unwind: "$paiddetails" },
        {
          $match: match,
        },
        {
          $project: {
            month: { $substr: ["$paiddetails.created_date_time", 8, 2] },
          },
        },
        { $match: { month: yesterday } },
        {
          $group: {
            _id: null,
            total_amount: { $sum: { $toDouble: "$paiddetails.amount" } },
          },
        },
      ]);

      let currentmonth = 0;
      let prevmonth = 0;
      if (currentmonthvalue.length > 0) {
        currentmonth = currentmonthvalue[0].count;
      }
      if (prevmonthvalue.length > 0) {
        prevmonth = prevmonthvalue[0].count;
      }
      let studentcount = await transaction.aggregate([
        { $unwind: "$paiddetails" },
        {
          $match: match,
        },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]);
      let studencountvalue = 0;
      if (studentcount.length > 0) {
        studencountvalue = studentcount[0].count;
      }
      let percentagecalc = await percentagevalue(
        currentmonth_value,
        yesterday,
        studencountvalue
      );
      response.status(statusCodes.success).json(percentagecalc);
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: "Problem occurred while transaction" });
    }
  } else {
    response
      .status(statusCodes.ProvideAllFields)
      .json({ message: "Provide mandatory fields." });
  }
};
const percentagevalue = async (
  currentmonth,
  prevmonth,
  studentcount,
  title
) => {
  if (currentmonth == null)
    return [{ value: "desc", studentcount: studentcount, title: title }];
  if (prevmonth == null)
    return [{ value: "inc", studentcount: studentcount, title: title }];
  let percentChange = 0;
  if (prevmonth < currentmonth) {
    percentChange = Math.round(
      (1 - parseInt(prevmonth) / parseInt(currentmonth)) * 100
    );

    return [
      {
        percentChange: percentChange,
        value: "desc",
        studentcount: studentcount,
        title: title,
      },
    ];
  } else {
    percentChange = Math.round(
      ((parseInt(prevmonth) - parseInt(currentmonth)) / prevmonth) * 100
    );
    return [
      {
        value: "inc",
        percentChange: percentChange ? percentChange : 0,
        studentcount: studentcount,
        title: title,
      },
    ];
  }
};
const getrelievestudentdetails = async (request, response) => {
  if (request.body.org_id && request.body.status) {
    try {
      let branch_id = request.body.branch_id;
      let org_id = request.body.org_id;
      // let cyearid = await getCurrentCalendarYearIDByOrgId(org_id);
      let cyearid;
      let academic_years_id = request.body.academic_years_id;
      let calendar_years_id = request.body.calendar_years_id || cyearid;
      let allocstatus = request.body.status;
      let branch_status = request.body.branch_status;

      let match = { org_id: org_id, status: allocstatus };
      if (branch_status) match["status"] = branch_status;
      if (calendar_years_id) {
        match["calendar_years_id"] = calendar_years_id;
      }
      if (academic_years_id) {
        match["academic_years_id"] = academic_years_id;
      }
      if (branch_id) {
        match["branch_id"] = branch_id;
      }

      const relievestudentvalue = await allocstudent
        .aggregate([
          {
            $match: match,
          },
          { $unset: ["status"] },
          {
            $lookup: {
              from: "students",
              let: { salId: { $toObjectId: "$student_id" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$salId"] },
                        { $eq: ["$status", allocstatus] },
                      ],
                    },
                  },
                },
              ],
              as: "student_details",
            },
          },
          { $unwind: "$student_details" },
          {
            $set: {
              status: "$student_details.status",
            },
          },
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: ["$$ROOT", "$student_details"],
              },
            },
          },
          { $unset: ["student_details"] },
        ])
        .sort({ id: 1 });
      let itemsObj = [];
      let feedetails = [];

      for (let i = 0; i < relievestudentvalue.length; i++) {
        let item = relievestudentvalue[i];

        feedetails.push(await getstudentfinaldueamount(item));
      }
      itemsObj = await Promise.all(feedetails);
      response.status(statusCodes.success).json(itemsObj);
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: "Problem occurred while transaction" });
    }
  } else {
    response
      .status(statusCodes.ProvideAllFields)
      .json({ message: "Provide mandatory fields." });
  }
};
const closefortheday = async (request, response) => {
  let todaydate = datevalue.currentDate();
  let org_id = request.body.org_id;
  let created_by = request.body.created_by;
  var tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/, "");
  const tomorrow_date = tomorrow.split(" ")[0];
  let statuscheck = await closetoday.find({ status: "1" }).sort({ _id: -1 });
  if (statuscheck.length == 0) {
    await closetoday.create({
      close_at: todaydate,
      open_at: tomorrow_date,
      status: "1",
      org_id: org_id,
      created_by: created_by,
    });
    response
      .status(statusCodes.success)
      .json({ message: "Closed for the day" });
  }
};
const expenseReport = async (request, response) => {
  try {
    const to_date = request.body.to_date;
    const from_date = request.body.from_date;

    const org_id = request.body?.org_id;
    const status = request.body?.status;
    const paymethod = request.body?.paymethod;

    let match = { status: status, type: paymethod };
    if (from_date && to_date && paymethod && org_id) {
      if (from_date) {
        match["date"] = { $gte: from_date };
      }
      if (to_date) {
        match["date"] = { $lte: to_date };
      }
      if (from_date && to_date) {
        match["date"] = { $gte: from_date, $lte: to_date };
      }
      let aggregate = [
        {
          $match: match,
        },
        {
          $lookup: {
            from: "securities",
            let: { salId: { $toObjectId: "$created_by" } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$salId"] },
                      { $eq: ["$status", "1"] },
                      { $eq: ["$org_id", org_id] },
                    ],
                  },
                },
              },
            ],
            as: "created_by_details",
          },
        },
        { $unwind: "$created_by_details" },
        {
          $set: {
            created_by_name: "$created_by_details.admin_name",
          },
        },
        { $unset: ["created_by_details"] },
      ];
      // let draw = parseInt(request.body?.draw);
      // if (draw) draw = parseInt(draw);

      // if (draw) {
      //   let row = request.body.start;
      //   let rowperpage = request.body.length; // Rows display per page
      //   let columnIndex = request.body.order[0]['column']; // Column index
      //   let columnName = request.body.columns[columnIndex]['data']; // Column name
      //   let columnSortOrder = request.body.order[0]['dir']; // asc or desc
      //   let searchStr = request.body.search.value;
      //   let final_result = [];
      //   if (searchStr) {
      //     let regex = new RegExp(searchStr, "i")
      //     searchStr = { $or: [{ 'expenses_to': regex }, { 'total_amount': regex }, { 'distinct_count': regex }] };
      //   } else {
      //     searchStr = {};
      //   }
      //   let search = { $match: searchStr };
      //   final_result.push(search);
      //   if (columnSortOrder == 'asc') {
      //     columnSortOrder = 1;
      //   } else { columnSortOrder = -1; }
      //   if (columnName) {
      //     sort = { $sort: { [columnName]: columnSortOrder } };
      //   }
      //   let skip = { "$skip": Number(row) };
      //   final_result.push(skip);
      //   let limit = { $limit: Number(rowperpage) };
      //   if (rowperpage && rowperpage != '-1') {
      //     final_result.push(limit);
      //   }
      //   let faceit = {
      //     $facet: {
      //       totalCount: [{ $count: 'count' }],
      //       searchCount: [search, { $count: 'count' }],
      //       aaData: final_result,
      //     }
      //   };
      //   let addfields = {
      //     $addFields: {
      //       iTotalRecords: {
      //         $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0]
      //       },
      //       iTotalDisplayRecords: {
      //         $ifNull: [{ $arrayElemAt: ['$searchCount.count', 0] }, 0]
      //       }
      //     }
      //   };
      //   aggregate.push(sort);
      //   aggregate.push(faceit);
      //   aggregate.push(addfields);
      //   aggregate.push({ $unset: ['totalCount', 'searchCount'] });

      // const expensesreport = await expenses.aggregate(
      //   aggregate)
      //   let res1 = expensesreport[0];
      //     if (!res1) {
      //       res1 = {
      //         "iTotalRecords": 0,
      //         "iTotalDisplayRecords": 0,
      //         "aaData": [],
      //       };
      //     }
      //     res1['draw'] = draw;
      //     response.status(statusCodes.success).send(res1);
      //   }
      const expensesreport = await expenses.aggregate(aggregate);
      response.status(statusCodes.success).json(expensesreport);
    } else {
      response
        .status(statusCodes.ProvideAllFields)
        .json({ message: "Please fill all mandatory fields" });
    }
  } catch (e) {
    response
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while generating report" });
  }
};
const settlementreport = async (request, response) => {
  try {
    const to_date = request.body.to_date;
    const from_date = request.body.from_date;

    const org_id = request.body?.org_id;
    if (from_date && to_date && org_id) {
      let query = await transaction.aggregate([
        { $unwind: "$paiddetails" },
        {
          $match: {
            "paiddetails.org_id": org_id,
            "paiddetails.status": "2",
            "paiddetails.date": {
              $gte: from_date,
              $lte: to_date,
            },
          },
        },
        // }, { $set: { paiddetails_id: "$paiddetails._id"} },
        // { $unset: "paiddetails._id" },
        // {
        //   $replaceRoot: {
        //     newRoot: {
        //       $mergeObjects: ["$$ROOT", "$paiddetails"]
        //     }
        //   }
        // },
        {
          $project: {
            student_id: "$paiddetails.student_id",
            created_by: "$paiddetails.created_by",
            amount: "$paiddetails.amount",
            date: "$paiddetails.date",
            bill_number: "$bill_number",
          },
        },
        {
          $lookup: {
            from: "students",
            let: { salId: { $toObjectId: "$student_id" } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$salId"] },
                      { $eq: ["$org_id", org_id] },
                    ],
                  },
                },
              },
            ],
            as: "student_details",
          },
        },
        { $unwind: "$student_details" },
        {
          $lookup: {
            from: "securities",
            let: { salId: { $toObjectId: "$created_by" } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$salId"] },
                      { $eq: ["$status", "1"] },
                      { $eq: ["$org_id", org_id] },
                    ],
                  },
                },
              },
            ],
            as: "created_by_details",
          },
        },
        { $unwind: "$created_by_details" },
        {
          $set: {
            fee_type: "Settlement",
            student_name: "$student_details.student_name",
            created_by_name: "$created_by_details.admin_name",
          },
        },
        { $unset: ["student_details", "created_by_details"] },
      ]);
      response.status(statusCodes.success).send(query);
    } else {
      response
        .status(statusCodes.ProvideAllFields)
        .json({ message: "Please fill all mandatory fields" });
    }
  } catch (e) {
    response
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while generating report" });
  }
};
const logreport = async (request, response) => {
  if (request.body.org_id) {
    try {
      const to_date = request.body?.to_date;
      const from_date = request.body?.from_date;
      const org_id = request.body.org_id;
      let match = { org_id: org_id };
      if (from_date) {
        match["date"] = { $gte: from_date };
      }
      if (to_date) {
        match["date"] = { $lte: to_date };
      }
      if (from_date && to_date) {
        match["date"] = { $gte: from_date, $lte: to_date };
      }

      let logs_details = await log
        .aggregate([
          {
            $match: match,
          },
          {
            $lookup: {
              from: "sub_fee_details",
              let: { salId: { $toObjectId: "$prev_sub_fee_id" } },

              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$salId"] },
                        { $eq: ["$status", "1"] },
                        { $eq: ["$org_id", org_id] },
                      ],
                    },
                  },
                },
              ],
              as: "sub_fee_name",
            },
          },
          { $unwind: "$sub_fee_name" },
          {
            $lookup: {
              from: "sub_fee_details",
              let: { salId: { $toObjectId: "$modified_sub_fee_id" } },

              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$salId"] },
                        { $eq: ["$status", "1"] },
                        { $eq: ["$org_id", org_id] },
                      ],
                    },
                  },
                },
              ],
              as: "mod_sub_fee_name",
            },
          },
          { $unwind: "$mod_sub_fee_name" },
          {
            $lookup: {
              from: "securities",
              let: { salId: { $toObjectId: "$operated_by" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$salId"] },
                        { $eq: ["$status", "1"] },
                        { $eq: ["$org_id", org_id] },
                      ],
                    },
                  },
                },
              ],
              as: "created_by_details",
            },
          },
          { $unwind: "$created_by_details" },
          {
            $lookup: {
              from: "students",
              let: { salId: { $toObjectId: "$student_id" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$salId"] },
                        { $eq: ["$org_id", org_id] },
                      ],
                    },
                  },
                },
              ],
              as: "student_details",
            },
          },
          { $unwind: "$student_details" },
          {
            $set: {
              prev_sub_fee_type: "$sub_fee_name.sub_fee_type",
              modif_sub_fee_type: "$mod_sub_fee_name.sub_fee_type",
              created_by_name: "$created_by_details.admin_name",
              student_ID: "$student_details.id",
              student_name: "$student_details.student_name",
            },
          },
          {
            $unset: [
              "sub_fee_name",
              "mod_sub_fee_name",
              "created_by_details",
              "student_details",
            ],
          },
        ])
        .sort({ updated_date_time: -1 });
      response.status(statusCodes.success).json(logs_details);
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: e.message });
    }
  } else {
    response
      .status(statusCodes.ProvideAllFields)
      .json({ message: "Provide mandatory fields" });
  }
};
const pendingOldDueReport = async (request, response) => {
  if (request.body.org_id) {
    try {
      let org_id = request.body?.org_id;
      let status = request.body?.status;
      const student_id = request.body?.student_id;
      let list = request.body?.list;
      let cyear_id = await getCurrentCalendarYearIDByOrgId(org_id);
      let calendar_years_id = request.body.calendar_years_id ?? cyear_id;
      if (calendar_years_id) {
        // let matchvalue = { id: { '$regex': student_id, '$options': 'i' } }
        // if (status) {
        //   matchvalue['status'] = status.toString();
        // }

        let match = { org_id: org_id, status: 1 };
        if (calendar_years_id) match["calendar_years_id"] = calendar_years_id;
        if (status) match["status"] = status.toString();
        if (student_id) match["student_id"] = student_id;
        let studentarray = [];
        let studentlist = await allocstudent.find(match);
        //  let studentagg=await studentinfo.aggregate([
        //   {
        //     "$project": {
        //       "_id": {
        //         "$toString": "$_id"
        //       }
        //     }
        //   },
        //   {
        //      $lookup:
        //      {
        //          from: "allocate_student_branches",
        //          localField: "_id",
        //          foreignField: "student_id",
        //          as: "aliasForTable1Collection"
        //      }
        //   },{
        //     $lookup:
        //     {
        //         from: "branchfee_details",
        //         localField: "branch_id",
        //         foreignField: "branch_id",
        //         as: "aliasForTable2Collection"
        //     }
        //  }

        //   ])
        //

        for (var i = 0; i < studentlist.length; i++) {
          let student_details = await getStudentdetailsById(
            studentlist[i].student_id,
            studentlist[i].status
          );

          if (student_details.statusCode == 200) {
            let studentdata = student_details?.data;
            let branch_fee = studentdata?.branch_fee;
            let branchstudent = studentdata?.branch_student;

            const fees_details = [];
            let itemsObj = [];

            for (let i = 0; i < branch_fee.length; i++) {
              let sub_fee_id = branch_fee[i]?.sub_fee_id;
              let amount = branch_fee[i]?.amount;
              branchstudent["sub_fee_id"] = sub_fee_id;
              branchstudent["amount"] = amount;
              fees_details.push(getstudentduepaidFeeamt(branchstudent));
            }

            //var newArray = fees_details.filter(value => Object.keys(value).length !== 0);
            itemsObj = await Promise.all(fees_details);
            itemsObj = itemsObj.filter(
              (value) => Object.keys(value).length !== 0
            );
            let oldduevalue = await getoldduedetails(
              studentdata?._id.toString(),
              studentdata?.org_id
            );
            if (oldduevalue) {
              itemsObj.push(oldduevalue);
            }
            let user_obj = {};
            user_obj["old_due"] = oldduevalue?.due_amount ?? 0.0;
            user_obj["student_id"] = studentdata.student_id;
            user_obj["hall_ticket_number"] = studentdata.hall_ticket_number;
            user_obj["student_phone_number"] = studentdata.student_phone_number;
            user_obj["admission_number"] = studentdata.admission_number;
            user_obj["student_name"] = studentdata.student_name;
            user_obj["_id"] = studentdata._id;
            user_obj["feedetails"] = itemsObj;
            user_obj["old_dues"] = oldduevalue ?? "";
            studentarray.push(user_obj);
          }
        }

        //   let unwind = { "$unwind": "$paiddetails" };
        //   let match = { "org_id": org_id, "status": "1" };
        //   let match2=[
        //     { $eq: ['$paiddetails.sub_fee_id', '$$sub_fee_id'] },
        //     //{ $eq: ['$student_id', '$$salId'] },
        //     { $eq: ["$paiddetails.status", "1"] },
        //     { $eq: ['$paiddetails.org_id', org_id] },
        //   ];
        //   // if (students_ids.length > 0)
        //   //   match2['transaction_details.paiddetails.student_id'] = { $in: students_ids.map(item => (item._id).toString()) };
        //    if (sub_fee_id && sub_fee_id.length > 0) {
        //     match['sub_fee_id'] = { $in: sub_fee_id };
        //  }

        // if(student_id){
        // match2.push({$eq:['$paiddetails.student_id',students_ids._id.toString()]});
        // }
        //   let calendar_years_id = await getCurrentCalendarYearIDByOrgId(org_id);
        //   let groupby = {
        //     $group: { '_id': { student_id: '$paiddetails.student_id', sub_fee_id: '$paiddetails.sub_fee_id'/*,branch_id: '$paiddetails.branch_id'*/ }, sum: { $sum: { "$toDouble": "$paiddetails.amount" } } }
        //   }
        //   let final_res = { $project: { "_id": 0, "student_id": "$_id.student_id", "sub_fee_id": "$_id.sub_fee_id", sum: "$sum"/*,"branch_id":"$_id.branch_id"*/ } };

        // let paid_details = await branchfee.aggregate([
        //   { $unionWith: "transactions"  },
        //   unwind,
        //   groupby,
        //   final_res
        // {
        //   "$lookup": {
        //     "from": "transactions",
        //     //"localField": "sub_fee_id",
        //     //"foreignField": "sub_fee_id",
        //      //"as": "joined" ,
        //     "let": { "sub_fee_id": "$sub_fee_id" },
        //     "pipeline": [
        //       unwind,
        //       {
        //         "$match": {
        //           "$expr": {
        //             $and:match2 ,
        //           }
        //         }
        //       }
        //     ],
        //     "as": "transaction_details"
        //   },
        // },
        // { "$unwind": { "path": "$transaction_details" } },
        // //groupby,
        //final_res,

        // {
        //   "$lookup": {
        //     "from": "students",
        //     "let": { "salId": { "$toObjectId": "$student_id" } },
        //     "pipeline": [
        //       {
        //         "$match": {
        //           "$expr": {

        //             $and:[ { $eq: ['$_id', '$$salId'] },
        //             { $eq: ["$status", "1"] },
        //             { $eq: ['$org_id', org_id] },
        //             ]
        //             ,
        //           }
        //         }
        //       }
        //     ],
        //     "as": "student_details"
        //   },
        // },
        // { $unwind: "$student_details" },
        // {
        //   "$lookup": {
        //     "from": "sub_fee_details",
        //     "let": { "salId": { "$toObjectId": "$sub_fee_id" } },
        //     "pipeline": [
        //       {
        //         "$match": {
        //           "$expr": {
        //             $and: [
        //               { $eq: ['$_id', '$$salId'] },
        //               { $eq: ["$status", "1"] },
        //               { $eq: ['$org_id', org_id] },
        //             ],
        //           }
        //         },
        //       }
        //     ],
        //     "as": "sub_fee_name"
        //   },
        // },
        // { $unwind: "$sub_fee_name" },
        // {
        //   "$lookup": {
        //     "from": "old_students",
        //     "let": { "salId": "$student_id" },
        //     "pipeline": [
        //       {
        //         "$match": {
        //           "$expr": {
        //             $and: [
        //               { $eq: ['$student_id', '$$salId'] },
        //               { $eq: ["$status", "1"] },
        //               { $eq: ['$org_id', org_id] },
        //             ],
        //           }
        //         },
        //       }
        //     ],
        //     "as": "old_stud_due"
        //   },
        // },
        // { "$unwind": { "path": "$old_stud_due", "preserveNullAndEmptyArrays": true } },
        // {
        //   $set: {
        //     sub_fee_type: "$sub_fee_name.sub_fee_type",
        //     student_ID: "$student_details.id",
        //     student_name: "$student_details.student_name",
        //     hall_ticket_number: "$student_details.hall_ticket_number",
        //     //branchfeeamount: { $ifNull: [ "$branch_details.amount", 0]},
        //     pending_due_amount: { $ifNull: ["$old_stud_due.old_due_amount", 0] },
        //   }
        // },
        // { $unset: ["sub_fee_name", "student_details", "old_stud_due"] },
        //     ]);
        //

        // const newArr = Array.prototype.concat(...studentarray);

        // let paiddetails=newArr.map(item=>
        //     item.feedetails)
        if (list == "1") {
          studentarray = studentarray.filter((obj) => {
            return obj.feedetails.some(
              (feedetail) => parseFloat(feedetail.due_amount) > 0
            );
          });
        }
        let newarr = studentarray.map((item) => item.feedetails).flat(1);
        // const uniqueSubFeeIds = [...new Set(newarr.map(item => ({ sub_fee_type: item.sub_fee_name + ' Paid amount', sub_fee_id: item.sub_fee_id, branchfeeamount: item.sub_fee_name, balance_amt: item.sub_fee_name + ' due amount' })))];
        // console.log(uniqueSubFeeIds.length);
        const uniqueData = newarr.reduce((acc, curr) => {
          if (!acc.find((item) => item.sub_fee_id === curr.sub_fee_id)) {
            acc.push({
              sub_fee_id: curr.sub_fee_id,
              branchfeeamount: curr.sub_fee_name,
              sub_fee_type: curr.sub_fee_name + " Paid amount",
              balance_amt: curr.sub_fee_name + " due amount",
            });
          }
          return acc;
        }, []);

        // let fee_types = uniqueSubFeeIds.map((item, index) => ({ sub_fee_type: item.sub_fee_name + ' Paid amount', sub_fee_id: item.sub_fee_id, branchfeeamount: item.sub_fee_name, balance_amt: item.sub_fee_name + ' due amount' }))
        //  const unique = (arr, props = []) => [...new Map(arr.map(entry => [props.map(k => entry[k]).join('|'), entry])).values()];
        //  const sub_fees = unique(fee_types, ['sub_fee_id']);
        // //  console.log(sub_fees)
        // let result = paid_details.reduce((item, value) => {
        //   let temp = item.find(sub_item => sub_item.student_id === value.student_id);
        //   const fee = {};
        //   const feevalue = {};
        //   fee['sub_fee_id'] = value?.sub_fee_id;
        //   fee['sub_fee_type'] = value?.sub_fee_type;
        //   fee['amount'] = value?.sum ?? 0;
        //   fee['branchfeeamount'] = value?.branchfeeamount ?? 0;
        //   if (value?.sub_fee_type == "Old due") {
        //     fee['balance_amt'] = value?.pending_due_amount  - value?.sum  ?? 0;
        //     fee['branchfeeamount'] = value?.pending_due_amount ?? 0;
        //   } else {
        //     fee['balance_amt'] = value?.branchfeeamount - value?.sum ?? 0;

        //   }
        //   if (!temp) {
        //     const student = {};
        //     student['student_id'] = value?.student_id;
        //     student['student_ID'] = value?.student_ID;
        //     student['student_name'] = value?.student_name;
        //     student['hall_ticket_number'] = value?.hall_ticket_number
        //     let feedetails=[]
        //     feedetails.push(fee)
        //     student['fee_details']=feedetails;

        //     item.push(student);
        //   } else {
        //     let feedetails=[]
        //     feedetails=temp['fee_details']
        //     feedetails.push(fee)
        //     temp['fee_details']=feedetails;
        //   }
        //   return item;
        // }, []);

        response
          .status(statusCodes.success)
          .json({ columns: uniqueData, report: studentarray });

        //response.status(statusCodes.success).json(studentarray)
      } else {
        response
          .status(statusCodes.InvalidData)
          .json({ message: "No active calender year" });
      }
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: e.message });
    }
  } else {
    response
      .status(statusCodes.ProvideAllFields)
      .json({ message: "Provide all amndatory fields" });
  }
};
const GetOlduesLogs = async (req, res) => {
  try {
    let student_id = req.body.student_id;
    let org_id = req.body.org_id;
    if (student_id && org_id) {
      let match = { student_id, org_id, status: "1" };
      let result = await oldduelog
        .aggregate([
          { $match: match },
          {
            $lookup: {
              from: "securities",
              let: { salId: { $toObjectId: "$created_by" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$_id", "$$salId"] }],
                    },
                  },
                },
              ],
              as: "user_details",
            },
          },
          {
            $unwind: {
              path: "$user_details",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $set: {
              created_by_name: { $ifNull: ["$user_details.admin_name", ""] },
              // created_by_name: "$user_details.admin_name"
            },
          },
          { $unset: ["user_details"] },
        ])
        .sort({ _id: -1 });
      res.status(statusCodes.success).json(result);
    } else {
      res
        .status(statusCodes.ProvideAllFields)
        .json({ message: "Please fill all mandatory fields" });
    }
  } catch (e) {
    res
      .status(statusCodes.SomethingWentWrong)
      .json({ message: "Problem occurred while getting old dues logs" });
  }
};
const TotalCashIN = (req) => {
  return new Promise(async (resolve, reject) => {
    const date = req.currentDate.split(" ")[0];
    const status = req.body.status;
    const org_id = req.body.org_id;
    let unwind = { $unwind: "$paiddetails" };
    let match = {
      "paiddetails.org_id": org_id,
      "paiddetails.status": { $in: ["1", "2"] },
    };
    // if (status) match['paiddetails.status'] = "1";
    if (date) {
      match["paiddetails.date"] = { $lte: date };
    }
    let groupby = {
      $group: {
        _id: { org_id: "$paiddetails.org_id" },
        cash: { $sum: { $toDouble: "$paiddetails.cash" } },
        bank: { $sum: { $toDouble: "$paiddetails.bank" } },
        upi: { $sum: { $toDouble: "$paiddetails.upi" } },
        total_amount: { $sum: { $toDouble: "$paiddetails.amount" } },
      },
    };
    let final_res = {
      $project: {
        _id: 0,
        cash: { $round: ["$cash", 2] },
        bank: { $round: ["$bank", 2] },
        upi: { $round: ["$upi", 2] },
        total_amount: { $round: ["$total_amount", 2] },
      },
    };

    let day_wise_totals = await transaction
      .aggregate([unwind, { $match: match }, groupby, final_res])
      .sort({ date: -1 });
    let obj = { cashInHand: 0, cashInBank: 0, cashInupi: 0 };
    let value = await expencestilldate(org_id, date, 1);

    // console.log("day_wise_totals is ", day_wise_totals);
    // console.log("value is ", value);

    if (day_wise_totals.length > 0) {
      obj["cashInHand"] = (
        parseFloat(day_wise_totals[0].cash) - parseFloat(value.cash_value ?? 0)
      ).toFixed(2);
      obj["cashInBank"] = (
        parseFloat(day_wise_totals[0].bank) - parseFloat(value.bank_value ?? 0)
      ).toFixed(2);
      obj["cashInupi"] = (
        parseFloat(day_wise_totals[0].upi) - parseFloat(value.upi_value ?? 0)
      ).toFixed(2);
    }
    resolve(obj);
  });
};
const cashInHand = async (request, response) => {
  if (request.body.org_id) {
    try {
      let cashinhand = await TotalCashIN(request);

      response.status(statusCodes.success).json(cashinhand);

      // const date = request.currentDate.split(" ")[0];
      // const status = request.body.status;
      // const org_id = request.body.org_id;

      // let unwind = { "$unwind": "$paiddetails" };
      // let match = { "paiddetails.org_id": org_id, };

      // if (status) match['paiddetails.status'] = "1";
      // if (date) {
      //   match['paiddetails.date'] = { $lte: date };
      // }
      // let groupby = {
      //   $group: { '_id': { org_id: '$paiddetails.org_id' }, cash: { $sum: { "$toDouble": "$paiddetails.cash" } }, bank: { $sum: { "$toDouble": "$paiddetails.bank" } }, upi: { $sum: { "$toDouble": "$paiddetails.upi" } }, total_amount: { $sum: { "$toDouble": "$paiddetails.amount" } } }
      // }

      // let final_res = { $project: { "_id": 0, cash: { $round: ["$cash", 2] }, bank: { $round: ["$bank", 2] }, upi: { $round: ["$upi", 2] }, total_amount: { $round: ["$total_amount", 2] } } };
      // // let final_res = { $project: { "_id": 0, "date": "$_id.date", cash: "$cash", bank: "$bank", upi: "$upi", total_amount: "$total_amount" } };

      // let day_wise_totals = await transaction.aggregate([
      //   unwind,
      //   {
      //     $match: match
      //   },
      //   groupby,
      //   final_res,

      // ]).sort({ "date": -1 });
      // let obj = {cashInHand:0,cashInBank:0, cashInupi:0 };
      // let value = await expencestilldate(org_id, date, 1);
      // if(day_wise_totals.length>0){
      //   obj['cashInHand'] = (parseFloat(day_wise_totals[0].cash) - parseFloat(value.cash_value ?? 0)).toFixed(2);
      //   obj['cashInBank'] = (parseFloat(day_wise_totals[0].bank) - parseFloat(value.bank_value ?? 0)).toFixed(2);
      //   obj['cashInupi'] = (parseFloat(day_wise_totals[0].upi) - parseFloat(value.upi_value ?? 0)).toFixed(2);
      // }
      // //day_wise_totals
      // response.status(statusCodes.success).json(obj);
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: e.message });
    }
  } else {
    response
      .status(statusCodes.ProvideAllFields)
      .json({ message: "Provide mandatory fields" });
  }
};
const dateforexpenses = async (status, org_id, date) => {
  // const date = request.currentDate;
  // const status = request.body.status;
  // const org_id = request.body.org_id;

  let unwind = { $unwind: "$paiddetails" };
  let match = { "paiddetails.org_id": org_id };

  if (date) {
    match["paiddetails.date"] = { $lte: date };
  }
  let groupby = {
    $group: {
      _id: { org_id: "$paiddetails.org_id" },
      cash: { $sum: { $toDouble: "$paiddetails.cash" } },
      bank: { $sum: { $toDouble: "$paiddetails.bank" } },
      upi: { $sum: { $toDouble: "$paiddetails.upi" } },
      total_amount: { $sum: { $toDouble: "$paiddetails.amount" } },
    },
  };

  let final_res = {
    $project: {
      _id: 0,
      cash: { $round: ["$cash", 2] },
      bank: { $round: ["$bank", 2] },
      upi: { $round: ["$upi", 2] },
      total_amount: { $round: ["$total_amount", 2] },
    },
  };
  // let final_res = { $project: { "_id": 0, "date": "$_id.date", cash: "$cash", bank: "$bank", upi: "$upi", total_amount: "$total_amount" } };

  let day_wise_totals = await transaction
    .aggregate([
      unwind,
      {
        $match: match,
      },
      groupby,
      final_res,
    ])
    .sort({ date: -1 });

  let obj = { cashInHand: 0, cashInBank: 0, cashInupi: 0 };
  let value = await expencestilldate(org_id, date, 1);
  if (day_wise_totals.length > 0) {
    obj["cashInHand"] = (
      parseFloat(day_wise_totals[0].cash) - parseFloat(value.cash_value ?? 0)
    ).toFixed(2);
    obj["cashInBank"] = (
      parseFloat(day_wise_totals[0].bank) - parseFloat(value.bank_value ?? 0)
    ).toFixed(2);
    obj["cashInupi"] = (
      parseFloat(day_wise_totals[0].upi) - parseFloat(value.upi_value ?? 0)
    ).toFixed(2);
  }

  //day_wise_totals
  return obj;
};
const expencestilldate = async (org_id, date, valuestatus) => {
  let match = { org_id: org_id, status: "A" };

  if (valuestatus == 1) {
    if (date) {
      match["date"] = { $lte: date };
    }
  } else {
    date = Datevalue(date);
    match["date"] = date;
  }
  let groupby = {
    $group: {
      _id: { expense_type: "$expense_type", type: "$type" },
      expenses_amount: { $sum: { $toDouble: "$amount" } },
    },
  };
  let final_res = {
    $project: {
      _id: 0,
      expense_type: "$_id.expense_type",
      type: "$_id.type",
      expenses_amount: { $round: ["$expenses_amount", 2] },
    },
  };
  let day_wise_totals = await expenses
    .aggregate([
      {
        $match: match,
      },
      groupby,
      final_res,
    ])
    .sort({ date: -1 });
  match["date"] = { $lte: date };
  let expensesvaluetilldate = await expenses
    .aggregate([
      {
        $match: match,
      },
      groupby,
      final_res,
    ])
    .sort({ date: -1 });
  let cashcollection = 0;
  let bankcollection = 0;
  let upicollection = 0;
  let cashexpenses = 0;
  let bankexpenses = 0;
  let upiexpenses = 0;
  let totcashcollection = 0;
  let totbankcollection = 0;
  let totupicollection = 0;
  let totcashexpenses = 0;
  let totbankexpenses = 0;
  let totupiexpenses = 0;

  for (var i = 0; i < day_wise_totals.length; i++) {
    if (day_wise_totals[i].expense_type === "C") {
      if (day_wise_totals[i].type == "C") {
        cashcollection = day_wise_totals[i].expenses_amount;
      }
      if (day_wise_totals[i].type == "B") {
        bankcollection = day_wise_totals[i].expenses_amount;
      }
      if (day_wise_totals[i].type == "U") {
        upicollection = day_wise_totals[i].expenses_amount;
      }
    }
    if (day_wise_totals[i].expense_type === "E") {
      if (day_wise_totals[i].type == "C") {
        cashexpenses = day_wise_totals[i].expenses_amount;
      }
      if (day_wise_totals[i].type == "B") {
        bankexpenses = day_wise_totals[i].expenses_amount;
      }
      if (day_wise_totals[i].type == "U") {
        upiexpenses = day_wise_totals[i].expenses_amount;
      }
    }
    if (expensesvaluetilldate[i].expense_type === "C") {
      if (expensesvaluetilldate[i].type == "C") {
        totcashcollection = expensesvaluetilldate[i].expenses_amount;
      }
      if (expensesvaluetilldate[i].type == "B") {
        totbankcollection = expensesvaluetilldate[i].expenses_amount;
      }
      if (expensesvaluetilldate[i].type == "U") {
        totupicollection = expensesvaluetilldate[i].expenses_amount;
      }
    }
    if (expensesvaluetilldate[i].expense_type === "E") {
      if (day_wise_totals[i].type == "C") {
        totcashexpenses = expensesvaluetilldate[i].expenses_amount;
      }
      if (expensesvaluetilldate[i].type == "B") {
        totbankexpenses = expensesvaluetilldate[i].expenses_amount;
      }
      if (expensesvaluetilldate[i].type == "U") {
        totupiexpenses = expensesvaluetilldate[i].expenses_amount;
      }
    }
  }

  let objvalue = {};
  if (valuestatus == 1) {
    objvalue["cash_value"] = cashexpenses - cashcollection;
    objvalue["bank_value"] = bankexpenses - bankcollection;
    objvalue["upi_value"] = upiexpenses - upicollection;
  } else {
    objvalue["cash_expvalue"] = cashexpenses;
    objvalue["bank_expvalue"] = bankexpenses;
    objvalue["upi_expvalue"] = upiexpenses;
    objvalue["cash_collvalue"] = cashcollection;
    objvalue["bank_collvalue"] = bankcollection;
    objvalue["upi_collvalue"] = upicollection;
    // objvalue['cash_value'] = totcashexpenses - totcashcollection
    // objvalue['bank_value'] = totbankexpenses - totbankcollection
    // objvalue['upi_value'] = totupiexpenses - totupicollection
    objvalue["date"] = date;
  }

  return objvalue;
};
const cummulativereport = async (request, response) => {
  if (request.body.org_id) {
    try {
      const from_date = request.body?.from_date;
      const to_date = request.body?.to_date;
      let org_id = request.body?.org_id;
      const statusvalue = request.body?.status;
      var start = new Date(from_date);
      var end = new Date(to_date);
      var loop = new Date(start);

      const fees_details = [];
      let itemsObj = [];
      while (loop <= end) {
        fees_details.push(await expencestilldate(org_id, loop, 0));
        fees_details.push(
          await transactionmadetilldate(statusvalue, org_id, loop)
        );
        var newDate = loop.setDate(loop.getDate() + 1);
        loop = new Date(newDate);
      }
      itemsObj = await Promise.all(fees_details);
      let newData = itemsObj.reduce((acc, curr) => {
        let findIndex = acc.findIndex((item) => item.date === curr.date);
        if (findIndex === -1) {
          acc.push(curr);
        } else {
          acc[findIndex] = Object.assign({}, acc[findIndex], curr);
        }
        return acc;
      }, []);

      newData = newData.filter(
        (item) =>
          item["total_amount"] != 0 ||
          item["cash_expvalue"] != 0 ||
          item["bank_expvalue"] != 0 ||
          item["upi_expvalue"] != 0
      );

      //   newData=newData.map(curr=>{

      //         curr['cashinhand']=curr['cashtot']-curr['cash_value'];
      //   curr['cashinbank']=curr['banktot']-curr['bank_value'];
      //   curr['cashinupi']=curr['upitot']-curr['upi_value'];
      //   return curr
      //   }

      // )

      // let resvalue=value;
      // resvalue=valueone
      response.status(statusCodes.success).json(newData);

      //day_wise_totals
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: e.message });
    }
  } else {
    response
      .status(statusCodes.ProvideAllFields)
      .json({ message: "Provide mandatory fields" });
  }
};
const transactionmadetilldate = async (status, org_id, date) => {
  date = Datevalue(date);
  let unwind = { $unwind: "$paiddetails" };
  let match = {
    "paiddetails.org_id": org_id,
    "paiddetails.status": { $in: ["1", "2"] },
  };

  match["paiddetails.date"] = date;

  if (status) match["paiddetails.status"] = status;
  let groupby = {
    $group: {
      _id: { org_id: "$paiddetails.org_id" },
      cash: { $sum: { $toDouble: "$paiddetails.cash" } },
      bank: { $sum: { $toDouble: "$paiddetails.bank" } },
      upi: { $sum: { $toDouble: "$paiddetails.upi" } },
      total_amount: { $sum: { $toDouble: "$paiddetails.amount" } },
    },
  };

  let final_res = {
    $project: {
      _id: 0,
      cash: { $round: ["$cash", 2] },
      bank: { $round: ["$bank", 2] },
      upi: { $round: ["$upi", 2] },
      total_amount: { $round: ["$total_amount", 2] },
    },
  };
  let groupby1 = {
    $group: {
      _id: { org_id: "$paiddetails.org_id" },
      cash: { $sum: { $toDouble: "$paiddetails.cash" } },
      bank: { $sum: { $toDouble: "$paiddetails.bank" } },
      upi: { $sum: { $toDouble: "$paiddetails.upi" } },
      total_amount: { $sum: { $toDouble: "$paiddetails.amount" } },
    },
  };

  let final_res1 = {
    $project: {
      _id: 0,
      cash: { $round: ["$cash", 2] },
      bank: { $round: ["$bank", 2] },
      upi: { $round: ["$upi", 2] },
      total_amount: { $round: ["$total_amount", 2] },
    },
  };

  // let final_res = { $project: { "_id": 0, "date": "$_id.date", cash: "$cash", bank: "$bank", upi: "$upi", total_amount: "$total_amount" } };

  let day_wise_totals = await transaction
    .aggregate([
      unwind,
      {
        $match: match,
      },
      groupby,
      final_res,
    ])
    .sort({ date: -1 });
  match["paiddetails.date"] = { $lte: date };
  let cashinhandvalue = await dateforexpenses(status, org_id, date);

  let totalamountbydate = await transaction
    .aggregate([
      unwind,
      {
        $match: match,
      },
      groupby1,
      final_res1,
    ])
    .sort({ date: -1 });

  let cashvalue = 0;
  let bankvalue = 0;
  let upivalue = 0;
  let cashvaluetot = 0;
  let bankvaluetot = 0;
  let upivaluetot = 0;
  let total_amount = 0;
  if (day_wise_totals.length > 0) {
    cashvalue = day_wise_totals[0].cash;
    bankvalue = day_wise_totals[0].bank;
    upivalue = day_wise_totals[0].upi;
    total_amount = day_wise_totals[0].total_amount;
  }
  // if(totalamountbydate.length>0){
  //   cashvaluetot = totalamountbydate[0].cash;
  //   bankvaluetot = totalamountbydate[0].bank;
  //   upivaluetot = totalamountbydate[0].upi
  // }

  cashvaluetot = cashinhandvalue.cashInHand;
  bankvaluetot = cashinhandvalue.cashInBank;
  upivaluetot = cashinhandvalue.cashInupi;

  let obj = {};

  obj["cash"] = cashvalue;
  obj["bank"] = bankvalue;
  obj["upi"] = upivalue;
  obj["cashinhand"] = cashvaluetot;
  obj["cashinbank"] = bankvaluetot;
  obj["cashinupi"] = upivaluetot;
  obj["total_amount"] = total_amount;

  obj["date"] = date;

  return obj;
};
const Totalamountvalue = async (request, response) => {
  if (request.body.org_id) {
    try {
      const org_id = request.body.org_id;

      let unwind = { $unwind: "$paiddetails" };
      let match = { "paiddetails.org_id": org_id, "paiddetails.status": "1" };

      let dateTime = request.currentDate;
      match["paiddetails.date"] = { $lte: dateTime };

      let groupby = {
        $group: {
          _id: { org_id: "$paiddetails.org_id" },
          cash: { $sum: { $toDouble: "$paiddetails.cash" } },
          bank: { $sum: { $toDouble: "$paiddetails.bank" } },
          upi: { $sum: { $toDouble: "$paiddetails.upi" } },
          total_amount: { $sum: { $toDouble: "$paiddetails.amount" } },
        },
      };
      let final_res = {
        $project: {
          _id: 0,
          cash: { $round: ["$cash", 2] },
          bank: { $round: ["$bank", 2] },
          upi: { $round: ["$upi", 2] },
          total_amount: { $round: ["$total_amount", 2] },
        },
      };
      // let final_res = { $project: { "_id": 0, "date": "$_id.date", cash: "$cash", bank: "$bank", upi: "$upi", total_amount: "$total_amount" } };

      let day_wise_totals = await transaction
        .aggregate([
          unwind,
          {
            $match: match,
          },
          groupby,
          final_res,
        ])
        .sort({ date: -1 });
      response.status(statusCodes.success).json(day_wise_totals);
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: e.message });
    }
  }
};
const getduebill = async (request, response) => {
  if (request.body.org_id) {
    try {
      let org_id = request.body.org_id;
      let match = { status: "1", org_id: org_id };
      let students = await duebill.aggregate([
        {
          $match: match,
        },
        {
          $lookup: {
            from: "sub_fee_details",
            let: { salId: { $toObjectId: "$sub_fee_id" } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$salId"] },
                      { $eq: ["$status", "1"] },
                      { $eq: ["$org_id", org_id] },
                    ],
                  },
                },
              },
            ],
            as: "sub_fee_name",
          },
        },
        { $unwind: "$sub_fee_name" },
        {
          $set: {
            sub_fee_type: "$sub_fee_name.sub_fee_type",
          },
        },
        { $unset: ["sub_fee_name"] },
      ]);
      response.status(statusCodes.success).json(students);
    } catch (e) {
      response
        .status(statusCodes.SomethingWentWrong)
        .json({ message: e.message });
    }
  }
};
module.exports = {
  GetOlduesLogs,
  getoldduedetails,
  TotalCashIN,
  dashboardvalue,
  getduebill,
  cummulativereport,
  getdayvalue,
  getdatevalue,
  getrelievestudentdashboarddetails,
  cashInHand,
  getstudentfinaldueamount,
  getdueamtdetails,
  DayBookReport,
  TransactionsReport,
  CounterDayWiseTotals,
  DateAndFeeWiseTotals,
  FeeWiseTotals,
  DayWiseTotals,
  OverAllReport,
  addTransaction,
  getTransaction,
  finalamtsettlement,
  updateTransaction,
  addmanualbillTransaction,
  updatemanualbillTransaction,
  getStudTransactiondetails,
  getStudFeedetails,
  deleteTransaction,
  getbilldetails,
  getdatevaluesforeditbills,
  getstudentduepaidFeeamt,
  getStudamtdetails,
  getfinalamtstudent,
  settlestudent,
  getrelievestudentdetails,
  closefortheday,
  expenseReport,
  settlementreport,
  logreport,
  pendingOldDueReport,
  Totalamountvalue,
};
