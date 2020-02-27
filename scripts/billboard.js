let { getChart, listCharts } = require("billboard-top-100");
const { promisify } = require("util");
module.exports = {
  getChart: promisify(getChart),
  listCharts: promisify(listCharts)
};
