function getDateRangeForPeriod(period) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (period === 'current-quarter') {
    const qStartMonth = Math.floor(month / 3) * 3;
    return {
      gte: new Date(year, qStartMonth, 1),
      lte: new Date(year, qStartMonth + 3, 0, 23, 59, 59),
    };
  }

  if (period === 'current-year') {
    return {
      gte: new Date(year, 0, 1),
      lte: new Date(year, 11, 31, 23, 59, 59),
    };
  }

  if (period?.startsWith('month-')) {
    const offset = parseInt(period.split('-')[1]);
    const d = new Date(year, month - offset, 1);
    return {
      gte: d,
      lte: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
    };
  }

  return {
    gte: new Date(year, month, 1),
    lte: new Date(year, month + 1, 0, 23, 59, 59),
  };
}

const testPeriods = ['month-0', 'month-1', 'current-quarter', 'current-year'];
testPeriods.forEach(p => {
  const range = getDateRangeForPeriod(p);
  console.log(`${p}: ${range.gte.toISOString()} to ${range.lte.toISOString()}`);
});
