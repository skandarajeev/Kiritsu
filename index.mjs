import express from "express";

import { getInformation } from "./contracts.mjs";
const app = express();
app.use(express.json());
const port = 4000;
console.log("http://localhost:4000");
// respond with "hello world" when a GET request is made to the homepage
app.get("/health-check", (req, res) => {
  setTimeout(() => {
    res.send("hello world");
    console.log("sent");
  }, 2000);
});

app.get("/info", async (req, res) => {
  res.send(await getInformation("0x6332264bCf485381b64413b9A8f1735b4E97DcA1"));
});

app.get("/update", async (req, res) => {
  const { asset } = req.body;
  const { date } = req.body;
  const { img } = req.body;
  const { id } = req.body;
  const { changes } = req.body;
  console.log(asset, date, img, id, changes);
  var newJsLink =
    "https://arweave.net/" +
    (await updateJsonUri(asset, date, img, changes, db));
  console.log(newJsLink);
  res.send(await UpdateUri(id, newJsLink));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
