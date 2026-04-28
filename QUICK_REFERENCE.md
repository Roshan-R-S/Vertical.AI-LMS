# Quick Reference - Lead Pipeline Implementation

## 🎯 Core Concepts

### The 3 Key Changes

1. **Transition Map Validation**
   - What: Explicit allowed transitions for each stage
   - Why: Prevents invalid stage skipping, supports branching
   - Where: `leads.constants.ts`

2. **Follow-up Task Automation**
   - What: Auto-creates task when lead moves to Demo Postponed
   - Why: Tracks follow-ups, appears in Work Queue, ensures accountability
   - Where: `leads.controller.ts` (lines 260-285)

3. **Follow-up UI Components**
   - What: Date picker modal + follow-up info display
   - Why: Better UX, shows follow-up details on lead page
   - Where: `FollowUpModal.jsx`, `FollowUpInfo.jsx`

---

## 🔑 Key Constants (leads.constants.ts)

```typescript
ALLOWED_TRANSITIONS = {
  'New': ['First Call'],
  'First Call': ['Demo Scheduled'],
  'Demo Scheduled': ['Demo Completed', 'Demo Postponed'],
  'Demo Completed': ['Not Interested', 'Proposal Shared'],
  'Demo Postponed': ['Demo Completed', 'Demo Postponed'],  // Loop!
  'Proposal Shared': ['Negotiation'],
  'Negotiation': ['Deal Closed', 'PS & Dropped'],
  'Not Interested': [],
  'PS & Dropped': [],
  'Deal Closed': [],
}

FOLLOWUP_TRIGGER_STAGES = ['Demo Postponed']  // Only this stage triggers task creation

NOTIFY_STAGES = ['Demo Postponed', 'PS & Dropped', 'Not Interested', 'Deal Closed']
```

---

## 🔄 Transition Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                 LEAD PIPELINE                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  New ──► First Call ──► Demo Scheduled             │
│                              │                     │
│                     ┌────────┴────────┐             │
│                     ▼                 ▼             │
│           Demo Completed      Demo Postponed       │
│                  │              (follow-up loop)   │
│                  │                  │              │
│         ┌────────┴────────┐         └──────┐       │
│         ▼                 ▼                ▼       │
│   Not Interested   Proposal Shared ──► Demo Completed
│   (END)                 │                 │        │
│                         ▼                 │        │
│                    Negotiation ◄──────────┘        │
│                         │                         │
│              ┌──────────┴──────────┐               │
│              ▼                     ▼               │
│         Deal Closed           PS & Dropped        │
│            (END)                 (END)            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Follow-up Task Schema

When created:
```json
{
  "id": "task-xyz",
  "title": "Follow-up: Reschedule demo for TechNova",
  "leadId": "lead-123",
  "assignedToId": "bde-456",
  "dueDate": "2026-05-15",
  "followUpDateTo": "2026-05-20",
  "followUpReason": "Demo Postponed - reschedule required",
  "type": "follow_up",
  "status": "pending"
}
```

---

## 🎯 User Journeys

### Journey 1: Successful Demo → Proposal

```
Demo Scheduled
    ↓
[BDE clicks → leads to demo on time]
    ↓
Demo Completed
    ↓
Proposal Shared
    ↓
Negotiation
    ↓
Deal Closed ✅
```

### Journey 2: Demo Needs Rescheduling

```
Demo Scheduled
    ↓
[Customer asks to reschedule]
    ↓
Demo Postponed ← 📋 FOLLOW-UP TASK CREATED
    ↓
[Task appears in BDE's Work Queue]
    ↓
[BDE completes follow-up by May 20]
    ↓
Demo Completed → Proposal Shared → Deal Closed ✅
```

### Journey 3: Multiple Reschedules

```
Demo Scheduled
    ↓
Demo Postponed ← 📋 Task 1 (May 15-20)
    ↓
[Still not ready]
    ↓
Demo Postponed ← 📋 Task 2 (May 22-25)
    ↓
[Finally ready]
    ↓
Demo Completed ✅
```

### Journey 4: Not Interested

```
Demo Completed
    ↓
[Customer not interested]
    ↓
Not Interested ← 🔔 NOTIFICATION SENT
    ↓
[END - No further movement]
```

---

## 🛠️ Developer Cheatsheet

### Check if transition is valid

```typescript
import { isTransitionAllowed, ALLOWED_TRANSITIONS } from './leads.constants';

// Option 1: Use helper
const valid = isTransitionAllowed(
  oldMilestoneId,
  newMilestoneId,
  'Demo Scheduled',
  'Demo Completed'
);

// Option 2: Direct check
const allowed = ALLOWED_TRANSITIONS['Demo Scheduled'];
const valid = allowed.includes('Demo Completed'); // true
```

### Get notification for stage change

```typescript
import { getNotificationMessage } from './leads.constants';

const { text, type } = getNotificationMessage('Demo Postponed', 'TechNova Inc');
// Returns: {
//   text: "Demo postponed for \"TechNova Inc\" — follow up to reschedule.",
//   type: "warning"
// }
```

### Create follow-up task (backend)

```typescript
const task = await prisma.task.create({
  data: {
    title: `Follow-up: Reschedule demo for ${lead.companyName}`,
    leadId: lead.id,
    assignedToId: lead.assignedToId,
    dueDate: new Date(followUpDateFrom),
    followUpDateTo: followUpDateTo ? new Date(followUpDateTo) : null,
    type: 'follow_up',
    followUpReason: 'Demo Postponed - reschedule required',
    status: 'pending',
  },
});
```

### Query follow-up tasks

