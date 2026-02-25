// returns ["2025-12-20", "2025-12-21", "2025-12-22"]
function getDateStringsBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end)) return [];
  if (start > end) return [];

  const days = [];
  const d = new Date(start);

  while (d <= end) {
    days.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }

  return days;
}

module.exports = { getDateStringsBetween };
