# 🚀 Quick Start: Publishing & Featuring System

## ✅ What's Complete (Backend + APIs)

### 1. Database ✅
- User roles (USER, MODERATOR, ADMIN, SUPER_ADMIN)
- Startup tiers (BRONZE, SILVER, GOLD)
- Featuring tracking (scores, performance, expiration)

### 2. Core Logic ✅
- Progressive tier validation
- Auto-scoring algorithm (0-100 points)
- Role-based access control
- Performance tracking

### 3. APIs ✅
All endpoints tested and working:
- `POST /api/startups/[id]/publish` - Publish startup
- `DELETE /api/startups/[id]/publish` - Unpublish
- `GET /api/startups/[id]/publish` - Check status
- `GET /api/admin/featured` - List featured + suggestions
- `POST /api/admin/featured` - Feature startup
- `DELETE /api/admin/featured/[id]` - Unfeature
- `PATCH /api/admin/featured/[id]` - Extend duration

### 4. Background Jobs ✅
- Daily rotation script ready
- Score update system
- Performance-based auto-extension

---

## 🎯 Immediate Next Steps (You Should Do)

### Step 1: Create Admin User (2 min)
```sql
-- Run in your database or via Prisma Studio
UPDATE users
SET role = 'ADMIN'
WHERE email = 'your@email.com';
```

Or update `admin@openrevenue.org` from seed:
```bash
pnpm db:seed  # Creates admin@openrevenue.org with ADMIN role
```

### Step 2: Test Publishing API (5 min)
```javascript
// In your browser console or API client:

// 1. Get your startup
const startups = await fetch('/api/startups').then(r => r.json());
const myStartup = startups[0];

// 2. Check publish requirements
const status = await fetch(`/api/startups/${myStartup.id}/publish`)
  .then(r => r.json());
console.log('Can publish:', status.canPublish);
console.log('Current tier:', status.currentTier);
console.log('Requirements:', status.validation.requirements);

// 3. Publish it!
const result = await fetch(`/api/startups/${myStartup.id}/publish`, {
  method: 'POST'
}).then(r => r.json());

console.log('Published!', result);
```

### Step 3: Test Admin Features (5 min)
```javascript
// As admin user:

// 1. View featured startups and suggestions
const featured = await fetch('/api/admin/featured').then(r => r.json());
console.log('Featured:', featured.featured);
console.log('Suggestions:', featured.suggestions);
console.log('Available slots:', featured.stats.availableSlots);

// 2. Feature a startup
const featureResult = await fetch('/api/admin/featured', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    startupId: 'startup-id-here',
    durationDays: 7
  })
}).then(r => r.json());

console.log('Featured!', featureResult);
```

### Step 4: Run Daily Rotation Job (2 min)
```bash
# Test the rotation manually:
pnpm tsx src/jobs/rotate-featured.ts

# Output:
# 🔄 Starting featured startups rotation...
# Found 0 expired featured startups
# 💡 Available slots: 5/5
# ⭐ Auto-featured: Demo Startup (score: 85)
# ✨ Featured 1 new startups
# ✅ Rotation complete!
```

---

## 🎨 UI Components To Build Next

### Priority 1: Visibility Settings Tab
**Location**: `/dashboard/settings` → Add new "Visibility" tab

**What to show**:
```
┌─────────────────────────────────────────────┐
│ 👑 Your Tier: GOLD                         │
│ ████████████████████░░ 85/100              │
│                                             │
│ Publishing Status: ✅ Published             │
│ Feature Score: 85 points                    │
│                                             │
│ [View Requirements] [Unpublish]             │
└─────────────────────────────────────────────┘
```

**API Call**:
```javascript
const status = await fetch(`/api/startups/${startupId}/publish`).then(r => r.json());
```

### Priority 2: Admin Dashboard
**Location**: `/admin/featured`

**What to show**:
```
Currently Featured (2/5 slots)
┌────────────────────────────────────────┐
│ Demo Startup              Score: 85    │
│ Featured until: Jan 12, 2025           │
│ 1,250 impressions • 87 clicks (6.9%)   │
│ [Extend 7 Days] [Unfeature]            │
└────────────────────────────────────────┘

Auto-Feature Suggestions
┌────────────────────────────────────────┐
│ High Growth Startup        Score: 92   │
│ ✓ Verified  ✓ High MRR  ✓ Stories     │
│ [Feature for 7 Days]                   │
└────────────────────────────────────────┘
```

**API Calls**:
```javascript
// Get data
const data = await fetch('/api/admin/featured').then(r => r.json());

// Feature a startup
await fetch('/api/admin/featured', {
  method: 'POST',
  body: JSON.stringify({ startupId: '...', durationDays: 7 })
});
```

### Priority 3: Featured Badge Component
**Location**: Reusable component for startup cards

**What to show**:
```jsx
{startup.isFeatured && (
  <Badge className="bg-yellow-500">⭐ Featured</Badge>
)}

{startup.tier === 'GOLD' && (
  <Badge className="bg-yellow-600">👑 Gold</Badge>
)}
```

---

## 📊 Progressive Tier System

### How It Works

**Your startup automatically gets a tier based on what you've completed**:

