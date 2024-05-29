module.exports = (req, res, next) => {
  const statusCode = 404;
  res.format({
    html: () =>
      res
        .status(statusCode)
        .send(
          '<h1>Oops! La pagina che stai cercando sembra essere introvabile.</h1>'
        ),
    json: () =>
      res.status(statusCode).json({
        statusCode,
        error: 'Pagina non Trovata',
      }),
  });
};
