// Banana Farmer Web Service Demo

'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var oracledb = require('oracledb');
const dbConfig = require('./dbConfig.js');

var app = express();
app.use(bodyParser.json()); // Use body parser to parse JSON body

var port = 3000;

oracledb.outFormat = oracledb.OBJECT;

// HTTP Method: GET
// URI        : /database
// Get last database record
app.get('/database', function (req, res) {
  doGetConnection(res, function(err, connection) {
    if (err)
      return;
    connection.execute(
      `select record_date "Date", name "Name", os "OS", version "Version" from database where ROWNUM < 2`,
      function (err, result) {
        if (err) {
          res.set('Content-Type', 'application/json');
          res.status(500).send(JSON.stringify({
            status: 500,
            message: "Error getting the database last record",
            detailed_message: err.message
          }));
        } else {
          res.contentType('application/json').status(200);
          res.send(JSON.stringify(result.rows));
        }
        doRelease(connection, "GET /database");
      });
  });
});

// HTTP Method: GET
// URI        : /performance
// Get last performance record
app.get('/performance', function (req, res) {
  doGetConnection(res, function(err, connection) {
    if (err)
      return;
    connection.execute(
      `select cpus "Number of CPUs", cpu_usage "CPU Usage", threads "Number of Threads", time_consumed "Time Consumed" from performance where ROWNUM < 2`,
      function (err, result) {
        if (err) {
          res.set('Content-Type', 'application/json');
          res.status(500).send(JSON.stringify({
            status: 500,
            message: "Error getting the performance last record",
            detailed_message: err.message
          }));
        } else {
          res.contentType('application/json').status(200);
          res.send(JSON.stringify(result.rows));
        }
        doRelease(connection, "GET /performance");
      });
  });
});

// HTTP Method: GET
// URI        : /resources
// Get last resources record
app.get('/resources', function (req, res) {
  doGetConnection(res, function(err, connection) {
    if (err)
      return;
    connection.execute(
      `select tablespaces "Tablespaces", current_memory "Current Memory", max_memory "Max Memory", processes "Processes" from resources where ROWNUM < 2`, 
      [], { fetchInfo: {"Tablespaces": {type: oracledb.STRING}} },
      function (err, result) {
        if (err) {
          res.set('Content-Type', 'application/json');
          res.status(500).send(JSON.stringify({
            status: 500,
            message: "Error getting the resources last record",
            detailed_message: err.message
          }));
        } else {
          res.contentType('application/json').status(200);
          result.rows[0]["Tablespaces"] =  JSON.parse(result.rows[0]["Tablespaces"]);
          res.send(JSON.stringify(result.rows));
        }
        doRelease(connection, "GET /resources");
      });
  });
});

// HTTP Method: GET
// URI        : /activity
// Get last activity record
app.get('/activity', function (req, res) {
  doGetConnection(res, function(err, connection) {
    if (err)
      return;
    connection.execute(
      `select sessions "Number of sessions", sql_requests "SQL Requests" from activity where ROWNUM < 2`, [], { fetchInfo: {"SQL Requests": {type: oracledb.STRING}} },
      function (err, result) {
        if (err) {
          res.set('Content-Type', 'application/json');
          res.status(500).send(JSON.stringify({
            status: 500,
            message: "Error getting the activity last record",
            detailed_message: err.message
          }));
        } else {
          res.contentType('application/json').status(200);
          result.rows[0]["SQL Requests"] =  JSON.parse(result.rows[0]["SQL Requests"]);
          res.send(JSON.stringify(result.rows[0]));
        }
        doRelease(connection, "GET /activity");
      });
  });
});

// HTTP Method: GET
// URI        : /users
// Get last users record
app.get('/users', function (req, res) {
  doGetConnection(res, function(err, connection) {
    if (err)
      return;
    connection.execute(
      `select users "Users", roles "Roles" from users where ROWNUM < 2`, 
      [], { fetchInfo: {"Users": {type: oracledb.STRING}, "Roles": {type: oracledb.STRING}} },
      function (err, result) {
        if (err) {
          res.set('Content-Type', 'application/json');
          res.status(500).send(JSON.stringify({
            status: 500,
            message: "Error getting the users last record",
            detailed_message: err.message
          }));
        } else {
          res.contentType('application/json').status(200);
          result.rows[0]["Users"] =  JSON.parse(result.rows[0]["Users"]);
          result.rows[0]["Roles"] =  JSON.parse(result.rows[0]["Roles"]);
          res.send(JSON.stringify(result.rows));
        }
        doRelease(connection, "GET /users");
      });
  });
});

