// Shared lookup data for the 2024 season, used by several components.
import { TEAM_THEMES } from "./theme.js"

// ---------------------------------------------------------------------------
// Drivers
// ---------------------------------------------------------------------------

// Driver photos all come from formula1.com and show the 2024 kit:
//   season    [team, driver code] of the 2024 season cutout: a transparent image of the
//             driver in 2024 race suit. Cropped from the top on formula1.com's image
//             server, so every hero gets the same chest-up framing.
//   portrait  the 2024 headshot (solid team-colour background), used for avatars.
//   cutout    the newer transparent PNG, a fallback only where it still shows the 2024 team.
// Doohan has no 2024 season cutout; his newer one is in Alpine kit, which he raced in 2024.
// Antonelli did not start a race in 2024.
const F1_IMAGE = "https://media.formula1.com/image/upload"
const F1_SEASON_CUTOUT = ([team, code], { aspect, width }) =>
  `${F1_IMAGE}/c_crop,g_north,ar_${aspect}/c_limit,w_${width}/q_auto/common/f1/2024/${team}/${code}/2024${team}${code}right.webp`
// `large` is about 640px wide for heroes; the default is a small thumbnail for avatars
const F1_2024_PORTRAIT = (slug, large) =>
  `https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/2024Drivers/${slug}.jpg` +
  (large ? ".img.640.medium.jpg" : ".transform/2col/image.jpg")
const F1_CUTOUT = (path) => `https://www.formula1.com/content/dam/fom-website/drivers/${path}.png`

const DRIVER_PHOTOS = {
  // Red Bull Racing
  max_verstappen: { season: ["redbullracing", "maxver01"], portrait: "verstappen", cutout: "M/MAXVER01_Max_Verstappen/maxver01" },
  perez: { season: ["redbullracing", "serper01"], portrait: "perez", cutout: "S/SERPER01_Sergio_Perez/serper01" },
  // Mercedes
  hamilton: { season: ["mercedes", "lewham01"], portrait: "hamilton" },
  russell: { season: ["mercedes", "georus01"], portrait: "russell", cutout: "G/GEORUS01_George_Russell/georus01" },
  // Ferrari
  leclerc: { season: ["ferrari", "chalec01"], portrait: "leclerc", cutout: "C/CHALEC01_Charles_Leclerc/chalec01" },
  sainz: { season: ["ferrari", "carsai01"], portrait: "sainz" },
  bearman: { season: ["ferrari", "olibea01"] }, // also raced twice for Haas; his standing is with Ferrari
  // McLaren
  norris: { season: ["mclaren", "lannor01"], portrait: "norris", cutout: "L/LANNOR01_Lando_Norris/lannor01" },
  piastri: { season: ["mclaren", "oscpia01"], portrait: "piastri", cutout: "O/OSCPIA01_Oscar_Piastri/oscpia01" },
  // Aston Martin
  alonso: { season: ["astonmartin", "feralo01"], portrait: "alonso", cutout: "F/FERALO01_Fernando_Alonso/feralo01" },
  stroll: { season: ["astonmartin", "lanstr01"], portrait: "stroll", cutout: "L/LANSTR01_Lance_Stroll/lanstr01" },
  // Alpine
  gasly: { season: ["alpine", "piegas01"], portrait: "gasly", cutout: "P/PIEGAS01_Pierre_Gasly/piegas01" },
  ocon: { season: ["alpine", "estoco01"], portrait: "ocon" },
  doohan: { cutout: "J/JACDOO01_Jack_Doohan/jacdoo01" },
  // Williams
  albon: { season: ["williams", "alealb01"], portrait: "albon", cutout: "A/ALEALB01_Alexander_Albon/alealb01" },
  sargeant: { season: ["williams", "logsar01"], portrait: "sargeant", cutout: "L/LOGSAR01_Logan_Sargeant/logsar01" },
  colapinto: { season: ["williams", "fracol01"] },
  // RB
  tsunoda: { season: ["rb", "yuktsu01"], portrait: "tsunoda" },
  ricciardo: { season: ["rb", "danric01"], portrait: "ricciardo", cutout: "D/DANRIC01_Daniel_Ricciardo/danric01" },
  lawson: { season: ["rb", "lialaw01"], portrait: "lawson" },
  // Haas
  hulkenberg: { season: ["haas", "nichul01"], portrait: "hulkenberg" },
  kevin_magnussen: { season: ["haas", "kevmag01"], portrait: "magnussen", cutout: "K/KEVMAG01_Kevin_Magnussen/kevmag01" },
  // Kick Sauber
  bottas: { season: ["kicksauber", "valbot01"], portrait: "bottas", cutout: "V/VALBOT01_Valtteri_Bottas/valbot01" },
  zhou: { season: ["kicksauber", "guazho01"], portrait: "zhou", cutout: "G/GUAZHO01_Guanyu_Zhou/guazho01" },
}