```
BRONZE (Can Publish) ─── 4 requirements
  ├─ ✅ Name & description
  ├─ ✅ 1+ connection
  ├─ ✅ Some revenue data
  └─ ✅ Privacy configured

SILVER (Enhanced) ─── +4 requirements
  ├─ ✅ All Bronze
  ├─ ✅ Logo uploaded
  ├─ ✅ Category selected
  └─ ✅ 3+ months data

GOLD (Premium) ─── +5 requirements
  ├─ ✅ All Silver
  ├─ ✅ Verified connection
  ├─ ✅ 6+ months data
  ├─ ✅ Has milestone
  ├─ ✅ Has story
  └─ ✅ Website URL
```

### Tier Benefits

| Feature | Bronze | Silver | Gold |
|---------|--------|--------|------|
| Can publish | ✅ | ✅ | ✅ |
| Leaderboard | ✅ | ✅ | ✅ |
| Search ranking | Low | Medium | High |
| Featured eligible | ❌ | ❌ | ✅ |
| Verified badge | ❌ | ❌ | ✅ |

---

## 🏆 Feature Score Breakdown

**Total: 100 points**

1. **Trust Level** (25 pts)
   - Platform verified: 25
   - Self-reported: 10

2. **Revenue** (20 pts)
   - ≥$50k MRR: 20
   - ≥$20k MRR: 15
   - ≥$10k MRR: 10
   - ≥$5k MRR: 5

3. **Growth Rate** (20 pts)
   - ≥30% MoM: 20
   - ≥20% MoM: 15
   - ≥10% MoM: 10
   - ≥5% MoM: 5

4. **Engagement** (15 pts)
   - 2+ stories: 5
   - 3+ milestones: 5
   - Recent activity: 5

5. **Completeness** (10 pts)
   - Logo: 3
   - Description >100 chars: 3
   - Website: 2
   - Category: 2

6. **Recency** (10 pts)
   - <30 days old: 10
   - <60 days old: 5
   - <90 days old: 2

**Minimum to be featured: 50 points**

---

## 🔄 Daily Rotation Rules

### Featuring
- **Max slots**: 5 startups
- **Duration**: Up to 7 days
- **Selection**: Top scoring suggestions auto-featured

### Auto-Extension
Happens automatically if:
- Click rate ≥ 5%, OR
- Total clicks ≥ 100

Extends by: 7 more days

### Removal
Happens when:
- Featured duration expires, AND
- Doesn't meet auto-extension criteria

---

## 🐛 Common Issues & Solutions

### "Can't publish - requirements not met"
**Solution**: Check requirements
```javascript
const status = await fetch(`/api/startups/${id}/publish`).then(r => r.json());
console.log('Missing:', status.validation.requirements.filter(r => !r.met));
```

### "Forbidden - Requires ADMIN role"
**Solution**: Update your role in database
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### "Maximum featured slots reached"
**Solution**: Unfeature a startup first
```javascript
await fetch(`/api/admin/featured/${startupId}`, { method: 'DELETE' });
```

---

## 🎓 Example Workflows

### Workflow 1: User Publishes Startup
1. User completes Bronze requirements
2. Clicks "Publish" in Visibility settings
3. System validates and publishes
4. Startup appears on leaderboard
5. Daily job calculates feature score

### Workflow 2: Admin Features Startup
1. Admin views suggestions (scored 50+)
2. Reviews startup details
3. Clicks "Feature for 7 Days"
4. Startup shows on homepage
5. Performance tracked automatically

### Workflow 3: Auto-Rotation
1. Daily job runs at 12 AM
2. Checks for expired featured startups
3. Evaluates performance (CTR)
4. Auto-extends high performers
5. Removes low performers
6. Fills empty slots with top scores

---

## 📁 Files Created

```
✅ Database
├── prisma/schema.prisma (updated)
└── prisma/seed.ts (updated)

✅ Core Libraries
├── src/lib/auth/roles.ts
├── src/lib/publishing/tier-validation.ts
└── src/lib/featuring/score-calculator.ts

✅ API Routes
├── src/app/api/startups/[id]/publish/route.ts
├── src/app/api/admin/featured/route.ts
└── src/app/api/admin/featured/[id]/route.ts

✅ Background Jobs
└── src/jobs/rotate-featured.ts

✅ Documentation
├── PUBLISHING_FEATURING_SYSTEM.md
└── QUICK_START_PUBLISHING.md (this file)
```

---

## 🚦 Status Summary

| Component | Status |
|-----------|--------|
| Database Schema | ✅ Complete |
| User Roles | ✅ Complete |
| Progressive Tiers | ✅ Complete |
| Score Calculator | ✅ Complete |
| Publishing API | ✅ Complete |
| Admin API | ✅ Complete |
| Background Jobs | ✅ Complete |
| Documentation | ✅ Complete |
| | |
| Visibility UI | ⏳ To Do |
| Admin Dashboard | ⏳ To Do |
| Featured Badges | ⏳ To Do |

---

## 🎉 You're Ready!

Everything is working. Test the APIs, then build the UI components when you're ready!

**Questions?** Check `PUBLISHING_FEATURING_SYSTEM.md` for detailed docs.
