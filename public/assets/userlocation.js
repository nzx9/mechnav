"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class UserLocation {
    getLocation(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    callback(null, position);
                }, err => callback(err, null), {
                    enableHighAccuracy: true
                });
            }
            else {
                createAlert("Unsupported browser!", "Sorry!, this browser not support GeoLocation API, please update or try using another browser.", "OK");
            }
        });
    }
    getRealTimeLocation(highAccuracy, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (navigator.geolocation) {
                navigator.geolocation.watchPosition((position) => {
                    callback(null, position);
                }, (err) => callback(err, null), {
                    enableHighAccuracy: highAccuracy
                });
            }
            else {
                createAlert("Unsupported browser!", "Sorry!, this browser not support GeoLocation API, please update or try using another browser.", "OK");
            }
        });
    }
    serverUpdateRealTime(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.getRealTimeLocation(true, (err, position) => {
                if (err) {
                    createAlert("Error", err.message, "OK");
                }
                else {
                    socket.emit("userlocation", {
                        userId: userId,
                        latlng: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        },
                        heading: position.coords.heading,
                        timestamp: position.timestamp
                    });
                    callback;
                }
            });
        });
    }
    getLocationWithInterval(seconds, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            setInterval(() => this.getLocation((err, pos) => callback(err, pos)), seconds * 1000);
        });
    }
}
