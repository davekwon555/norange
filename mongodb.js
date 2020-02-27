const { promisify } = require("util");
// newdb is the new database we create
var url = process.env.MONGODB_URI || "mongodb://localhost:27017/norange";

// create a client to mongodb
var MongoClient = require("mongodb").MongoClient;

let client;

// make client connect to mongo service
// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     console.log("Database created!");
//     // print database name
//     console.log("db object points to the database : "+ db.databaseName);
//     return dbSingleton;
// });

module.exports = {
  url,
  client: async () => {
    if (client) return client;
    client = await promisify(MongoClient.connect)(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    return client;
  }
};
