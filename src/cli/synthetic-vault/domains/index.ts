import type { DomainProfile } from "../types.js";
import { warehouseRobotics } from "./warehouse-robotics.js";
import { hrOnboarding } from "./hr-onboarding.js";
import { marketingAutomation } from "./marketing-automation.js";
import { iotFleetTracker } from "./iot-fleet-tracker.js";
import { analyticsPipeline } from "./analytics-pipeline.js";
import { videoStreaming } from "./video-streaming.js";
import { chatSupportBot } from "./chat-support-bot.js";
import { inventoryForecasting } from "./inventory-forecasting.js";
import { documentSigning } from "./document-signing.js";
import { travelBooking } from "./travel-booking.js";
import { socialFeed } from "./social-feed.js";
import { adBidding } from "./ad-bidding.js";
import { healthRecords } from "./health-records.js";
import { smartBuilding } from "./smart-building.js";
import { recruitmentAts } from "./recruitment-ats.js";

export const allDomainProfiles: DomainProfile[] = [
  warehouseRobotics,
  hrOnboarding,
  marketingAutomation,
  iotFleetTracker,
  analyticsPipeline,
  videoStreaming,
  chatSupportBot,
  inventoryForecasting,
  documentSigning,
  travelBooking,
  socialFeed,
  adBidding,
  healthRecords,
  smartBuilding,
  recruitmentAts,
];
