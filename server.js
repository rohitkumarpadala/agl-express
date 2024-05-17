
const express = require("express");
const app = express();
var bodyParser = require("body-parser");
var mime = require("mime");

var session = require("express-session");


const async = require("async");

var moment = require('moment');
const jwt = require('jsonwebtoken');
var cors = require('cors');
const yaml = require("yamljs");
const mongoose = require('mongoose');
require("dotenv").config();
const mailtransporter = require("./config/mail.js")
const master_server=`${process.env.HOST}`;

//connecting route to database
const multer = require("multer");

app.use(cors())
app.use(express.static(__dirname + "/public"));
app.use('*/images', express.static('public/images'));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "x-access-token");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});


const currentDate = () => {
  var dateobj = new Date();
  var create_date_time = new Date(
    new Date(dateobj).getTime() + 60 * 60 * (5.5 + 0) * 1000
  );
  create_date_time = create_date_time
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/, "");
  return create_date_time;
};


//uploading QRCode code buffer to server
const uploadQRCodeFile = (req) => {
  return new Promise(function (resolve, reject) {
    let qrcodedata = req.qrcodedata;
    bwipjs.toBuffer(
      {
        bcid: "qrcode", // qrcode type
        text: qrcodedata.asset_ref_no, // Text to encode
      },
      function (err, png) {
        // var base64data = new Buffer(data, 'binary');
        if (err) {
          console.log("qrcodecalled!!!" + err);
          // `err` may be a string or Error object
          resolve(null);
        } else {
          // const file = png;
          //const s3FileURL = process.env.AWS_Uploaded_File_URL_LINK;
          //4 digit random number
          let randomdigit = Math.floor(10000000 + Math.random() * 90000000);
          //let fileextension = mime.getExtension(file.mimetype);
          let filename =
            "qrlabel" +
            "_" +
            qrcodedata.asset_ref_no +
            "_" +
            randomdigit +
            ".png";
          //Where you want to store your file
          // console.log("file.mimetype:" + file.mimetype);
          var params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: filename,
            ACL: "public-read",
            Body: png,
            ContentEncoding: 'base64',
            ContentType: 'image/png'
          };

          s3bucket.upload(params, function (err, data) {
            if (err) {
              console.log("Image uplaod error:" + err);
              resolve(null);
            } else {
              // console.log(`File uploaded successfully. ${data.Location}`);
              resolve(data.Location);
            }
          });
        }
      }
    );
  });
};

//upload pdf file
const uploadSinglePdfFile = (req, objdata) => {
  return new Promise(function (resolve, reject) {
    const file = req.file;
    // console.log(file)
    //const s3FileURL = process.env.AWS_Uploaded_File_URL_LINK;
    //4 digit random number
    let randomdigit = Math.floor(10000000 + Math.random() * 90000000);
    let filename =
      objdata.module_name +
      "_" +
      objdata.unique_id +
      "_" +
      randomdigit +
      ".pdf";
    //Where you want to store your file
    var params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: filename,
      Body: file,
      ContentType: 'application/pdf',
      ACL: "public-read",
    };

    s3bucket.upload(params, function (err, data) {
      if (err) {
        console.log("Image uplaod error:" + err);
        resolve(null);
      } else {
        console.log(`File uploaded successfully. ${data.Location}`);
        resolve(data.Location);
      }
    });
  });
};

//uploading file to aws server
const uploadSingleFile = (req, objdata) => {
  return new Promise(function (resolve, reject) {
    const file = req.file;
    //const s3FileURL = process.env.AWS_Uploaded_File_URL_LINK;
    //4 digit random number
    let randomdigit = Math.floor(10000000 + Math.random() * 90000000);
    let fileextension = mime.getExtension(file.mimetype);
    let filename =
      objdata.module_name +
      "_" +
      objdata.unique_id +
      "_" +
      randomdigit +
      "." +
      fileextension;
    //Where you want to store your file
    console.log("file.mimetype:" + file.mimetype);
    var params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    s3bucket.upload(params, function (err, data) {
      if (err) {
        console.log("Image uplaod error:" + err);
        resolve(null);
      } else {
        console.log(`File uploaded successfully. ${data.Location}`);
        resolve(data.Location);
      }
    });
  });
};

