const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const Article = require('./model/article');
const articleStore = require('./datastore/articleStore');

const app = express();

app.use(bodyParser.json({ strict: false }));

app.get('/articles/:id', function (req, res) {
  const id = req.params.id;

  (async () => {
    try {
      const article = await articleStore.get(id);
      res.json({ success: true, article: article });
    } catch(ex) {
      console.error(ex);
      res.json({ success: false, error: ex.toString() });
    }
  })();
});

app.post('/articles', function (req, res) {
  const { id, title, author, body } = req.body;

  (async () => {
    const article = new Article({ title: title, author: author, body: body });
    article.generateId();

    try {
      await articleStore.save(article);
      res.json({ success: true, article: article });
    } catch(ex) {
      console.error(ex);
      res.json({ success: false, error: ex.toString() });
    }
  })();
});

app.put('/articles/:id', function (req, res) {
  const id = req.params.id;
  const { title, author, body } = req.body;

  (async () => {
    const article = new Article({ id: id, title: title, author: author, body: body });

    try {
      await articleStore.update(article);
      res.json({ success: true, article: article });
    } catch(ex) {
      console.error(ex);
      res.json({ success: false, error: ex.toString() });
    }
  })();
});

app.delete('/articles/:id', function (req, res) {
  const id = req.params.id;

  (async () => {
    try {
      await articleStore.delete(id);
      res.json({ success: true });
    } catch(ex) {
      console.error(ex);
      res.json({ success: false, error: ex.toString() });
    }
  })();
});

module.exports.handler = serverless(app);