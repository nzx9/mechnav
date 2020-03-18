"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcryptjs");
class Hasher {
    crypt(password, callback) {
        bcrypt.genSalt(10, (err, salt) => {
            if (err)
                return callback(err);
            bcrypt.hash(password, salt, (err, hash) => {
                return callback(err, hash);
            });
        });
    }
    compare(password, hash, callback) {
        bcrypt.compare(password, hash, (err, isPasswordMatch) => {
            if (err)
                return callback(err);
            callback(err, isPasswordMatch);
        });
    }
    cryptSync(password, salt) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(salt));
    }
    compareSync(password, hash) {
        return bcrypt.compareSync(password, hash);
    }
}
exports.Hasher = Hasher;