// HTTP method: GET
// URI        : /bananas/FARMER
// Get the banana shipment for FARMER
app.get('/bananas/:FARMER', function (req, res) {
  doGetConnection(res, function(err, connection) {
    if (err)
      return;
    connection.execute(
      "SELECT b.shipment FROM bananas b WHERE b.shipment.farmer = :f",
      { f: req.params.FARMER },
      function (err, result) {
        if (err) {
          res.set('Content-Type', 'application/json');
          res.status(500).send(JSON.stringify({
            status: 500,
            message: "Error getting the farmer's profile",
            detailed_message: err.message
          }));
        } else if (result.rows.length < 1) {
          res.set('Content-Type', 'application/json');
          res.status(404).send(JSON.stringify({
            status: 404,
            message: "Farmer doesn't exist",
            detailed_message: ""
          }));
        } else {
          res.contentType('application/json');
          res.status(200).send(JSON.stringify(result.rows));
        }
        doRelease(connection, "GET /bananas/" + req.params.FARMER);
      });
  });
});

// HTTP method: POST
// URI        : /bananas
// Create a new banana shipment for a farmer
app.post('/bananas', function (req, res) {
  if ("application/json" !== req.get('Content-Type')) {
    res.set('Content-Type', 'application/json').status(415).send(JSON.stringify({
      status: 415,
      message: "Wrong content-type. Only application/json is supported",
      detailed_message: null
    }));
    return;
  }
  doGetConnection(res, function(err, connection) {
    if (err)
      return;
    connection.execute(
      "INSERT INTO bananas VALUES (:s)",
      { s: JSON.stringify(req.body) },
      { autoCommit: true },
      function (err) {
        if (err) {
          res.set('Content-Type', 'application/json');
          res.status(400).send(JSON.stringify({
            status: 400,
            message: "Input Error",
            detailed_message: err.message
          }));
        } else {
          // Successfully created the resource
          res.status(201).set('Location', '/bananas/' + req.body.FARMER).end();
        }
        doRelease(connection, "POST /bananas");
      });
  });
});

// HTTP method: PUT
// URI        : /bananas/FARMER
// Update the banana shipment for FARMER
app.put('/bananas/:FARMER', function (req, res) {
  if ("application/json" !== req.get('Content-Type')) {
    res.set('Content-Type', 'application/json').status(415).send(JSON.stringify({
      status: 415,
      message: "Wrong content-type. Only application/json is supported",
      detailed_message: null
    }));
    return;
  }
  doGetConnection(res, function(err, connection) {
    if (err)
      return;
    connection.execute(
      "UPDATE bananas b SET shipment = :s WHERE b.shipment.farmer = :f",
      {
        s: JSON.stringify(req.body),
        f: req.params.FARMER
      },
      { autoCommit: true },
      function (err, result) {
        if (err) {
          res.set('Content-Type', 'application/json');
          res.status(400).send(JSON.stringify({
            status: 400,
            message: "Input Error",
            detailed_message: err.message
          }));
        } else if (result.rowsAffected === 0) {
          res.set('Content-Type', 'application/json');
          res.status(400).send(JSON.stringify({
            status: 400,
            message: "Farmer doesn't exist",
            detailed_message: ""
          }));
        } else {
          // Resource successfully updated. Sending an empty response body.
          res.status(204).end();
        }
        doRelease(connection,"PUT /bananas/" + req.params.FARMER);
      });
  });
});

// HTTP method: DELETE
// URI        : /bananas/FARMER
// Delete banana shipments for FARMER
app.delete('/bananas/:FARMER', function (req, res) {
  doGetConnection(res, function(err, connection) {
    if (err)
      return;
    connection.execute(
      "DELETE FROM bananas b WHERE b.shipment.farmer = :f",
      { f: req.params.FARMER },
      { autoCommit: true },
      function (err, result) {
        if (err) {
          res.set('Content-Type', 'application/json');
          res.status(400).send(JSON.stringify({
            status: 400,
            message: "Input Error",
            detailed_message: err.message
          }));
        } else if (result.rowsAffected === 0) {
          res.set('Content-Type', 'application/json');
          res.status(400).send(JSON.stringify({
            status: 400,
            message: "Farmer doesn't exist",
            detailed_message: ""
          }));
        } else {
          // Resource successfully deleted. Sending an empty response body.
          res.status(204).end();
        }

        doRelease(connection, "DELETE /bananas/" + req.params.FARMER);
      });
  });
});

// Get a connection from the pool
function doGetConnection(res, cb) {
  oracledb.getConnection(function (err, connection) {
    if (err) {
      res.set('Content-Type', 'application/json');
      res.status(500).send(JSON.stringify({
        status: 500,
        message: "Error getting DB connection",
        detailed_message: err.message
      }));
    } else {
      cb(err, connection);
    }
  });
}

// Release a connection to the pool
function doRelease(connection, message) {
  connection.close(
    function(err) {
      if (err)
        console.error(err);
      else
        console.log(message + " : Connection released");
    });
}

function run() {
  oracledb.createPool({
      user: dbConfig.user,
      password: dbConfig.password,
      connectString: dbConfig.connectString
    },
    function(err) {
      if (err)
        console.error("createPool() error: " + err.message);
      else
        var server = app.listen(port,
          function () {
            console.log('Server is listening on port ' + server.address().port);
          });
    });
}


process
  .on('SIGTERM', function() {
    console.log("\nTerminating");
    process.exit(0);
  })
  .on('SIGINT', function() {
    console.log("\nTerminating");
    process.exit(0);
  });

run();