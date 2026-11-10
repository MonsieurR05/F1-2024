// Base URL of the Flask API.
// Set PUBLIC_API_URL (e.g. in f1/frontend/.env) to point at a deployed backend;
// it defaults to the local development server.
export const API_BASE = (import.meta.env.PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "")

// Build a full API URL from a path such as "/api/drivers"
export const apiUrl = (path) => `${API_BASE}${path}`
