const genius = require("genius-lyrics");
const { client: connectMongoClient } = require("../mongodb");
const apiKey = process.env.GENIUS_ACCESS_TOKEN;
const Genius = new genius.Client(apiKey);
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const mongoClient = await connectMongoClient();
  const db = mongoClient.db("norange");
  const songs = db.collection("songs");
  const allSongs = await songs.find({ genius: { $ne: null } }).toArray();

  for (let i = 0; i < allSongs.length; i++) {
    const currentSong = allSongs[i];

    console.log({
      currentSong
    });
  }
  process.exit(0);
})().catch(console.error);