// Photo URLs for avatars (and the hero fallback), best first. Empty means initials.
export const getDriverImageUrls = (driverId, { large = false } = {}) => {
  const photo = DRIVER_PHOTOS[driverId]
  if (!photo) return []
  return [
    ...(photo.portrait ? [F1_2024_PORTRAIT(photo.portrait, large)] : []),
    ...(photo.season ? [F1_SEASON_CUTOUT(photo.season, { aspect: "1:1", width: large ? 640 : 200 })] : []),
    ...(photo.cutout ? [F1_CUTOUT(photo.cutout)] : []),
  ]
}

// Transparent cutouts for hero panels, all in 2024 kit
export const getDriverCutoutUrls = (driverId) => {
  const photo = DRIVER_PHOTOS[driverId]
  if (!photo) return []
  return [
    ...(photo.season ? [F1_SEASON_CUTOUT(photo.season, { aspect: "8:9", width: 800 })] : []),
    ...(photo.cutout ? [F1_CUTOUT(photo.cutout)] : []),
  ]
}

// "Lando Norris" -> "LN"
export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

// Age in whole years on a given date (defaults to today)
export const ageOn = (dateOfBirth, on = new Date()) => {
  const born = new Date(dateOfBirth)
  let age = on.getFullYear() - born.getFullYear()
  const hadBirthday =
    on.getMonth() > born.getMonth() || (on.getMonth() === born.getMonth() && on.getDate() >= born.getDate())
  if (!hadBirthday) age -= 1
  return age
}

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

// Team colours come from the theme definitions, so bars, badges and the
// team-themed interface always agree
export const getTeamColor = (constructorId) => TEAM_THEMES[constructorId]?.primary || "#9CA3AF"

// Shorter display names ("Alpine F1 Team" -> "Alpine")
const TEAM_SHORT_NAMES = {
  alpine: "Alpine",
  haas: "Haas",
  rb: "RB",
}

export const teamName = (constructorId, fullName) => TEAM_SHORT_NAMES[constructorId] || fullName

// Three-letter team codes, as used on timing screens
const TEAM_CODES = {
  red_bull: "RBR",
  mercedes: "MER",
  ferrari: "FER",
  mclaren: "MCL",
  aston_martin: "AMR",
  alpine: "ALP",
  williams: "WIL",
  rb: "RB",
  sauber: "SAU",
  haas: "HAA",
}

export const teamCode = (constructorId, fullName = "") =>
  TEAM_CODES[constructorId] || fullName.slice(0, 3).toUpperCase()

// 2024 team logos from formula1.com (small square marks)
const TEAM_LOGO_SLUGS = {
  red_bull: "red-bull-racing",
  rb: "rb",
  mclaren: "mclaren",
  ferrari: "ferrari",
  mercedes: "mercedes",
  aston_martin: "aston-martin",
  alpine: "alpine",
  williams: "williams",
  sauber: "kick-sauber",
  haas: "haas-f1-team",
}

export const getTeamLogoUrl = (constructorId) => {
  const slug = TEAM_LOGO_SLUGS[constructorId]
  return slug ? `https://media.formula1.com/content/dam/fom-website/teams/2024/${slug}-logo.png` : null
}

// Engine supplier for each 2024 team
const POWER_UNITS = {
  red_bull: "Honda RBPT",
  rb: "Honda RBPT",
  mercedes: "Mercedes",
  mclaren: "Mercedes",
  aston_martin: "Mercedes",
  williams: "Mercedes",
  ferrari: "Ferrari",
  haas: "Ferrari",
  sauber: "Ferrari",
  alpine: "Renault",
}

export const getPowerUnit = (constructorId) => POWER_UNITS[constructorId] || "Unknown"

// ---------------------------------------------------------------------------
// Circuits
// ---------------------------------------------------------------------------

