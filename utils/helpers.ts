import pkg from "bloom-filters";
const { BloomFilter } = pkg;

import { readFileSync } from "fs";
import path from "path";
import type { BloomFilterType } from "./types.js";

export const getDictFilter = (): BloomFilterType | null => {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "dictionary-filter.json",
    );
    const rawData = readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(rawData);

    console.log("Dictionary ready");

    return BloomFilter.fromJSON(jsonData);
  } catch (err) {
    console.error("Failed to setup dictionary:", err);

    return null;
  }
};

export const isWordInDict = (
  filter: BloomFilterType,
  word: string,
): boolean => {
  if (!filter || !word) return false;
  return filter.has(word.toLowerCase().trim());
};

export const calculatePoints = (wordLength: number): number => {
  if (wordLength <= 2) return 0;
  if (wordLength <= 4) return 1;
  if (wordLength === 5) return 2;
  if (wordLength === 6) return 3;
  if (wordLength === 7) return 5;
  return 11;
};
