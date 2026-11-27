import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

interface EntitiesMap<T> {
  [id: string | number]: T;
}

interface EntityStoreState<T> {
  entities: EntitiesMap<T>;
  ids: (string | number)[];
}

export function useEntityStore<T extends { id: string | number }>(name: string) {
  return defineStore(name, function () {
    const state = ref<EntityStoreState<T>>({
      entities: {},
      ids: [],
    });

    function getState() {
      return state.value;
    }
    function setState(data: EntityStoreState<T>) {
      state.value = data;
    }

    function setEntities(entities: T[]) {
      state.value.entities = entities.reduce<EntitiesMap<T>>((acc, entity) => {
        acc[entity.id] = entity;
        return acc;
      }, {});
      state.value.ids = entities.map(e => e.id);
    }

    function upsertMany(entities: T[]) {
      for (const entity of entities) {
        const id = entity.id;
        if (!id) {
          if (import.meta.env.DEV) {
            console.warn('entity must have an id', entity);
          }
          continue;
        }
        state.value.entities[id] = entity;
        if (!state.value.ids.includes(id)) {
          state.value.ids.push(id);
        }
      }
    }

    function insert(entity: T) {
      if (!entity?.['id']) {
        if (import.meta.env.DEV) {
          console.warn('entity must have an id', entity);
        }
        return;
      }
      const id = entity.id;
      state.value.entities[id] = entity;
      state.value.ids.push(id);

      return entity;
    }

    function update(id: string | number, data: Partial<T>) {
      const current = state.value.entities[id];
      if (current) {
        const entity = { ...current, ...data };
        state.value.entities[id] = entity;
      }

      return state.value.entities[id];
    }

    function remove(id: string | number) {
      const updatedState = {
        ids: state.value.ids.filter(i => i !== id),
        entities: Object.values(state.value.entities).reduce<EntitiesMap<T>>((acc, entity) => {
          if (entity.id !== id) {
            acc[entity.id] = entity;
          }
          return acc;
        }, {}),
      };

      state.value = updatedState;
    }

    function clearAll() {
      state.value = {
        entities: {},
        ids: [],
      };
    }

    function findById(id: string | number) {
      return computed(() => state.value.entities[id]);
    }
    function getAll() {
      return computed(() => state.value.ids.map(id => state.value.entities[id]!));
    }
    function find(predicate: (entity: T) => boolean) {
      return computed(() =>
        state.value.ids.reduce<T[]>((acc, id) => {
          const entity = state.value.entities[id];
          if (entity && predicate(entity)) {
            acc.push(entity);
          }
          return acc;
        }, []),
      );
    }

    return {
      getState,
      setState,

      setEntities,
      upsertMany,
      clearAll,

      insert,
      update,
      remove,

      getAll,
      findById,
      find,
    };
  })();
}
