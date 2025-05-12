export const f2PoolDate = (targetDate) => {
  return Math.floor(new Date(`${targetDate}T00:00:00Z`).getTime() / 1000);
};

export const f2poolEndDate = (targetDate) => {
  return Math.floor(new Date(`${targetDate}T23:59:59Z`).getTime() / 1000);
};
