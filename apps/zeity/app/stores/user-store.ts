import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { LocalUser } from '~/types/local-user';

export const useUserStore = defineStore('user', () => {
  const user = ref<LocalUser | null>(null);
  function setUser(value: LocalUser | null) {
    user.value = value;
  }

  const loading = ref(false);
  function setLoading(value: boolean) {
    loading.value = value;
  }

  return {
    user,
    setUser,

    loading,
    setLoading,
  };
});
