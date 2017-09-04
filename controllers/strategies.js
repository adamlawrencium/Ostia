/**
 * GET /
 * Strategies
 */
exports.getStrategies = (req, res) => {
  res.render('strategy', {
    title: 'Strategies'
  });
};
