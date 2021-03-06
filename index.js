const axios = require("axios");
const CronJob = require("cron").CronJob;
const fetchNews = require("./news");
const { DateTime } = require("luxon");

const chunkArrayInGroups = (arr, size) => {
  var myArray = [];
  for (var i = 0; i < arr.length; i += size) {
    myArray.push(arr.slice(i, i + size));
  }
  return myArray;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const WEBHOOKS = {
  techmeme: process.env.TECHMEME_DISCORD_WEBHOOK_URL,
};

const sendWebhook = async (url, articles) => {
  await axios.post(url, {
    content: `Techmeme News for **${DateTime.utc().toLocaleString(
      DateTime.DATE_HUGE
    )}**`,
  });
  for (let chunk of chunkArrayInGroups(articles, 10)) {
    let embeds = [];
    for (let item of chunk) {
      const title = item.title
        .split("' +")
        .join("")
        .split("'")
        .join("")
        .split("\n")
        .join("");
      if (item.url.startsWith("www.") || item.url.startsWith("http")) {
        embeds.push({
          title,
          url: item.url,
          // TODO: On mobile this method of URL generation fills the tweet with %20 as opposed to on desktop where it decodes correctly.
          // description: `[Click to Tweet](https://www.twitter.com/share?text=${title
          //   .split(" ")
          //   .join("%20")}%20${item.url})`,
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
