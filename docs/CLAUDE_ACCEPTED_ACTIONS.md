# Claude Code Accepted Actions

This document lists all actions that Claude Code can perform without requiring explicit user approval in this project.

## Git Operations

### Commit Operations
- ✅ `git commit -m "message"` - Create commits with any message
- ✅ `git add .` or `git add -A` - Stage all changes
- ✅ `git add <file>` - Stage specific files

### Remote Operations
- ✅ `git push` - Push commits to remote repository
- ✅ `git pull` - Pull changes from remote repository
- ✅ `git remote get-url origin` - Get remote repository URL

### Status & Information
- ✅ `git status` - Check repository status
- ✅ `git commit` - Create commits (general)
- ✅ `git restore <file>` - Restore files from staging

## Package Management

### NPM Operations
- ✅ `npm install` - Install all dependencies from package.json
- ✅ `npm install <package>` - Install specific packages
- ✅ `npm uninstall <package>` - Remove packages
- ✅ `npm search <term>` - Search for packages
- ✅ `npm run build` - Build the project
- ✅ `npm run dev` - Start development server (any port, e.g., `npm run dev:*`)

### Shadcn UI
- ✅ `npx shadcn@latest add <component>` - Add UI components from shadcn/ui

## File System Operations

### Directory Operations
- ✅ `mkdir <directory>` - Create directories
- ✅ `chmod <permissions> <file>` - Change file permissions

### File Operations
- ✅ `cat <file>` - Display file contents
- ✅ `echo <content>` - Output text (typically used for testing)

## Development Operations

### Build & Testing
- ✅ `npm run build` - Production build
- ✅ `node <script>` - Run Node.js scripts

### Process Management
- ✅ `kill <pid>` - Kill processes

## Docker Operations
- ✅ `docker <command>` - Any Docker commands
- ✅ `docker-compose up` - Start Docker services (any flags)

## Browser Operations
- ✅ `open <url>` - Open URLs in default browser (macOS)
  - Example: `open https://github.com/anerky2016/v0-ssat-training-website`

## Audio/Media Operations
- ✅ Operations on `public/audio/tts/README.md` - TTS audio documentation

## Project-Specific Approved Patterns

### Commit Message Format
All commits should follow this format:
```
<Short descriptive title>

<Detailed description with sections>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Common Development Workflows

#### 1. Make Changes → Commit → Push
```bash
# Stage changes
git add -A

# Commit with descriptive message
git commit -m "$(cat <<'EOF'
Add feature X

Details:
- Change 1
- Change 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Push to remote
git push
```

#### 2. Build → Test → Deploy
```bash
# Build the project
npm run build

# Test the build (if tests exist)
npm test

# Push changes
git add -A && git commit -m "message" && git push
```

#### 3. Add UI Component
```bash
# Add shadcn component
npx shadcn@latest add <component>

# Install if needed
npm install @radix-ui/react-<component>
```

## Operations That Require Approval

The following operations still require user approval:

### Destructive Git Operations
- ⚠️ `git push --force` - Force push (dangerous)
- ⚠️ `git reset --hard` - Hard reset (loses changes)
- ⚠️ `git rebase -i` - Interactive rebase
- ⚠️ `git clean -fd` - Remove untracked files

### System Operations
- ⚠️ `rm -rf` - Recursive force delete
- ⚠️ `sudo` commands - Elevated privileges
- ⚠️ System configuration changes

### Database Operations
- ⚠️ Direct database modifications
- ⚠️ Migration rollbacks
- ⚠️ Data deletions

## Best Practices

### 1. Always Build Before Committing
```bash
npm run build && git add -A && git commit -m "message" && git push
```

### 2. Check Status Before Pushing
```bash
git status
git add -A
git commit -m "message"
git push
```

### 3. Use Descriptive Commit Messages
- Include what changed
- Include why it changed
- Include any breaking changes
- Include implementation details for complex features

### 4. Group Related Changes
- Commit related changes together
- Don't mix unrelated features in one commit
- Keep commits atomic and focused

## Security Considerations

### Safe Operations
- ✅ Reading files from the project directory
- ✅ Writing to project files (with caution)
- ✅ Installing npm packages from official registry
- ✅ Running build scripts defined in package.json

### Requires Caution
- ⚠️ Installing packages from unknown sources
- ⚠️ Running scripts from external sources
- ⚠️ Modifying system-level configurations
- ⚠️ Exposing sensitive credentials

## Environment Variables

Safe to use in development:
- ✅ `NEXT_PUBLIC_*` - Public Next.js variables
- ✅ `NODE_ENV` - Environment indicator
- ✅ Reading from `.env.local` (never commit)

Never commit:
- ❌ API keys and secrets
- ❌ Database credentials
- ❌ Authentication tokens
- ❌ Private keys

## Project Structure

### Safe to Modify
- ✅ `/components/**` - React components
- ✅ `/app/**` - Next.js app directory
- ✅ `/lib/**` - Utility libraries
- ✅ `/data/**` - JSON data files
- ✅ `/public/**` - Static assets
- ✅ `/docs/**` - Documentation

### Requires Extra Caution
- ⚠️ `package.json` - Check dependencies carefully
- ⚠️ `next.config.js` - Affects build configuration
- ⚠️ `tsconfig.json` - TypeScript configuration
- ⚠️ `.env.*` - Environment files

## Automated Workflows

### CI/CD Pipeline
This project uses:
- Vercel for deployment (auto-deploys on push to main)
- GitHub Actions (if configured)

Approved automatic actions:
- ✅ Build verification on commit
- ✅ Type checking
- ✅ Linting (when configured)

## Notes

1. All actions listed as approved (✅) can be executed by Claude Code without prompting the user
2. Actions marked with ⚠️ require user confirmation before execution
3. This list is specific to this project and may differ for other projects
4. When in doubt, Claude Code should ask for permission rather than proceeding automatically

## Version History

- **2025-01-20**: Initial documentation created
  - Documented all currently approved git, npm, and development operations
  - Added commit message format guidelines
  - Added best practices and security considerations

---

Last Updated: 2025-01-20
