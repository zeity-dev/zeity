import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Task } from '@zeity/types/task';
import { useEntityStore } from './entityStore';

export const useTaskStore = defineStore('task', () => {
  const loading = ref(false);
  function setLoading(value: boolean) {
    loading.value = value;
  }

  const tasksStore = useEntityStore<Task>('tasks');

  return {
    upsertTasks: tasksStore.upsertMany,

    getAllTasks: tasksStore.getAll,
    findTasks: tasksStore.find,
    findTaskById: tasksStore.findById,

    insertTask: tasksStore.insert,
    updateTask: tasksStore.update,
    removeTask: tasksStore.remove,

    loading,
    setLoading,
  };
});
