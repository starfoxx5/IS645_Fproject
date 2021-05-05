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

app.get("/import", (req, res) => {
  res.render("import", {
    type: "get",
  });
});

app.get("/export", (req, res) => {
  var message = "";
  res.render("export", { message: message });
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
  dblib.res.render("delete", {
    type: "post",
    prod: req.body,
  });
});

// // POST /delete/5
// app.post("/delete/:id", (req, res) => {
//   const id = req.params.id;
//   const sql = "DELETE FROM customer WHERE cusId = $1";
//   pool.query(sql, [id], (err, result) => {
//     // if (err) ...
//     res.redirect("/customers");
//   });
// });

app.post("/update", async (req, res) => {
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

app.post("/input", upload.single("filename"), (req, res) => {
  if (!req.file || Object.keys(req.file).length === 0) {
    message = "Error: Import file not uploaded";
    return res.send(message);
  }
  //Read file line by line, inserting records
  const buffer = req.file.buffer;
  const lines = buffer.toString().split(/\r?\n/);

  lines.forEach((line) => {
    //console.log(line);
    product = line.split(",");
    //console.log(product);
    const sql = `INSERT INTO customer (cusId, cusFname, cusLname, cusState, cusSalesYTD, cusSalesPrev)
       VALUES ($1, $2, $3, $4, $5, $6)`;
    pool.query(sql, product, (err, result) => {
      if (err) {
        console.log(`Insert Error.  Error message: ${err.message}`);
      } else {
        console.log(`Inserted successfully`);
      }
    });
  });
  message = `Processing Complete - Processed ${lines.length} records`;
  res.send(message);
});

app.post("/export", (req, res) => {
  const sql = "SELECT * FROM customer ORDER BY cusId";
  pool.query(sql, [], (err, result) => {
    var message = "";
    if (err) {
      message = `Error - ${err.message}`;
      res.render("export", { message: message });
    } else {
      var output = "";
      result.rows.forEach((customer) => {
        output += `${customer.cusId},${customer.cusFname},${customer.cusLname},${customer.cusState},${customer.cusSalesYTD},${customer.cusSalesYTD}\r\n`;
      });
      res.header("Content-Type", "text/csv");
      res.attachment("export.csv");
      return res.send(output);
    }
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
