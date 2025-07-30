export const monthMap = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

export function filterByTime(data, dateField, { type, date, month, year, week }) {
  return data.filter((item) => {
    const d = new Date(item[dateField]);

    if (type === "day" && date) {
      return d.toISOString().split("T")[0] === new Date(date).toISOString().split("T")[0];
    }

    if (type === "week" && week) {
      const itemWeek = getWeek(d);
      return week === itemWeek;
    }

    if (type === "month" && month && year) {
      return (
        d.getFullYear() === Number(year) &&
        d.getMonth() === monthMap[month.toLowerCase()]
      );
    }

    if (type === "year" && year) {
      return d.getFullYear() === Number(year);
    }

    return true;
  });
}

function getWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}
