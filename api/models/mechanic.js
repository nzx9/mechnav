"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const datastore_1 = require("./datastore");
const distance_calc_1 = require("./distance_calc");
const calc = new distance_calc_1.Calc();
class Mechanic extends datastore_1.DataStore {
    constructor() {
        super();
    }
    find(user_coords, max_mechanics, max_distance) {
        return new Promise((resolve, reject) => {
            super.readDataInRTDB("user_locations/mechanic", (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    let dataArray = [];
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
                        }
                        else {
                            return;
                        }
                    });
                    resolve(dataArray);
                }
            });
        });
    }
}
exports.Mechanic = Mechanic;
