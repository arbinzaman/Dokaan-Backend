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



// utils/barcodeHelper.js
export const cleanBarcode = (barcode) => {
  // Clean up barcode (e.g., remove spaces, hyphens, etc.)
  return barcode.replace(/[\s-]/g, '');
};

// Function to extract brand and product code
export const splitBarcode = (barcode) => {
  // Assuming first 5 digits represent the brand code
  const brandCode = barcode.slice(0, 4);
  const productCode = barcode.slice(4);  // Remaining part is the product code
  return { brandCode, productCode };
};

