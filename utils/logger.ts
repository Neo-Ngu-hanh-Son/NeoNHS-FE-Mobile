// utils/logger.ts
import { Logger } from "tslog";
import { APP_CONFIG } from "./constants";

export const logger = new Logger({
  name: APP_CONFIG.APP_NAME,
  minLevel: "info",
  displayDateTime: true,
});
