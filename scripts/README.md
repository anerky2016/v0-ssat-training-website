# Scripts Directory

This directory contains utility scripts for managing the SSAT Training Website data and content.

## Available Scripts

### `fetch-cefr-levels.js`

Assigns CEFR (Common European Framework of Reference) levels to all vocabulary words in the system.

**Usage:**
```bash
node scripts/fetch-cefr-levels.js
```

**What it does:**
- Processes all vocabulary JSON files in the `/data` directory
- Assigns CEFR levels (A1-C2) to words that don't have them
- Generates a distribution report showing word counts by level
- Updates the vocabulary files with the new CEFR data

**Output:**
- Updated vocabulary files with `cefr_level` field
- Console report showing distribution and statistics
- Sample words from each CEFR level

**CEFR Levels:**
- **A1** - Beginner
- **A2** - Elementary
- **B1** - Intermediate
- **B2** - Upper Intermediate
- **C1** - Advanced
- **C2** - Proficiency

**Current Distribution (as of last run):**
```
A1 (Beginner):             0 words (0.0%)
A2 (Elementary):           4 words (0.2%)
B1 (Intermediate):       362 words (19.4%)
B2 (Upper Intermediate): 745 words (40.0%)
C1 (Advanced):           651 words (34.9%)
C2 (Proficiency):        101 words (5.4%)
─────────────────────────────────────────
Total:                 1,863 words
```

**Notes:**
- The script uses heuristics to estimate CEFR levels
- Existing CEFR levels are preserved (not overwritten)
- For production, consider using official CEFR word lists or APIs
- See `/docs/CEFR_LEVELS.md` for detailed documentation

### `generate-vocabulary-questions.js`

Generates practice questions for vocabulary words using AI.

**Usage:**
```bash
node scripts/generate-vocabulary-questions.js
```

## Adding New Scripts

When adding new scripts:

1. Create the script file in this directory
2. Add execute permissions: `chmod +x scripts/your-script.js`
3. Add a shebang line: `#!/usr/bin/env node`
4. Document the script in this README
5. Add error handling and helpful console output
6. Test thoroughly before committing

## Best Practices

- Use Node.js for scripts that need to process JSON data
- Use Bash scripts for system operations
- Include clear console output and progress indicators
- Handle errors gracefully
- Document all parameters and options
- Add examples in comments or documentation

## Related Documentation

- [CEFR Levels Documentation](/docs/CEFR_LEVELS.md)
- [Vocabulary System Documentation](/docs/VOCABULARY_RENDERING_PLAN.md)

## Requirements

- Node.js 18+
- npm packages as defined in package.json

## Troubleshooting

### Script fails to read vocabulary files
- Ensure you're running from the project root directory
- Check that vocabulary JSON files exist in `/data` directory
- Verify file permissions

### CEFR levels not appearing
- Run the `fetch-cefr-levels.js` script
- Check that vocabulary files have write permissions
- Clear Next.js cache: `rm -rf .next`

## Contributing

When contributing new scripts:
1. Follow existing code style
2. Add comprehensive error handling
3. Document in this README
4. Test with actual data
5. Consider edge cases
