const latencyByStage: Record<'discovery' | 'upload', number> = {
  discovery: 900,
  upload: 1400,
};

export const experienceRuntime = {
  label: 'Nebay Edge Optimizer',
  latencyMs: latencyByStage,
};

export async function simulateLatency(stage: 'discovery' | 'upload') {
  const delay = experienceRuntime.latencyMs[stage];
  if (!delay) return;
  await new Promise((resolve) => setTimeout(resolve, delay));
}
