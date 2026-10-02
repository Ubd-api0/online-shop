import axios from "axios";
import { publicEnv } from "@/lib/env";

// API base comes from NEXT_PUBLIC_API_URL ("/api/v2" for the Route Handlers
// in this app). Same-origin, so cookies attach automatically.
const api = axios.create({
  baseURL: publicEnv.apiUrl,
  withCredentials: true,
});

export default api;
