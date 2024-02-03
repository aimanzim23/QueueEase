// src/utils.js (or any utility file)
import { v4 as uuidv4 } from "uuid";

export const generateQueueId = () => {
  return uuidv4();
};
