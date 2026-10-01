"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadUser } from "./slices/user";

// Loads the current session (if any) once on mount, app-wide — one request
// returns the user and, for the business owner, the store. Silently rejects
// when the visitor isn't logged in.
export function SessionLoader() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return null;
}
