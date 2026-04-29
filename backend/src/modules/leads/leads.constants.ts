/**
 * Explicit Lead Pipeline Transition Map
 * Defines all valid stage transitions in the sales pipeline
 */

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  'New':             ['First Call'],
  'First Call':      ['Demo Scheduled', 'Not Interested'],
  'Demo Scheduled':  ['Demo Completed', 'Demo Postponed', 'Not Interested'],
  'Demo Postponed':  ['Demo Postponed', 'Demo Completed', 'Not Interested'],
  'Demo Completed':  ['Proposal Shared', 'Not Interested'],
  'Proposal Shared': ['Negotiation', 'Not Interested'],
  'Negotiation':     ['Deal Closed', 'PS & Dropped', 'Not Interested'],
  'PS & Dropped':    [],
  'Not Interested':  [],
  'Deal Closed':     [],
};

export const FOLLOWUP_TRIGGER_STAGES = ['Demo Postponed'];

export const NOTIFY_STAGES = ['Demo Postponed', 'PS & Dropped', 'Not Interested', 'Deal Closed'];

export const BRANCH_STAGES = ['Demo Postponed', 'PS & Dropped', 'Not Interested'];

export const SEQUENTIAL_STAGES = ['New', 'First Call', 'Demo Scheduled', 'Demo Completed', 'Proposal Shared', 'Negotiation'];

export function isTransitionAllowed(
  fromMilestoneId: string | null | undefined,
  toMilestoneId: string,
  milestoneName: string | null | undefined,
  targetMilestoneName: string
): boolean {
  if (!milestoneName) return true; // No current milestone, allow any
  const allowedNextStages = ALLOWED_TRANSITIONS[milestoneName] || [];
  return allowedNextStages.includes(targetMilestoneName);
}

export function getNotificationMessage(milestoneName: string, companyName: string): { text: string; type: string } {
  const messages: Record<string, { text: string; type: string }> = {
    'Demo Postponed':  { text: `Demo postponed for "${companyName}" — follow up to reschedule.`, type: 'warning' },
    'PS & Dropped':    { text: `Lead "${companyName}" dropped after proposal shared.`, type: 'warning' },
    'Not Interested':  { text: `Lead "${companyName}" marked as Not Interested.`, type: 'danger' },
    'Deal Closed':     { text: `🎉 Deal closed for "${companyName}"! Great work.`, type: 'success' },
  };
  return messages[milestoneName] || { text: '', type: 'info' };
}
