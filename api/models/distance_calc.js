"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Calc {
    constructor() {
        this.pi = Math.PI;
    }
    toRadians(degrees) {
        return degrees * (this.pi / 180);
    }
    calcDistance(coords) {
        // haversine formula
        let lat1_Rad = this.toRadians(coords.coords1.lat);
        let lat2_Rad = this.toRadians(coords.coords2.lat);
        let diff_lat = lat2_Rad - lat1_Rad;
        let diff_lng = this.toRadians(coords.coords2.lng - coords.coords1.lng);
        let a = Math.pow(Math.sin(diff_lat / 2), 2) +
            Math.cos(lat1_Rad) *
                Math.cos(lat2_Rad) *
                Math.pow(Math.sin(diff_lng / 2), 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return 6371 * c; //in km
    }
}
exports.Calc = Calc;
