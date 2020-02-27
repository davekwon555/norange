require('dotenv').config();
const moment = require("moment");
const { getChart, listCharts } = require("./billboard");
const { client: connectMongoClient } = require("../mongodb");

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const validateIso = iso => moment(iso).isValid();
const validateInput = (start, end) => ({
  startValid: validateIso(start),
  endValid: validateIso(end),
  validInput: validateIso(start) && validateIso(end)
});

(async (startIso, endIso) => {
  const { startValid, endValid, inputValid } = validateInput(startIso, endIso);
  if (inputValid === false) {
    throw new Error(
      `Invalid dates:\n${startIso} valid:${startValid}\n${endIso} valid:${endValid}`
    );
  }

  const mongoClient = await connectMongoClient();

  let currentMoment = moment(startIso);
  const endMoment = moment(endIso);
  const db = mongoClient.db("norange");
  const songs = db.collection("songs");
  const billboardHot100 = db.collection("billboardHot100");

  let allSongs = [];

  let chart;
  while (endMoment.isSameOrAfter(currentMoment)) {
    currentMoment.add(1, "day");
    const date = currentMoment.format("YYYY-MM-DD");

    const getResult = await billboardHot100.findOne({
      date
    });

    const recordExists = getResult !== null;

    if (recordExists) {
      allSongs = allSongs.concat([...getResult.chart.songs]);
    }
  }
  const reducedSongs = allSongs.reduce((acc, song) => {
    console.log({
      song
    });
    acc[song.title] = song;
    return acc;
  }, {});
  const allEntries = Object.entries(reducedSongs);
  for (let i = 0; i < allEntries.length; i++) {
    const [songTitle, song] = allEntries[i];
    const getResult = await songs.findOne({
      title: song.title
    });

    const recordExists = getResult !== null;
    console.log({ getResult });

    try {
      if (recordExists === false) {
        await songs.insertOne({
          ...song
        });
      } else {
        await songs.updateOne(
          {
            title: song.title
          },
          {
            $set: { ...song }
          }
        );
      }
    } catch (e) {
      console.error(e);
    }
  }
  process.exit(0);
})("2000-01-01T00:00:00.000Z", "2020-01-15T00:00:00.000Z").catch(console.error);
