import { DataStore } from "./datastore";

interface LatLng {
  lat: number;
  lng: number;
}
interface JobData {
  clientId: string;
  mechanicId: string;
  startPoint: LatLng;
  endPoint: LatLng;
  startTime: any;
  endTime: any;
  isActivated: boolean;
}
class Job extends DataStore {
  constructor() {
    super();
  }
  create(jobData: JobData, callback: any) {
    super.createFieldWithAutoId("Jobs", jobData, (err: any, res: any) =>
      callback(err, res)
    );
  }

  getActiveJob(accType: string, userId: string, callback: any) {
    super.getWithCondition(
      "Jobs",
      {
        cName1: `${accType}Id`,
        cValue1: userId,
        cName2: "isActivated",
        cValue2: true
      },
      (err: any, res: any) => {
        callback(err, res);
      }
    );
  }

  getJobs(accType: string, userId: any, callback: any) {
    super.getWithCondition(
      "Jobs",
      {
        cName1: `${accType}Id`,
        cValue1: userId,
        cName2: null,
        cValue2: null
      },
      (err: any, res: any) => {
        callback(err, res);
      }
    );
  }
}

export { Job, JobData, LatLng };
