const oracledb = require('oracledb');
const dbConfig = require('./dbConfig.js');
var database = {};
var performance = {};
var resources = {};
var activity = {};
var users = {};
var id = {};

async function sql_request(sql, connection, string) {
  try {
    let i;
    result = await connection.execute(sql);
    // console.log("Query results: ");
    // console.log(result.rows);
    // console.log(result);
    i = 0;
    for (x of result.metaData) {
      switch (string) {
        case 'database':
          database[x['name']] = result.rows[0][i];
          break;
        case 'performance':
          performance[x['name']] = result.rows[0][i];
          break;
        case 'resources':
          resources[x['name']] = result.rows[0][i];
          break;
        case 'activity':
          activity[x['name']] = result.rows[0][i];
          break;
      }
      ++i;
    }
  } catch (e) {
    console.log(e);
  }
}

async function sql_array(sql, connection, string) {
  try {
    let i;
    result = await connection.execute(sql);
    // console.log("Query results: ");
    // console.log(result.rows);
    // console.log(result);
    for (x of result.rows) {
      let json = {}
      i = 0;
      for (y of result.metaData) {
        json[y['name']] = x[i];
        i++;
      }
      switch (string) {
        case 'tablespaces':
          resources.Tablespaces.push(json);
          break;
        case 'sql_requests':
          activity.Requests.push(json);
          break;
        case 'users':
          users.Users.push(json);
          break;
        case 'roles':
          users.Roles.push(json);
          break;
      }
    }
  } catch (e) {
    console.log(e);
  }
}

async function getID(connection) {
  try {

    result = await connection.execute('select max(id) from database');
    let temp_id = result.rows[0][0]
    if (temp_id === null)
    id = 0;
    else
    id = temp_id+1;
  } catch(e) {
    console.log(e);
  }
}

async function insertData(sql, connection) {
  try {
    result = await connection.execute(sql);
    console.log(result);
    console.log(sql)
  } catch (error) {
    console.log(error)
  }
}

