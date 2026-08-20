// Material that reaches a release without being an npm package: vendored,
// adapted, or generated from an upstream source. The dependency walk below can
// only see npm packages, so this material is invisible to it by construction —
// not missed by accident — and no amount of checking the walk output can guard
// it. Declaring it here is what puts it in the notices and under the --check
// gate. Both release targets bundle @maka/core and @maka/runtime, so every
// entry applies to both.
//
// Each entry is checked against the tree it claims to describe: LICENSE must
// carry the copyright line, and every listed file must exist and still contain
// its marker. `marker` is the text the carrying file must still contain. Pin it to
// something that should not change silently: the upstream revision for adapted
// source, the attribution line for generated data (which a routine re-sync
// preserves, while a dropped attribution fails).
export const NON_NPM_SOURCES = [
  {
    name: 'anomalyco/opencode (adapted source)',
    license: 'MIT',
    repository: 'https://github.com/anomalyco/opencode',
    revision: 'fc80874f45a595ff6874a4d36b1090f6a64424d2',
    copyright: 'Copyright (c) 2025 opencode',
    description: [
      "Maka's tool-output truncation and string-edit matching strategies include",
      'adaptations of this software. Each file marks the adapted portion in its',
      "header; the surrounding Maka source stays under the repository's",
      'Apache-2.0 license.',
    ].join('\n'),
    files: [
      {
        path: 'packages/runtime/src/tool-output.ts',
        marker: 'fc80874f45a595ff6874a4d36b1090f6a64424d2',
      },
      {
        path: 'packages/runtime/src/edit-replace.ts',
        marker: 'fc80874f45a595ff6874a4d36b1090f6a64424d2',
      },
    ],
  },
  {
    name: 'sst/models.dev (generated model catalog snapshot)',
    license: 'MIT',
    repository: 'https://github.com/sst/models.dev',
    revision: 'https://models.dev/api.json (snapshot digest recorded in each file header)',
    copyright: 'Copyright (c) 2025 models.dev',
    description: [
      'The generated model metadata and pricing modules are derived from the',
      'models.dev catalog by scripts/sync-model-metadata.mjs. The individual model',
      'facts are not themselves copyrightable; what is carried over from upstream',
      'is the selection and arrangement — which providers and fields are kept, and',
      "upstream's normalized structures such as the model status values and",
      'reasoning effort options.',
    ].join('\n'),
    files: [
      {
        path: 'packages/core/src/model-metadata.generated.ts',
        marker: 'Copyright (c) 2025 models.dev',
      },
      {
        path: 'packages/runtime/src/telemetry/model-pricing.generated.ts',
        marker: 'Copyright (c) 2025 models.dev',
      },
    ],
  },
];

// Validation runs over injected content rather than the filesystem so the
// failure paths are reachable in a test without editing tracked source.
export function validateNonNpmSources(sources, { licenseText, readCarrier }) {
  for (const source of sources) {
    if (source.license !== 'MIT') {
      throw new Error(
        `${source.name}: only MIT is declarable here; add the license text before declaring ${source.license}`,
      );
    }
    if (!licenseText.includes(source.copyright)) {
      throw new Error(
        `${source.name}: LICENSE has no ${JSON.stringify(source.copyright)} under THIRD-PARTY COMPONENTS`,
      );
    }
    for (const file of source.files) {
      const carrier = readCarrier(file.path);
      if (carrier === undefined) {
        throw new Error(
          `${source.name}: ${file.path} is declared as carrying this material but does not exist`,
        );
      }
      if (!carrier.includes(file.marker)) {
        throw new Error(
          `${source.name}: ${file.path} no longer contains its attribution marker ${JSON.stringify(file.marker)}`,
        );
      }
    }
  }
}
