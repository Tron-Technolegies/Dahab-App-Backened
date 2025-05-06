export const calculateReward = (hashRate) => {
  // This should be replaced with actual calculation based on:
  // - Current network difficulty
  // - Coin price
  // - Pool fees
  // - Hash rate contribution

  // Example: $0.10 per TH/s per day
  const rewardPerTHPerDay = 0.1;
  return (hashRate / 1000) * rewardPerTHPerDay;
};
