<template>
  <div>
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
        <div><b>CPU Usage:</b> {{ cpu_usage }} %</div>
      </div>
      <div class="activity-info box">
        <div class="title">Activity</div>
        <div><b>Active sessions: </b> {{ sessions }}</div>
        <div><b>Total SQL Requests (24hr): </b> {{ total_sql_24hr }}</div>
        <div><b>Total Users: </b> {{ this.total_users }}</div>
        <div><b>Total Roles: </b> {{ this.total_roles }}</div>
      </div>
    </div>
    <div class="horizontal-container">
      <div class="box">
        <div class="title">Ram Usage</div>
        <doughnut-chart
          v-if="this.loaded"
          :labels="this.ramLabels"
          :borderColor="this.borderColor"
          :backgroundColor="this.backgroundColor"
          :data="this.ramData"
        ></doughnut-chart>
      </div>
      <div class="box">
        <div class="title">Total Space (MB)</div>
        <doughnut-chart
          v-if="this.loaded"
          :labels="this.tsLabels"
          :borderColor="this.borderColor"
          :backgroundColor="this.backgroundColor"
          :data="this.tsData"
        ></doughnut-chart>
      </div>
    </div>
    <div class="box">
      <div class="title">Total Space (MB)</div>
      <line-chart
        v-if="this.loaded"
        :labels="this.sLabels"
        :borderColor="this.borderColor"
        :backgroundColor="this.backgroundColor"
        :data="this.sData"
        :label="this.sLabel"
      ></line-chart>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import DoughnutChart from '@/components/DoughnutChart'
import LineChart from '@/components/LineChart'

export default {
  name: 'MainPage',
  components: {
    DoughnutChart,
    LineChart
  },
  data () {
    return {
      loaded: false,
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
      total_users: '',
      roles: {},
      total_roles: '',
      resources: {},
      ramLabels: ['Current Ram (MB)', 'Ram Left (MB)'],
      tsLabels: [],
      borderColor: [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(117, 245, 66, 1)',
        'rgba(245, 233, 66, 1)'
      ],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(117, 245, 66, 0.2)',
        'rgba(245, 233, 66, 0.2)'
      ],
      ramData: [],
      tsData: [],
      sLabel: 'Total Space (MB)',
      sLabels: [],
      sData: []
    }
  },
  mounted () {
    this.getDatabase()
    this.getCurrentPerformance()
    this.getActivity()
    this.getUsers()
    this.getResources()
  },
  watch: {},
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
        this.total_users = this.users.Users.length
        this.total_roles = this.roles.Roles.length
        this.usersBusy = false
        this.rolesBusy = false
      })
    },
    getResources () {
      axios.get('http://localhost:3000/resources').then(response => {
        this.resources = response.data
        let total = (
          this.resources['Total Ram'] - this.resources['Current Memory']
        ).toFixed(4)
        let current = this.resources['Current Memory'].toFixed(4)
        this.$set(this, 'ramData', [parseInt(current), parseInt(total)])

        this.resources.Tablespaces.Tablespaces.map(x =>
          this.tsLabels.push(x.Tablespace_name)
        )
        this.resources.Tablespaces.Tablespaces.map(x =>
          this.tsData.push(x['Total MB'])
        )
        console.log(this.tsLabels)

        this.loaded = true
      })
    },
    getNPerformance (n) {
      
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.horizontal-container {
  display: flex;
  flex-direction: row;
}

.box {
  border: solid;
  padding: 10px;
  margin: 15px;
  flex: 1;
}

.title {
  font-size: 20px;
  font-weight: bold;
  padding-bottom: 5px;
}
</style>
