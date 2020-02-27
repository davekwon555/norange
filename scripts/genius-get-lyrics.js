require('dotenv').config();
const genius = require("genius-lyrics");
const { client: connectMongoClient } = require("../mongodb");
const apiKey = process.env.GENIUS_ACCESS_TOKEN;
const Genius = new genius.Client(apiKey);
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const mongoClient = await connectMongoClient();
  const db = mongoClient.db("norange");
  const songs = db.collection("songs");
  const allSongs = await songs.find({}).toArray();

  for (let i = 0; i < allSongs.length; i++) {
    const currentSong = allSongs[i];

    const searchTerm = `${currentSong.title} ${currentSong.artist}`;
    console.log(
      `song #${i}/${allSongs.length} ${((i / allSongs.length) * 100).toFixed(
        2
      )}% complete`
    );
    if (currentSong.genius) {
      console.log(`already have lyrics for ${searchTerm}`);
      continue;
    }
    console.log(`searching genius for ${searchTerm}`);
    const search = await Genius.findTrack(searchTerm);
    if (search.response.hits.length === 0) {
      console.log("unable to find song information from genius");
      continue;
    }
    const url = await Genius.getUrl(search);
    const lyricsJSON = await Genius.getLyrics(url);
    const lyrics = lyricsJSON.lyrics;

    songs.updateOne(
      {
        title: currentSong.title,
        artist: currentSong.artist
      },
      {
        $unset: {
          lyrics: true
        },
        $set: {
          genius: {
            search,
            url,
            lyricsJSON
          }
        }
      }
    );
    console.log({
      title: currentSong.title,
      artist: currentSong.artist
    });
    await wait(1000 * 10);
  }
})().catch(console.error);
