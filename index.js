const express = require("express");
const app = express();

const router = express.Router();

//Handlebars
app.engine("handlebars", engine());
app.set("views", "./views");
app.set("view engine", "handlebars");
app.use(express.static(path.join(__dirname, "public")));

router.get("/prueba", async (req, res) => {
  try {
    res.json({
      status: 200,
      message: "Get data has successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

router.get("/", function (req, res) {
  res.render("home");
});

app.use(express.json({ extended: false }));

app.use("/", router);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server is running in port ${PORT}`));
