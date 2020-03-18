"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let App = require("./app");
let Socket = require("socket.io");
const datastore_1 = require("./api/models/datastore");
const dataStore = new datastore_1.DataStore();
let server = App.listen(process.env.PORT || 80, () => {
    console.log("Listen on: " + (process.env.PORT || 80));
});
let io = Socket(server);
io.on("connection", (socket) => {
    console.log("Client id: " + socket.id);
    socket.on("userlocation", (data) => {
        data.heading = data.heading === null ? 0 : data.heading;
        data.timestamp = data.timestamp === null ? 0 : data.timestamp;
        let __data = {
            socketId: socket.id,
            latlng: data.latlng,
            heading: data.heading,
            timestamp: data.timestamp
        };
        try {
            if (data.userId !== null &&
                data.userId !== undefined &&
                data.accountType !== null &&
                data.accountType !== undefined) {
                dataStore.updateInRTDB("user_locations", data.accountType, data.userId, __data);
            }
        }
        catch (error) {
            console.log("error: " + error);
        }
        io.emit("locationdata_server", {
            userId: data.userId,
            latlng: data.latlng,
            heading: data.heading,
            timestamp: data.timestamp
        });
    });
    socket.on("disconnect", (log) => {
        console.log("client disconnected | " + log);
    });
    socket.on("requestfromclient", (data) => {
        io.emit("requestfromclient_server", {
            mechanicId: data.mechanicId,
            clientId: data.clientId,
            clientPos: data.clientPos,
            distance: data.distance
        });
    });
    socket.on("responsefrommechanic", (data) => {
        io.emit("responsefrommechanic_server", {
            data
        });
    });
    socket.on("jobcreatedsuccess", (data) => {
        io.emit("jobcreatedsuccess_server", {
            clientId: data.clientId,
            mechanicId: data.mechanicId
        });
    });
    socket.on("canceljob", (data) => {
        io.emit("canceljob_server", {
            clientId: data.clientId,
            mechanicId: data.mechanicId,
            jobId: data.jobId
        });
    });
});
