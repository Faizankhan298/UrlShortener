const express = require("express");
const app = express();
const port = 8000;
const path = require("path");

const URL = require("./models/url");
const urlRoute = require("./routes/url");
const staticRouter = require("./routes/staticRouter");

const { connectToMongoDB } = require("./connect");

connectToMongoDB("mongodb://localhost:27017/short-url").then(() => {
  console.log("Connected to MongoDB");
});

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use("/url", urlRoute);
app.use("/", staticRouter);

app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    { shortId },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );
  res.redirect(entry.redirectURL);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
