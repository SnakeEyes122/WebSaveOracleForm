import fs from 'fs';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-white dark:bg-\[#0a0a0a\]/g, 'bg-surface-card');
  content = content.replace(/border-gray-200 dark:border-gray-800/g, 'border-surface-card-2');
  content = content.replace(/text-gray-900 dark:text-white/g, 'text-ink-pure font-display');
  content = content.replace(/text-gray-900 dark:text-gray-100/g, 'text-ink-near-white');
  content = content.replace(/text-gray-500 font-mono/g, 'text-ink-dim font-mono');
  content = content.replace(/text-gray-500/g, 'text-ink-dim');
  content = content.replace(/text-gray-400/g, 'text-ink-dim');
  content = content.replace(/text-gray-600/g, 'text-ink-dim');
  content = content.replace(/bg-gray-50\/50 dark:bg-gray-900\/20/g, 'bg-surface-card-2');
  content = content.replace(/divide-gray-200 dark:divide-gray-800/g, 'divide-surface-card-2');
  content = content.replace(/hover:bg-gray-50 dark:hover:bg-gray-900\/50/g, 'hover:bg-surface-card-2');
  content = content.replace(/bg-gray-100 dark:bg-gray-800/g, 'bg-surface-card-2');
  content = content.replace(/dark:border-gray-700/g, 'border-surface-card-2');
  content = content.replace(/dark:text-gray-300/g, 'text-ink-near-white');
  fs.writeFileSync(file, content, 'utf8');
});
