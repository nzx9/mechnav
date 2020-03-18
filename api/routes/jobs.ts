const router = require("express").Router();
import { Job, JobData, LatLng } from "../models/job";
const job = new Job();

router.post("/create", (req: any, res: any) => {
  let jobData: JobData = {
    clientId: req.body.clientId,
    mechanicId: req.body.mechanicId,
    startPoint: req.body.startPoint,
    endPoint: req.body.endPoint,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    isActivated: req.body.isActivated
  };
  job.create(jobData, (err: any, result: any) => {
    if (err) {
      return res.status(400).json({
        success: false,
        msg: err,
        data: null
      });
    } else {
      return res.status(201).json({
        success: true,
        msg: `Job created successfully`,
        data: result
      });
    }
  });
});

router.post("/finish", (req: any, res: any) => {
  job.updateField(
    { collection: "Jobs", doc: req.body.jobId },
    {
      endTime: req.body.endTime,
      isActivated: req.body.isActivated
    },
    (err: any, result: any) => {
      if (err) {
        res.status(401).json({
          success: false,
          msg: err.toString()
        });
      } else {
        res.status(200).json({
          success: true,
          msg: "updated"
        });
      }
    }
  );
});

router.get("/:userId&:accType&:isOnlyActive", (req: any, res: any) => {
  if (req.params.isOnlyActive) {
    job.getActiveJob(
      req.params.accType,
      req.params.userId,
      (err: any, result: any) => {
        if (err) {
          console.log(err);
          return res.status(400).json({
            success: false,
            msg: err,
            data: null
          });
        } else {
          return res.status(200).json({
            success: true,
            msg: `Active Job of ${req.params.userId}`,
            data: result
          });
        }
      }
    );
  } else {
    job.getJobs(
      req.params.accType,
      req.params.userId,
      (err: any, result: any) => {
        if (err) {
          return res.status(400).json({
            success: false,
            msg: err,
            data: null
          });
        } else {
          return res.status(200).json({
            success: true,
            msg: `All jobs of ${req.params.userId}`,
            data: result
          });
        }
      }
    );
  }
});

module.exports = router;
