export const formatIndianNumber = (num) => {
  if (!num || num === 0) return '';
  
  const number = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(number)) return '';
  
  return new Intl.NumberFormat('en-IN').format(number);
};

export const parseIndianNumber = (str) => {
  if (!str) return '';
  return str.replace(/,/g, '');
};