"use strict";

var _require = require('mongodb'),
    MongoClient = _require.MongoClient;

var url = 'mongodb://localhost/issuetracker'; //Atlas URL - replace UUU with user, PPP with password, XXX with hostname
// const url = 'mongodb+srv://UUU:PPP@cluster0-XXX.mongodb.net/issuetracker?retryWrites=true';
// mLab URL - replace UUU with user, PPP with password, XXX with hostname
// const url = 'mongodb://UUU:PPP@XXX.mlab.com:33533/issuetracker';

function testWithCallbacks(callback) {
  console.log('\n--- testWithCallbacks ---');
  var client = new MongoClient(url, {
    useNewUrlParser: true
  });
  client.connect(function (err, client) {
    if (err) {
      callback(err);
      return;
    }

    console.log('Connected to MongoDB');
    var db = client.db();
    var collection = db.collection('employees');
    var employee = {
      id: 1,
      name: 'A. Callback',
      age: 23
    };
    collection.insertOne(employee, function (err, result) {
      if (err) {
        client.close();
        callback(err);
        return;
      }

      console.log('Result of insert:\n', result.insertedId);
      collection.find({
        _id: result.insertedId
      }).toArray(function (err, docs) {
        if (err) {
          client.close();
          callback(err);
          return;
        }

        console.log('Result of find:\n', docs);
        client.close();
        callback(err);
      });
    });
  });
}

testWithCallbacks(function (err) {
  if (err) {
    console.log(err);
  }
});