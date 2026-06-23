/**
 * data.ts — Async data-fetching layer backed by seed.ts.
 *
 * This file re-exports all types and provides async wrapper functions
 * for strategy pages that need to simulate real I/O delays. No external
 * network calls are made; all data is deterministically generated.
 */

export type { User, Post, Product, Analytics, Activity } from "./seed";
export {
  makeUser,
  makePosts,
  makeProducts,
  makeAnalytics,
  makeActivities,
  fetchWithDelay,
  liveSeed,
  isrSeed,
} from "./seed";

export function fetchServerTimestamp(): string {
  return new Date().toISOString();
}
