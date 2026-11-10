// Shared lookup data for the 2024 season, used by several components.
import { url } from "./api.js"

// Driver portrait image URLs (tried in order, so later entries are fallbacks)
const DRIVER_IMAGE_URLS = {
  // Red Bull Racing
  max_verstappen: [
    "https://www.formula1.com/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png",
    "https://formula1review.com/wp-content/uploads/2024/03/max-verstappen.png",
  ],
  perez: ["https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/4472.png&w=350&h=254"],

  // Mercedes
  hamilton: ["https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/868.png"],
  russell: [
    "https://cdn.racingnews365.com/Riders/Russell/_570x570_crop_center-center_none/f1_2024_gr_mer_lg.png?v=1708704486",
  ],

  // Aston Martin
  alonso: ["https://formula1review.com/wp-content/uploads/2024/03/fernando-alonso.png"],
  stroll: [
    "https://cdn.racingnews365.com/Riders/Stroll/_570x570_crop_center-center_none/f1_2024_ls_ast_lg.png?v=1708704434",
  ],

  // Ferrari
  leclerc: ["https://www.formula1.com/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png"],
  sainz: ["https://a.espncdn.com/i/headshots/rpm/players/full/4686.png"],

  // McLaren
  norris: ["https://www.formula1.com/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png"],
  piastri: ["https://www.formula1.com/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png"],

  // Alpine
  gasly: ["https://www.formula1.com/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png"],
  ocon: ["https://formula1review.com/wp-content/uploads/2024/03/esteban-ocon.png"],

  // Williams
  albon: ["https://www.formula1.com/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png"],
  sargeant: ["https://www.formula1.com/content/dam/fom-website/drivers/L/LOGSAR01_Logan_Sargeant/logsar01.png"],

  // RB (AlphaTauri)
  tsunoda: ["https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/5652.png&w=350&h=254"],
  ricciardo: ["https://www.formula1.com/content/dam/fom-website/drivers/D/DANRIC01_Daniel_Ricciardo/danric01.png"],

  // Haas
  kevin_magnussen: ["https://www.formula1.com/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png"],
  hulkenberg: ["https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/4396.png&w=350&h=254"],

  // Kick Sauber
  bottas: ["https://www.formula1.com/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png"],
  zhou: ["https://www.formula1.com/content/dam/fom-website/drivers/G/GUAZHO01_Guanyu_Zhou/guazho01.png"],

  // Reserve and substitute drivers
  lawson: [
    "https://cdn.racingnews365.com/_570x570_crop_center-center_none/lawson-cutout-2025-vcarb.png?v=1743592719",
  ],
  doohan: ["https://cdn.racingnews365.com/_570x570_crop_center-center_none/jacdoo01.png?v=1741600637"],
  colapinto: [
    "https://www.kymillman.com/wp-content/uploads/f1/products/f1-signed-photos/franco-colapinto/franco-colapinto.png",
  ],
  bearman: [
    "https://www.kymillman.com/wp-content/uploads/f1/products/f1-signed-photos/oliver-bearman/oliver-bearman.png",
  ],
}

// Placeholder shown when a driver has no portrait or every URL fails to load
export const driverPlaceholderUrl = (driverName, size = 96) =>
  url(`/placeholder.svg?height=${size}&width=${size}&query=`) + encodeURIComponent(driverName + " F1 driver")

export const getDriverImageUrls = (driverId, driverName, size = 96) =>
  DRIVER_IMAGE_URLS[driverId] || [driverPlaceholderUrl(driverName, size)]

// Team brand colors
const TEAM_COLORS = {
  red_bull: { primary: "#0600EF", secondary: "#DC143C" },
  mercedes: { primary: "#00D2BE", secondary: "#000000" },
  ferrari: { primary: "#DC143C", secondary: "#FFFF00" },
  mclaren: { primary: "#FF8700", secondary: "#000000" },
  aston_martin: { primary: "#006F62", secondary: "#CEDC00" },
  alpine: { primary: "#0090FF", secondary: "#FF1801" },
  williams: { primary: "#005AFF", secondary: "#FFFFFF" },
  rb: { primary: "#6692FF", secondary: "#FFFFFF" },
  sauber: { primary: "#00D100", secondary: "#000000" },
  haas: { primary: "#FFFFFF", secondary: "#DC143C" },
}

export const getTeamColors = (constructorId) => TEAM_COLORS[constructorId] || { primary: "#E10600", secondary: "#FFFFFF" }

// Country flag emojis, keyed by driver nationality
const NATIONALITY_FLAGS = {
  Dutch: "🇳🇱",
  British: "🇬🇧",
  Monégasque: "🇲🇨",
  Monegasque: "🇲🇨",
  "New Zealander": "🇳🇿",
  Argentinian: "🇦🇷",
  Spanish: "🇪🇸",
  Mexican: "🇲🇽",
  Australian: "🇦🇺",
  Canadian: "🇨🇦",
  German: "🇩🇪",
  French: "🇫🇷",
  Japanese: "🇯🇵",
  Finnish: "🇫🇮",
  Danish: "🇩🇰",
  Thai: "🇹🇭",
  Chinese: "🇨🇳",
  American: "🇺🇸",
  Argentine: "🇦🇷",
  Italian: "🇮🇹",
  Swiss: "🇨🇭",
  Austrian: "🇦🇹",
  Belgian: "🇧🇪",
}

export const getCountryFlag = (nationality) => NATIONALITY_FLAGS[nationality] || "🏁"