async function run() {
  try {
    let sql, result;
    let n = 20; // seconds

    setInterval(async function (connection, extConnection) {
      connection = await oracledb.getConnection(dbConfig.internal);
      extConnection = await oracledb.getConnection(dbConfig.external);

      try {
        database = {};
        performance = {};
        activity = { Requests: [] };
        resources = { Tablespaces: [] };
        users = {Users: [], Roles: []};
        
        await getID(extConnection);

        // 
        // PERFORMANCE
        // 

        // number of cpus, cpu consumed per time, cpu usage (%)
        sql = `select max(num_cpus) "CPUS", sum(cpu_consumed_time) "TIME_CONSUMED", sum(avg_cpu_utilization) "CPU_USAGE" from V$RSRCMGRMETRIC`;
        await sql_request(sql, connection, 'performance');

        // number of threads
        sql = `select count(*) "THREADS" from v$thread`;
        await sql_request(sql, connection, 'performance');


        //
        // DATABASE
        //

        // Database name & platform_name
        sql = `select name, platform_name from v$database`;
        await sql_request(sql, connection, 'database');

        // Oracle version
        sql = `SELECT PRODUCT, VERSION FROM SYS.PRODUCT_COMPONENT_VERSION WHERE PRODUCT LIKE 'Oracle%'`
        await sql_request(sql, connection, 'database');

        // Date
        sql = `SELECT TO_CHAR (SYSDATE, 'MM-DD-YYYY HH24:MI:SS') "CURRENT DATE" FROM DUAL`
        await sql_request(sql, connection, 'database');

        //
        // RESOURCES
        //

        // Space info
        sql = `select
        fs.tablespace_name                          "Tablespace_name",
        (df.totalspace - fs.freespace)              "Used MB",
        fs.freespace                                "Free MB",
        df.totalspace                               "Total MB",
        round(100 * (fs.freespace / df.totalspace)) "Pct. Free"
     from
        (select
           tablespace_name,
           round(sum(bytes) / 1048576) TotalSpace
        from
           dba_data_files
        group by
           tablespace_name
        ) df,
        (select
           tablespace_name,
           round(sum(bytes) / 1048576) FreeSpace
        from
           dba_free_space
        group by
           tablespace_name
        ) fs
     where
        df.tablespace_name = fs.tablespace_name`
        await sql_array(sql, connection, 'tablespaces');

        // Number of tablespaces
        sql = `SELECT count(DISTINCT sgm.TABLESPACE_NAME) "Number of Tablespaces"
        FROM DBA_SEGMENTS sgm`
        await sql_request(sql, connection, 'resources');

        // Ram used & Max used ram in MB
        sql = `SELECT 
        sum((se1.value/1024)/1024) "CURRENT SIZE",
        sum((se2.value/1024)/1024) "MAXIMUM SIZE"
        FROM v$sesstat se1, v$sesstat se2, v$session ssn, v$bgprocess bgp, v$process prc,
        v$instance ins, v$statname stat1, v$statname stat2
        WHERE se1.statistic# = stat1.statistic# and stat1.name = 'session pga memory'
        AND se2.statistic# = stat2.statistic# and stat2.name = 'session pga memory max'
        AND se1.sid = ssn.sid
        AND se2.sid = ssn.sid
        AND ssn.paddr = bgp.paddr (+)
        AND ssn.paddr = prc.addr (+)`
        await sql_request(sql, connection, 'resources');

        // Number of processes
        sql = `Select count(*) "Number of processes" from v$process
        where execution_type = 'PROCESS'`
        await sql_request(sql, connection, 'resources');

        //
        // RESOURCES
        //

        // Number of processes
        sql = `select count(*) "Number of processes" from V$session where status='ACTIVE'`
        await sql_request(sql, connection, 'activity');

        // History of sql requests
        sql = `select v.SQL_TEXT,
        v.FIRST_LOAD_TIME
   from v$sql v
where to_date(v.FIRST_LOAD_TIME,'YYYY-MM-DD hh24:mi:ss')>sysdate-1`
        await sql_array(sql, connection, 'sql_requests');

        //
        // USERS
        //

        // Users on database
        sql = `SELECT USERNAME, USER_ID, DEFAULT_TABLESPACE, TEMPORARY_TABLESPACE,ACCOUNT_STATUS, CREATED FROM DBA_USERS
        ORDER BY created ASC`
        await sql_array(sql, connection, 'users');

        // roles on database
        sql = `SELECT ROLE, ROLE_ID FROM DBA_ROLES`
        await sql_array(sql, connection, 'roles');


        // console.log(database);
        // console.log(performance);
        // console.log(resources);
        // console.log(activity);
        //console.log(users);

        //
        // UPDATE EXTERNAL DATABASE
        //

        let users_json = {Users: []}
        users_json.Users = users.Users;
        let roles_json = {Roles: []}
        roles_json.Roles = users.Roles;
        // console.log('users_json = ' + JSON.stringify(users_json))
        // console.log('roles_json = ' + JSON.stringify(roles_json))

        // Users
        // sql = `INSERT INTO users (id, users, roles)
        // VALUES (${id},utl_raw.cast_to_raw('${JSON.stringify(users_json)}'),utl_raw.cast_to_raw('${JSON.stringify(roles_json)}'))`

          sql = `DECLARE
          users_json CLOB;
          roles_json CLOB;
        BEGIN
          users_json := '${JSON.stringify(users_json)}';
          roles_json := '${JSON.stringify(roles_json)}';
        
          INSERT INTO users (id, users, roles)
          VALUES ( ${id}, users_json, roles_json);
        END;`

        await insertData(sql, extConnection);

      } catch (err) {
        console.log(err);
      } finally {
        if (connection)
          await connection.close()
        if (extConnection)
          await extConnection.close()
      }

    }, n * 1000);



  } catch (err) {
    console.error(err);
  } finally {
    try {

    } catch (err) {
      console.error(err);
    }
  }
}

run();