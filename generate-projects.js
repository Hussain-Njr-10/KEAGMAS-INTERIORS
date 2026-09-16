import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = './public/keagmas1';
const PROJECTS_DIR = './src/content/projects';

// Helper to slugify
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// Helper to format names
function formatName(text) {
  let name = text.replace(/_/g, ' ');
  if (name.startsWith('Project ')) {
    name = name.substring(8);
  }
  // Title case
  return name.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

// Helper to get all media files recursively
function getMediaFiles(dirPath, mediaFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      getMediaFiles(filePath, mediaFiles);
    } else {
      if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.mp4')) {
        // We need the path relative to public/, and ensure posix slashes
        let relativePath = filePath.split('public')[1] || filePath.split('public\\')[1] || filePath.split('public/')[1];
        if (relativePath) {
          const publicPath = relativePath.replace(/\\/g, '/');
          mediaFiles.push(publicPath);
        }
      }
    }
  });

  return mediaFiles;
}

// Ensure projects directory exists
if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

// Clear existing files
const existingFiles = fs.readdirSync(PROJECTS_DIR);
existingFiles.forEach(file => {
  if (file.endsWith('.md')) {
    fs.unlinkSync(path.join(PROJECTS_DIR, file));
  }
});

let yearCounter = 2024;

// Read Categories
const categories = fs.readdirSync(PUBLIC_DIR);

categories.forEach(categoryFolder => {
  if (categoryFolder === 'sketches') return; // Skip sketches

  const categoryPath = path.join(PUBLIC_DIR, categoryFolder);
  if (!fs.statSync(categoryPath).isDirectory()) return;

  const formattedCategory = formatName(categoryFolder);

  // Read Projects
  const projects = fs.readdirSync(categoryPath);
  projects.forEach(projectFolder => {
    const projectPath = path.join(categoryPath, projectFolder);
    if (!fs.statSync(projectPath).isDirectory()) return;

    const formattedTitle = formatName(projectFolder);
    const slug = slugify(formattedTitle) || slugify(projectFolder);

    const mediaFiles = getMediaFiles(projectPath);

    if (mediaFiles.length === 0) return;

    // The first image is the hero
    const heroImage = mediaFiles.find(m => m.endsWith('.jpg') || m.endsWith('.png')) || mediaFiles[0];

    const mediaListString = JSON.stringify(mediaFiles);

    const markdown = `---
title: "${formattedTitle}"
location: ""
year: ${yearCounter}
category: "${formattedCategory}"
heroImage: "${heroImage}"
media: ${mediaListString}
---

A bespoke interior design and architecture commission in the ${formattedCategory} category. This project showcases KEAGMAS INTERIORS' commitment to luxury, materiality, and precise spatial flow. Explore the gallery below for a complete visual walkthrough of the spaces.
`;

    fs.writeFileSync(path.join(PROJECTS_DIR, `${slug}.md`), markdown);
    console.log(`Generated: ${slug}.md with ${mediaFiles.length} media files.`);
    yearCounter = yearCounter === 2024 ? 2023 : (yearCounter === 2023 ? 2022 : 2024); // Cycle years a bit for variety
  });
});

console.log('Project generation complete!');
