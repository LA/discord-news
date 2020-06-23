const cheerio = require("cheerio");
const axios = require("axios");

module.exports = async () => {
  let articles = [];

  const { data } = await axios.get("http://www.techmeme.com/m");

  const $ = cheerio.load(data);

  $("#top_items .nav_away").each(function () {
    const container = $(this).find("a").first();
    const url = container.attr("href");
    const source = container.find(".cite").text();
    const title = container.find(".title").text().split(":").join("");
    articles.push({
      url,
      source,
      title,
    });
  });

  return articles;
};
