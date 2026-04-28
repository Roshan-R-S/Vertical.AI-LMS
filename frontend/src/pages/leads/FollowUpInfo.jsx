import { AlertCircle, Clock } from 'lucide-react';

const FollowUpInfo = ({ lead, tasks }) => {
  // Get follow-up tasks for this lead
  const followUpTasks = tasks.filter(
    (t) => t.leadId === lead?.id && t.type === 'follow_up' && t.status !== 'completed'
  );

  if (!followUpTasks.length || lead?.milestone !== 'Demo Postponed') {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex gap-3">
        <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-amber-900 m-0">Pending Follow-ups</h4>
          <div className="mt-3 space-y-2">
            {followUpTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-2 p-2 bg-white rounded border border-amber-100">
                <Clock size={14} className="text-amber-600 mt-1 flex-shrink-0" />
                <div className="flex-1 text-xs">
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-muted mt-0.5">
                    Due: <span className="font-semibold">{task.dueDate}</span>
                    {task.followUpDateTo && ` - ${task.followUpDateTo}`}
                  </p>
                  {task.followUpReason && (
                    <p className="text-muted mt-1">Reason: {task.followUpReason}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xxs font-semibold whitespace-nowrap ${
                  task.status === 'overdue'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {task.status === 'overdue' ? '⚠️ Overdue' : '⏱️ Pending'}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xxs text-amber-700 mt-3 mb-0">
            Complete the follow-up task to move the lead to Demo Completed or schedule another follow-up.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FollowUpInfo;
