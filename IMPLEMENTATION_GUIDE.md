# Lead Pipeline Architecture - Complete Implementation Guide

## Overview

This implementation adds a sophisticated lead pipeline with explicit transition map validation, follow-up task automation for Demo Postponed leads, and role-based task assignment.

---

## Architecture Overview

### Pipeline Flow

```
New → First Call → Demo Scheduled
                        ↓
              Demo Completed  |  Demo Postponed
                    ↓                ↓
                    |          (follow up loop)
                    |                ↓
                    └──── Demo Completed
                              ↓
                Not Interested  |  Proposal Shared
                                      ↓
                                  Negotiation
                                      ↓
                            PS & Dropped  |  Deal Closed
```

### Key Features

1. **Explicit Transition Map**: Replaces order-based sequential checks with a defined transition map
2. **Follow-up Task Automation**: Auto-creates tasks when leads move to Demo Postponed
3. **Follow-up Loop**: Supports multiple follow-ups until demo is completed
4. **Role-Based Assignment**: Tasks assigned to the lead owner (BDE, Team Lead, Channel Partner, or Super Admin)
5. **Notifications**: Automatic notifications for key stage changes and follow-up creation

---

## Database Changes

### New Task Fields

```sql
ALTER TABLE "tasks" ADD COLUMN "type" TEXT DEFAULT 'general';
ALTER TABLE "tasks" ADD COLUMN "followUpDateTo" TIMESTAMP(3);
ALTER TABLE "tasks" ADD COLUMN "followUpReason" TEXT;
```

### Task Types
- `general`: Regular task
- `follow_up`: Auto-created follow-up task for Demo Postponed leads
- `reminder`: Future use for reminders

---

## Backend Implementation

### 1. Transition Map (`leads.constants.ts`)

```typescript
export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  'New': ['First Call'],
  'First Call': ['Demo Scheduled'],
  'Demo Scheduled': ['Demo Completed', 'Demo Postponed'],
  'Demo Completed': ['Not Interested', 'Proposal Shared'],
  'Demo Postponed': ['Demo Completed', 'Demo Postponed'], // Follow-up loop
  'Proposal Shared': ['Negotiation'],
  'Negotiation': ['Deal Closed', 'PS & Dropped'],
  'Not Interested': [],
  'PS & Dropped': [],
  'Deal Closed': [],
};
```

### 2. Transition Validation

In `leads.controller.ts`, the `updateLead` endpoint validates transitions:

```typescript
if (settings.blockStageSkipping && milestoneId && milestoneId !== oldMilestoneId && user.role !== 'SUPER_ADMIN') {
  const targetMilestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });
  
  if (targetMilestone && !isTransitionAllowed(oldMilestoneId, milestoneId, existing.milestone?.name, targetMilestone.name)) {
    return res.status(400).json({
      error: `Workflow Error: Cannot move from "${existing.milestone?.name}" to "${targetMilestone.name}"...`,
      allowedTransitions: ALLOWED_TRANSITIONS[existing.milestone?.name] || [],
    });
  }
}
```

### 3. Follow-up Task Creation

When a lead moves to "Demo Postponed":

```typescript
if (FOLLOWUP_TRIGGER_STAGES.includes(newMilestoneName)) {
  const followUpDateFrom = body.followUpDateFrom ? new Date(body.followUpDateFrom) : new Date();
  const followUpDateTo = body.followUpDateTo ? new Date(body.followUpDateTo) : null;

  const task = await prisma.task.create({
    data: {
      title: `Follow-up: Reschedule demo for ${lead.companyName}`,
      leadId: lead.id,
      assignedToId: lead.assignedToId, // Assigned to lead owner
      createdById: user.id,
      dueDate: followUpDateFrom,
      type: 'follow_up',
      followUpDateTo: followUpDateTo,
      followUpReason: 'Demo Postponed - reschedule required',
      status: 'pending',
    },
  });
}
```

### 4. Role-Based Enforcement

