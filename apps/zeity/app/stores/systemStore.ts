export const useSystemStore = defineStore('systemStore', () => {
  const config = useRuntimeConfig();

  return {
    appName: config.public.appName,
    stage: config.public.stage,
    version: config.public.version,
    allowOrganisationCreate: config?.public?.allow?.organisation.create,
    legal: config.public.legal,
    links: config.public.links,
  };
});
