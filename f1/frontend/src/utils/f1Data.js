// Shared lookup data for the 2024 season, used by several components.

// ---------------------------------------------------------------------------
// Drivers
// ---------------------------------------------------------------------------

// Driver portrait image URLs (tried in order). Drivers without a working image,
// or whose image fails to load, show their initials instead.
// Note: Russell, Stroll, Doohan and Lawson have no working image and show initials instead.
const DRIVER_IMAGE_URLS = {
  // Red Bull Racing
  max_verstappen: [
    "https://www.formula1.com/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png",
    "https://formula1review.com/wp-content/uploads/2024/03/max-verstappen.png",
  ],
  perez: ["https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/4472.png&w=350&h=254"],

  // Mercedes
  hamilton: ["https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/868.png"],

  // Aston Martin
  alonso: ["https://formula1review.com/wp-content/uploads/2024/03/fernando-alonso.png"],

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
  colapinto: [
    "https://www.kymillman.com/wp-content/uploads/f1/products/f1-signed-photos/franco-colapinto/franco-colapinto.png",
  ],
  bearman: [
    "https://www.kymillman.com/wp-content/uploads/f1/products/f1-signed-photos/oliver-bearman/oliver-bearman.png",
  ],
}

export const getDriverImageUrls = (driverId) => DRIVER_IMAGE_URLS[driverId] || []

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

// 2024 team colors, as commonly used in F1 broadcast graphics
const TEAM_COLORS = {
  red_bull: "#3671C6",
  mercedes: "#27F4D2",
  ferrari: "#E8002D",
  mclaren: "#FF8000",
  aston_martin: "#229971",
  alpine: "#FF87BC",
  williams: "#64C4FF",
  rb: "#6692FF",
  sauber: "#52E252",
  haas: "#B6BABD",
}

export const getTeamColor = (constructorId) => TEAM_COLORS[constructorId] || "#9CA3AF"

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
