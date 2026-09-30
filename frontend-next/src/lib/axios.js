import axios from "axios";

// Same-origin now that the API lives inside this app — relative baseURL,
// cookies attach automatically (no CORS/withCredentials juggling needed).
const api = axios.create({
  baseURL: "/api/v2",
  withCredentials: true,
});

export default api;
