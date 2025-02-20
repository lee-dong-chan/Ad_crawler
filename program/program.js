import { spawn } from "child_process";
import reviewCheck from "./utils/reviewcheck.js";
import dotenv from "dotenv";

import {
  closeRecord,
  saveRecord,
  startRecord,
  stopRecord,
} from "./utils/record.js";
import axios from "axios";
import { VideoCheck } from "./utils/videofilter.js";
dotenv.config();
const api = axios.create({
  baseURL: process.env.BASE_URL,
  withCredentials: true,
});

const AD_patton =
  /kMRMediaRemoteNowPlayingInfoDidChangeNotification\s+for\s+path\s+.+?\/player-MediaRemote-DefaultPlayer/;
const AD_patton2 = /subaq_enqueueAQBufferIntoAudioQueue:/;
// 오디오 관련로그 광고실행시 반복적으로 실행
const AD_patton3 =
  /0x[a-fA-F0-9]+ - \[pageProxyID=\d+, webPageID=\d+, PID=\d+\] WebPageProxy::updateThrottleState: UIProcess is taking a foreground assertion because we are playing audio/;
const AD_patton4 =
  /ADVERTISING:\$([a-zA-Z0-9]+)\/\*([0-9]+) pb-\d+ ([a-fA-F0-9\-]+) type=<([^>]+)> at (\w+ \w+ \d+ \d{2}:\d{2}:\d{2} \d{4}) opts=\{([^\}]+)\}/;
const AD_Patton5 =
  /Acquiring\s+assertion\s+targeting\s+\[xpcservice<com\.apple\.WebKit\.WebContent\([^\)]+\):(\d+)\]\{[^\}]+\}\[uuid:([^\]]+)\]:(\d+)\]\s+from\s+originator\s+\[app<([^\(]+)\(\w+-[^\)]+\):\d+\]\s+with\s+description\s+<RBSAssertionDescriptor\|\s+"([^"]+)"\s+ID:(\d+-\d+-\d+)\s+target:(\d+)\s+attributes\[[^\]]+\]\s*\/?$/;

const store_patton =
  /https:\/\/amp-api\.apps\.apple\.com\/v1\/catalog\/kr\/apps\/[^\s"]+/;
// 딥링크 스토어 URL 로그 체크하여 스토어의 앱 ID 추출

// const AD_stop =
//   /\[0x[0-9a-fA-F]+\] invalidated because the current process cancelled the connection by calling xpc_connection_cancel\(\)/;   /// 광고프로세스 취소 로그가 아니엿음

const logCheck = spawn("idevicesyslog");

const state = new Proxy(
  {
    isConnect: false,
    isRecording: false,
    isProcessing: false,
    recordComplete: false,
  },
  {
    set(target, property, value) {
      if (target[property] !== value) {
        console.log("State:", {
          property,
          value: value,
        });
      }
      target[property] = value;
      return true;
    },
  }
);

const storedata = new Proxy(
  {
    storeId: "",
  },
  {
    set(target, property, value) {
      if (target[property] !== value) {
        console.log("StoreID:", {
          property,
          value: value,
        });
      }
      target[property] = value;
      return true;
    },
  }
);

let recordtime = null;
let lastlogtime = Date.now();
const checkConnectionInterval = setInterval(() => {
  if (Date.now() - lastlogtime > 2000) {
    state.isConnect = false;
    console.log("로그정보가 없습니다. 휴대폰 연결을 확인하세요");
  }
}, 5000);

logCheck.stdout.on("data", (data) => {
  lastlogtime = Date.now();
  const log = data.toString();

  if (log) {
    if (!state.isConnect) {
      state.isConnect = true;
    }
  }
  // if (AD_stop.test(log)) {
  //   // state.isRecording = false;
  //   // state.isProcessing = false;
  //   // storedata.storeId = "";
  //   // if (recordtime) {
  //   //   clearTimeout(recordtime);
  //   //   recordtime = null;
  //   // }
  //   console.log("stop");
  // }

  if (store_patton.test(log)) {
    const startpoint = log.indexOf("/apps/") + 6;
    const endpoint = log.indexOf("?");
    const id = log.slice(startpoint, endpoint);
    storedata["storeId"] = id;
  }

  if (
    AD_patton.test(log) ||
    AD_patton2.test(log) ||
    AD_patton3.test(log) ||
    AD_patton4.test(log) ||
    AD_Patton5.test(log)
  ) {
    if (!state.isProcessing && !state.isRecording) {
      state.storeId = "";
      startRecord();
      state.isRecording = true;
    }
    if (!recordtime) {
      recordtime = setTimeout(() => {
        if (storedata.storeId !== "") {
          stopRecord();
          state.isRecording = false;
          CheckDBandFilesave();
        } else {
          console.error("not store_ID");
          closeRecord();
          state.isRecording = false;
        }
        recordtime = null;
      }, 30000);
    }
  }
});

const CheckDBandFilesave = async () => {
  if (state.isProcessing == true) return;

  state.isProcessing = true;

  try {
    console.log("check");
    const { data } = await api.get(`/list/${storedata.storeId}`);
    if (!data.find) {
      console.log("start");

      const First_Filter = await reviewCheck(storedata.storeId);

      console.log(First_Filter);

      if (!First_Filter.Ad_result) {
        console.log("광고 점수 이상");

        const VideoSave = saveRecord();
        console.log(VideoSave);

        const Second_Filter = await VideoCheck(VideoSave.path, VideoSave.name);

        if (Second_Filter) {
          console.log("영상 문제없음");
        } else {
          console.log("문제영상 정보 DB로 전송");
          if (storedata.storeId && First_Filter.title && VideoSave.path) {
            const upload = await api.post("list", {
              appid: storedata.storeId,
              videoname: First_Filter.title,
              filepath: VideoSave.path,
            });

            console.log(upload.upload);
          } else {
            console.error("요청 바디가 준비되지 않았습니다.");
          }
        }
      } else if (First_Filter) {
        console.log("광고 점수 양호");
        closeRecord();
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    state.isProcessing = false;
    storedata.storeId = "";
  }
};

process.on("exit", () => {
  clearInterval(checkConnectionInterval);
});
//https://itunes.apple.com/kr/rss/customerreviews/id=963067330/json

// const test = async () => {
//   const data = await reviewCheck(1105855019);
//   console.log(data);
// };

// test();
