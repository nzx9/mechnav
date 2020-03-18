/* 
   datastore.ts ==> datastore.js
*/
import { Hasher } from "./hasher";
const admin: any = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(
    require("../../keys/<your_key_name.json> ")   // add your firebase key to keys folder(at root directory of project) and replace <your_key_name.json> with it's name
  ),
  databaseURL: "<your_database_url>" // replace your database url with <your_database_url> here
});

interface ChildModel {
  collection: any;
  doc: any;
}

interface Condition {
  cName1: string | null;
  cValue1: any;
  cName2: string | null;
  cValue2: any;
}

class DataStore extends Hasher {
  private fs: any;
  private db: any;
  constructor() {
    super();
    this.init();
  }

  init() {
    try {
      this.fs = admin.firestore();
      this.db = admin.database();
    } catch (error) {
      console.log(error);
    }
  }

  createField(child: ChildModel, data: any): boolean {
    try {
      this.fs
        .collection(child.collection)
        .doc(child.doc)
        .set(data);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  createFieldWithAutoId(collection: string, data: any, callback: any) {
    this.fs
      .collection(collection)
      .add(data)
      .then((result: any) => {
        callback(null, result.id);
      })
      .catch((err: any) => {
        callback(err, null);
      });
  }

  updateField(child: ChildModel, data: any, callback: any) {
    try {
      this.fs
        .collection(child.collection)
        .doc(child.doc)
        .update(data);
      callback(null, true);
    } catch (err) {
      callback(err, false);
    }
  }

  getData(child: ChildModel, callback: any) {
    this.fs
      .collection(child.collection)
      .doc(child.doc)
      .get()
      .then((data: any) => callback(null, data))
      .catch((err: any) => callback(err, null));
  }

  getAllInCollection(collection: string, callback: any) {
    this.fs
      .collection(collection)
      .get()
      .then((data: any) => callback(null, data.docs))
      .catch((err: any) => callback(err, null));
  }

  getWithCondition(collection: any, condition: Condition, callback: any) {
    this.fs
      .collection(collection)
      .where(condition.cName1, "==", condition.cValue1)
      .where(condition.cName2, "==", condition.cValue2)
      .get()
      .then((result: any) => {
        if (result._size !== 0) {
          callback(null, {
            size: result._size,
            body: result.docs[0].data(),
            _id: result.docs[0].id
          });
        } else {
          callback(null, {
            size: result._size,
            body: null,
            _id: null
          });
        }
      })
      .catch((err: any) => {
        console.log(err);
        callback(err, null);
      });
  }

  listenToDB(child: ChildModel, callback: any) {
    this.fs
      .collection(child.collection)
      .doc(child.doc)
      .onSnapshot()
      .then((data: any) => callback(null, data))
      .catch((err: any) => callback(err, null));
  }

  createInRTDB(collection1: any, collection2: any, doc: any, data: any) {
    try {
      let ref = this.db.ref("/");
      ref
        .child(collection1)
        .child(collection2)
        .child(doc)
        .set(data);
      console.log("Done");
    } catch (error) {
      console.log(error);
    }
  }

  updateInRTDB(collection1: any, collection2: any, doc: any, data: any) {
    let ref = this.db.ref("/");
    ref
      .child(collection1)
      .child(collection2)
      .child(doc)
      .update(data);
  }

  readDataInRTDB(ref: string, callback: any) {
    try {
      let _ref = this.db.ref(ref);
      _ref.once("value", (data: any) => {
        callback(null, data.val());
      });
    } catch (error) {
      callback(error, null);
    }
  }

  userRegister(regData: any, callback: any) {
    this.fs
      .collection("users_table")
      .where("email", "==", regData.email)
      .get()
      .then((snap: any) => {
        if (snap.empty) {
          super.crypt(regData.password, (err: any, hash: any) => {
            regData.password = hash;
            if (!err) {
              this.fs
                .collection("users_table")
                .add(regData)
                .then((result: any) => {
                  callback(null, result.id);
                })
                .catch((err: any) => callback(err.details, null));
            } else return callback(err, null);
          });
        } else {
          return callback("Email already exist!", null);
        }
      })
      .catch((err: any) => callback(err.details, null));
  }

  userLogin(loginData: any, callback: any) {
    let ref = this.fs.collection("users_table");
    ref
      .where("email", "==", loginData.email)
      .get()
      .then((snap: any) => {
        if (snap.empty) return callback("No user with this email", null);
        else
          super.compare(
            loginData.password,
            snap.docs[0].data().password,
            (err: any, isPasswordMatch: boolean) => {
              if (err) callback(err, null);
              else {
                if (isPasswordMatch) callback(null, snap.docs[0].id);
                else callback("Check your password and try again", null);
              }
            }
          );
      })
      .catch((err: any) => callback(err.details, null));
  }

  userDetails(id: string, callback: any) {
    this.fs
      .collection("users_table")
      .doc(id)
      .get()
      .then((snap: any) => {
        return callback(null, snap.data());
      })
      .catch((err: any) => callback(err.details, null));
  }

  userDelete(id: string, callback: any) {
    this.fs
      .collection("users_table")
      .doc(id)
      .delete()
      .then((result: any) => callback(null, result))
      .catch((err: any) => callback(err, null));
  }
}
export { DataStore };


