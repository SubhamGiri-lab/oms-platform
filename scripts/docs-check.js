const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  const results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results.push(...walkDir(full));
    } else if (file.toLowerCase().endsWith('.md')) {
      results.push(full);
    }
  });
  return results;
}

function isExternal(link) {
  return /^(?:[a-z]+:)?\/\//i.test(link) || link.startsWith('mailto:');
}

function checkDocs() {
  const docsDir = path.resolve(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) {
    console.log('No docs/ directory found — skipping docs link checks.');
    process.exit(0);
  }

  const mdFiles = walkDir(docsDir);
  const broken = [];

  mdFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
    let m;
    while ((m = linkRe.exec(content)) !== null) {
      let link = m[2].trim();
      if (!link || isExternal(link) || link.startsWith('#')) continue;
      // strip anchor
      const [linkPath] = link.split('#');
      // treat absolute paths as repo-rooted
      let target;
      if (linkPath.startsWith('/')) {
        target = path.resolve(process.cwd(), '.' + linkPath);
      } else {
        target = path.resolve(path.dirname(file), linkPath);
      }

      const exists = fs.existsSync(target) || fs.existsSync(target + '.md') || fs.existsSync(path.join(target, 'README.md'));
      if (!exists) broken.push({ file, link, target });
    }
  });

  if (broken.length === 0) {
    console.log('Docs link check: no broken links found.');
    process.exit(0);
  }

  console.error('Docs link check: broken links found:');
  broken.forEach((b) => {
    console.error(`- ${path.relative(process.cwd(), b.file)} -> ${b.link} (resolved: ${b.target})`);
  });
  process.exit(2);
}

checkDocs();
