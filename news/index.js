const fetchTechmeme = require("./techmeme");

module.exports = async () => {
  return {
    techmeme: await fetchTechmeme(),
  };
};
