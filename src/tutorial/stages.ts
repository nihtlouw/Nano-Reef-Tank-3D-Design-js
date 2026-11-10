// Both the tutorial and exploration use Scene.tsx and the original reef assets.
// Stage visibility is independent of navigation/checklists: Next never certifies readiness.
export function stageParts(stage?: number) {
  if (stage === undefined)
    return {
      water: true,
      equipment: true,
      fixture: true,
      rocks: true,
      life: true,
      exploded: false,
      running: true,
    };
  return {
    water: stage === 2 || stage >= 6,
    equipment: stage === 0 || stage >= 3,
    fixture: stage === 0 || stage >= 3,
    rocks: stage >= 4,
    life: stage >= 9,
    exploded: stage === 0,
    running: stage >= 7,
  };
}
