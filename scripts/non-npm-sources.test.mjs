import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { NON_NPM_SOURCES, validateNonNpmSources } from './non-npm-sources.mjs';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const licenseText = readFileSync(join(repoRoot, 'LICENSE'), 'utf8');
const readCarrier = (path) => readFileSync(join(repoRoot, path), 'utf8');

// A stub source shaped like a real entry, so each case perturbs exactly one
// field. Using the real inventory for the failure cases would only prove the
// current tree is clean, not that a dirty one is rejected.
const stub = {
  name: 'example/upstream',
  license: 'MIT',
  copyright: 'Copyright (c) 2025 example',
  files: [{ path: 'src/carrier.ts', marker: 'deadbeef' }],
};
const stubInputs = {
  licenseText: 'Copyright (c) 2025 example',
  readCarrier: () => '// adapted at deadbeef',
};

describe('non-npm third-party inventory', () => {
  it('accepts the declared inventory against the current tree', () => {
    validateNonNpmSources(NON_NPM_SOURCES, { licenseText, readCarrier });
  });

  it('declares at least the carriers the release actually ships', () => {
    assert.ok(NON_NPM_SOURCES.length > 0);
    for (const source of NON_NPM_SOURCES) {
      assert.ok(source.files.length > 0, `${source.name} declares no carrying file`);
    }
  });

  it('accepts the stub the failure cases perturb', () => {
    validateNonNpmSources([stub], stubInputs);
  });

  it('rejects a source whose copyright never reached LICENSE', () => {
    assert.throws(
      () => validateNonNpmSources([stub], { ...stubInputs, licenseText: 'unrelated' }),
      /LICENSE has no/,
    );
  });

  it('rejects a carrying file that no longer exists', () => {
    assert.throws(
      () => validateNonNpmSources([stub], { ...stubInputs, readCarrier: () => undefined }),
      /does not exist/,
    );
  });

  it('rejects a carrying file that lost its attribution marker', () => {
    assert.throws(
      () => validateNonNpmSources([stub], { ...stubInputs, readCarrier: () => '// no marker' }),
      /no longer contains its attribution marker/,
    );
  });

  it('rejects a license it has no text for', () => {
    assert.throws(
      () => validateNonNpmSources([{ ...stub, license: 'BSD-3-Clause' }], stubInputs),
      /only MIT is declarable/,
    );
  });
});
