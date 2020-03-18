"use strict";
const express = require("express");
const app = express();
const helmet = require("helmet");
//middlewears
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(helmet());
// api routes
const userRoutes = require("./api/routes/users");
const mechanicRoutes = require("./api/routes/mechanics");
const jobRoutes = require("./api/routes/jobs");
app.use("/api/users", userRoutes);
app.use("/api/mechanics", mechanicRoutes);
app.use("/api/jobs", jobRoutes);
//visual routes
app.use("/", express.static("public"));
//error handling
app.use((req, res, callback) => {
    const error = new Error("Not Found");
    error.status = 404;
    callback(error);
});
app.use((error, req, res, callback) => {
    res.status(error.status || 500);
    res.json({
        error: error.message
    });
});
module.exports = app;
