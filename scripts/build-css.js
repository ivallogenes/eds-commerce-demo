import {
  readdirSync,
  readFileSync,
  writeFileSync,
  watch,
  existsSync,
} from 'fs';
import {
  join,
  dirname,
  basename,
  sep,
  normalize,
} from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import postcss from 'postcss';
// eslint-disable-next-line import/no-extraneous-dependencies
import postcssImport from 'postcss-import';
// eslint-disable-next-line import/no-extraneous-dependencies
import postcssNesting from 'postcss-nesting';
// eslint-disable-next-line import/no-extraneous-dependencies
import postcssPresetEnv from 'postcss-preset-env';
// eslint-disable-next-line import/no-extraneous-dependencies
import autoprefixer from 'autoprefixer';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Plugin to remove CSS comments selectively, keeping important ones
const removeComments = () => ({
  postcssPlugin: 'remove-comments',
  Once(root) {
    root.walkComments((comment) => {
      const text = comment.text.trim();

      // Keep comments that start with specific keywords (case-insensitive)
      const keepPatterns = [
        /^stylelint/i,
        /^filepath:/i,
        /^@preserve/i,
      ];

      // Check if comment should be kept
      const shouldKeep = keepPatterns.some((pattern) => pattern.test(text));

      if (!shouldKeep) {
        comment.remove();
      }
    });
  },
});

removeComments.postcssPlugin = 'remove-comments';

const processor = postcss([
  postcssImport(),
  postcssNesting(),
  postcssPresetEnv({
    stage: 3,
    features: {
      'nesting-rules': true,
      'custom-properties': true,
      'custom-media-queries': true,
      'color-mix': true,
    },
    autoprefixer: {
      grid: true,
    },
  }),
  autoprefixer(),
  removeComments(),
]);

/**
 * Check if a path contains a 'source' directory segment (cross-platform)
 * @param {string} filePath - The file path to check
 * @returns {boolean}
 */
function isInSourceDir(filePath) {
  const normalized = normalize(filePath);
  // Match 'source' as a directory segment (not as part of a filename)
  const sourcePattern = new RegExp(`(^|\\${sep})source(\\${sep}|$)`);
  return sourcePattern.test(normalized);
}

/**
 * Find all source CSS files recursively
 * @param {string} dir - Directory to search
 * @param {string[]} files - Accumulator for found files
 * @returns {string[]}
 */
function findSourceFiles(dir, files = []) {
  if (!existsSync(dir)) {
    console.warn(`⚠️  Directory not found: ${dir}`);
    return files;
  }

  const entries = readdirSync(dir, { withFileTypes: true });

  // eslint-disable-next-line no-restricted-syntax
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'source') {
        // Found a source directory, scan for CSS files
        const sourceDir = readdirSync(fullPath);
        const cssFiles = sourceDir
          .filter((f) => f.endsWith('.css'))
          .map((f) => join(fullPath, f));
        files.push(...cssFiles);
      } else if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== '__dropins__') {
        findSourceFiles(fullPath, files);
      }
    }
  }

  return files;
}

/**
 * Process a single CSS file
 * @param {string} sourcePath - Path to source CSS file
 * @returns {Promise<boolean>} - Success status
 */
async function processFile(sourcePath) {
  const normalizedPath = normalize(sourcePath);

  // Verify file exists before processing
  if (!existsSync(normalizedPath)) {
    // eslint-disable-next-line no-console
    console.error(`❌ Source file not found: ${normalizedPath}`);
    return false;
  }

  try {
    const sourceDir = dirname(normalizedPath);
    const parentDir = dirname(sourceDir);
    const filename = basename(normalizedPath);
    const outputPath = join(parentDir, filename);

    // eslint-disable-next-line no-console
    console.info(`📝 Processing: ${normalizedPath.replace(rootDir, '.')}`);

    const css = readFileSync(normalizedPath, 'utf8');
    const result = await processor.process(css, {
      from: normalizedPath,
      to: outputPath,
    });

    writeFileSync(outputPath, result.css);
    // eslint-disable-next-line no-console
    console.info(`✅ Compiled: ${outputPath.replace(rootDir, '.')}`);

    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`❌ Error processing ${normalizedPath}:`);
    // eslint-disable-next-line no-console
    console.error(`   ${error.message}`);
    if (error.line && error.column) {
      // eslint-disable-next-line no-console
      console.error(`   at line ${error.line}, column ${error.column}`);
    }
    return false;
  }
}

/**
 * Build all CSS files
 * @returns {Promise<{success: number, failed: number}>}
 */
