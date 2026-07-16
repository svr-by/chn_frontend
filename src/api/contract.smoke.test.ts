import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const openApiPath = path.join(root, 'openapi/api-docs.json');
const endpointsDir = path.join(root, 'src/api/endpoints');
const generatedEndpointsPath = path.join(root, 'src/api/generated/endpoints.ts');

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

function loadOpenApiOperations(): Set<string> {
  const spec = JSON.parse(fs.readFileSync(openApiPath, 'utf8')) as {
    paths: Record<string, Record<string, unknown>>;
  };

  const ops = new Set<string>();
  for (const [pathTemplate, methods] of Object.entries(spec.paths)) {
    for (const method of Object.keys(methods)) {
      const upper = method.toUpperCase();
      if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(upper)) {
        ops.add(`${upper} ${pathTemplate}`);
      }
    }
  }
  return ops;
}

/** Parse Orval getXxxUrl helpers → method + OpenAPI-style path template */
function loadUrlHelpers(): Map<
  string,
  { method: HttpMethod; pathTemplate: string }
> {
  const gen = fs.readFileSync(generatedEndpointsPath, 'utf8');
  const helpers = new Map<
    string,
    { method: HttpMethod; pathTemplate: string }
  >();

  const helperRe =
    /export const (get(Get|Post|Patch|Put|Delete)\w+Url) = \(([^)]*)\) => \{/g;
  let match: RegExpExecArray | null;
  while ((match = helperRe.exec(gen))) {
    const name = match[1];
    const method = match[2].toUpperCase() as HttpMethod;
    const start = match.index + match[0].length;
    const nextExport = gen.indexOf('\nexport ', start);
    const body = gen.slice(start, nextExport === -1 ? gen.length : nextExport);

    const pathLiterals = [
      ...body.matchAll(/[`'](\/(?:auth|companies)[^`'?]*)/g),
    ].map((m) => m[1]);
    if (pathLiterals.length === 0) continue;

    const pathWithVars = pathLiterals.reduce((a, b) =>
      a.length <= b.length ? a : b,
    );
    const pathTemplate = pathWithVars.replace(/\$\{(\w+)\}/g, '{$1}');
    helpers.set(name, { method, pathTemplate });
  }

  return helpers;
}

/** Collect getXxxUrl references from RTK endpoint modules (+ baseApi refresh). */
function collectUsedHelpers(): string[] {
  const files = [
    ...fs
      .readdirSync(endpointsDir)
      .filter((f) => f.endsWith('.ts'))
      .map((f) => path.join(endpointsDir, f)),
    path.join(root, 'src/api/baseApi.ts'),
  ];

  const used = new Set<string>();
  const callRe = /\b(get(?:Get|Post|Patch|Put|Delete)\w+Url)\s*\(/g;

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    let m: RegExpExecArray | null;
    while ((m = callRe.exec(source))) {
      used.add(m[1]);
    }
  }

  return [...used].sort();
}

describe('RTK ↔ OpenAPI contract', () => {
  const openApiOps = loadOpenApiOperations();
  const helpers = loadUrlHelpers();
  const usedHelpers = collectUsedHelpers();

  it('parses Orval URL helpers from generated endpoints', () => {
    expect(helpers.size).toBeGreaterThan(100);
  });

  it('every RTK-used URL helper maps to an OpenAPI operation', () => {
    expect(usedHelpers.length).toBeGreaterThan(50);

    const missing: string[] = [];
    for (const name of usedHelpers) {
      const helper = helpers.get(name);
      if (!helper) {
        missing.push(`${name} (helper not found in generated endpoints)`);
        continue;
      }
      const key = `${helper.method} ${helper.pathTemplate}`;
      if (!openApiOps.has(key)) {
        missing.push(`${name} → ${key}`);
      }
    }

    expect(missing, missing.join('\n')).toEqual([]);
  });

  it('does not hardcode API path strings in RTK endpoint modules', () => {
    const hardcoded: string[] = [];
    for (const file of fs.readdirSync(endpointsDir)) {
      if (!file.endsWith('.ts')) continue;
      const source = fs.readFileSync(path.join(endpointsDir, file), 'utf8');
      const matches = source.matchAll(
        /(?:url:\s*|=>\s*)([`'"])(\/(?:auth|companies)[^`'"]*)\1/g,
      );
      for (const m of matches) {
        hardcoded.push(`${file}: ${m[2]}`);
      }
    }
    expect(hardcoded, hardcoded.join('\n')).toEqual([]);
  });
});
