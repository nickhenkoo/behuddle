"use client";

import { useEffect } from "react";

export function ConsoleEgg() {
  useEffect(() => {
    console.log(
      "%c TeamUp ",
      "background: #111; color: #fff; font-family: monospace; font-size: 14px; padding: 4px 8px; border-radius: 2px;"
    );
    console.log(
      "%c You have the skills. Someone has the idea.",
      "color: #888; font-family: monospace; font-size: 12px;"
    );
    console.log(
      "%c → teamup.com/join",
      "color: #4F46E5; font-family: monospace; font-size: 12px;"
    );
  }, []);

  return null;
}
