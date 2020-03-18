import { DataStore } from "./datastore";

interface GeoPosition {
  latitude: number;
  longitude: number;
}
interface AddressData {
  streetAdress: string;
  city: string;
  zip: number;
}
interface RegistationData {
  username: string;
  email: string;
  password: any;
  contactNumber: number;
  accountType: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePic?: string | null;
  gender?: string | null;
  date_created: any;
}

interface GarageRegistationData {
  address: AddressData;
  geolocation: GeoPosition;
  garageName: string;
}

interface LoginData {
  email: string;
  password: string;
}

class User extends DataStore {
  constructor() {
    super();
  }
  register(regData: RegistationData, callback: any) {
    super.userRegister(regData, (err: any, result: any) =>
      callback(err, result)
    );
  }

  login(loginData: LoginData, callback: any) {
    super.userLogin(loginData, (err: any, result: any) =>
      callback(err, result)
    );
  }

  getInfo(id: string, callback: any) {
    super.userDetails(id, (err: any, result: any) => callback(err, result));
  }

  updateInfo(id: any, data: Array<any>, callback: any) {
    super.updateField(
      { collection: "users_table", doc: id },
      data,
      (err: any, success: boolean) => {
        callback(err, success);
      }
    );
  }

  getAllUsers(callback: any) {
    super.getAllInCollection("users_table", (err: any, data: any) =>
      callback(err, data)
    );
  }

  delete(id: string, callback: any) {
    super.userDelete(id, (err: any, success: any) => callback(err, success));
  }
}

export { User, RegistationData, LoginData, GeoPosition };
