"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const datastore_1 = require("./datastore");
class Job extends datastore_1.DataStore {
    constructor() {
        super();
    }
    create(jobData, callback) {
        super.createFieldWithAutoId("Jobs", jobData, (err, res) => callback(err, res));
    }
    getActiveJob(accType, userId, callback) {
        super.getWithCondition("Jobs", {
            cName1: `${accType}Id`,
            cValue1: userId,
            cName2: "isActivated",
            cValue2: true
        }, (err, res) => {
            callback(err, res);
        });
    }
    getJobs(accType, userId, callback) {
        super.getWithCondition("Jobs", {
            cName1: `${accType}Id`,
            cValue1: userId,
            cName2: null,
            cValue2: null
        }, (err, res) => {
            callback(err, res);
        });
    }
}
exports.Job = Job;