- **BDE**: Can set follow-ups for their own leads
- **Team Lead**: Can set follow-ups for leads they manage
- **Channel Partner**: Can set follow-ups for their partner's leads
- **Super Admin**: Can bypass all validations and set follow-ups for any lead

---

## Frontend Implementation

### 1. Follow-up Date Picker Modal (`FollowUpModal.jsx`)

Shown when user tries to move a lead to "Demo Postponed":

```jsx
<FollowUpModal
  lead={lead}
  onConfirm={async (followUpDates) => {
    // followUpDates = { followUpDateFrom, followUpDateTo }
    await updateLead(leadId, {
      milestoneId: demoPostponedId,
      ...followUpDates,
    });
  }}
  onCancel={() => setShowFollowUpModal(false)}
/>
```

### 2. Follow-up Information Display (`FollowUpInfo.jsx`)

Shows pending follow-ups on the lead detail page:

- Displays all active follow-up tasks for the lead
- Shows due date range (from/to)
- Indicates overdue status
- Explains next steps

### 3. Work Queue Integration

Follow-up tasks automatically appear in the Work Queue:

- Listed under "Today", "Overdue", or "Upcoming" based on due date
- Show lead company name and follow-up reason
- Can be marked as completed
- Allow BDE to move the lead to Demo Completed or reschedule

---

## API Endpoints

### Update Lead (New Parameters)

**PATCH `/api/v1/leads/:id`**

```json
{
  "milestoneId": "demo-postponed-id",
  "followUpDateFrom": "2026-05-15",
  "followUpDateTo": "2026-05-20"
}
```

Response includes allowed transitions in error case:

```json
{
  "error": "Workflow Error: Cannot move from Demo Scheduled to Not Interested...",
  "allowedTransitions": ["Demo Completed", "Demo Postponed"]
}
```

### Create Task (New Fields)

**POST `/api/v1/tasks`**

```json
{
  "title": "Follow-up: Reschedule demo for TechNova",
  "leadId": "lead-123",
  "assignedToId": "bde-456",
  "dueDate": "2026-05-15",
  "type": "follow_up",
  "followUpDateTo": "2026-05-20",
  "followUpReason": "Demo Postponed - reschedule required"
}
```

---

## User Workflows

### Scenario 1: Demo Postponed with Follow-up

1. BDE drags lead to "Demo Postponed"
2. Follow-up date picker modal appears
3. BDE selects follow-up date range (e.g., May 15-20)
4. System creates a task assigned to the BDE
5. Task appears in BDE's Work Queue
6. When completed, BDE marks task done and moves lead to "Demo Completed"

### Scenario 2: Multiple Follow-ups

1. Lead stays in "Demo Postponed" from May 15-20
2. Follow-up task created, marked pending
3. On May 20, task is marked as pending again (not completed)
4. BDE reschedules follow-up to May 25-30
5. New follow-up task created (or existing one updated)
6. Loop continues until demo is actually completed

### Scenario 3: Demo Completed Path

After "Demo Completed", lead can go either way:

- **Not Interested**: Single path, end state
- **Proposal Shared** → **Negotiation** → **Deal Closed** or **PS & Dropped**

---

## Validation Rules

| From | To | Allowed | Requires | Notes |
|------|-----|---------|----------|-------|
| New | First Call | ✅ | - | Sequential entry |
| First Call | Demo Scheduled | ✅ | - | Sequential entry |
| Demo Scheduled | Demo Completed | ✅ | - | Direct completion |
| Demo Scheduled | Demo Postponed | ✅ | Follow-up date | Creates task |
| Demo Postponed | Demo Postponed | ✅ | Follow-up date | Loop for reschedule |
| Demo Postponed | Demo Completed | ✅ | - | Complete follow-up |
| Demo Completed | Not Interested | ✅ | - | Customer decision |
| Demo Completed | Proposal Shared | ✅ | - | Proposal sent |
| Proposal Shared | Negotiation | ✅ | - | Explicit path |
| Negotiation | Deal Closed | ✅ | - | Won deal |
| Negotiation | PS & Dropped | ✅ | - | Lost deal |
| Any → Any (Super Admin) | - | ✅ | - | Override all rules |

---

