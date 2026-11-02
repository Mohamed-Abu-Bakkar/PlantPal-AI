export type Screen =
  | "home"
  | "scanner"
  | "result"
  | "care"
  | "weather"
  | "health"
  | "suitability"
  | "store"
  | "plants"
  | "alerts"
  | "assistant"
  | "details"
  | "iot";

export const GREEN = "#087a43";

export const SCREEN_TITLES: Record<Screen, string> = {
  home: "PlantPal AI",
  scanner: "Identify Plant",
  result: "Plant Identification",
  care: "Care Guide",
  weather: "Location & Weather",
  health: "Plant Health",
  suitability: "Plant Suitability",
  store: "Buy Supplies",
  plants: "My Plants",
  alerts: "Alerts",
  assistant: "AI Assistant",
  details: "Plant Details",
  iot: "IoT Field Monitor",
};
