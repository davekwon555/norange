const { client: connectMongoClient } = require("../mongodb");
const ss = require("string-similarity");

const cleanUpLyrics = lyrics => {
  let lyricsArray = [];
  lyricsArray = lyrics
    .toLowerCase()
    .split(" ")
    .map(token => {
      return unescape(token)
        .replace(/[^a-z0-9+]+/gi, "")
        .replace(/[\r\n]+/gm, "")
        .replace(/^\d/, "");
    });
  return lyricsArray.join(" ");
};

const runAnalysisForLyrics = async (lyrics, location) => {
  const matches = [];
  const cleanedUpLyrics = cleanUpLyrics(lyrics);
  location = location.toLowerCase();

  console.log({
    cleanedUpLyrics,
    location
  });

  if (cleanedUpLyrics.includes(" " + location + " ")) matches.push(lyrics);

  if (matches.length > 0) {
    console.log({ matches });
    process.exit(0);
  }
  return matches;
};

(async () => {
  const mongoClient = await connectMongoClient();
  const db = mongoClient.db("norange");
  const songs = db.collection("songs");
  const locations = db.collection("locations");
  const allSongs = await songs.find({}).toArray();
  const allLocations = await locations.find({}).toArray();
  for (let i = 0; i < allSongs.length; i++) {
    const currentSong = allSongs[i];
    for (let j = 0; j < allLocations.length; j++) {
      const currentLocation = allLocations[
        j
      ].results[0].address_components[0].long_name.toLowerCase();
      const matches = runAnalysisForLyrics(
        currentSong.genius.lyricsJSON.lyrics,
        currentLocation
      );
    }
  }
})();
