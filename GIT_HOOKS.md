# Git Hooks Configuration

This repository uses **Husky** to ensure code quality before commits.

## Pre-commit Hooks

Before each commit, the following checks are automatically run:

### 1. Lint-staged (ESLint + Prettier)
- Runs ESLint on staged `.ts` files
- Automatically fixes linting issues
- Formats code with Prettier
- Only processes staged files (not the entire codebase)

### 2. Tests
- Runs all unit tests (`pnpm test`)
- Ensures no breaking changes are committed

## Commit Message Hook

The `commit-msg` hook validates:
- ✅ Commit message is not empty
- ✅ Minimum 10 characters
- ✅ Meaningful commit messages

## Configuration Files

- `.husky/pre-commit` - Pre-commit hook script
- `.husky/commit-msg` - Commit message validation
- `.lintstagedrc.json` - Lint-staged configuration

## How It Works

1. **Stage your changes:**
   ```bash
   git add .
   ```

2. **Commit (hooks run automatically):**
   ```bash
   git commit -m "feat: add new feature"
   ```

3. **What happens:**
   - ⚙️ ESLint checks and fixes staged TypeScript files
   - 🎨 Prettier formats staged files
   - 🧪 All tests run
   - ✍️ Commit message is validated
   - ✅ If all pass → commit succeeds
   - ❌ If any fail → commit is blocked

## Bypassing Hooks (Not Recommended)

In emergency situations only:
```bash
git commit --no-verify -m "emergency fix"
```

⚠️ **Warning:** This skips all quality checks!

## Manual Commands

Run checks manually without committing:

```bash
# Run lint
pnpm run lint

# Run tests
pnpm run test

# Run lint-staged manually
pnpm lint-staged

# Format all files
pnpm run format
```

## Setup for New Contributors

Hooks are automatically installed when you run:
```bash
pnpm install
```

The `prepare` script in `package.json` ensures Husky is set up.

## Benefits

✅ **Consistent Code Quality** - All committed code is linted and tested  
✅ **Early Bug Detection** - Catch issues before they reach CI/CD  
✅ **Automated Formatting** - No manual formatting needed  
✅ **Clean Commit History** - Meaningful commit messages  
✅ **Team Alignment** - Everyone follows the same standards
