<template>
  <div class="container">
    <div class="horizontal-container">
      <div class="database-info box">
        <div class="title">Database Info</div>
        <div><b>Name:</b> {{ name }}</div>
        <div><b>Version:</b> {{ version }}</div>
        <div><b>OS:</b> {{ os }}</div>
        <div><b>Record Date:</b> {{ date }}</div>
      </div>
      <div class="performance-info box">
        <div class="title">Current Performance</div>
        <div><b>Number of CPUs:</b> {{ cpus }}</div>
        <div><b>Number of Threads:</b> {{ threads }}</div>
        <div><b>CPU Usage:</b> {{ cpu_usage }} MB</div>
      </div>
      <div class="activity-info box">
        <div class="title">Activity</div>
        <div><b>Active sessions: </b> {{ sessions }}</div>
        <div><b>Total SQL Requests (24hr): </b> {{ total_sql_24hr }}</div>
        <div><b>Total Users: </b> {{ users.Users.length }}</div>
        <div><b>Total Roles: </b> {{ roles.Roles.length }}</div>
      </div>
    </div>
    <div class="box">flat</div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'MainPage',
  data () {
    return {
      name: '',
      version: '',
      os: '',
      date: '',
      cpus: '',
      threads: '',
      cpu_usage: '',
      sessions: '',
      total_sql_24hr: '',
      users: {},
      roles: {}
    }
  },
  mounted () {
    this.getDatabase()
    this.getCurrentPerformance()
    this.getActivity()
    this.getUsers()
  },
  methods: {
    getDatabase () {
      axios.get('http://localhost:3000/database').then(response => {
        this.name = response.data.Name
        this.date = response.data.Date
        this.version = response.data.Version
        this.os = response.data.OS
      })
    },
    getCurrentPerformance () {
      axios.get('http://localhost:3000/performance').then(response => {
        this.cpus = response.data['Number of CPUs']
        this.threads = response.data['Number of Threads']
        this.cpu_usage = response.data['CPU Usage'].toFixed(4)
      })
    },
    getActivity () {
      axios.get('http://localhost:3000/activity').then(response => {
        this.sessions = response.data['Number of sessions']
        this.total_sql_24hr = response.data['SQL Requests'].Requests.length
      })
    },
    getUsers () {
      axios.get('http://localhost:3000/users').then(response => {
        this.users = response.data['Users']
        this.roles = response.data['Roles']
        console.log(this.users)
        console.log(this.roles)
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.container {
  display: flex;
  flex-direction: column;
}

.horizontal-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.box {
  border: solid;
  padding: 10px;
  margin: 7px;
  width: inherit;
  flex: 1;
}

.title {
  font-size: 20px;
  font-weight: bold;
  padding-bottom: 5px;
}


</style>
