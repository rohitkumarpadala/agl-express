//const REDIS_URL = process.env.REDIS_URL;
var redis = require('redis');
var client = redis.createClient();
const { StudFinal, getbranchamt, getTrasactionamt, studentwisebillReport} = require('./commonfunction');
client.connect().then(() => {
    console.log("connected")
})

const Queue = require("bull");
let QUEUE_NAME = "PROCESS_QUEUE";
let STAFF_QUEUE_NAME = "PROCESS_STAFF_QUEUE";
let DUEAMT_QUEUE_NAME = "DUEAMT_QUEUE_NAME";
let BRANCHFEE_QUEUE_NAME = "BRANCHFEE_QUEUE_NAME";
let TOTALAMT_QUEUE_NAME = "TOTALAMT_QUEUE_NAME";
let REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const processQueue = new Queue(QUEUE_NAME, REDIS_URL);

// client = redis.createClient();
console.log(REDIS_URL);
async function addJob(data) {

    return await processQueue.add(QUEUE_NAME, data);
}
client.get('due_amount', function (err, reply) {
    console.log(reply); // ReactJS
});
async function addStaffJob(data) {
    console.log(data)
    return await processQueue.add(STAFF_QUEUE_NAME, data);
}
async function adddueamtJob(data) {
    //console.log(data)
    return await processQueue.add(DUEAMT_QUEUE_NAME, data);
}
async function addtotalamountpaidJob(data) {
    //console.log(data)
    return await processQueue.add(TOTALAMT_QUEUE_NAME, data);
}

async function addbranchamtJob(data) {
    console.log(data)
    return await processQueue.add(BRANCHFEE_QUEUE_NAME, data);
}
async function getJobs(option) {
    if (option == 'JOBS_COUNT') {
        let jobs = await processQueue.getJobCounts();
        console.log(jobs);
        return jobs;
    } else if (option == 'JOBS_FAILED') {
        let jobs = await processQueue.getFailed();
        console.log(jobs);
        return jobs;
    }

}

async function getstaffJobs() {
    let countJobs = await processQueue.getJobs(['completed']);
    console.log(countJobs[0].data.staff_name);
}
async function getdueamtJobs() {
    client.get('dueamt');
}

async function reprocessFailedJobs() {
    let failedJobs = await getJobs('JOBS_FAILED');
    failedJobs.forEach(element => {
        console.log(element.data);
        addStaffJob(element.data);
        element.remove();
    });
    return failedJobs.length;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
processQueue.process(QUEUE_NAME, async (data, done) => {
    try {
        done();
        //await callsomemethod(job.security_id);
    }
    catch (err) {
        console.log(err);
        done(err);
    }
})

processQueue.process(STAFF_QUEUE_NAME, async (job, done) => {
    try {
        console.log(job.data.staff_name);
        done();
    }
    catch (err) {
        console.log(err);
        done(err);
    }
});
processQueue.process(DUEAMT_QUEUE_NAME, async (job, done) => {
    try {

        var dueamt = await StudFinal(job.data);

        await savedueamt(job.data, dueamt);
        done();


    }
    catch (err) {
        console.log(err);
        done(err);
    }
});
processQueue.process(TOTALAMT_QUEUE_NAME, async (job, done) => {
    try {
        var totamt = await monthtot(job.data);
        console.log(totamt);
        done();
    }
    catch (err) {
        console.log(err);
        done(err);
    }
});
processQueue.process(BRANCHFEE_QUEUE_NAME, async (job, done) => {
    try {
        //var branchamt = await getbranchamt(job.data);
        done();
    }
    catch (err) {
        console.log(err);
        done(err);
    }
});
function savedueamt(data1, data2) {

    var str1 = "student_due_amount_";
    var str2 = data1;
    var str3 = String(str1.concat(str2));

    client.set(str3, data2);
}
async function monthtot(data) {
 
    //client.zAdd('myset',[{score:1,value:"hello"},{score:2,value:"hi"}]);

}


module.exports = { addJob, addStaffJob, getJobs, reprocessFailedJobs, getstaffJobs, adddueamtJob, getdueamtJobs, addbranchamtJob };