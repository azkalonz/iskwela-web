var mysql = require("mysql");

var pool = mysql.createPool({
  connectionLimit: process.env.mysql_connection_pool_Limit, // default:10
  host: process.env.mysql_host,
  user: process.env.mysql_user,
  password: process.env.mysql_password,
  database: process.env.mysql_database,
  port: process.env.mysql_port,
});

module.exports = {
  all: () => {
    return new Promise((resolve, reject) => {
      pool.query("SELECT * FROM users", (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  },
  isUserRegistered: (email) => {
    return new Promise((resolve, reject) => {
      pool.query("SELECT * FROM users WHERE ?", { email: email }, (err, res) =>
        err ? reject(err) : resolve(res.length && true)
      );
    });
  },
  registerUser: (user) => {
    return new Promise((resolve, reject) => {
      let data = {
        number: Math.floor(Math.random() * 9909),
        name: user.nickname,
        role: "Student",
        email: user.email,
      };
      pool.query("INSERT INTO users SET ?", data, (err, res) =>
        err ? reject(err) : resolve(true)
      );
    });
  },
  joinClass: (email, classCode) => {
    return new Promise((resolve, reject) => {
      let prevClasses = "";
      pool.query(
        "SELECT classes FROM users WHERE email = ?",
        email,
        (err, res) => {
          if (res[0].classes.split(",").indexOf(classCode) >= 0) {
            resolve(res);
            return;
          }
          if (err) reject(err);
          prevClasses = res[0].classes;
          if (prevClasses.length) {
            prevClasses = [prevClasses + "," + classCode];
          } else {
            prevClasses = [classCode];
          }
          pool.query(
            "UPDATE users SET classes = ? WHERE email = ?",
            [prevClasses.toString(), email],
            (e, r) => {
              resolve(r);
            }
          );
        }
      );
    });
  },
  getUserInfo: (email) => {
    return new Promise((resolve, reject) => {
      let buffer = null;
      pool.query("SELECT * FROM users WHERE email = ?", email, (err, res) => {
        if (err) reject(err);
        else {
          buffer = JSON.parse(JSON.stringify(res[0]));
          if (!buffer.classes.length) {
            buffer.classes = [];
            resolve(buffer);
            return;
          }
          let classNumbers =
            buffer.classes.indexOf(",") >= 0
              ? buffer.classes.split(",")
              : [buffer.classes];
          buffer.classes = [];
          classNumbers.map((c, i) => {
            pool.query("SELECT * FROM classes WHERE number = ?", c, (e, r) => {
              if (e) reject(err);
              else if (r[0]) {
                if (!r[0].img.length)
                  r[0].img =
                    "https://cdn.shopify.com/s/files/1/0010/9215/7503/t/5/assets/MothersDay-enchroma.jpg";
                buffer.classes.push(r);
              }
              if (i == classNumbers.length - 1) {
                resolve(buffer);
              }
            });
          });
        }
      });
    });
  },
};
