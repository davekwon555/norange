const californiaCities = require("../cities.json").California.sort();
const request = require("request-promise");
const { client: connectMongoClient } = require("../mongodb");
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const mongoClient = await connectMongoClient();
  const db = mongoClient.db("norange");
  const locations = db.collection("locations");

  for (let i = 0; i < californiaCities.length; i++) {
    const city = californiaCities[i];

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${city.replace(
      " ",
      "+"
    )},+CA&key=${apiKey}`;
    await wait(100);
    const response = await request(url);
    const responseObject = JSON.parse(response);
    const getResult = await locations.findOne({
      city
    });
    console.log({
      getResult
    });
    if (getResult) {
      const updateResponse = await locations.updateOne(
        {
          city
        },
        {
          $set: {
            city,
            ...responseObject
          }
        }
      );
      console.log({
        updateResponse
      });
    } else {
      const insertResponse = await locations.insertOne({
        city,
        ...responseObject
      });
      console.log({
        insertResponse
      });
    }
    console.log(`inserted ${city}`);
  }
})().catch(console.error);
