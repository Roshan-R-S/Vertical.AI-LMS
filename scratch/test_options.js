const generateFilterOptions = () => {
  const now = new Date();
  const options = [];
  
  // Last 3 months
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    options.push({ label, value: `month-${i}` });
  }
  
  // Current Quarter
  const q = Math.floor(now.getMonth() / 3) + 1;
  options.push({ label: `Q${q} ${now.getFullYear()}`, value: 'current-quarter' });
  
  // Current Year
  options.push({ label: `Year ${now.getFullYear()}`, value: 'current-year' });
  
  return options;
};

console.log(JSON.stringify(generateFilterOptions(), null, 2));
