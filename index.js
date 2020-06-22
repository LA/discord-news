const axios = require("axios");
const CronJob = require("cron").CronJob;
const fetchNews = require("./news");

const chunkArrayInGroups = (arr, size) => {
  var myArray = [];
  for (var i = 0; i < arr.length; i += size) {
    myArray.push(arr.slice(i, i + size));
  }
  return myArray;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const WEBHOOKS = {
  techmeme:
    "https://discordapp.com/api/webhooks/724416630549118986/NeElmXAOIXfbWeJaluIP58LmQKAgep5i4LVVjBL3sLnYxFrIr8JT1_hHvtcXoblYzdN1",
};

const sendWebhook = async (url, articles) => {
  for (let chunk of chunkArrayInGroups(articles, 10)) {
    let embeds = [];
    for (let item of chunk) {
      if (item.url.startsWith("www.") || item.url.startsWith("http")) {
        embeds.push({
          title: item.title
            .split("' +")
            .join("")
            .split("'")
            .join("")
            .split("\n")
            .join(""),
          url: item.url,
          author: {
            name: item.source.split("\n").join("").split(":").join(""),
          },
        });
      }
    }
    try {
      await axios.post(url, {
        embeds,
      });
      await delay(2000);
    } catch (err) {
      for (let num of err.response.data.embeds) {
        console.log(embeds[parseInt(num, 10)]);
      }
    }
  }
};

const job = new CronJob(
  "0 30 5 * * *",
  () => {
    fetchNews()
      .then(async (news) => {
        try {
          for (let key of Object.keys(WEBHOOKS)) {
            await sendWebhook(WEBHOOKS[key], news[key]);
          }
        } catch (err) {
          console.error("Failed to send webhook");
        }
      })
      .catch((err) => console.log(err.response.data.content));
  },
  null,
  true,
  "America/Los_Angeles"
);

job.start();
