const alfy = require("alfy");
var translate = require("node-google-translate-skidz");

const [source, target, ...queryWords] = alfy.input.split(" ");

translate({ text: queryWords.join(" "), source, target })
  .then(function(result) {
    if (!result) {
      alfy.output([{ title: "No translations found" }]);
      return;
    }

    const translations = [];

    if (result.dict) {
      const posMap = {};
      const wordScores = {};

      result.dict.forEach(pos => {
        pos.entry.forEach(entry => {
          posMap[entry.word] = posMap[entry.word] || [];
          posMap[entry.word].push(pos.pos);

          wordScores[entry.word] = Math.max(
            entry.score,
            wordScores[entry.word] || 0
          );
        });
      });

      Object.keys(wordScores).forEach(word => {
        translations.push({
          translation: word,
          score: wordScores[word],
          partsOfSpeech: posMap[word]
        });
      });
    }

    if (result.translation) {
      const current = translations.find(
        t => t.translation === result.translation
      );
      if (current) {
        current.score = 1.0;
      } else {
        translations.push({ translation: result.translation, score: 1.0 });
      }
    }

    translations.sort((a, b) => b.score - a.score);

    const items = translations.map(({ translation, partsOfSpeech }) => ({
      title: translation,
      subtitle: (partsOfSpeech || []).join(", "),
      arg: translation
    }));

    alfy.output(items);
  })
  .catch(err => {
    console.log("err", err);
  });