// Circuit facts (all-time race lap records as of the end of 2024) and layout maps
const CIRCUITS = {
  bahrain: { firstGrandPrix: 2004, lengthKm: 5.412, lapRecord: { time: "1:31.447", driver: "Pedro de la Rosa", year: "2005" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Bahrain_Circuit.png.transform/9col/image.png" },
  jeddah: { firstGrandPrix: 2021, lengthKm: 6.174, lapRecord: { time: "1:30.734", driver: "Lewis Hamilton", year: "2021" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Saudi_Arabia_Circuit.png.transform/9col/image.png" },
  albert_park: { firstGrandPrix: 1996, lengthKm: 5.278, lapRecord: { time: "1:19.813", driver: "Charles Leclerc", year: "2024" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Australia_Circuit.png.transform/9col/image.png" },
  suzuka: { firstGrandPrix: 1987, lengthKm: 5.807, lapRecord: { time: "1:30.983", driver: "Lewis Hamilton", year: "2019" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Japan_Circuit.png.transform/9col/image.png" },
  shanghai: { firstGrandPrix: 2004, lengthKm: 5.451, lapRecord: { time: "1:32.238", driver: "Michael Schumacher", year: "2004" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/China_Circuit.png.transform/9col/image.png" },
  miami: { firstGrandPrix: 2022, lengthKm: 5.412, lapRecord: { time: "1:31.361", driver: "Max Verstappen", year: "2023" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Miami_Circuit.png.transform/9col/image.png" },
  imola: { firstGrandPrix: 1980, lengthKm: 4.909, lapRecord: { time: "1:15.484", driver: "Lewis Hamilton", year: "2020" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Emilia_Romagna_Circuit.png.transform/9col/image.png" },
  monaco: { firstGrandPrix: 1950, lengthKm: 3.337, lapRecord: { time: "1:12.909", driver: "Lewis Hamilton", year: "2021" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Monaco_Circuit.png.transform/9col/image.png" },
  villeneuve: { firstGrandPrix: 1978, lengthKm: 4.361, lapRecord: { time: "1:13.078", driver: "Valtteri Bottas", year: "2019" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Canada_Circuit.png.transform/9col/image.png" },
  catalunya: { firstGrandPrix: 1991, lengthKm: 4.675, lapRecord: { time: "1:18.149", driver: "Max Verstappen", year: "2023" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Spain_Circuit.png.transform/9col/image.png" },
  red_bull_ring: { firstGrandPrix: 1970, lengthKm: 4.318, lapRecord: { time: "1:05.619", driver: "Carlos Sainz Jr.", year: "2020" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Austria_Circuit.png.transform/9col/image.png" },
  silverstone: { firstGrandPrix: 1950, lengthKm: 5.891, lapRecord: { time: "1:27.097", driver: "Max Verstappen", year: "2020" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Great_Britain_Circuit.png.transform/9col/image.png" },
  hungaroring: { firstGrandPrix: 1986, lengthKm: 4.381, lapRecord: { time: "1:16.627", driver: "Lewis Hamilton", year: "2020" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Hungary_Circuit.png.transform/9col/image.png" },
  spa: { firstGrandPrix: 1950, lengthKm: 7.004, lapRecord: { time: "1:46.286", driver: "Valtteri Bottas", year: "2018" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Belgium_Circuit.png.transform/9col/image.png" },
  zandvoort: { firstGrandPrix: 1952, lengthKm: 4.259, lapRecord: { time: "1:11.097", driver: "Lewis Hamilton", year: "2021" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Netherlands_Circuit.png.transform/9col/image.png" },
  monza: { firstGrandPrix: 1950, lengthKm: 5.793, lapRecord: { time: "1:21.046", driver: "Rubens Barrichello", year: "2004" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Italy_Circuit.png.transform/9col/image.png" },
  baku: { firstGrandPrix: 2017, lengthKm: 6.003, lapRecord: { time: "1:43.009", driver: "Charles Leclerc", year: "2019" },
    map: "https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Baku_Circuit" },
  marina_bay: { firstGrandPrix: 2008, lengthKm: 5.063, lapRecord: { time: "1:41.905", driver: "Kevin Magnussen", year: "2018" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Singapore_Circuit.png.transform/9col/image.png" },
  americas: { firstGrandPrix: 2012, lengthKm: 5.513, lapRecord: { time: "1:36.169", driver: "Charles Leclerc", year: "2019" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/USA_Circuit.png.transform/9col/image.png" },
  rodriguez: { firstGrandPrix: 1963, lengthKm: 4.304, lapRecord: { time: "1:17.774", driver: "Valtteri Bottas", year: "2021" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Mexico_Circuit.png.transform/9col/image.png" },
  interlagos: { firstGrandPrix: 1973, lengthKm: 4.309, lapRecord: { time: "1:10.540", driver: "Valtteri Bottas", year: "2018" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Brazil_Circuit.png.transform/9col/image.png" },
  vegas: { firstGrandPrix: 2023, lengthKm: 6.12, lapRecord: { time: "1:35.490", driver: "Oscar Piastri", year: "2023" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Las_Vegas_Circuit.png.transform/9col/image.png" },
  losail: { firstGrandPrix: 2021, lengthKm: 5.38, lapRecord: { time: "1:23.196", driver: "Max Verstappen", year: "2021" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Qatar_Circuit.png.transform/9col/image.png" },
  yas_marina: { firstGrandPrix: 2009, lengthKm: 5.281, lapRecord: { time: "1:26.103", driver: "Max Verstappen", year: "2021" },
    map: "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Abu_Dhabi_Circuit.png.transform/9col/image.png" },
}

export const getCircuit = (circuitId) => CIRCUITS[circuitId] || null

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

// True when a driver was classified (position_text is a number, not R/D/W/N/E/F)
export const isClassified = (result) => /^\d+$/.test(String(result?.position_text ?? ""))

// Finishing position for display: "1", "12" or "DNF" / "DSQ"
export const finishLabel = (result) => {
  if (isClassified(result)) return String(result.position)
  return result?.position_text === "D" ? "DSQ" : "DNF"
}

// "2024-03-02" -> "Mar 2" (short), "March 2, 2024" (long), "Saturday, March 2, 2024" (full)
const DATE_FORMATS = {
  short: { day: "numeric", month: "short" },
  long: { day: "numeric", month: "long", year: "numeric" },
  full: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
}

export const formatDate = (isoDate, style = "short") =>
  new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("en-US", { ...DATE_FORMATS[style], timeZone: "UTC" })
