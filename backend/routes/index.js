require("dotenv").config();
var express = require("express");
var router = express.Router();
var pool = require("../connection");
var jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    req.token = bearerHeader.split(" ")[1];
    next();
  } else res.sendStatus(403);
};

router.post("/checkuser", verifyToken, function (req, res, next) {
  jwt.verify(req.token, "randomtoken", async (err, data) => {
    if (!data.email) {
      res.sendStatus(403);
      return;
    }
    if (err) {
      res.sendStatus(403);
    } else {
      let isRegistered = await pool.isUserRegistered(data.name);
      if (!isRegistered) {
        pool.registerUser(data).then((d) => res.json({ d }));
      } else {
        res.json({ auth: true });
      }
    }
  });
});
router.post("/api/login", (req, res) => {
  const user = req.body;

  jwt.sign(user, "randomtoken", (err, token) => {
    res.json({ token });
  });
});
router.get("/api", verifyToken, async (req, res) => {
  jwt.verify(req.token, "randomtoken", async (err, data) => {
    if (!data.email) {
      res.sendStatus(403);
      return;
    }
    if (err) {
      res.sendStatus(403);
      return;
    }
    let result = null;
    if (typeof pool[req.query.operation] == "function") {
      console.log(req.query);
      result = await pool[req.query.operation].apply(
        this,
        req.query.param.indexOf("~") >= 0
          ? req.query.param.split("~")
          : [req.query.param]
      );
    } else {
      res.json({ error: req.query.operation + " is not a function" });
      return;
    }
    res.json(result);
  });
});

module.exports = router;
