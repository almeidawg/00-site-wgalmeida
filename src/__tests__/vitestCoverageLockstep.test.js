import { describe, expect, it } from 'vitest';
import { analyzeVitestCoverageLockstep } from '../../tools/check-vitest-coverage-lockstep.mjs';

const buildFixture = ({
  declared = '4.1.12',
  lockVitest = '4.1.12',
  lockCoverage = '4.1.12',
  installedVitest = '4.1.12',
  installedCoverage = '4.1.12',
} = {}) => ({
  manifest: { devDependencies: { vitest: declared, '@vitest/coverage-v8': declared } },
  lockfile: {
    packages: {
      '': { devDependencies: { vitest: declared, '@vitest/coverage-v8': declared } },
      'node_modules/vitest': { version: lockVitest },
      'node_modules/@vitest/coverage-v8': { version: lockCoverage },
    },
  },
  installed: { vitest: installedVitest, '@vitest/coverage-v8': installedCoverage },
});

describe('Vitest and V8 coverage version lockstep guard', () => {
  it('accepts exact matching declared, locked, and installed versions', () => {
    const result = analyzeVitestCoverageLockstep(buildFixture());
    expect(result.ok).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('flags different locked and installed coverage versions', () => {
    const result = analyzeVitestCoverageLockstep(buildFixture({
      declared: '^4.0.16',
      lockCoverage: '4.1.2',
      installedCoverage: '4.1.2',
    }));
    expect(result.ok).toBe(false);
    expect(result.issues).toContain('VITEST_COVERAGE_LOCK_VERSION_MISMATCH');
    expect(result.issues).toContain('VITEST_COVERAGE_INSTALLED_VERSION_MISMATCH');
    expect(result.warnings).toContain('vitest: DECLARATION_NOT_EXACT');
  });

  it('detects dependency install drift against the lockfile', () => {
    const result = analyzeVitestCoverageLockstep(buildFixture({ installedCoverage: '4.1.11' }));
    expect(result.issues).toContain('@vitest/coverage-v8: INSTALLED_LOCK_VERSION_DRIFT');
  });

  it('detects manifest and lock root disagreement', () => {
    const fixture = buildFixture();
    fixture.lockfile.packages[''].devDependencies.vitest = '^4.0.16';
    const result = analyzeVitestCoverageLockstep(fixture);
    expect(result.issues).toContain('vitest: MANIFEST_LOCK_SPEC_DRIFT');
  });

  it('fails closed when coverage package is not installed', () => {
    const result = analyzeVitestCoverageLockstep(buildFixture({ installedCoverage: null }));
    expect(result.ok).toBe(false);
    expect(result.issues).toContain('@vitest/coverage-v8: MISSING_INSTALLED_PACKAGE');
  });
});
