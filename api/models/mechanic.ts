import { DataStore } from "./datastore";
import { Calc } from "./distance_calc";

const calc = new Calc();
class Mechanic extends DataStore {
  constructor() {
    super();
  }

  find(user_coords: any, max_mechanics: number, max_distance: number) {
    return new Promise((resolve: any, reject: any) => {
      super.readDataInRTDB("user_locations/mechanic", (err: any, data: any) => {
        if (err) {
          reject(err);
        } else {
          let dataArray: any = [];
          let keys = Object.keys(data);
          keys.forEach(key => {
            if (dataArray.length < max_mechanics) {
              let distance = calc.calcDistance({
                coords1: user_coords,
                coords2: data[key].latlng
              });
              if (distance < max_distance) {
                dataArray.push({
                  mechanicId: key,
                  socketId: data[key].socketId,
                  distance: distance,
                  latlng: data[key].latlng
                });
              }
            } else {
              return;
            }
          });
          resolve(dataArray);
        }
      });
    });
  }
}

export { Mechanic };
