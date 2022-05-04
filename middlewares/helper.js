exports.parseData = (req, res, next) => {
    const { includes } = req.body;
    if (includes) req.body.includes = JSON.parse(includes);
    next();
  };
  