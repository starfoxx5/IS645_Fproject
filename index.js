// Required modules
const express = require("express");
const app = express();
const dblib = require("./dblib.js");

const multer = require("multer");
const upload = multer();

// Add middleware to parse default urlencoded form
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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
  //Create an empty product object (To populate form with values)
  const cus = {
    cusId: "",
    cusFname: "",
    cusLname: "",
    cusState: "",
    cusSalesYTD: "",
    cusSalesPrev: "",
  };
  res.render("customers", {
    type: "get",
    totRecs: totRecs.totRecords,
    cus: cus,
  });
});

app.get("/create", async (req, res) => {
  res.render("create", {
    type: "get",
  });
});

app.get("/delete/:id", async (req, res) => {
  const cus = {
    cusId: req.params.id,
    cusFname: "",
    cusLname: "",
    cusState: "",
    cusSalesYTD: "",
    cusSalesPrev: "",
  };
  dblib.findCustomers(cus).then((result) => {
    console.log(result);
    res.render("delete", {
      type: "get",
      prod: result.result[0],
    });
  });
});

app.get("/update/:id", async (req, res) => {
  const cus = {
    cusId: req.params.id,
    cusFname: "",
    cusLname: "",
    cusState: "",
    cusSalesYTD: "",
    cusSalesPrev: "",
  };
  dblib.findCustomers(cus).then((result) => {
    console.log(result);
    res.render("update", {
      type: "get",
      prod: result.result[0],
    });
  });
});

app.get("/import", async (req, res) => {
  const totRecs = await dblib.getTotalRecords();
  res.render("import", {
    type: "get",
    totRecs: totRecs.totRecords,
  });
});

app.get("/export", (req, res) => {
  var message = "";
  res.render("export", { message: message, type: "get" });
});

// Posts

app.post("/customers", async (req, res) => {
  // Omitted validation check
  //  Can get this from the page rather than using another DB call.
  //  Add it as a hidden form value.
  const totRecs = await dblib.getTotalRecords();

  dblib
    .findCustomers(req.body)
    .then((result) => {
      res.render("customers", {
        type: "post",
        totRecs: totRecs.totRecords,
        result: result,
        prod: req.body,
      });
    })
    .catch((err) => {
      res.render("customers", {
        type: "post",
        totRecs: totRecs.totRecords,
        result: `Unexpected Error: ${err.message}`,
        prod: req.body,
      });
    });
});

app.post("/create", async (req, res) => {
  dblib
    .insertCustomer(req.body)
    .then((result) => {
      if (result.trans === "success") {
        res.render("create", {
          type: "post",
          prod: req.body,
          error: "false",
        });
      } else {
        res.render("create", {
          type: "post",
          prod: req.body,
          error: `Unexpected Error: ${result.msg}`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/delete", async (req, res) => {
  console.log(req.body);
  dblib.deleteCustomer(req.body.cusid).then((result) => {
    if (result.trans === "success") {
      res.render("delete", {
        type: "post",
        prod: req.body,
        error: "false",
      });
    } else {
      res.render("update", {
        type: "post",
        prod: req.body,
        error: `Unexpected Error: ${result.msg}`,
      });
    }
  });
});

app.post("/update", async (req, res) => {
  dblib
    .updateCustomer(req.body)
    .then((result) => {
      if (result.trans === "success") {
        res.render("update", {
          type: "post",
          prod: req.body,
          error: "false",
        });
      } else {
        res.render("update", {
          type: "post",
          prod: req.body,
          error: `Unexpected Error: ${result.msg}`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/import", upload.single("filename"), async (req, res) => {
  console.log("hi");
  console.log(req.file, req.body);

  if (!req.file) {
    //  if (!req.file || Object.keys(req.file).length === 0) {
    message = `Error: Import file not uploaded ${req.file}`;
    return res.json({
      message: message,
    });
  }
  //Read file line by line, inserting records
  const buffer = req.file.buffer;
  const lines = buffer.toString().split(/\r?\n/);

  var numFailed = 0;
  var numInserted = 0;
  var errorMessage = [];

  // lines.forEach(async (line) => {
  for (let line of lines) {
    product = line.split(",");
    //console.log(product);
    let result = await dblib.insertCustomer(product);
    if (result.trans === "success") {
      numInserted++;
    } else {
      console.log(result);
      numFailed++;
      // errorMessage += `${result.msg} \r\n`;
      errorMessage.push(result.msg);
    }
  }
  // });
  //index.js establishes the data for the routes
  //dblib establishes the logic for the database
  const totRecs = await dblib.getTotalRecords();
  res.json({
    type: "post",
    numFailed: numFailed,
    numInserted: numInserted,
    errorMessage: errorMessage,
    totRecs: totRecs.totRecords,
  });
});

app.post("/export", async (req, res) => {
  let output = await dblib.exportFile();
  res.header("Content-Type", "text/csv");
  res.attachment("export.csv");
  return res.send(output);
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
