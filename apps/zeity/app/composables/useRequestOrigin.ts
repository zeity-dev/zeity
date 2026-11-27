import { useRequestURL } from '#app';

export const useRequestOrigin = () => {
  return useRequestURL().origin;
};
