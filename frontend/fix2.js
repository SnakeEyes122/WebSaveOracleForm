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
  // Buttons
  content = content.replace(/bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100/g, 'bg-surface-card-2 text-ink-near-white hover:bg-brand-foam-deep');
  content = content.replace(/rounded-md/g, 'rounded-pill');
  // Cancel Buttons / Outline Buttons
  content = content.replace(/bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-[#0a0a0a] dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-900/g, 'bg-transparent text-ink-near-white hover:bg-surface-card border border-hairline-dim');
  // Inputs
  content = content.replace(/bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#0a0a0a] dark:border-gray-700 dark:text-white dark:focus:ring-blue-500/g, 'bg-canvas border-hairline-dim text-ink-near-white focus:ring-brand-cerulean focus:border-brand-cerulean');
  // Text
  content = content.replace(/text-gray-700 dark:text-gray-300/g, 'text-ink-near-white');
  content = content.replace(/text-gray-800 dark:text-gray-200/g, 'text-ink-pure font-display');
  
  // Specific fix for Dashboard.tsx to avoid missing closing div or whatever
  // Just generic fixes.
  
  fs.writeFileSync(file, content, 'utf8');
});
