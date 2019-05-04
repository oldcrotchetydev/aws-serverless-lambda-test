const uuidv4 = require('uuid/v4');

module.exports = class Article {
  constructor({ id, title, author, body}) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.body = body;
  }

  generateId() {
    this.id = uuidv4();
  }

  toJSON() {
    return { id: this.id, title: this.title, author: this.author, body: this.body };
  }
}