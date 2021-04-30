// Required modules
const express = require("express");
const app = express();
const dblib = require("./dblib.js");

const multer = require("multer");
const upload = multer();

// Add middleware to parse default urlencoded form
app.use(express.urlencoded({ extended: false }));

// Setup EJS
app.set("view engine", "ejs");

// Enable CORS (see https://enable-cors.org/server_expressjs.html)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Application folders
app.use(express.static("public"));

// Start listener
app.listen(process.env.PORT || 3000, () => {
  console.log("Server started (http://localhost:3000/) !");
});

// Setup routes
app.get("/", (req, res) => {
  //res.send("Root resource - Up and running!")
  res.render("index");
});

app.get("/customers", async (req, res) => {
  // Omitted validation check
  const totRecs = await dblib.getTotalRecords();
  res.render("customers", {
    type: "get",
    totRecs: totRecs.totRecords,
  });
});

// Test Insert

// const customera = [999, "Zed", "Beat", "FL", 9999, 999];
// dblib.insertCustomer(customera).then((result) => {
//   if (result.trans === "fail") {
//     console.log("ERROR OCCURED");
//     console.log(result.msg);
//   } else {
//     console.log("Insert Successful");
//     console.log(result.msg);
//   }
// });

// Loop to insert - using async () function and await
// Not using try catch block
// (async () => {
//   console.log("--- STEP 1: Pre-Loop");
//   for (cus of customers) {
//     console.log("--- STEP 2: In-Loop Before Insert");
//     const result = await dblib.insertProduct(cus);
//     console.log("--- STEP 3: In-Loop After Insert");
//     console.log("result is: ", result);
//     if (result.trans === "success") {
//       numInserted++;
//     } else {
//       numFailed++;
//       errorMessage += `${result.msg} \r\n`;
//     }
//   }
//   console.log("--- STEP 4: After-Loop");
//   console.log(`Records processed: ${numInserted + numFailed}`);
//   console.log(`Records successfully inserted: ${numInserted}`);
//   console.log(`Records with insertion errors: ${numFailed}`);
//   if (numFailed > 0) {
//     console.log("Error Details:");
//     console.log(errorMessage);
//   }
// })();