```typescript
// Get all pending follow-ups for a lead
const followUps = await prisma.task.findMany({
  where: {
    leadId: leadId,
    type: 'follow_up',
    status: 'pending',
  },
  include: { assignedTo: true },
});

// Get all overdue follow-ups
const overdue = await prisma.task.findMany({
  where: {
    type: 'follow_up',
    dueDate: { lt: new Date() },
    status: { not: 'completed' },
  },
});
```

---

## 🎨 Frontend Patterns

### Show Follow-up Modal

```jsx
const [showModal, setShowModal] = useState(false);

<FollowUpModal
  lead={lead}
  onConfirm={async (dates) => {
    await updateLead(leadId, {
      milestoneId: demoPostponedId,
      ...dates // { followUpDateFrom, followUpDateTo }
    });
    setShowModal(false);
  }}
  onCancel={() => setShowModal(false)}
/>
```

### Display Follow-up Info

```jsx
<FollowUpInfo 
  lead={lead}
  tasks={tasks}
/>
// Automatically shows if:
// - lead.milestone === 'Demo Postponed'
// - has pending follow-up tasks
```

### Filter Tasks by Type

```jsx
// Show only follow-up tasks
const followUpTasks = tasks.filter(t => t.type === 'follow_up');

// Show mixed (general + follow_up)
const allTasks = tasks.filter(t => 
  t.type === 'general' || t.type === 'follow_up'
);
```

---

## 🐛 Common Issues & Fixes

### Issue: Transition blocked unexpectedly

**Check:**
1. Is `blockStageSkipping` setting enabled?
2. Is the transition in `ALLOWED_TRANSITIONS`?
3. Is user Super Admin (should bypass)?

**Fix:**
```typescript
// Check setting
const settings = await prisma.systemSetting.findUnique({
  where: { key: 'blockStageSkipping' }
});

// Check transition
const allowed = ALLOWED_TRANSITIONS[currentStage];
console.log(allowed); // Should include target stage
```

### Issue: Follow-up task not created

**Check:**
1. Stage is "Demo Postponed"?
2. `followUpDateFrom` sent in request?
3. Task model has new fields?

**Fix:**
```typescript
// Verify migration applied
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name='tasks' AND column_name='type'
);

// Verify task created
SELECT * FROM tasks WHERE type = 'follow_up' LIMIT 5;
```

### Issue: Notifications not showing

**Check:**
1. Stage in `NOTIFY_STAGES`?
2. User ID correct?
3. Notification service running?

**Fix:**
```typescript
// Check constant
console.log(NOTIFY_STAGES); // Should include your stage

// Check notifications created
SELECT * FROM notifications 
WHERE "userId" = 'user-id' 
ORDER BY "createdAt" DESC LIMIT 5;
```

---

## 📊 Database Queries

### Get all pending follow-ups

```sql
SELECT t.*, l."companyName", u."name" AS "assignedTo"
FROM tasks t
JOIN leads l ON t."leadId" = l.id
JOIN users u ON t."assignedToId" = u.id
WHERE t.type = 'follow_up'
AND t.status = 'pending'
ORDER BY t."dueDate" ASC;
```

### Get leads with active follow-ups

```sql
SELECT DISTINCT l.id, l."companyName", COUNT(t.id) as "followUpCount"
FROM leads l
JOIN tasks t ON l.id = t."leadId"
WHERE l."milestoneId" = (SELECT id FROM milestones WHERE name = 'Demo Postponed')
AND t.type = 'follow_up'
AND t.status = 'pending'
GROUP BY l.id, l."companyName"
ORDER BY "followUpCount" DESC;
```

### Get overdue follow-ups by user

```sql
SELECT u."name", COUNT(t.id) as "overdueCount"
FROM tasks t
JOIN users u ON t."assignedToId" = u.id
WHERE t.type = 'follow_up'
AND t."dueDate" < NOW()
AND t.status = 'pending'
GROUP BY u.id, u."name"
ORDER BY "overdueCount" DESC;
```

---

## 🚀 Testing Commands

### Test API: Transition Validation

```bash
curl -X PATCH http://localhost:3001/api/v1/leads/lead-123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "milestoneId": "demo-postponed-id",
    "followUpDateFrom": "2026-05-15",
    "followUpDateTo": "2026-05-20"
  }'
```

### Test API: Invalid Transition

```bash
curl -X PATCH http://localhost:3001/api/v1/leads/lead-123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "milestoneId": "not-interested-id"
  }'
# Expected: 400 Error with allowedTransitions
```

---

## 📚 File Locations

| File | Purpose |
|------|---------|
| `leads.constants.ts` | Transition map & helpers |
| `leads.controller.ts` | Transition validation + follow-up creation |
| `tasks.controller.ts` | Task CRUD with new fields |
| `FollowUpModal.jsx` | Date picker for follow-ups |
| `FollowUpInfo.jsx` | Display pending follow-ups |
| `Leads.jsx` | Kanban integration |
| `schema.prisma` | Task model definition |
| `migration.sql` | Database schema changes |

---

## ✅ Verification Checklist

- [ ] Can move lead from Demo Scheduled → Demo Postponed
- [ ] Follow-up modal appears with date picker
- [ ] Task created in database
- [ ] Task appears in Work Queue
- [ ] Can move Demo Postponed → Demo Completed
- [ ] Can move Demo Postponed → Demo Postponed again
- [ ] Cannot move Demo Completed → Demo Scheduled (blocked)
- [ ] Super Admin can bypass rules
- [ ] Notifications sent correctly
- [ ] Follow-up info shows on lead detail

---

**Last Updated:** April 28, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
