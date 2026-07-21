import fs from 'fs';

const files = ['src/pages/FileTypes.tsx', 'src/pages/Repository.tsx', 'src/pages/Systems.tsx', 'src/pages/Users.tsx'];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/border-gray-300 border-surface-card-2/g, 'border-surface-card-2');
  content = content.replace(/text-gray-700 text-ink-near-white/g, 'text-ink-near-white');
  content = content.replace(/hover:bg-gray-50 dark:hover:bg-gray-800/g, 'hover:bg-surface-card-2');
  content = content.replace(/text-ink-dim dark:text-ink-dim/g, 'text-ink-dim');
  content = content.replace(/hover:bg-gray-50 dark:hover:bg-gray-900/g, 'hover:bg-surface-card-2');
  fs.writeFileSync(file, content, 'utf8');
});
