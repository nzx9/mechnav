"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router = require("express").Router();
const mechanic_1 = require("../models/mechanic");
const mechanic = new mechanic_1.Mechanic();
router.get("/request/:userId&:lat&:lng", (req, res) => {
    let userId = req.params.userId;
    let userCoords = { lat: req.params.lat, lng: req.params.lng };
    mechanic
        .find(userCoords, 5, 3)
        .then((result) => {
        let msg = result.length === 1
            ? `Found ${result.length} mechanic nearby you`
            : `Found ${result.length} mechanics nearby you`;
        return res.status(200).json({
            success: true,
            msg: msg,
            data: result
        });
    })
        .catch(err => {
        return res.status(400).json({
            success: false,
            msg: err.toString(),
            data: null
        });
    });
});
module.exports = router;
