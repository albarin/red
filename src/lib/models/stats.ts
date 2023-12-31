import type { Cycle } from "./cycle";
import type { Optional } from "./optional";

export interface CyclesStats {
  cyclesLength: number;
  averageCycleLength: number;
  standardDeviationCycleLength: number;
  shortestCycle: Cycle;
  longestCycle: Cycle;
}

const getMean = (data: number[]): number => {
  return data.reduce(function (a: number, b: number) {
    return Number(a) + Number(b);
  }) / data.length;
};

const getSD = (data: number[]): number => {
  const m = getMean(data);
  return Math.sqrt(data.reduce(function (sq: number, n: number) {
    return sq + Math.pow(n - m, 2);
  }, 0) / (data.length - 1));
};

const getShortestCycle = (cycles: Cycle[]): Cycle => {
  return cycles.reduce((shortest: Cycle, current: Cycle) => {
    const shortestDuration = shortest.duration || 0;
    const currentDuration = current.duration || 0;
    return (shortestDuration < currentDuration) ? shortest : current
  });
}

export const getLongestCycle = (cycles: Cycle[]): Cycle => {
  return cycles.reduce((longest: Cycle, current: Cycle) => {
    const longestDuration = longest.duration || 0;
    const currentDuration = current.duration || 0;
    return (longestDuration > currentDuration) ? longest : current
  });
}

export const getStats = (cycles: Cycle[]): Optional<CyclesStats> => {
  const cyclesLength = cycles.length;
  const finishedCycles = cycles.filter(cycle => cycle.end !== undefined);

  if (!finishedCycles.length) {
    return undefined;
  }

  const durations = finishedCycles.map(cycle => cycle.duration || 0);
  if (!durations.length) {
    return undefined;
  }

  return {
    cyclesLength: cyclesLength,
    averageCycleLength: Math.round(getMean(durations)),
    standardDeviationCycleLength: Math.round(getSD(durations)),
    shortestCycle: getShortestCycle(finishedCycles),
    longestCycle: getLongestCycle(finishedCycles),
  } as CyclesStats;
}
