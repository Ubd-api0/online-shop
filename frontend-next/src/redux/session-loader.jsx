"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadUser } from "./slices/user";
import { loadSeller } from "./slices/seller";

// Loads the current session (if any) once on mount, app-wide. Silently
// no-ops (rejects) when the visitor isn't logged in / isn't the owner —
// same as the old app's App.js useEffect dispatches.
export function SessionLoader() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
    dispatch(loadSeller());
  }, [dispatch]);

  return null;
}
