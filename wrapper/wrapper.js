const oracledb = require('oracledb');
const dbConfig = require('./dbConfig.js');
var database = {};
var performance = {};
var resources = {};
var activity = {};
var users = {};

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
        users = { Users: [], Roles: [] };

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

        // total ram
        sql = `select
        max(value)/1024/1024 "TOTAL RAM"
     from
        dba_hist_osstat
     where
        stat_name = 'PHYSICAL_MEMORY_BYTES'`
        await sql_request(sql, connection, 'resources');

        // Number of processes
        sql = `Select count(*) "Number of processes" from v$process
        where execution_type = 'PROCESS'`
        await sql_request(sql, connection, 'resources');

        //
        // ACTIVITY
        //

        // Number of sessions
        sql = `select count(*) "sessions" from V$session where status='ACTIVE'`
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


        console.log(database);

        //
        // UPDATE EXTERNAL DATABASE
        //

        let users_json = { Users: [] }
        users_json.Users = users.Users;
        let roles_json = { Roles: [] }
        roles_json.Roles = users.Roles;


        // Users
        result = await extConnection.execute(
          'insert into users (users, roles) values (:uv, :rv) returning id into :iv',
          { iv: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }, uv: JSON.stringify(users_json), rv: JSON.stringify(roles_json) },
          { autoCommit: true });
        let u_id = result.outBinds.iv[0];


        let requests_json = { Requests: [] }
        requests_json.Requests = activity.Requests;

        // Activity
        result = await extConnection.execute(
          'insert into activity (sessions, sql_requests) values (:sv, :sqlv) returning id into :iv',
          { iv: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }, sv: activity['sessions'], sqlv: JSON.stringify(requests_json) },
          { autoCommit: true });
        let a_id = result.outBinds.iv[0];



        let tables_json = { Tablespaces: [] }
        tables_json.Tablespaces = resources.Tablespaces;
        // Resources
        result = await extConnection.execute(
          'insert into resources (tablespaces, current_memory, max_memory, processes, total_ram) values (:tv, :cv, :mv, :pv, :trv) returning id into :iv',
          { iv: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }, tv: JSON.stringify(tables_json), cv: resources['CURRENT SIZE'], mv: resources['MAXIMUM SIZE'], pv: resources['Number of processes'], trv: resources['TOTAL RAM'] },
          { autoCommit: true });
        let r_id = result.outBinds.iv[0];


        // Performance
        result = await extConnection.execute(
          'insert into performance (cpus, cpu_usage, threads, time_consumed) values (:cv, :cuv, :tv, :tcv) returning id into :iv',
          { iv: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }, cv: performance['CPUS'], cuv: performance['CPU_USAGE'], tv: performance['THREADS'], tcv: performance['TIME_CONSUMED'] },
          { autoCommit: true });
        let p_id = result.outBinds.iv[0];


        // Database
        result = await extConnection.execute(
          'insert into database (record_date, name, os, version, p_id, r_id, a_id, u_id) values (:rv, :nv, :ov, :vv, :pidv, :ridv, :aidv, :uidv) returning id into :iv',
          { iv: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }, rv: database['CURRENT DATE'], nv: database['NAME'], ov: database['PLATFORM_NAME'], vv: database['VERSION'], pidv: p_id, ridv: r_id, aidv: a_id, uidv: u_id },
          { autoCommit: true });

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