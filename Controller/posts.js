// Importa l'array dei post dal file 'postsDb.json'
const posts = require('../db/postsDb.json');
//Gestione dei percorsi
const path = require('path');
//modulo per la gestione dei file
const fs = require('fs');
//modulo uuid per generare identificatori univoci
const { v4: uuidv4 } = require('uuid');

const index = (req, res) => {
  //stringa HTML che conterrà una lista di post
  let html = '<ul>';
  // Iteriamo attraverso ogni post nel file JSON
  posts.forEach((post) => {
    //Per ogni post, aggiungiamo un elemento <li> con un link al post specifico, usando il suo slug
    html += `<li><a href="/posts/${post.slug}">${post.title}</a></li>`;
  });
  //Chiusura Html
  html += '</ul>';
  //Inviamo risposta con contenuto dell'HTML
  res.send(html);
};
//Funzione per gestire la richiesta per visualizzare un singolo post
const show = (req, res) => {
  // post nel file JSON che corrisponde allo slug passato come parametro nella richiesta
  const post = posts.find((p) => p.slug === req.params.slug);
  //Se il post è trovato, crea una stringa HTML
  if (post) {
    //URL completo per l'immagine del post
    const imageUrl = `${req.protocol}://${req.get('host')}/${post.image}`;
    //URL completo per il download dell'immagine del post
    const downloadUrl = `${req.protocol}://${req.get('host')}/posts/${
      post.slug
    }/download`;
    let html = '<div>';
    //Variabile per contenere HTML
    html += `<div>
            <img src="/${post.image}" alt="${post.title}">
            <div class="post-content">
              <h2>${post.title}</h2>
              <p>${post.content}</p>
               <p><strong>IMAGE URL:</strong> <a href="${imageUrl}" target="_blank">${imageUrl}</a></p>
               <p><strong>Download Image URL:</strong> <a href="${downloadUrl}" target="_blank">${downloadUrl}</a></p>
            </div>
            </div>
`;
    html += '</div>';
    //Inviamo risposta con contenuto dell'HTML
    res.send(html);
  } else {
    //rispondiamo con un errore 404 e un messaggio JSON
    res.status(404).json({ error: 'Post not found' });
  }
};

// Funzione per gestire la richiesta per creare un nuovo post
const create = (req, res) => {
  // Formattiamo la risposta in base al tipo di richiesta accettata
  res.format({
    html: () => {
      // Se tipo di richiesta accetta HTML, inviamo una pagina HTML con un messaggio
      res.send('<h1>Qui potrai creare i tuoi post</h1>');
    },
    default: () => {
      // Se il tipo di richiesta non è accettato, inviamo un errore 406 (Not Acceptable)
      res.status(406).send('Not Acceptable');
    },
  });
};

// download immagine del post
const downloadImage = (req, res) => {
  // Decodifica lo slug
  const slug = decodeURIComponent(req.params.slug);
  // Cerca il post nel file JSON che corrisponde allo slug decodificato
  const post = posts.find((p) => p.slug === slug);
  //Quando il post viene trovato
  if (post) {
    // restituisce il percorso completo dell'immagine
    const imagePath = path.join(__dirname, '../public', post.image);
    res.download(imagePath, (err) => {
      if (err) {
        // Log errore 500
        res.status(500).json({ error: "Errore nel download dell'immagine" });
      }
    });
    //post non viene trovato errore 500
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
};

const store = (req, res) => {
  const { title, content, image } = req.body; // Assumendo che l'immagine sia un URL o percorso

  if (!title || !content || !image) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  // nuovo post con ID univoco, titolo, contenuto, immagine e slug
  const newPost = {
    id: uuidv4(),
    title,
    content,
    image,
    slug: title
      .toLowerCase() //tutto in lettere minuscole
      .replace(/ /g, '-') //Sostituisce spazi con trattini, e tutti gli spazi nel titolo non solo il primo
      .replace(/[^\w-]+/g, ''), //evito i caratteri che non sono lettere numeri trattini bassi o trattini
  };
  // Aggiunge Post all'Array di post
  posts.push(newPost);

  // Scrivi i nuovi dati nel file JSON (simulazione di un database)
  fs.writeFile(
    path.join(__dirname, '../db/postsDb.json'),
    JSON.stringify(posts, null, 2),
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to save post' });
      }

      res.format({
        html: () => {
          res.redirect(`/posts/${newPost.slug}`);
        },
        json: () => {
          res.status(201).json(newPost);
        },
        default: () => {
          res.status(406).send('Not Acceptable');
        },
      });
    }
  );
};

// Funzione per eliminare un post
const destroy = (req, res) => {
  //slug del post dalla richiesta
  const { slug } = req.params;
  //Trova l'indice del post nell'array dei post
  const postIndex = posts.findIndex((p) => p.slug === slug);
  //post non è stato trovato, restituisci un errore 404
  if (postIndex === -1) {
    return res.status(404).json({ error: 'Il tuo post non è stato trovato!' });
  }
  //Rimuovi il post dall'array e ottieni il post rimosso
  const [deletedPost] = posts.splice(postIndex, 1);
  //dati aggiornati nel file JSON
  fs.writeFile(
    path.join(__dirname, '../db/postsDb.json'),
    JSON.stringify(posts, null, 2),
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete post' });
      }

      res.format({
        //risposta Html, reindirizza alla pagina degli elenchi dei post
        html: () => {
          res.redirect('/posts');
        },
        //testo semplice, invia un messaggio di conferma
        text: () => {
          res.send('Post eliminato');
        },
        //richiesta accetta JSON, restituisce un messaggio di conferma insieme al post eliminato
        json: () => {
          res
            .status(200)
            .json({ message: 'Post eliminato', post: deletedPost });
        },
        //tipo di richiesta non è accettato, restituisci un errore 406
        default: () => {
          res.status(406).send('Not Acceptable');
        },
      });
    }
  );
};

// Le funzioni devono essere esportate per renderle disponibili in altre parti dell'app
module.exports = { index, show, create, downloadImage, store, destroy };
