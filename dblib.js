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
  if (customer.cusFname !== "") {
    params.push(`${customer.cusFname}%`);
    sql += ` AND UPPER(cusFname) LIKE UPPER($${i})`;
    i++;
  }
  if (customer.cusLname !== "") {
    params.push(`${customer.cusLname}%`);
    sql += ` AND UPPER(cusLname) LIKE UPPER($${i})`;
    i++;
  }
  if (customer.cusState !== "") {
    params.push(`${customer.cusState}%`);
    sql += ` AND UPPER(cusState) LIKE UPPER($${i})`;
    i++;
  }
  if (customer.cusSalesYTD !== "") {
    params.push(parseFloat(customer.cusSalesYTD));
    sql += ` AND cusSalesYTD >= $${i}`;
    i++;
  }
  if (customer.cusSalesPrev !== "") {
    params.push(parseFloat(customer.cusSalesPrev));
    sql += ` AND cusSalesPrev >= $${i}`;
    i++;
  }

  sql += ` ORDER BY cusId`;
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

const deleteCustomer = (customerId) => {
  console.log(customerId);
  const sql = "DELETE FROM customer WHERE cusId = $1";
  return pool
    .query(sql, [customerId])
    .then((result) => {
      return {
        trans: "success",
        result: result,
      };
    })
    .catch((err) => {
      return {
        trans: "Error",
        result: `Error: ${err.message}`,
      };
    });
};

const updateCustomer = (customer) => {
  console.log(customer);
  const sql =
    "UPDATE customer SET cusFname=$2, cusLname=$3, cusState=$4, cusSalesYTD=$5, cusSalesPrev=$6 WHERE cusId = $1";
  return pool
    .query(sql, [
      customer.cusid,
      customer.cusfname,
      customer.cuslname,
      customer.cusstate,
      customer.cussalesytd,
      customer.cussalesprev,
    ])
    .then((result) => {
      console.log(1);
      return {
        trans: "success",
        result: result,
      };
    })
    .catch((err) => {
      console.log(2);
      return {
        trans: "Error",
        result: `Error: ${err.message}`,
      };
    });
};

const exportFile = async () => {
  const sql = "SELECT * FROM customer ORDER BY cusId";
  let result = await pool.query(sql, []);
  let headers = await pool.query(
    "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N'customer'"
  );
  console.log(headers.rows);
  let headerRow = headers.rows.reduce((accumulator, current) => {
    return accumulator + current.column_name + ",";
  }, "");
  var output = headerRow + "\r\n";
  result.rows.forEach((customer) => {
    output += `${customer.cusid},${customer.cusfname},${customer.cuslname},${customer.cusstate},"${customer.cussalesytd}","${customer.cussalesprev}"\r\n`;
  });
  return output;
};

// Add this at the bottom
module.exports.insertCustomer = insertCustomer;
module.exports.getTotalRecords = getTotalRecords;
module.exports.findCustomers = findCustomers;
module.exports.deleteCustomer = deleteCustomer;
module.exports.updateCustomer = updateCustomer;
module.exports.exportFile = exportFile;
