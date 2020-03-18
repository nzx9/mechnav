"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
   datastore.ts ==> datastore.js
*/
const hasher_1 = require("./hasher");
const admin = require("firebase-admin");
admin.initializeApp({
    credential: admin.credential.cert(require("../../keys/<your_key_name.json> ") // add your firebase key to keys folder(at root directory of project) and replace <your_key_name.json> with it's name
    ),
    databaseURL: "<your_database_url>" // replace your database url with <your_database_url> here
});
class DataStore extends hasher_1.Hasher {
    constructor() {
        super();
        this.init();
    }
    init() {
        try {
            this.fs = admin.firestore();
            this.db = admin.database();
        }
        catch (error) {
            console.log(error);
        }
    }
    createField(child, data) {
        try {
            this.fs
                .collection(child.collection)
                .doc(child.doc)
                .set(data);
            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }
    createFieldWithAutoId(collection, data, callback) {
        this.fs
            .collection(collection)
            .add(data)
            .then((result) => {
            callback(null, result.id);
        })
            .catch((err) => {
            callback(err, null);
        });
    }
    updateField(child, data, callback) {
        try {
            this.fs
                .collection(child.collection)
                .doc(child.doc)
                .update(data);
            callback(null, true);
        }
        catch (err) {
            callback(err, false);
        }
    }
    getData(child, callback) {
        this.fs
            .collection(child.collection)
            .doc(child.doc)
            .get()
            .then((data) => callback(null, data))
            .catch((err) => callback(err, null));
    }
    getAllInCollection(collection, callback) {
        this.fs
            .collection(collection)
            .get()
            .then((data) => callback(null, data.docs))
            .catch((err) => callback(err, null));
    }
    getWithCondition(collection, condition, callback) {
        this.fs
            .collection(collection)
            .where(condition.cName1, "==", condition.cValue1)
            .where(condition.cName2, "==", condition.cValue2)
            .get()
            .then((result) => {
            if (result._size !== 0) {
                callback(null, {
                    size: result._size,
                    body: result.docs[0].data(),
                    _id: result.docs[0].id
                });
            }
            else {
                callback(null, {
                    size: result._size,
                    body: null,
                    _id: null
                });
            }
        })
            .catch((err) => {
            console.log(err);
            callback(err, null);
        });
    }
    listenToDB(child, callback) {
        this.fs
            .collection(child.collection)
            .doc(child.doc)
            .onSnapshot()
            .then((data) => callback(null, data))
            .catch((err) => callback(err, null));
    }
    createInRTDB(collection1, collection2, doc, data) {
        try {
            let ref = this.db.ref("/");
            ref
                .child(collection1)
                .child(collection2)
                .child(doc)
                .set(data);
            console.log("Done");
        }
        catch (error) {
            console.log(error);
        }
    }
    updateInRTDB(collection1, collection2, doc, data) {
        let ref = this.db.ref("/");
        ref
            .child(collection1)
            .child(collection2)
            .child(doc)
            .update(data);
    }
    readDataInRTDB(ref, callback) {
        try {
            let _ref = this.db.ref(ref);
            _ref.once("value", (data) => {
                callback(null, data.val());
            });
        }
        catch (error) {
            callback(error, null);
        }
    }
    userRegister(regData, callback) {
        this.fs
            .collection("users_table")
            .where("email", "==", regData.email)
            .get()
            .then((snap) => {
            if (snap.empty) {
                super.crypt(regData.password, (err, hash) => {
                    regData.password = hash;
                    if (!err) {
                        this.fs
                            .collection("users_table")
                            .add(regData)
                            .then((result) => {
                            callback(null, result.id);
                        })
                            .catch((err) => callback(err.details, null));
                    }
                    else
                        return callback(err, null);
                });
            }
            else {
                return callback("Email already exist!", null);
            }
        })
            .catch((err) => callback(err.details, null));
    }
    userLogin(loginData, callback) {
        let ref = this.fs.collection("users_table");
        ref
            .where("email", "==", loginData.email)
            .get()
            .then((snap) => {
            if (snap.empty)
                return callback("No user with this email", null);
            else
                super.compare(loginData.password, snap.docs[0].data().password, (err, isPasswordMatch) => {
                    if (err)
                        callback(err, null);
                    else {
                        if (isPasswordMatch)
                            callback(null, snap.docs[0].id);
                        else
                            callback("Check your password and try again", null);
                    }
                });
        })
            .catch((err) => callback(err.details, null));
    }
    userDetails(id, callback) {
        this.fs
            .collection("users_table")
            .doc(id)
            .get()
            .then((snap) => {
            return callback(null, snap.data());
        })
            .catch((err) => callback(err.details, null));
    }
    userDelete(id, callback) {
        this.fs
            .collection("users_table")
            .doc(id)
            .delete()
            .then((result) => callback(null, result))
            .catch((err) => callback(err, null));
    }
}
exports.DataStore = DataStore;
