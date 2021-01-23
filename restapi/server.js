'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var oracledb = require('oracledb');
const dbConfig = require('./dbConfig.js');
const cors = require('cors')

var app = express();
app.use(bodyParser.json()); // Use body parser to parse JSON body

var port = 3000;

oracledb.outFormat = oracledb.OBJECT;

// HTTP Method: GET
// URI        : /database
// Get last database record
app.get('/database',cors(), function (req, res) {
  doGetConnection(res, function(err, connection) {
    if (err)
      return;
    connection.execute(
      `select record_date "Date", name "Name", os "OS", version "Version" from database where ROWNUM < 2 ORDER BY ID DESC`,
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
          res.send(JSON.stringify(result.rows[0]));
        }
        doRelease(connection, "GET /database");
      });
  });
});

// HTTP Method: GET
// URI        : /performance
// Get last performance record
app.get('/performance',cors(), function (req, res) {
  doGetConnection(res, function(err, connection) {
    if (err)
      return;
    connection.execute(
      `select cpus "Number of CPUs", cpu_usage "CPU Usage", threads "Number of Threads", time_consumed "Time Consumed" from performance where ROWNUM < 2 ORDER BY ID DESC`,
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
          res.send(JSON.stringify(result.rows[0]));
        }
        doRelease(connection, "GET /performance");
      });
  });
});

// HTTP Method: GET
// URI        : /resources
// Get last resources record
app.get('/resources',cors(), function (req, res) {
  doGetConnection(res, function(err, connection) {
    if (err)
      return;
    connection.execute(
      `select tablespaces "Tablespaces", current_memory "Current Memory", max_memory "Max Memory", processes "Processes", total_ram "Total Ram" from resources where ROWNUM < 2 ORDER BY ID DESC`, 
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
          res.send(JSON.stringify(result.rows[0]));
        }
        doRelease(connection, "GET /resources");
      });
  });
});

// HTTP Method: GET
// URI        : /activity
// Get last activity record
app.get('/activity',cors(), function (req, res) {
  doGetConnection(res, function(err, connection) {
    if (err)
      return;
    connection.execute(
      `select sessions "Number of sessions", sql_requests "SQL Requests" from activity where ROWNUM < 2 ORDER BY ID DESC`, [], { fetchInfo: {"SQL Requests": {type: oracledb.STRING}} },
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
app.get('/users',cors(), function (req, res) {
  doGetConnection(res, function(err, connection) {
    if (err)
      return;
    connection.execute(
      `select users "Users", roles "Roles" from users where ROWNUM < 2 ORDER BY ID DESC`, 
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
          res.send(JSON.stringify(result.rows[0]));
        }
        doRelease(connection, "GET /users");
      });
  });
});

// HTTP Method: GET
// URI        : /database
// Get last database record
app.get('/database/:REQUESTS',cors(), function (req, res) {
  doGetConnection(res, function(err, connection) {
    if (err)
      return;
    connection.execute(
      `select record_date "Date", name "Name", os "OS", version "Version" from database ORDER BY record_date DESC FETCH FIRST :r ROWS ONLY`,
      { r: req.params.REQUESTS },
      function (err, result) {
        if (err) {
          res.set('Content-Type', 'application/json');
          res.status(500).send(JSON.stringify({
            status: 500,
            message: "Error getting the database last records",
            detailed_message: err.message
          }));
        } else {
          res.contentType('application/json').status(200);
          res.send(JSON.stringify(result.rows));
        }
        doRelease(connection, "GET /database" + req.params.REQUESTS);
      });
  });
});

// HTTP Method: GET
// URI        : /performance
// Get last performance record
app.get('/performance/:REQUESTS',cors(), function (req, res) {
  doGetConnection(res, function(err, connection) {
    if (err)
      return;
    connection.execute(
      `select cpus "Number of CPUs", cpu_usage "CPU Usage", threads "Number of Threads", time_consumed "Time Consumed" from performance ORDER BY id DESC FETCH FIRST :r ROWS ONLY`,
      { r: req.params.REQUESTS },
      function (err, result) {
        if (err) {
          res.set('Content-Type', 'application/json');
          res.status(500).send(JSON.stringify({
            status: 500,
            message: "Error getting the performance last records",
            detailed_message: err.message
          }));
        } else {
          res.contentType('application/json').status(200);
          res.send(JSON.stringify(result.rows));
        }
        doRelease(connection, "GET /performance" + req.params.REQUESTS);
      });
  });
});

// HTTP Method: GET
// URI        : /activiy
// Get last activiy record
app.get('/activity/:REQUESTS',cors(), function (req, res) {
  doGetConnection(res, function(err, connection) {
    if (err)
      return;
    connection.execute(
      `select sessions "Number of sessions" from activity ORDER BY id DESC FETCH FIRST :r ROWS ONLY`,
      { r: req.params.REQUESTS },
      function (err, result) {
        if (err) {
          res.set('Content-Type', 'application/json');
          res.status(500).send(JSON.stringify({
            status: 500,
            message: "Error getting the activiy last records",
            detailed_message: err.message
          }));
        } else {
          res.contentType('application/json').status(200);
          res.send(JSON.stringify(result.rows));
        }
        doRelease(connection, "GET /activiy" + req.params.REQUESTS);
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