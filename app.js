const express = require('express');
require('dotenv').config();
const app = express();
const port = 9015;
const postRouter = require('./routers/posts');
const authRouter = require('./routers/auth');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');
const morgan = require('morgan');

app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

app.get('/', (req, res) => {
  res.send(
    `<h1>Benvenuto nel mio Blog! Qui potrai trovare tutte le news sulla tua esperienza in cucina!</h1>`
  );
});
app.use('/posts', postRouter);

app.use('/auth', authRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server http://localhost:${port}`);
});
