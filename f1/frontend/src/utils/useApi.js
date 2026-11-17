import { useEffect, useState } from "react"
import { apiUrl } from "./api.js"

// Requests are cached per page load, so components that need the same data
// (for example the standings) share one network request.
const cache = new Map()

export const fetchJson = (path) => {
  if (!cache.has(path)) {
    const request = fetch(apiUrl(path)).then((response) => {
      if (!response.ok) {
        const error = new Error(`Request for ${path} failed with status ${response.status}`)
        error.status = response.status
        throw error
      }
      return response.json()
    })
    // Don't keep failed requests, so a retry makes a fresh request
    request.catch(() => cache.delete(path))
    cache.set(path, request)
  }
  return cache.get(path)
}

/**
 * Load one or more API paths.
 *
 *   const { data, error, loading, retry } = useApi(["/api/drivers", "/api/races"])
 *   const [drivers, races] = data   // once loading is false and error is null
 *
 * Pass null (or an array containing null) to wait until the paths are known.
 */
export function useApi(paths) {
  const key = paths && !paths.includes(null) ? paths.join("|") : null
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ data: null, error: null, loading: true })

  useEffect(() => {
    if (!key) return undefined
    let cancelled = false
    setState((previous) => ({ data: previous.data, error: null, loading: true }))

    Promise.all(key.split("|").map(fetchJson))
      .then((data) => !cancelled && setState({ data, error: null, loading: false }))
      .catch((error) => {
        console.error(error)
        if (!cancelled) setState({ data: null, error, loading: false })
      })

    return () => {
      cancelled = true
    }
  }, [key, attempt])

  return { ...state, retry: () => setAttempt((n) => n + 1) }
}
