var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var fs = require("fs");
var { engine } = require("express-handlebars");
const multer = require("multer");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
var { parse } = require("csv-parse");

var app = express();

// app initialization params
app.engine("handlebars", engine());
app.set("views", "./views");
app.set("view engine", "handlebars");
app.use(express.static(path.join(__dirname, "public")));

var router = express.Router();

async function sendEmail(email, name, lastname, zoomId) {
  var myHeaders = {
    Authorization:
      "bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6ImxqRDBUYmV3U2gycFRWV3JOOHlkT3ciLCJleHAiOjE2NzIwNzg3ODMsImlhdCI6MTY3MTQ3Mzk4M30.l0uFWYB3W19WjimX2bBe15aoBUH6F0ehqe7lu3uPFaE",
    "Content-Type": "application/json",
  };

  var raw = JSON.stringify({
    email: email,
    first_name: name,
    last_name: lastname || "-",
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
    mode: "cors",
    credentials: "include",
  };

  const response = await fetch(
    `https://api.zoom.us/v2/meetings/${zoomId}/registrants`,
    requestOptions
  );
  await fetch("https://api.github.com/users/github");
  return await response.json();
}

router.get("/", function (req, res) {
  res.render("home");
});

var type = multer({ dest: "/upload" }).single("recfile");

router.post("/upload", type, function (req, res) {
  const input = req.file;
  const id = req.body.code;
  const fileData = new fs.readFileSync(input.path);
  parse(fileData, { columns: false, trim: true }, async function (err, rows) {
    let result = [];
    for (let i = 1; i < rows.length; i++) {
      const val = rows[i];
      const response = await sendEmail(val[0], val[1], val[2], id);
      if (response?.code) {
        result.push({
          status: false,
          message: response?.message,
          email: val[0],
        });
      } else {
        result.push({ status: true, message: "OK", email: val[0] });
      }
    }
    console.log(result);
    res.render("home", { result });
  });
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/", router);

app.listen(process.env.PORT || 400);
console.log("Node has started");
