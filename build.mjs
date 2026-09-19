import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const root = path.dirname(fileURLToPath(import.meta.url))

function readManifestWidgets() {
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'))
    const widgets = Array.isArray(manifest?.ui?.widgets) ? manifest.ui.widgets : []
    return widgets
      .map((widget) => {
        const entry = widget?.entry || widget?.file
        if (!entry || typeof entry !== 'string' || !entry.startsWith('dist/') || !entry.endsWith('.js')) return null
        const out = entry.slice('dist/'.length, -'.js'.length)
        const id = widget?.id
        const candidates = id ? [`src/widgets/${id}.tsx`, `src/widgets/${id}.ts`] : []
        for (const candidate of candidates) {
          if (fs.existsSync(path.join(root, candidate))) {
            return { entry: path.join(root, candidate), outfile: path.join(root, 'dist', `${out}.js`) }
          }
        }
        return null
      })
      .filter(Boolean)
  } catch {
    return []
  }
}
let esbuild
try {
  esbuild = require('esbuild')
} catch {
  try {
    esbuild = require(path.join(root, '..', 'momai', 'node_modules', 'esbuild'))
  } catch {}
}
const pageEntry = path.join(root, 'src', 'page.tsx')
const pageOutfile = path.join(root, 'dist', 'page.js')
const panelEntry = path.join(root, 'src', 'panel.tsx')
const panelOutfile = path.join(root, 'dist', 'panel.js')
// Bundled persistent worker (Node). The packaged ZIP excludes src/, so the
// worker must be self-contained: runtime.ts + src/database + src/auth +
// src/integrations bundled into a single CJS file. Native/prod deps
// (better-sqlite3) stay external and are installed into the staging dir by
// package-extension.mjs (--prod).
const workerEntry = path.join(root, 'runtime.ts')
const workerOutfile = path.join(root, 'dist', 'runtime.js')

if (esbuild?.build) {
  const widgetBuilds = readManifestWidgets()
  await esbuild.build({
    entryPoints: [pageEntry],
    outfile: pageOutfile,
    bundle: true,
    format: 'esm',
    target: 'es2020',
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    loader: {
      '.png': 'dataurl'
    }
  })
  await esbuild.build({
    entryPoints: [panelEntry],
    outfile: panelOutfile,
    bundle: true,
    format: 'esm',
    target: 'es2020',
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    loader: {
      '.png': 'dataurl'
    }
  })
  for (const widget of widgetBuilds) {
    await esbuild.build({
      entryPoints: [widget.entry],
      outfile: widget.outfile,
      bundle: true,
      format: 'esm',
      target: 'es2020',
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      loader: {
        '.png': 'dataurl'
      }
    })
  }
  await esbuild.build({
    entryPoints: [workerEntry],
    outfile: workerOutfile,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node22',
    packages: 'external'
  })
  console.log('[momai-smart-home] build done (via programmatic esbuild)')
} else {
  const { execSync } = await import('node:child_process')
  execSync(`npx esbuild "${pageEntry}" --bundle --format=esm --target=es2020 --outfile="${pageOutfile}" --external:react --external:react-dom --external:react/jsx-runtime --loader:.png=dataurl`, {
    stdio: 'inherit',
    cwd: root
  })
  execSync(`npx esbuild "${panelEntry}" --bundle --format=esm --target=es2020 --outfile="${panelOutfile}" --external:react --external:react-dom --external:react/jsx-runtime --loader:.png=dataurl`, {
    stdio: 'inherit',
    cwd: root
  })
  execSync(`npx esbuild "${workerEntry}" --bundle --platform=node --format=cjs --target=node22 --packages=external --outfile="${workerOutfile}"`, {
    stdio: 'inherit',
    cwd: root
  })
  console.log('[momai-smart-home] build done')
}
