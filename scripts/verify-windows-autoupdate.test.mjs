import assert from 'node:assert/strict';
import test from 'node:test';

import { stopInstalledProcessTrees } from './verify-windows-autoupdate.mjs';

test('accepts taskkill races when every installed process has exited', async () => {
  const processes = [{ processId: 101 }, { processId: 202 }];

  await stopInstalledProcessTrees('/installed', processes, {
    run: async () => {
      throw new Error('taskkill raced an already-exited child');
    },
    waitForExit: async () => {},
  });
});

test('fails when installed processes remain after taskkill', async () => {
  const killError = new Error('taskkill failed');
  const exitError = new Error('installed processes did not exit');

  await assert.rejects(
    stopInstalledProcessTrees('/installed', [{ processId: 101 }], {
      run: async () => {
        throw killError;
      },
      waitForExit: async () => {
        throw exitError;
      },
    }),
    (error) => {
      assert.equal(error, exitError);
      assert.equal(error.cause?.errors?.[0], killError);
      return true;
    },
  );
});
