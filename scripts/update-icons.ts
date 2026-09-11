import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const ICONS_PATH = path.join(ROOT, 'src', 'icons');
const README_PATH = path.join(ROOT, 'ReadMe.md');

function cleanSvg(svg: string): string {
  let cleaned = svg
    .replace(/^\uFEFF?\s*<\?xml[\s\S]*?\?>\s*/i, '')
    .replace(/<!--[\s\S]*?-->\s*/g, '')
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>\s*/gi, '')
    .replace(/\s+fill\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');

  cleaned = cleaned.replace(/<svg\b[^>]*>/i, (root) =>
    root.replace(
      /\s+(?:version|id|data-name|x|y|xmlns:xlink|style|xml:space|enable-background)\s*=\s*(?:"[^"]*"|'[^']*')/gi,
      '',
    ),
  );

  return `${cleaned.replace(/\s+/g, ' ').trim()}\n`;
}

async function cleanIcons(svgFiles: string[]): Promise<void> {
  await Promise.all(
    svgFiles.map(async (file) => {
      const filePath = path.join(ICONS_PATH, file);
      const svg = await readFile(filePath, 'utf8');
      await writeFile(filePath, cleanSvg(svg), 'utf8');
    }),
  );
}

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
  const svgFiles = (await readdir(ICONS_PATH))
    .filter((file) => file.endsWith('.svg'))
    .sort((a, b) => a.localeCompare(b));

  await cleanIcons(svgFiles);
  await writeFile(README_PATH, await buildReadme(), 'utf8');
}

main().catch((error: unknown) => {
  console.error('Error:', error instanceof Error ? error.message : error);
  process.exit(1);
});
