import { supportedMimeTypes } from "../config/fileSystem.config.js";
import {v4 as uuidv4} from "uuid";

export const imageValidator = (size, mime) =>{
  if (byteToMB(size) > 1) {
    return "Image size should not be more than 1MB";
  }
  else if (!supportedMimeTypes.includes(mime)){
    return "Image format not supported";
  }
  return null;
}

export const byteToMB = (bytes) =>{
    return (bytes / (1024 * 1024));
}


export const generateFileName = () =>{
return uuidv4();
}