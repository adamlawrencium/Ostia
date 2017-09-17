/**
 * GET /
 * Strategies
 */
exports.getStrategies = (req, res) => {
  res.render('strategy', {
    title: 'Strategies'
  });
};

// TODO
exports.deployStrategy = (req, res) => {
  res.send('boop');
};
