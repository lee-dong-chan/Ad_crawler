import { exec } from "child_process";
const path = process.env.OSA_PATH;

export const startRecord = async () => {
  exec(
    `osascript  /Users/idongchan/Desktop/pj/AD_selector/program/utils/applescript/record_start.scpt`, // 절대 경로 // 환경변수도 사용불가
    (error) => {
      if (error) {
        console.error(error.message);
        return;
      }

      console.log("recording start");
    }
  );
};

export const stopRecord = async () => {
  exec(
    `osascript  /Users/idongchan/Desktop/pj/AD_selector/program/utils/applescript/record_stop.scpt`,
    (error) => {
      if (error) {
        console.error(error.message);
        return;
      }
      console.log("recording stop");
    }
  );
};

export const saveRecord = async () => {
  return new Promise((resolve, reject) => {
    exec(
      `osascript  /Users/idongchan/Desktop/pj/AD_selector/program/utils/applescript/record_save.scpt`,
      (error, stdout, stderr) => {
        if (error) {
          reject(error.message);
          return;
        }
        const file = stdout.trim();
        console.log("file save:", file);
        resolve(file);
      }
    );
  });
};

export const closeRecord = async () => {
  exec(
    `osascript  /Users/idongchan/Desktop/pj/AD_selector/program/utils/applescript/record_close.scpt`,
    (error) => {
      return;
    }
  );
  console.log("recording cansle");
};
