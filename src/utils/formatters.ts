// Format currency in Indian Rupees (INR)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date string (YYYY-MM-DD) into readable formats like "Jul 4, 2026"
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  
  // Handing time-zone offset issue by formatting local values
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC' // Keep date exact to what was entered in YYYY-MM-DD
  });
};
