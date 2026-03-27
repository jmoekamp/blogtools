#!/usr/bin/env node

/**
 * Pre-builds a serialized Lunr.js search index from search-data.json.
 *
 * Usage:
 *   node _scripts/build-search-index.js [site-dir]
 *
 * site-dir defaults to _site if not provided.
 */

const lunr = require('lunr');
const fs   = require('fs');
const path = require('path');

const siteDir    = process.argv[2] || path.join(__dirname, '..', '_site');
const dataPath   = path.join(siteDir, 'search-data.json');
const outputPath = path.join(siteDir, 'search-index.json');

if (!fs.existsSync(dataPath)) {
  console.error('ERROR: ' + dataPath + ' not found. Run `jekyll build` first.');
  process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('Indexing ' + posts.length + ' posts…');

const idx = lunr(function () {
  this.ref('url');
  this.field('title',       { boost: 10 });
  this.field('description', { boost: 5 });
  this.field('tags',        { boost: 3 });
  this.field('categories',  { boost: 3 });
  this.field('content');

  posts.forEach(function (post) {
    this.add({
      url:         post.url,
      title:       post.title,
      description: post.description,
      tags:        post.tags.join(' '),
      categories:  post.categories.join(' '),
      content:     post.content
    });
  }, this);
});

fs.writeFileSync(outputPath, JSON.stringify(idx));

const sizeMB = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
console.log('Search index built: ' + outputPath + ' (' + sizeMB + ' MB)');
