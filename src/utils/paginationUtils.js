const getPaginationOptions = (page, limit) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const offset = (pageNum - 1) * limitNum;
  return { limit: limitNum, offset };
};

module.exports = {
  getPaginationOptions,
};