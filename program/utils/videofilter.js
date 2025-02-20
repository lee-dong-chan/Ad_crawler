import fs, { readFileSync, unlinkSync } from "fs";

export const VideoCheck = async (path, name) => {
  // const checkvideo =>()=>{}

  const checkVideo = true;

  if (checkVideo) {
    try {
      unlinkSync(`${path}${name}`);
      return true;
    } catch (error) {
      console.error(error);
    }
  } else {
    return false;
  }
};
