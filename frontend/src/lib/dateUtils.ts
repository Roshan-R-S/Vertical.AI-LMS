
export const getDateRange = (filter: 'ALL' | 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'CUSTOM', customStart?: string, customEnd?: string) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (filter) {
    case 'TODAY':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    case 'YESTERDAY':
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    case 'LAST_7_DAYS':
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    case 'CUSTOM':
      return { 
        startDate: customStart ? new Date(customStart).toISOString() : undefined, 
        endDate: customEnd ? new Date(customEnd + 'T23:59:59').toISOString() : undefined 
      };
    default:
      return { startDate: undefined, endDate: undefined };
  }
};
