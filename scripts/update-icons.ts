import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const ICONS_PATH = path.join(ROOT, 'src', 'icons');
const README_PATH = path.join(ROOT, 'ReadMe.md');

async function buildReadme(): Promise<string> {
  const svgFiles = (await readdir(ICONS_PATH))
    .filter((file) => file.endsWith('.svg'))
    .sort((a, b) => a.localeCompare(b));

  const cards = svgFiles
    .map((file) => {
      const displayName = path.parse(file).name.replace(/-/g, ' ');
      return `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; min-height:110px; padding:12px 8px; border:1px solid #e5e7eb; border-radius:12px; background:#f8fafc;">
        <img src="./src/icons/${file}" alt="${displayName}" width="40" height="40" />
        <span style="font-size:11px; color:#374151; text-align:center; word-break:break-word;">${displayName}</span>
      </div>`;
    })
    .join('\n');

  return `# Icon Collection

This repo contains a curated set of SVG icons. The gallery below is automatically refreshed when new SVG files are added.

<div align="center">
  <div style="max-width: 895px; margin: 0 auto; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 16px; align-items: stretch;">
${cards}
  </div>
</div>

Total icons: ${svgFiles.length}
`;
}

async function main(): Promise<void> {
  await writeFile(README_PATH, await buildReadme(), 'utf8');
}

main().catch((error: unknown) => {
  console.error('Error:', error instanceof Error ? error.message : error);
  process.exit(1);
});
