const router = require("express").Router();
import { Mechanic } from "../models/mechanic";

const mechanic = new Mechanic();
router.get("/request/:userId&:lat&:lng", (req: any, res: any) => {
  let userId = req.params.userId;
  let userCoords = { lat: req.params.lat, lng: req.params.lng };
  mechanic
    .find(userCoords, 5, 3)
    .then((result: any) => {
      let msg =
        result.length === 1
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
