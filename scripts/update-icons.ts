import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const ICONS_PATH = path.join(ROOT, 'src', 'icons');
const README_PATH = path.join(ROOT, 'ReadMe.md');

async function buildReadme(): Promise<string> {
  const svgFiles = (await readdir(ICONS_PATH))
    .filter((file) => file.endsWith('.svg'))
    .sort((a, b) => a.localeCompare(b));

  const rows: string[] = [];
  for (let index = 0; index < svgFiles.length; index += 6) {
    const cells = svgFiles.slice(index, index + 6).map((file) => {
      const displayName = path.parse(file).name.replace(/-/g, ' ');
      return `<img src="./src/icons/${file}" alt="${displayName}" width="40" height="40"><br>${displayName}`;
    });
    while (cells.length < 6) {
      cells.push('');
    }
    rows.push(`| ${cells.join(' | ')} |`);
  }

  const gallery = [
    '| Icon | Icon | Icon | Icon | Icon | Icon |',
    '| --- | --- | --- | --- | --- | --- |',
    ...rows,
  ].join('\n');

  return `# Icon Collection

This repo contains a curated set of SVG icons. Add new SVG files to \`src/icons\`, then run \`npm run update:icons\` to refresh this gallery.

${gallery}

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
