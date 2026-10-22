import test from 'node:test';
import assert from 'node:assert/strict';
import { readPersistedState, writePersistedState } from './persistedState.js';

test('readPersistedState returns fallback when storage is empty', () => {
  const storage = {};
  assert.deepEqual(readPersistedState('missing-key', { ok: true }, storage), { ok: true });
});

test('writePersistedState stores JSON and readPersistedState returns it', () => {
  const storage = {};
  const value = { name: 'Alice', score: 97 };

  writePersistedState('profile', value, storage);

  assert.deepEqual(readPersistedState('profile', null, storage), value);
});
