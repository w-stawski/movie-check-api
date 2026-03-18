import pkg from "bloom-filters";
const { BloomFilter } = pkg;

export interface WordRequest {
  word: string;
}

export interface BatchWordRequest {
  words: Array<{ val: string }>;
}

export interface WordValidationResult {
  val: string;
  valid: boolean;
  points: number;
}

export type BloomFilterType = InstanceType<typeof BloomFilter>;
