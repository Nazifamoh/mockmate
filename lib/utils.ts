import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to conditionally join Tailwind classes with intelligent merging.
 * Similar to classnames + tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Base URL for fetching tech logos from Devicon CDN
const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

/**
 * Normalizes tech name keys to match the format used by the `mappings` object.
 * Examples:
 *   "React.js" → "react"
 *   "Node JS" → "nodejs"
 */
const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

/**
 * Checks whether a given tech icon URL actually exists.
 * Uses HEAD request to minimize data transfer.
 */
const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // true if icon exists
  } catch {
    return false; // fallback if network fails
  }
};

/**
 * Returns an array of valid tech logos with fallback.
 * Tries to fetch icons for each tech from Devicon. If missing, falls back to a default icon.
 */
export const getTechLogos = async (techArray: string[]) => {
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg", // fallback icon
    }))
  );

  return results;
};

/**
 * Picks a random interview cover image from the preset array.
 * The path returned is relative to your /public/covers directory.
 */
export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};
