"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router = require("express").Router();
const user_1 = require("../models/user");
const user = new user_1.User();
router.post("/register", (req, res) => {
    let registationData = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        contactNumber: req.body.contactNumber,
        accountType: "client",
        firstName: null,
        lastName: null,
        profilePic: null,
        gender: null,
        date_created: req.body.dateCreated
    };
    user.register(registationData, (err, result) => {
        if (err) {
            return res.status(400).json({
                success: false,
                msg: err,
                data: null
            });
        }
        else {
            return res.status(201).json({
                success: true,
                msg: "User created successfully",
                data: { userId: result }
            });
        }
    });
});
router.post("/login", (req, res) => {
    let loginData = {
        email: req.body.email,
        password: req.body.password
    };
    user.login(loginData, (err, result) => {
        if (err) {
            return res.status(401).json({
                success: false,
                msg: err,
                data: null
            });
        }
        else {
            return res.status(200).json({
                success: true,
                msg: "Authorized to login",
                data: { uID: result }
            });
        }
    });
});
router.get("/:userId", (req, res) => {
    let userId = req.params.userId;
    if (userId === "all") {
        user.getAllUsers((err, data) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    msg: err.toString(),
                    data: null
                });
            }
            else {
                return res.status(200).json({
                    success: true,
                    msg: "User data of all users",
                    data: data
                });
            }
        });
    }
    else {
        user.getInfo(userId, (err, result) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    msg: err,
                    data: null
                });
            }
            else {
                return res.status(200).json({
                    success: true,
                    msg: "User information of " + userId,
                    data: {
                        username: result.username,
                        accountType: result.accountType,
                        contactNumber: result.contactNumber,
                        email: result.email,
                        profilePic: result.profilePic,
                        gender: result.gender,
                        firstName: result.firstName,
                        lastName: result.lastName,
                        date_created: result.date_created
                    }
                });
            }
        });
    }
});
router.post("/profile/update", (req, res) => {
    let data = null;
    if (req.body.username !== undefined &&
        req.body.accountType !== undefined &&
        req.body.email !== undefined) {
        data = {
            username: req.body.username,
            accountType: req.body.accountType,
            email: req.body.email,
            contactNumber: req.body.contactNumber,
            firstName: req.body.firstName === undefined ? null : req.body.firstName,
            lastName: req.body.lastName === undefined ? null : req.body.lastName,
            gender: req.body.gender
        };
    }
    else {
        data = {
            contactNumber: req.body.contactNumber,
            firstName: req.body.firstName === undefined ? null : req.body.firstName,
            lastName: req.body.lastName === undefined ? null : req.body.lastName,
            gender: req.body.gender
        };
    }
    if (data !== null) {
        user.updateInfo(req.body.userId, data, (err, result) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    msg: err.toString(),
                    data: { userId: null }
                });
            }
            else {
                return res.status(200).json({
                    success: true,
                    msg: "User Profile updated success",
                    data: { userId: result }
                });
            }
        });
    }
});
router.get("/delete/:userId", (req, res) => {
    let userId = req.params.userId;
    user.delete(userId, (err, success) => {
        if (err) {
            return res.status(400).json({
                success: false
            });
        }
        else {
            return res.status(200).json({
                success: success
            });
        }
    });
});
module.exports = router;
