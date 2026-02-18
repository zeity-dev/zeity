import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { useEntityStore } from '../../../app/stores/entityStore';

describe('entityStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('should be defined', () => {
        const store = useEntityStore('test');
        expect(store).toBeDefined();
    });

    it('should have a default state', () => {
        const store = useEntityStore('test');
        expect(store.getState()).toEqual({ entities: {}, ids: [] });
    });

    describe('upsertMany', () => {
        it('should insert many entities', () => {
            const store = useEntityStore('test');
            store.upsertMany([{ id: '1' }, { id: '2' }]);

            expect(store.getState()).toEqual({
                entities: { '1': { id: '1' }, '2': { id: '2' } },
                ids: ['1', '2'],
            });
        });

        it('should update existing entities', () => {
            const store = useEntityStore<{ id: string, name: string }>('test');
            store.insert({ id: '1', name: 'empty' });
            store.upsertMany([{ id: '1', name: 'test' }]);

            expect(store.getState()).toEqual({
                entities: { '1': { id: '1', name: 'test' } },
                ids: ['1'],
            });
        });

        it('should not insert entities without an id', () => {
            const store = useEntityStore('test');
            // @ts-expect-error: id is missing
            store.upsertMany([{}, {}]);

            expect(store.getState()).toEqual({ entities: {}, ids: [] });
        });
    });

    describe('insert', () => {
        it('should insert an entity', () => {
            const store = useEntityStore('test');
            store.insert({ id: '1' });

            expect(store.getState()).toEqual({
                entities: { '1': { id: '1' } },
                ids: ['1'],
            });
        });


        it('should not insert an entity without an id', () => {
            const store = useEntityStore('test');
            // @ts-expect-error: id is missing
            store.insert({});

            expect(store.getState()).toEqual({ entities: {}, ids: [] });
        });
    });

    describe('update', () => {
        it('should update an entity', () => {
            const store = useEntityStore<{ id: string, name: string }>('test');
            store.insert({ id: '1', name: 'test' });
            store.update('1', { name: 'updated' });

            expect(store.getState()).toEqual({
                entities: { '1': { id: '1', name: 'updated' } },
                ids: ['1'],
            });
        });


        it('should not update an entity that does not exist', () => {
            const store = useEntityStore('test');
            store.update('1', {});

            expect(store.getState()).toEqual({ entities: {}, ids: [] });
        });
    });

    describe('remove', () => {
        it('should remove an entity', () => {
            const store = useEntityStore('test');
            store.insert({ id: '1' });
            store.remove('1');

            expect(store.getState()).toEqual({ entities: {}, ids: [] });
        });

        it('should not remove an entity that does not exist', () => {
            const store = useEntityStore('test');
            store.remove('1');

            expect(store.getState()).toEqual({ entities: {}, ids: [] });
        });
    });

    describe('findById', () => {
        it('should get an entity by id', () => {
            const store = useEntityStore<{ id: string, name: string }>('test');
            store.insert({ id: '1', name: 'test' });

            expect(store.findById('1').value).toEqual({ id: '1', name: 'test' });
        });

        it('should return undefined if the entity does not exist', () => {
            const store = useEntityStore('test');

            expect(store.findById('1').value).toBeUndefined();
        });
    });

    describe('getAll', () => {
        it('should get entities by ids', () => {
            const store = useEntityStore<{ id: string, name: string }>('test');
            store.insert({ id: '1', name: 'test' });
            store.insert({ id: '2', name: 'test' });

            expect(store.getAll().value).toEqual([
                { id: '1', name: 'test' },
                { id: '2', name: 'test' },
            ]);
        });

        it('should return an empty array if there are no entities', () => {
            const store = useEntityStore('test');

            expect(store.getAll().value).toEqual([]);
        });
    });

    describe('find', () => {
        it('should find entities by predicate', () => {
            const store = useEntityStore<{ id: string, name: string }>('test');
            store.insert({ id: '1', name: 'test 1' });
            store.insert({ id: '2', name: 'test 2' });

            expect(store.find((entity) => entity.name === 'test 1').value).toEqual([
                { id: '1', name: 'test 1' },
            ]);
        });

        it('should return an empty array if there are no entities', () => {
            const store = useEntityStore('test');

            expect(store.find(() => true).value).toEqual([]);
        });
    });
});