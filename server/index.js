const express = require("express");
const multer = require("multer");
const mysql = require("mysql");
const fs = require("fs");
const bodyparser = require("body-parser");
const path = require("path");
const papa = require("papaparse");
const cors = require("cors");
const app = express();
app.use(express.static("./public"));
app.use(bodyparser.json());

app.use(
  cors({
    origin: "*",
  })
);
app.use(
  bodyparser.urlencoded({
    extended: true,
  })
);
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "pricing_mern_db",
});
db.connect(function (err) {
  if (err) {
    return console.error("error: " + err.message);
  }
  console.log("Database connected.");
});
var storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "./uploads");
  },
  filename: (req, file, callBack) => {
    callBack(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
var upload = multer({
  storage: storage,
});
app.get("/", async (req, res) => {
  let productData = await db.connect((error) => {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const offset = limit * (page - 1);
    const where = false;
    countQuery = `SELECT count(id) as cnt FROM products ${
      where ? ` where ${where}` : ""
    }`;
    selectQuery = `SELECT * FROM products ${
      where ? ` where ${where}` : ""
    } limit ${limit}  OFFSET  ${offset} `;
    console.log("selectQuery", selectQuery);
    db.query(countQuery, function (err, countResult) {
      db.query(selectQuery, function (err, result) {
        res.json({
          msg: "Server running successfully",
          data: result,
          count: countResult?.[0]?.cnt,
          page: page,
          limit: limit,
        });
      });
    });
  });
});

app.post("/updateRec", async (req, res) => {
  console.log("data: ", req.body);

  let productData = await db.connect((error) => {
    updateQuery = `UPDATE products SET SKU = '${req.body.SKU}', Price = '${req.body.Price}', ProductName = '${req.body.ProductName}' WHERE products.id = '${req.body.id}';`;
    console.log("updateQuery", updateQuery);
    db.query(updateQuery, function (err, result) {
      res.json({
        msg: "Server running successfully",
      });
    });
  });
});

//app.get('/loadCsv', (req, res) => {})
app.post("/uploadcsv", upload.single("uploadcsv"), async (req, res) => {
  let uploadData = await db.connect((error) => {
    query = "INSERT INTO csvuploads (filePath, status) VALUES ?";
    db.query(
      query,
      [[[req.file.filename, 0]]],
      async function (err, csvFileUpload) {
        if (err) throw err;
        //console.log(error || res)
        const file = fs.createReadStream(`uploads/${req.file.filename}`);
        console.log("csvUploadRes", csvFileUpload.insertId);
        await papa.parse(file, {
          worker: true, // Don't bog down the main thread if its a big file
          complete: function (results, file) {
            console.log("results", results);
            let insData = results?.data.slice(1);
            insData = insData.map((row, index) => {
              row.push(1, csvFileUpload.insertId);
              console.log("row", row);
              return row;
              // return row;
            });
            console.log("insData", insData);
            if (!results?.data.length)
              res.json({
                msg: "File Uploaded..!",
                file: req.file,
              });
            let query =
              "INSERT INTO products (StoreID,SKU, ProductName, Price, status, fileId) VALUES ?";
            db.query(query, [insData], (error, res) => {
              console.log("insData", insData);
              let uQuery = `UPDATE csvuploads SET status = 1 WHERE csvuploads.id = ${csvFileUpload.insertId}`;
              db.query(uQuery);
            });
          },
        });
      }
    );
  });
  res.json({
    msg: "File Uploaded..!",
    file: req.file,
    uploadData: uploadData,
  });
});

function csvToDb(csvUrl) {
  let stream = fs.createReadStream(csvUrl);
  let collectionCsv = [];
  let csvFileStream = csv
    .parse()
    .on("data", function (data) {
      collectionCsv.push(data);
    })
    .on("end", function () {
      collectionCsv.shift();
      db.connect((error) => {
        if (error) {
          console.error(error);
        } else {
          let query = "INSERT INTO users (id, name, email) VALUES ?";
          db.query(query, [collectionCsv], (error, res) => {
            console.log(error || res);
          });
        }
      });
      fs.unlinkSync(csvUrl);
    });
  stream.pipe(csvFileStream);
}
const PORT = 5000;
app.listen(PORT, () => console.log(`Node app serving on port: ${PORT}`));
