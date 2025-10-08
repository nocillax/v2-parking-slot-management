# 🌿 Git Branching Strategy

## Branch Naming Convention

### Feature Branches

```
feat/<feature-name>
```

**Examples:**

- `feat/location-hierarchy`
- `feat/user-authentication`
- `feat/reservation-system`

### Bug Fix Branches

```
fix/<issue-description>
```

**Examples:**

- `fix/user-login-error`
- `fix/payment-calculation`

### Other Branch Types

```
chore/<task>     - Maintenance, refactoring
docs/<task>      - Documentation updates
test/<feature>   - Adding tests
```

---

## Workflow Steps

### 1. Starting New Feature

```bash
# Make sure you're on main and it's up to date
git checkout main
git pull origin main

# Create new feature branch
git checkout -b feat/location-hierarchy

# Verify you're on the new branch
git branch
```

### 2. Working on Feature (Per Task)

```bash
# After each completed task (e.g., "Create Division model")
git add .
git status  # Review changes
git commit -m "feat: create Division model with associations"

# Continue working on next task...
# After next task (e.g., "Create District model")
git add .
git commit -m "feat: create District model with division relationship"
```

### 3. Pushing Feature Branch

```bash
# After completing all tasks in the feature
git push origin feat/location-hierarchy
```

### 4. Creating Pull Request (GitHub)

1. Go to GitHub repository
2. Click "Compare & pull request"
3. Fill in PR description:

   ```
   ## Feature: Location Hierarchy

   ### Changes
   - ✅ Created Division, District, Area models
   - ✅ Updated User model with default location
   - ✅ Updated ParkingLot model with area_id
   - ✅ Added location seed data

   ### Testing
   - Database sync successful
   - All associations working

   ### Next Steps
   - Create location APIs
   ```

4. Request review (if working with team)
5. Merge to main

### 5. After Merge

```bash
# Switch back to main
git checkout main

# Pull latest changes
git pull origin main

# Delete local feature branch (optional)
git branch -d feat/location-hierarchy

# Delete remote branch (optional)
git push origin --delete feat/location-hierarchy
```

---

## Commit Message Format

### Structure

```
<type>: <short description>

[optional body]

[optional footer]
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Formatting, missing semicolons, etc
- `refactor:` - Code change that neither fixes a bug nor adds a feature
- `test:` - Adding tests
- `chore:` - Maintenance

### Examples

**Good commits:**

```bash
git commit -m "feat: create Division model with country field"
git commit -m "feat: add location hierarchy associations"
git commit -m "fix: resolve circular dependency in models"
git commit -m "docs: update PRD with location discovery feature"
```

**Bad commits:**

```bash
git commit -m "update"
git commit -m "changes"
git commit -m "fix bug"
```

---

## Current Project: Location Hierarchy Feature

### Branch Name

```
feat/location-hierarchy
```

### Task Breakdown (Sequential Commits)

1. **Task 1:** Create Division model

   ```bash
   git commit -m "feat: create Division model with name, code, country fields"
   ```

2. **Task 2:** Create District model

   ```bash
   git commit -m "feat: create District model with division relationship"
   ```

3. **Task 3:** Create Area model

   ```bash
   git commit -m "feat: create Area model with district relationship and geolocation"
   ```

4. **Task 4:** Update User model

   ```bash
   git commit -m "feat: add default location fields to User model"
   ```

5. **Task 5:** Update ParkingLot model

   ```bash
   git commit -m "feat: update ParkingLot model with area_id and coordinates"
   ```

6. **Task 6:** Update model associations

   ```bash
   git commit -m "feat: configure location hierarchy associations in models/index.js"
   ```

7. **Task 7:** Create seed data
   ```bash
   git commit -m "feat: add Bangladesh location seed data (divisions, districts, areas)"
   ```

### Final Push

```bash
# After all tasks complete
git push origin feat/location-hierarchy
```

---

## Tips

### Check Current Branch

```bash
git branch
# * feat/location-hierarchy  ← You're here
#   main
```

### View Commit History

```bash
git log --oneline
```

### Undo Last Commit (if not pushed)

```bash
git reset --soft HEAD~1
```

### View Changes Before Committing

```bash
git diff
git status
```

### Stage Specific Files

```bash
git add models/Division.js
git add models/District.js
git commit -m "feat: create Division and District models"
```

---

## Emergency: If Something Goes Wrong

### Discard All Changes

```bash
git checkout -- .
```

### Switch Back to Main (Abandon Feature)

```bash
git checkout main
git branch -D feat/location-hierarchy  # Force delete
```

### Recover Deleted Branch (if not pushed)

```bash
git reflog  # Find the commit hash
git checkout -b feat/location-hierarchy <commit-hash>
```

---

**Last Updated:** October 8, 2025
**Current Feature:** Location Hierarchy
**Branch:** `feat/location-hierarchy`
