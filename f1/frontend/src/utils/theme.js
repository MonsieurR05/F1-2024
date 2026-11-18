// Team colour system.
//
// The whole interface is themed by three CSS custom properties on <html>:
//   --team      primary team colour (accents, highlights, glows)
//   --team-2    secondary team colour (gradient partner)
//   --on-team   text colour that is readable on top of --team
// They are registered with @property in global.css, so switching teams animates.
// Pages default to Formula 1 red; team and driver pages paint themselves in that
// team's colours while they are open (see useTeamTheme in components/ui.jsx).

// Each team keeps its own recognisable identity. Primary colours follow the 2024
// broadcast graphics; secondary colours come from each team's livery.
export const TEAM_THEMES = {
  red_bull: { name: "Red Bull", primary: "#3671C6", secondary: "#E4002B" },
  ferrari: { name: "Ferrari", primary: "#E8002D", secondary: "#FFD12E" },
  mclaren: { name: "McLaren", primary: "#FF8000", secondary: "#47C7FC" },
  mercedes: { name: "Mercedes", primary: "#27F4D2", secondary: "#9EA7AE" },
  aston_martin: { name: "Aston Martin", primary: "#229971", secondary: "#CEDC00" },
  alpine: { name: "Alpine", primary: "#FF87BC", secondary: "#0093CC" },
  williams: { name: "Williams", primary: "#64C4FF", secondary: "#1868DB" },
  rb: { name: "RB", primary: "#6692FF", secondary: "#E4002B" },
  sauber: { name: "Sauber", primary: "#52E252", secondary: "#00A19C" },
  haas: { name: "Haas", primary: "#B6BABD", secondary: "#E10600" },
}

// Used everywhere except team and driver pages
export const DEFAULT_THEME = { name: "Formula 1", primary: "#E10600", secondary: "#FF7A2F" }

export const getTheme = (teamId) => TEAM_THEMES[teamId] || DEFAULT_THEME

// Black or white text, whichever reads better on the given colour
export const readableOn = (hex) => {
  const value = hex.replace("#", "")
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255)
  const linear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const luminance = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
  // 0.179 is where black and white text have equal contrast against the colour
  return luminance > 0.179 ? "#0A0B0E" : "#FFFFFF"
}

// ---------------------------------------------------------------------------
// Applying a theme
// ---------------------------------------------------------------------------

// Paint the interface in a team's colours ("" or an unknown id for Formula 1 red)
export const applyTheme = (teamId) => {
  const theme = getTheme(teamId)
  const root = document.documentElement
  root.style.setProperty("--team", theme.primary)
  root.style.setProperty("--team-2", theme.secondary)
  root.style.setProperty("--on-team", readableOn(theme.primary))
  root.dataset.theme = TEAM_THEMES[teamId] ? teamId : ""
}
