import { exec } from "child_process";
const path = process.env.OSA_PATH;

export const startRecord = () => {
  exec(
    `osascript  /Users/idongchan/Desktop/pj/AD_crawler/program/utils/applescript/record_start.scpt`, // 절대 경로 // 환경변수도 사용불가
    (error) => {
      if (error) {
        console.error(error.message);
        return;
      }

      console.log("recording start");
    }
  );
};

export const stopRecord = () => {
  exec(
    `osascript  /Users/idongchan/Desktop/pj/AD_crawler/program/utils/applescript/record_stop.scpt`,
    (error) => {
      if (error) {
        console.error(error.message);
        return;
      }
      console.log("recording stop");
    }
  );
};

export const saveRecord = () => {
  exec(
    `osascript  /Users/idongchan/Desktop/pj/AD_crawler/program/utils/applescript/record_save.scpt`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(error.message);
        return;
      }
      const filepath = stdout.trim();
      console.log("file save:", filepath);
      return filepath;
    }
  );
};

export const closeRecord = () => {
  exec(
    `osascript  /Users/idongchan/Desktop/pj/AD_crawler/program/utils/applescript/record_close.scpt`,
    (error) => {
      return;
    }
  );
  console.log("recording cansle");
};