async function buildAll() {
  // eslint-disable-next-line no-console
  console.info('\n🔨 Building CSS files...\n');

  const sourceFiles = [
    ...findSourceFiles(join(rootDir, 'styles')),
    ...findSourceFiles(join(rootDir, 'blocks')),
  ];

  if (sourceFiles.length === 0) {
    // eslint-disable-next-line no-console
    console.warn('⚠️  No source CSS files found in styles/source or blocks/*/source directories.\n');
    // eslint-disable-next-line no-console
    console.info('   Expected structure:');
    // eslint-disable-next-line no-console
    console.info('   styles/source/*.css');
    // eslint-disable-next-line no-console
    console.info('   blocks/<block-name>/source/<block-name>.css\n');
    return { success: 0, failed: 0 };
  }

  // eslint-disable-next-line no-console
  console.info(`Found ${sourceFiles.length} source CSS file(s):\n`);
  // eslint-disable-next-line no-console
  sourceFiles.forEach((f) => console.info(`   ${f.replace(rootDir, '.')}`));
  // eslint-disable-next-line no-console
  console.info();

  let success = 0;
  let failed = 0;

  // Process files sequentially to avoid overwhelming the system
  // eslint-disable-next-line no-restricted-syntax
  for (const file of sourceFiles) {
    // eslint-disable-next-line no-await-in-loop
    const result = await processFile(file);
    if (result) {
      success += 1;
    } else {
      failed += 1;
    }
  }

  // eslint-disable-next-line no-console
  console.info('\n✨ CSS build complete!');
  // eslint-disable-next-line no-console
  console.info(`   ✅ ${success} compiled, ❌ ${failed} failed\n`);

  return { success, failed };
}

/**
 * Watch mode - monitors for CSS file changes
 */
async function watchMode() {
  // eslint-disable-next-line no-console
  console.info('\n👀 Watching for CSS changes...');
  // eslint-disable-next-line no-console
  console.info('   Monitoring: styles/source/, blocks/*/source/');
  // eslint-disable-next-line no-console
  console.info('   Press Ctrl+C to stop.\n');

  const dirs = [
    join(rootDir, 'styles'),
    join(rootDir, 'blocks'),
  ];

  const DEBOUNCE_MS = 200;

  // Pending timers for debounced processing
  const pendingTimers = new Map();

  // Process a change event with delayed read to avoid truncate race condition.
  // Editors often save as truncate→write, so the first fs event fires on an
  // empty file. We wait DEBOUNCE_MS after the *last* event for a given path
  // before reading, ensuring the write has completed.
  const handleChange = (dir, filename) => {
    if (!filename) return;

    // Normalize the path for cross-platform compatibility
    const normalizedFilename = normalize(filename);

    // Check if this is a CSS file in a source directory
    if (!normalizedFilename.endsWith('.css') || !isInSourceDir(normalizedFilename)) {
      return;
    }

    const fullPath = join(dir, normalizedFilename);

    // Clear any pending timer for this file (restarts the debounce window)
    if (pendingTimers.has(fullPath)) {
      clearTimeout(pendingTimers.get(fullPath));
    }

    // Schedule processing after debounce window
    const timer = setTimeout(async () => {
      pendingTimers.delete(fullPath);

      // Verify file still exists (might have been deleted)
      if (!existsSync(fullPath)) {
        // eslint-disable-next-line no-console
        console.warn(`⚠️  File deleted or moved: ${normalizedFilename}`);
        return;
      }

      // Extra guard: skip if file is empty (editor mid-write)
      const content = readFileSync(fullPath, 'utf8');
      if (content.trim().length === 0) {
        // eslint-disable-next-line no-console
        console.warn(`⚠️  Skipping empty source file (likely mid-save): ${normalizedFilename}`);
        return;
      }

      // eslint-disable-next-line no-console
      console.info(`\n🔄 Change detected: ${normalizedFilename}`);
      // eslint-disable-next-line no-console
      console.info('⚙️  Recompiling...\n');
      await processFile(fullPath);
    }, DEBOUNCE_MS);

    pendingTimers.set(fullPath, timer);
  };

  // Create watchers for each directory
  const watchers = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      // eslint-disable-next-line no-console
      console.warn(`⚠️  Directory not found, skipping watch: ${dir}`);
      // eslint-disable-next-line no-continue
      continue;
    }

    try {
      const watcher = watch(dir, { recursive: true }, (eventType, filename) => {
        handleChange(dir, filename);
      });
      watchers.push(watcher);
      // eslint-disable-next-line no-console
      console.info(`   Watching: ${dir.replace(rootDir, '.')}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`❌ Failed to watch ${dir}: ${err.message}`);
    }
  }

  if (watchers.length === 0) {
    // eslint-disable-next-line no-console
    console.error('❌ No directories could be watched. Exiting.');
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.info();

  // Initial build
  await buildAll();

  // Handle cleanup
  process.on('SIGINT', () => {
    // eslint-disable-next-line no-console
    console.info('\n\n👋 Stopping CSS watch...');
    watchers.forEach((w) => w.close());
    process.exit(0);
  });
}

// Main execution
const isWatch = process.argv.includes('--watch');

if (isWatch) {
  watchMode();
} else {
  buildAll().then(({ failed }) => {
    if (failed > 0) {
      process.exit(1);
    }
  });
}
