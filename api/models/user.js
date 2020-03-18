"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const datastore_1 = require("./datastore");
class User extends datastore_1.DataStore {
    constructor() {
        super();
    }
    register(regData, callback) {
        super.userRegister(regData, (err, result) => callback(err, result));
    }
    login(loginData, callback) {
        super.userLogin(loginData, (err, result) => callback(err, result));
    }
    getInfo(id, callback) {
        super.userDetails(id, (err, result) => callback(err, result));
    }
    updateInfo(id, data, callback) {
        super.updateField({ collection: "users_table", doc: id }, data, (err, success) => {
            callback(err, success);
        });
    }
    getAllUsers(callback) {
        super.getAllInCollection("users_table", (err, data) => callback(err, data));
    }
    delete(id, callback) {
        super.userDelete(id, (err, success) => callback(err, success));
    }
}
exports.User = User;
