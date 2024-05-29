//Importazione dei Moduli
const express = require('express');
const app = express();
const port = 9015; //Porta Ascolto
const postRouter = require('./routers/posts'); //router per le rotte dei post
const posts = require('./db/postsDb.json'); //file JSON contenente i post

app.use(express.static('public'));
app.use(express.json());

//Definizione delle rotte
app.get('/', (req, res) => {
  res.send(
    `<h1>Benvenuto nel mio Blog! Qui potrai trovare tutte le news sulla tua esperienza in cucina!</h1>`
  );
});

// router per le rotte che iniziano con '/posts'
app.use('/posts', postRouter);

//Avvio server
app.listen(port, () => {
  console.log(`Server http://localhost:${port}`); //messaggio per confermare che il server è in esecuzione
});
