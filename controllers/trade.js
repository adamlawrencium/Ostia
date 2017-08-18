/**
 * GET /
 * Home page.
 */
exports.trade = (req, res) => {
  res.render('home', {
    title: 'Home'
  });
};

/**
 * GET /
 * Home page.
 */
exports.suh = (req, res) => {
  res.send({"suh": "dude"});
};
