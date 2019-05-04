const Article = require('../model/article');
const AWS = require('aws-sdk');

const ARTICLES_TABLE = process.env.ARTICLES_TABLE;

const IS_OFFLINE = process.env.IS_OFFLINE;
let dynamoDb;
if (IS_OFFLINE === 'true') {
  dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  });
  console.log(dynamoDb);
} else {
  dynamoDb = new AWS.DynamoDB.DocumentClient();
};

module.exports.get = async (id) => {
  console.log(`get: querying for article: ${id}`);

  const params = {
    TableName: ARTICLES_TABLE,
    Key: {
      id: id
    }
  };

  let article = null;

  await dynamoDb.get(params).promise().then((result) => {
    if (result.Item) {
      const { id, title, author, body } = result.Item;
      article = new Article({ id: id, title: title, author: author, body: body });
    } else {
      throw `article not found: ${id}`;
    }
  }).catch((ex) => {
    console.error(ex);
    throw ex;
  });

  return article;
};

module.exports.save = async (article) => {
  console.log('save: saving new article');

  const params = {
    TableName: ARTICLES_TABLE,
    Item: {
      id: article.id,
      title: article.title,
      author: article.author,
      body: article.body
    },
    ConditionExpression: 'attribute_not_exists(id)'
  };

  await dynamoDb.put(params).promise().then(
    (data) => {
      console.log(`save: successfully saved article: ${article.id}`);
    },
    (err) => {
      if (err.code === "ConditionalCheckFailedException") {
        throw `article already exists: ${id}`;
      } else {
        throw `error saving article ${id}: ${JSON.stringify(err, null, 2)}`;
      }
    }
  ).catch((ex) => {
    console.error(ex);
    throw ex;
  });
};

module.exports.update = async (article) => {
  console.log(`update: updating article: ${article.id}`);

  const params = {
    TableName: ARTICLES_TABLE,
    Item: {
      id: article.id,
      title: article.title,
      author: article.author,
      body: article.body
    },
    ConditionExpression: 'attribute_exists(id)'
  };

  await dynamoDb.put(params).promise().then(
    (data) => {
      console.log(`update: successfully saved article: ${article.id}`);
    },
    (err) => {
      if (err.code === "ConditionalCheckFailedException") {
        throw `article does not exist: ${id}`;
      } else {
        throw `error updating article ${id}: ${JSON.stringify(err, null, 2)}`;
      }
    }
  ).catch((ex) => {
    console.error(ex);
    throw ex;
  });
};

module.exports.delete = async (id) => {
  console.log(`delete: deleting article: ${id}`);

  const params = {
    TableName: ARTICLES_TABLE,
    Key: {
      id: id
    },
    ConditionExpression: 'attribute_exists(id)'
  };

  await dynamoDb.delete(params).promise().then(
    (data) => {
      console.log(`delete: successfully deleted article: ${id}`);
    },
    (err) => {
      if (err.code === "ConditionalCheckFailedException") {
        throw `article does not exist: ${id}`;
      } else {
        throw `error deleting article ${id}: ${JSON.stringify(err, null, 2)}`;
      }
    }
  ).catch((ex) => {
    console.error(ex);
    throw ex;
  });
};

