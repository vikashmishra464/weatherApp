require('dotenv').config();
const http = require("http");
const fs = require("fs");
const requests = require("requests");

const homeFile = fs.readFileSync("home.html", "utf-8");

const replaceVal = (tempVal, orgVal) => {
  let temperature = tempVal.replace("{%tempval%}", orgVal.main.temp);
  temperature = temperature.replace("{%tempmin%}", orgVal.main.temp_min);
  temperature = temperature.replace("{%tempmax%}", orgVal.main.temp_max);
  temperature = temperature.replace("{%location%}", orgVal.name);
  temperature = temperature.replace("{%country%}", orgVal.sys.country);
  temperature = temperature.replace("{%tempstatus%}", orgVal.weather[0].main);

  return temperature;
};

const server = http.createServer((req, res) => {
  if (req.url == "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(homeFile);
  } else if (req.method === "POST" && req.url === "/weather") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const city = new URLSearchParams(body).get("city");

      requests(
        `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=1b2740a9b10259d15e9dbabec1aad29a`
      )
        .on("data", (chunk) => {

          const objdata = JSON.parse(chunk);
          const arrData = [objdata];
          const realTimeData = arrData
            .map((val) => replaceVal(homeFile, val))
            .join("");
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(realTimeData);
          res.end();
        })
        .on("error", (err) => {
          console.error(err);
          res.writeHead(500, { "Content-Type": "text/html" });
          res.end("Internal Server Error");
        });
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("File not found");
  }
});

console.log("Server is started at 5000");
server.listen(5000, "127.0.0.1");
