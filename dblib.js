// Add packages
require("dotenv").config();
// Add database package and connection string
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const getTotalRecords = () => {
  sql = "SELECT COUNT(*) FROM customer";
  return pool
    .query(sql)
    .then((result) => {
      return {
        msg: "success",
        totRecords: result.rows[0].count,
      };
    })
    .catch((err) => {
      return {
        msg: `Error: ${err.message}`,
      };
    });
};

const insertCustomer = (customer) => {
  // Will accept either a customer array or customer object
  if (customer instanceof Array) {
    params = customer;
  } else {
    params = Object.values(customer);
  }

  console.log("params is: ", params);

  const sql = `INSERT INTO customer (cusId, cusFname, cusLname, cusState, cusSalesYTD, cusSalesPrev)
               VALUES ($1, $2, $3, $4, $5, $6)`;

  return pool
    .query(sql, params)
    .then((res) => {
      return {
        trans: "success",
        msg: `Customer id ${params[0]} successfully inserted`,
      };
    })
    .catch((err) => {
      return {
        trans: "fail",
        msg: `Error on insert of customer id ${params[0]}.  ${err.message}`,
      };
    });
};

const findCustomers = (customer) => {
  // Will build query based on data provided from the form
  //  Use parameters to avoid sql injection

  // Declare variables
  var i = 1;
  params = [];
  sql = "SELECT * FROM customer WHERE true";

  // Check data provided and build query as necessary
  if (customer.cusId !== "") {
    params.push(parseInt(customer.cusId));
    sql += ` AND cusId = $${i}`;
    i++;
  }
  if (customer.prod_name !== "") {
    params.push(`${product.prod_name}%`);
    sql += ` AND UPPER(prod_name) LIKE UPPER($${i})`;
    i++;
  }
  if (product.prod_desc !== "") {
    params.push(`${product.prod_desc}%`);
    sql += ` AND UPPER(prod_desc) LIKE UPPER($${i})`;
    i++;
  }
  if (product.prod_price !== "") {
    params.push(parseFloat(product.prod_price));
    sql += ` AND prod_price >= $${i}`;
    i++;
  }

  sql += ` ORDER BY prod_id`;
  // for debugging
  console.log("sql: " + sql);
  console.log("params: " + params);

  return pool
    .query(sql, params)
    .then((result) => {
      return {
        trans: "success",
        result: result.rows,
      };
    })
    .catch((err) => {
      return {
        trans: "Error",
        result: `Error: ${err.message}`,
      };
    });
};

// Add this at the bottom
module.exports.insertCustomer = insertCustomer;
module.exports.getTotalRecords = getTotalRecords;
module.exports.findProducts = findProducts;
