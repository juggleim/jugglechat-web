const fs = require("fs");

const htmlPath = "./dist/index.html";
const htmlText = fs.readFileSync(htmlPath, 'utf8');
const htmlArr = htmlText.match(/.*\n/g) || [];

let result = "";

htmlArr.forEach(v => {
  v = v
    .replace(/script ?nomodule\s?/g, "script ")
    .replace(/\s?crossorigin\s?/g, " ")
    .replace(/data-src/g, 'src');
  if (!v.includes(`script type="module"`)) {
    result += v;
  }
});

fs.writeFileSync(htmlPath, result, 'utf8');

console.log("Format Successfully");
