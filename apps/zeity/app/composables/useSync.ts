export function useSync() {
  const timeStore = useTimerStore();
  const projectStore = useProjectStore();

  async function syncOfflineTimes(ids: string[]) {
    const offlineTimes = timeStore.findTimes((time) =>
      ids.includes(time.id)
    ).value;
    if (offlineTimes.length === 0) return;

    console.log('Syncing offline times:', offlineTimes);

    const newTimes = await $fetch('/api/times/sync', {
      method: 'POST',
      body: offlineTimes,
      timeout: 10_000,
    });

    for (const time of offlineTimes) {
      timeStore.removeTime(time.id);
    }
    timeStore.upsertTimes(newTimes);

    return newTimes;
  }

  async function syncOfflineProjects(ids: string[]) {
    const offlineProjects = projectStore.findProjects((project) =>
      ids.includes(project.id)
    ).value;
    if (offlineProjects.length === 0) return;

    const newProjects = await $fetch('/api/projects/sync', {
      method: 'POST',
      body: offlineProjects,
      timeout: 10_000,
    });

    for (const [index, value] of offlineProjects.entries()) {
      const timeStore = useTimerStore();
      const times = timeStore.findTimes(
        (time) => time.projectId === value.id
      ).value;
      times.forEach((time) => {
        time.projectId = newProjects[index]?.id || null;
        timeStore.updateTime(time.id, time);
      });
      projectStore.removeProject(value.id);
    }
    projectStore.upsertProjects(newProjects);

    return newProjects;
  }

  return {
    syncOfflineTimes,
    syncOfflineProjects,
  };
}