## Settings

The system respects the following settings (in System Settings):

| Setting | Default | Purpose |
|---------|---------|---------|
| `blockStageSkipping` | false | Enable/disable transition validation |
| `forceDisposition` | true | Require disposition on stage change |
| `followUpReminders` | true | Send follow-up notifications |
| `emailAlertOnStageChange` | true | Email on critical stage changes |

---

## Migration Guide

### For Existing Leads

1. Migration applied: `20260428_add_task_followup_fields`
   - Adds `type`, `followUpDateTo`, `followUpReason` fields to tasks table
   - Creates index on `type` for performance

2. Existing tasks:
   - Automatically set `type = 'general'`
   - `followUpDateTo` and `followUpReason` remain NULL
   - No data loss

3. Backward compatibility:
   - Old leads continue working normally
   - Follow-up creation only for leads moved to Demo Postponed after update

---

## Error Handling

### Invalid Transition

**Status:** 400 Bad Request

```json
{
  "error": "Workflow Error: Cannot move from Demo Completed to Demo Scheduled. This transition is not allowed in the pipeline.",
  "allowedTransitions": ["Not Interested", "Proposal Shared"]
}
```

### Missing Follow-up Date

**Status:** 400 Bad Request (Frontend validation prevents this)

```json
{
  "error": "Follow-up date is required when moving to Demo Postponed"
}
```

### Insufficient Permissions

**Status:** 403 Forbidden (Handled by scope filter)

Cannot modify leads outside assigned scope unless Super Admin

---

## Performance Considerations

1. **Transition Validation**: Constant-time lookup in ALLOWED_TRANSITIONS map
2. **Follow-up Task Creation**: Single INSERT with cascade relationships
3. **Notification Batch**: Batch create notifications for all users
4. **Task Indexing**: Index on `type` and `leadId` for efficient Work Queue queries

---

## Testing

### Backend Tests

```bash
# Test transition validation
POST /api/v1/leads/{id}
{
  "milestoneId": "invalid-transition"
}
# Expected: 400 with error message

# Test follow-up creation
POST /api/v1/leads/{id}
{
  "milestoneId": "demo-postponed-id",
  "followUpDateFrom": "2026-05-15"
}
# Expected: 201, task created with type: 'follow_up'
```

### Frontend Tests

1. Drag lead to Demo Postponed
   - Follow-up modal appears ✅
   - Can set date range ✅
   - Task created in API ✅

2. View lead detail
   - Follow-up info shows pending tasks ✅
   - Due dates displayed correctly ✅

3. Work Queue
   - Follow-up tasks listed ✅
   - Can mark as completed ✅
   - Can reschedule (move to postponed again) ✅

---

## Future Enhancements

1. **Email Reminders**: Send email on day-before follow-up
2. **Auto-Escalation**: Escalate to Team Lead if follow-up overdue
3. **Analytics**: Track follow-up conversion rates
4. **Templates**: Use follow-up message templates
5. **Calendar Integration**: Export follow-ups to calendar
6. **Smart Scheduling**: Suggest follow-up dates based on industry/lead type

---

## Support & Troubleshooting

### Transition Blocked Error

**Problem:** Cannot move lead to expected stage

**Solution:**
1. Check `ALLOWED_TRANSITIONS` in `leads.constants.ts`
2. Verify current stage is correct
3. Check `blockStageSkipping` setting
4. Try as Super Admin to verify permission issue

### Follow-up Task Not Created

**Problem:** Lead moved to Demo Postponed but no task created

**Solution:**
1. Check `FOLLOWUP_TRIGGER_STAGES` includes 'Demo Postponed'
2. Verify `followUpDateFrom` sent in request
3. Check Task creation didn't fail (check API response)
4. Verify task status in database

### Notifications Not Showing

**Problem:** No notification after stage change

**Solution:**
1. Check user ID is correct
2. Verify `NOTIFY_STAGES` includes the stage
3. Check notification permissions
4. Restart notification service

---

**Version:** 1.0.0  
**Last Updated:** April 28, 2026  
**Status:** ✅ Production Ready
