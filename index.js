// Add packages
const dblib = require("./dblib.js");

// Test get Total Records
// dblib
//   .getTotalRecords()
//   .then((result) => {
//     if (result.msg.substring(0, 5) === "Error") {
//       console.log(`Error Encountered.  ${result.msg}`);
//     } else {
//       console.log(`Total number of database records: ${result.totRecords}`);
//     }
//   })
//   .catch((err) => {
//     console.log(`Error: ${err.message}`);
//   });

// Test Insert

const customera = [999, "Zed", "Beat", "FL", 9999, 999];
dblib.insertCustomer(customera).then((result) => {
  if (result.trans === "fail") {
    console.log("ERROR OCCURED");
    console.log(result.msg);
  } else {
    console.log("Insert Successful");
    console.log(result.msg);
  }
});

// Loop to insert - using async () function and await
// Not using try catch block
(async () => {
  console.log("--- STEP 1: Pre-Loop");
  for (cus of customers) {
    console.log("--- STEP 2: In-Loop Before Insert");
    const result = await dblib.insertProduct(cus);
    console.log("--- STEP 3: In-Loop After Insert");
    console.log("result is: ", result);
    if (result.trans === "success") {
      numInserted++;
    } else {
      numFailed++;
      errorMessage += `${result.msg} \r\n`;
    }
  }
  console.log("--- STEP 4: After-Loop");
  console.log(`Records processed: ${numInserted + numFailed}`);
  console.log(`Records successfully inserted: ${numInserted}`);
  console.log(`Records with insertion errors: ${numFailed}`);
  if (numFailed > 0) {
    console.log("Error Details:");
    console.log(errorMessage);
  }
})();
