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
  const billboardHot100 = db.collection("billboardHot100");

  let chart;
  while (endMoment.isSameOrAfter(currentMoment)) {
    currentMoment.add(1, "day");
    const date = currentMoment.format("YYYY-MM-DD");

    const getResult = await billboardHot100.findOne({
      date
    });

    if (getResult) {
      console.log(`${date} already in database`);
      continue;
    }

    try {
      chart = await getChart("hot-100", date);
      await wait(1000 * 10);
    } catch (e) {
      console.error(e);
      continue;
    }

    const recordExists = getResult !== null;

    if (recordExists) {
      continue;
    }

    if (recordExists) {
      await billboardHot100.updateOne(
        {
          date
        },
        {
          $set: {
            date,
            chart
          }
        }
      );
    } else {
      await billboardHot100.insertOne({
        date,
        chart
      });
    }
    console.log("inserted " + date);
  }
  process.exit(0);
})("2000-01-01T00:00:00.000Z", "2020-01-15T00:00:00.000Z").catch(console.error);
