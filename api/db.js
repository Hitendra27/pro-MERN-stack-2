require('dotenv').config();
const {MongoClient} = require('mongodb');

// The connectToDb() function.
let db;

async function connectToDb() {
  const url = process.env.DB_URL || 'mongodb://localhost/issuetracker';
  const client = new MongoClient(url, {useNewUrlParser: true});
  await client.connect();
  console.log('Connected to MongoDB at', url);
  db = client.db();
}

// The getNextSequence function.
async function getNextSequence(name) {
  const result = await db
    .collection('counters')
    .findOneAndUpdate(
      {_id: name},
      {$inc: {current: 1}},
      {returnOriginal: false}
    );
  return result.value.current;
}

function getDb() {
  return db;
}

module.exports = {connectToDb, getNextSequence, getDb};
