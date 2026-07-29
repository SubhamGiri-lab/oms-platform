export const formatCurrency = (value) => {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatCompactNumber = (value) => {
  const amount = Number(value ?? 0);
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  }
  return String(amount);
};

export const formatDateShort = (value) => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

export const getStatusBadgeClass = (status = '') => {
  const statusMap = {
    pending: 'badge-warning',
    processing: 'badge-info',
    shipped: 'badge-neutral',
    delivered: 'badge-success',
    cancelled: 'badge-error'
  };

  return statusMap[status?.toLowerCase()] || 'badge-neutral';
};

export const getStatusLabel = (status = '') => {
  if (!status) {
    return 'Unknown';
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const buildSalesChartData = (series = []) => {
  if (!Array.isArray(series) || series.length === 0) {
    return [];
  }

  return series.map((entry) => ({
    name: entry.date || entry.name || 'Unknown',
    revenue: Number(entry.revenue || 0),
    orders: Number(entry.orders || 0)
  }));
};
