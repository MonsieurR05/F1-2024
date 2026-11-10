// Where the site and its data live.
//
// Local development (default): pages are served from "/" and data comes from the
// Flask API at PUBLIC_API_URL (http://localhost:5000 unless overridden in .env).
//
// Static deployment (GitHub Pages): the site is served from a sub-path (Astro's
// `base`), and PUBLIC_STATIC_DATA=true makes it read JSON files exported from the
// API by f1/backend/export_static.py instead of calling a live server.

// Base path of the site without a trailing slash: "" locally, "/F1-2024" on GitHub Pages
const SITE_BASE = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "")

// Build a link to a page or public file, e.g. url("/drivers")
export const url = (path) => `${SITE_BASE}${path}`

// True when the site should read pre-exported JSON instead of a live API
export const STATIC_DATA = import.meta.env.PUBLIC_STATIC_DATA === "true"

// Base URL of the Flask API (only used when STATIC_DATA is false)
export const API_BASE = (import.meta.env.PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "")

// Build the URL for an API path such as "/api/drivers" or "/api/results?driver_id=norris"
export const apiUrl = (path) => {
  if (!STATIC_DATA) return `${API_BASE}${path}`

  // Static files cannot take query strings, so filters become folders:
  //   /api/results?driver_id=norris  ->  /api/results/driver_id/norris.json
  const [pathname, query] = path.split("?")
  let file = pathname
  if (query) {
    for (const [key, value] of new URLSearchParams(query)) {
      file += `/${key}/${encodeURIComponent(value)}`
    }
  }
  return url(`${file}.json`)
}
