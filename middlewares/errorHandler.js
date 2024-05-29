module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.format({
    html: () => res.status(statusCode).send(`Errore: ${err.message}`),
    json: () =>
      res.status(statusCode).json({
        statusCode,
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      }),
  });
};
