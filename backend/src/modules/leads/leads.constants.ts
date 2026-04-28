/**
 * Explicit Lead Pipeline Transition Map
 * Defines all valid stage transitions in the sales pipeline
 */

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  // Initial entry points
  'New': ['First Call'],
  
  // Main sequential flow
  'First Call': ['Demo Scheduled'],
  'Demo Scheduled': ['Demo Completed', 'Demo Postponed'],
  
  // Demo completion and follow-up loop
  'Demo Completed': ['Not Interested', 'Proposal Shared'],
  'Demo Postponed': ['Demo Completed', 'Demo Postponed'], // Allow follow-up loop
  
  // Proposal flow
  'Proposal Shared': ['Negotiation'],
  'Negotiation': ['Deal Closed', 'PS & Dropped'],
  
  // Terminal states (no further transitions)
  'Not Interested': [],
  'PS & Dropped': [],
  'Deal Closed': [],
};

/**
 * Stages that require follow-up task creation
 */
export const FOLLOWUP_TRIGGER_STAGES = ['Demo Postponed'];

/**
 * Notification triggers - stages where notifications should be sent
 */
export const NOTIFY_STAGES = ['Demo Postponed', 'PS & Dropped', 'Not Interested', 'Deal Closed'];

/**
 * Branch stages - stages excluded from sequential pipeline checks
 */
export const BRANCH_STAGES = ['Demo Postponed', 'PS & Dropped', 'Not Interested'];

/**
 * Sequential stages - main pipeline stages that enforce ordering
 */
export const SEQUENTIAL_STAGES = ['New', 'First Call', 'Demo Scheduled', 'Demo Completed', 'Proposal Shared', 'Negotiation'];

/**
 * Validate if a transition is allowed
 * @param fromMilestoneId - Current milestone ID
 * @param toMilestoneId - Target milestone ID
 * @param milestoneName - Current milestone name
 * @param targetMilestoneName - Target milestone name
 * @returns true if transition is allowed
 */
export function isTransitionAllowed(
  fromMilestoneId: string | null | undefined,
  toMilestoneId: string,
  milestoneName: string | null | undefined,
  targetMilestoneName: string
): boolean {
  if (!milestoneName) {
    // If no current milestone, only 'New' → 'First Call' is valid
    return targetMilestoneName === 'First Call';
  }

  const allowedNextStages = ALLOWED_TRANSITIONS[milestoneName] || [];
  return allowedNextStages.includes(targetMilestoneName);
}

/**
 * Check if this is a sequential stage (for enforcing order)
 */
export function isSequentialStage(milestoneName: string): boolean {
  return SEQUENTIAL_STAGES.includes(milestoneName);
}

/**
 * Get notification message for stage change
 */
export function getNotificationMessage(milestoneName: string, companyName: string): { text: string; type: string } {
  const messages: Record<string, { text: string; type: string }> = {
    'Demo Postponed': {
      text: `Demo postponed for "${companyName}" — follow up to reschedule.`,
      type: 'warning',
    },
    'PS & Dropped': {
      text: `Lead "${companyName}" dropped after proposal shared.`,
      type: 'warning',
    },
    'Not Interested': {
      text: `Lead "${companyName}" marked as Not Interested.`,
      type: 'danger',
    },
    'Deal Closed': {
      text: `🎉 Deal closed for "${companyName}"! Great work.`,
      type: 'success',
    },
  };

  return messages[milestoneName] || { text: '', type: 'info' };
}
