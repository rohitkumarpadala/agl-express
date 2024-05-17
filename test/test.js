var should = require('should');
var app = require('../server.js');
var request = require('supertest');

describe('POST /staff/addStaff', function() {
it('All Feilds are required', function(done) {
  request(app)
    .post('/staff/addStaff')
    .send({"staff_id":"1234","dep_id":"1111","status":1,"org_id":1,"created_by":"","created_date_time":""})
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if(err){
        console.log(res.body);
       }
      done();
       });
    
});


});
describe('POST /student/addStudent', function() {
  it('Test for required Feilds', function(done) {
    request(app)
      .post('/student/addStudent')
      .send({"hall_ticket_number":1123,"admission_number":8318,"student_name":"Tharani","jnanbhumi_number:":"","aadhaar_number":1,"id":"22-ABCD-001","student_phone_number":9876543210,"ssc":"","second_language":"","status":1,"org_id":1,"created_by":"6316f8cbaa00b2e407b90c55","created_date_time":""})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
       if(err){
        console.log(res.body);
       }
        done();
         });
      
  });
  it('Maximum length validation for Students Module', function(done) {
    request(app)
      .post('/student/addStudent')
      .send({"hall_ticket_number":2345,"admission_number":8318,"student_name":"Tharani","jnanbhumi_number:":"","aadhaar_number":1456,"id":"22-ABCD-001","student_phone_number":9876543210,"ssc":"","second_language":"","status":1,"org_id":1,"created_by":"6316f8cbaa00b2e407b90c55","created_date_time":""})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
       if(err){
        console.log(res.body);
       }
        done();
         });
      
  });
});
describe('POST /dep/adddep', function() {
  it('Test for required Feilds', function(done) {
    request(app)
      .post('/dep/adddep')
      .send({"dep_name":"BA","create_by":"6316f8cbaa00b2e407b90c55","status":1,"org_id":1,"created_date_time":""})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
       if(err){
        console.log(res.body);
       }
        done();
         });
      
  });
  it('Maximum length validation for Department Module', function(done) {
    request(app)
      .post('/dep/adddep')
      .send({"dep_name":"BA","create_by":"6316f8cbaa00b2e407b90c55","status":1,"org_id":1,"created_date_time":""})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
       if(err){
        console.log(res.body);
       }
        done();
         });
      
  });
});
describe('POST /fee/addFee', function() {
  it('Test for required Feilds', function(done) {
    request(app)
      .post('/fee/addFee')
      .send({"fee_type":"Admission","access_status":1,"created_by":"6316f8cbaa00b2e407b90c55","status":1,"org_id":1,"created_date_time":"","fee_order":1})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
       if(err){
        console.log(res.body);
       }
        done();
         });
      
  });
  it('Maximum length validation for Fee Module', function(done) {
    request(app)
      .post('/fee/addFee')
      .send({"fee_type":"BA","access_status":1,"created_by":"6316f8cbaa00b2e407b90c55","status":1,"org_id":1,"created_date_time":"","fee_order":1})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
       if(err){
        console.log(res.body);
       }
        done();
         });
      
  });
});

describe('POST /branchfee/addbranchFee', function() {
  it('Test for required Feilds', function(done) {
    request(app)
      .post('/branchfee/addbranchFee')
      .send({"branch_id":"Admission","year":2022,"fee_id":"6316f8cbaa00b2e407b90c55","amount":1000,"access_status":1,"created_by":"6316f8cbaa00b2e407b90c55","status":1,"org_id":1,"created_date_time":"","fee_order":1})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
       if(err){
        console.log(res.body);
       }
        done();
         });
      
  });
  it('Maximum length validation for BranchFee Module', function(done) {
    request(app)
      .post('/branchfee/addbranchFee')
      .send({"branch_id":"6316f8cbaa00b2e407b90c55","year":2022,"fee_id":"6316f8cbaa00b2e407b90c55","amount":1000,"created_by":"6316f8cbaa00b2e407b90c55","status":1,"org_id":1,"created_date_time":""})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
       if(err){
        console.log(res.body);
       }
        done();
         });
      
  });
});
describe('POST /bill/addTransaction', function() {
  it('Test for required Feilds', function(done) {
    request(app)
      .post('/bill/addTransaction')
      .send([{"student_id":"6316f8cbaa00b2e407b90c55","payment_method":"U","fee_id":"6316f8cbaa00b2e407b90c55","amount":1000,"bill_type":1,"cash":100,"bank":100,"upi":100,"bill_type":"O","created_by":"6316f8cbaa00b2e407b90c55","status":1,"org_id":1,"created_date_time":""}])
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
       if(err){
        console.log(res.body);
       }
        done();
         });
      
  });
  it('Maximum length validation for Transaction Module', function(done) {
    request(app)
      .post('/bill/addTransaction')
      .send([{"student_id":"6316f8cbaa00b2e407b90c55","payment_method":"U","fee_id":"6316f8cbaa00b2e407b90c55","amount":100,"cash":100,"bank":100,"upi":100,"bill_type":"O","created_by":"6316f8cbaa00b2e407b90c55","status":1,"org_id":1,"created_date_time":""}])
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
       if(err){
        console.log(res.body);
       }
        done();
         });
      
  });
});
describe('POST /auth/addUser', function() {
  it('Test for required Feilds', function(done) {
    request(app)
      .post('/auth/addUser')
      .send({"admin_name":"Tharani","admin_email":"tharani@gmail.com","admin_mobile":"9876543210","address":"abc","admin_password":12345,"role_name":"Admin","security_type":"A","access_status":1,"created_by":"6316f8cbaa00b2e407b90c55","status":1,"org_id":1,"created_date_time":""})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
       if(err){
        console.log(res.body);
       }
        done();
         });
      
  });
  it('Maximum length validation for Transaction Module', function(done) {
    request(app)
      .post('/auth/addUser')
      .send({"admin_name":"Tharani","admin_email":"tharani@gmail.com","admin_mobile":"9876543210","address":"abc","admin_password":12345,"role_name":"Admin","security_type":"A","access_status":1,"created_by":"6316f8cbaa00b2e407b90c55","status":1,"org_id":1,"created_date_time":""})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
       if(err){
        console.log(res.body);
       }
        done();
         });
      
  });
});
describe('POST /expenses/addExpenses', function() {
  it('Test for required Feilds', function(done) {
    request(app)
      .post('/expenses/addExpenses')
      .send({"amount":1000,"expenses_to":"milk","expense_type":"","reason":"milk","type":"C","accept_url":"abc","reject_url":"abc","wait_url":"abc","created_by":"6316f8cbaa00b2e407b90c55","status":1,"org_id":1,"created_date_time":""})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
       if(err){
        console.log(res.body);
       }
        done();
         });
      
  });
  it('Maximum length validation for Expenses Module', function(done) {
    request(app)
      .post('/expenses/addExpenses')
      .send({"amount":1000,"expenses_to":"milk","expense_type":"","reason":"milk","type":"C","accept_url":"abc","reject_url":"abc","wait_url":"abc","created_by":"6316f8cbaa00b2e407b90c55","status":1,"org_id":1,"created_date_time":""})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
       if(err){
        console.log(res.body);
       }
        done();
         });
      
  });
});