/**
 * GET /
 * Portfolio
 */
exports.getPortfolio = (req, res) => {
  res.render('portfolio', {
    title: 'Portfolio'
  });
};
