/**
 * GET /
 * Strategies
 */
exports.getStrategies = (req, res) => {
  res.render('portfolio', {
    title: 'Portfolio'
  });
};