// send notification
const notification_options = {
  priority: "high",
  timeToLive: 60 * 60 * 24
};
const sendNotification = (req) => {
  return new Promise((resolve, reject) => {
    const title = req.notificationTitle
    const message = req.notificationMessage
    const registrationTokens = req.deviceTokens
    const options = notification_options
    var payload = {
      notification: {
        title: title,
        body: message
      },
      data: {
        menu: "Notifications",
      }
    };
    admin.messaging().sendToDevice(registrationTokens, payload, options)
      .then(response => {
        console.log(response);
        //res.status(200).send("Notification sent successfully")
        resolve(1);
      })
      .catch(error => {
        console.log(error);
        resolve(1);
      });
  })
}

app.use(function (req, res, next) {
  req.currentDate = currentDate();
  req.mailtransporter=mailtransporter;
  req.master_server = master_server;
  req.uploadQRCodeFile = uploadQRCodeFile;
  req.sendNotification = sendNotification;
  req.uploadSingleFile = uploadSingleFile;
  req.uploadSinglePdfFile = uploadSinglePdfFile;
 
req.upload=upload;
  next();
});


app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ extended: true, limit: "50mb" }));


var storage = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    var datetimestamp = Date.now();
    cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
  }
});
var upload = multer({ //multer settings
  storage: storage,
  fileFilter: function (req, file, callback) { //file filter
    if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
      return callback(new Error('Wrong extension type'));
    }
    callback(null, true);
  }
}).single('file');


///Load swagger
const swaggerUiExpress = require("swagger-ui-express");
const swaggerDocument = yaml.load('./apidoc/swagger.yaml');
app.use("/apidoc", swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerDocument));

//include routers
const securitiesRouter = require("./routes/securitiesRouter");
const studRouter = require("./routes/studentRouter");
const staffRouter = require("./routes/staffDepRouter");
const feeRouter = require("./routes/feeRouter");
const branchfeeRouter = require("./routes/branchfeeRouter");
const transactionsRouter = require("./routes/transactionsRouter");
const roleRouter = require("./routes/roleRouter");
const expensesRouter = require("./routes/expensesRouter");
const olddueRouter = require("./routes/oldstudentRouter");
const depRouter = require("./routes/depRouter");
const branchRouter = require("./routes/branchRouter");
const concessionRouter = require("./routes/concessionRouter");
const orgRouter = require("./routes/orgRouter");
const basemenuRouter = require("./routes/basemenuRouter");
const orgmenuRouter = require("./routes/orgmenuRouter");
const roleorgmenuRouter = require("./routes/rolemenuorgRouter");
const calendaryearRouter = require("./routes/calendaryearRouter");
const academicyearRouter = require("./routes/academicyearRouter");
//routing
app.use("/student", studRouter);
app.use("/staff", staffRouter);
app.use("/auth", securitiesRouter);
app.use("/fee", feeRouter);
app.use("/branchfee", branchfeeRouter);
app.use("/bill", transactionsRouter);
app.use("/role", roleRouter);
app.use("/expenses", expensesRouter);
app.use("/oldstuddue", olddueRouter);
app.use("/dep", depRouter);
app.use("/branch", branchRouter);
app.use("/concession", concessionRouter);
app.use("/org", orgRouter);
app.use("/basemenu", basemenuRouter);
app.use("/orgmenu", orgmenuRouter);
app.use("/roleorgmenu", roleorgmenuRouter);
app.use("/calendaryear", calendaryearRouter);
app.use("/academicyear", academicyearRouter);

const URL = 'mongodb://127.0.0.1:27017/agl12'
// const dotenv = require('dotenv'); //3 - but we need to tell express where to pick this port 
// It allows you to seperate your crediantials when we work in a collaborative environment
const PORT = process.env.PORT || '3001'; //2 - get the port from env file, if not available pick 8080
mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  // we need .then becausew
  //it returns a promise 
  app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`))
}).catch((error) => {
  console.log('Error:', error.message)
})
app.use(express.static(__dirname + "/uploads"));
module.exports = app;