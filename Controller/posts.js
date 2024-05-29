const path = require('path');
const fs = require('fs');
const slugify = require('slugify');
let posts = require('../db/postsDb.json');

const index = (req, res) => {
  res.format({
    html: () => {
      let html = '<ul>';
      posts.forEach((post) => {
        html += `<li>
                    <div>
                        <a href="/posts/${post.slug}">
                            <h3>${post.title}</h3></a>
                            <img width="200" src="/${post.image}" />
                            <p><strong>Ingredienti</strong>: ${post.tags
                              .map((t) => `<span class="tag">${t}</span>`)
                              .join(', ')}</p>
                    </div>
                </li>`;
      });
      html += '</ul>';
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Lista dei Post</title>
          <style>
            .tag {
              background-color: lightblue;
              padding: 2px 5px;
              border-radius: 3px;
              margin-right: 5px;
            }
          </style>
        </head>
        <body>
          <h1>Lista dei Post</h1>
          ${html}
        </body>
        </html>
      `);
    },
    json: () => {
      res.json({
        data: posts,
        count: posts.length,
      });
    },
  });
};

const show = (req, res) => {
  const slugPostsRequest = req.params.slug;
  const postRequest = posts.find((post) => post.slug === slugPostsRequest);
  res.format({
    html: () => {
      if (postRequest) {
        const post = postRequest;
        res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${post.title}</title>
            <style>
              .tag {
                background-color: lightblue;
                padding: 2px 5px;
                border-radius: 3px;
                margin-right: 5px;
              }
            </style>
          </head>
          <body>
            <div>
              <h2>${post.title}</h2>
              <img src="/${post.image}" alt="${
          post.title
        }" style="max-width: 100%;" />
              <p><strong>Ingredienti</strong>: ${post.tags
                .map((t) => `<span class="tag">${t}</span>`)
                .join(', ')}</p>
            </div>
          </body>
          </html>
        `);
      } else {
        res
          .status(404)
          .send(`<h1>Oops! Questo post sembra essere svanito nel nulla!</h1>`);
      }
    },
    json: () => {
      if (postRequest) {
        res.json({
          ...postRequest,
          image_url: `http://${req.headers.host}/${postRequest.image}`,
        });
      } else {
        res.status(404).json({
          error: 'Not Found',
          content: `Mi dispiace, non c'è nessun post con il titolo "${slugPostsRequest}".`,
        });
      }
    },
  });
};

const createSlug = (title) => {
  let baseSlug = slugify(title, { lower: true, strict: true });
  const slugs = posts.map((p) => p.slug);
  let counter = 1;
  let slug = baseSlug;
  while (slugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

const create = (req, res) => {
  const { title, content, tags } = req.body;

  const image = req.file?.filename;

  if (!title || !content || !tags || !image) {
    return res
      .status(400)
      .send(
        'Ops! Sembra che tu abbia dimenticato qualche dettaglio importante.'
      );
  }

  const slug = createSlug(title);

  const newPost = {
    title,
    slug,
    content,
    image,
    tags: tags.split(',').map((tag) => tag.trim()),
  };

  posts.push(newPost);
  fs.writeFileSync(
    path.join(__dirname, '../db/postsDb.json'),
    JSON.stringify(posts, null, 2)
  );

  res.format({
    html: () => res.redirect(`/posts/${slug}`),
    json: () => res.status(201).json({ ...newPost, slug }),
  });
};

const destroy = (req, res) => {
  const slug = req.params.slug;
  const postIndex = posts.findIndex((p) => p.slug === slug);

  if (postIndex !== -1) {
    const deletedPost = posts.splice(postIndex, 1)[0];
    fs.writeFileSync(
      path.join(__dirname, '../db/postsDb.json'),
      JSON.stringify(posts, null, 2)
    );

    const imageName = deletedPost.image;
    deletePublicImage(imageName);

    res.format({
      html: () => res.redirect('/posts'),
      json: () => res.send('Il post è stato eliminato con successo.'),
    });
  } else {
    res.status(404).format({
      html: () =>
        res.send('<h1>Ops! Questo post sembra essere sparito nel nulla.</h1>'),
      json: () => res.json({ error: 'Post non trovato' }),
    });
  }
};

const updatePosts = (newPosts) => {
  const filePath = path.join(__dirname, '../db/postsDb.json');
  fs.writeFileSync(filePath, JSON.stringify(newPosts, null, 2));
  posts = newPosts;
};

const deletePublicImage = (imageName) => {
  const imagePath = path.join(__dirname, '../public', imageName);
  fs.unlinkSync(imagePath);
};

const download = (req, res) => {
  const post = posts.find((p) => p.slug === req.params.slug);
  if (post) {
    const filePath = path.join(__dirname, '..', 'public', post.image);
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'Post non trovato' });
  }
};

module.exports = { index, show, create, destroy, download };
