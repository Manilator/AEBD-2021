<template>
  <div>
    <div class="horizontal-container">
      <div class="database-info box">
        <div class="text-box">
          <div class="title">Database Info</div>
          <div><b>Name:</b> {{ name }}</div>
          <div><b>Version:</b> {{ version }}</div>
          <div><b>OS:</b> {{ os }}</div>
          <div><b>Record Date:</b> {{ date }}</div>
        </div>
      </div>
      <div class="performance-info box">
        <div class="text-box">
          <div class="title">Current Performance</div>
          <div><b>Number of CPUs:</b> {{ cpus }}</div>
          <div><b>Number of Threads:</b> {{ threads }}</div>
          <div><b>CPU Usage:</b> {{ cpu_usage }} %</div>
        </div>
      </div>
      <div class="activity-info box">
        <div class="text-box">
          <div class="title">Activity</div>
          <div><b>Active sessions: </b> {{ sessions }}</div>
          <div><b>Total SQL Requests (24hr): </b> {{ total_sql_24hr }}</div>
          <div><b>Total Users: </b> {{ this.total_users }}</div>
          <div><b>Total Roles: </b> {{ this.total_roles }}</div>
        </div>
      </div>
    </div>
    <div class="horizontal-container">
      <div class="box">
        <div class="text-box">
          <div class="title">Ram Usage</div>
          <doughnut-chart
            v-if="this.loaded"
            :labels="this.ramLabels"
            :borderColor="this.borderColor"
            :backgroundColor="this.backgroundColor"
            :data="this.ramData"
            class="pie"
          ></doughnut-chart>
        </div>
      </div>
      <div class="box">
        <div class="text-box">
          <div class="title">Total Space (MB)</div>
          <doughnut-chart
            v-if="this.loaded"
            :labels="this.tsLabels"
            :borderColor="this.borderColor"
            :backgroundColor="this.backgroundColor"
            :data="this.tsData"
            class="pie"
          ></doughnut-chart>
        </div>
      </div>
      <div class="box">
        <div class="text-box">
          <div class="title">Free Space (MB)</div>
            <doughnut-chart
              v-if="this.loaded"
              :labels="this.tsLabels"
              :borderColor="this.borderColor"
              :backgroundColor="this.backgroundColor"
              :data="this.fsData"
              class="pie"
            ></doughnut-chart>
        </div>
      </div>
    </div>
    <div class="box">
      <div class="text-box">
        <div class="title">Time Consumed</div>
        <bar-chart
          v-if="this.loaded"
          :labels="this.sLabels"
          :borderColor="this.lineBorderColor"
          :backgroundColor="this.lineBackgroundColor"
          :data="this.sData"
          :label="this.sLabel"
        ></bar-chart>
      </div>
    </div>
    <canvas id="canvas"></canvas>
  </div>
</template>

<script>
import axios from 'axios'
import DoughnutChart from '@/components/DoughnutChart'
import BarChart from '@/components/BarChart'

export default {
  name: 'MainPage',
  components: {
    DoughnutChart,
    BarChart
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
        'rgb(79, 161, 254,1)',
        'rgba(255, 119, 137, 1)',
        'rgba(26, 212, 190, 1)',
        'rgba(157, 126, 249, 1)'
      ],
      backgroundColor: [
        'rgb(79, 161, 254,1)',
        'rgba(255, 119, 137, 1)',
        'rgba(26, 212, 190, 1)',
        'rgba(157, 126, 249, 1)'
      ],
      lineBorderColor: 'rgba(26, 212, 190, 1)',
      lineBackgroundColor: ' rgba(26, 212, 190, 1)',
      ramData: [],
      tsData: [],
      fsData: [],
      sLabel: 'Time Consumed (ms)',
      sLabels: [],
      sData: []
    }
  },
  mounted () {
    this.makeGradient()
    this.getDatabase()
    this.getCurrentPerformance()
    this.getActivity()
    this.getUsers()
    this.getResources()
    this.getNRecords(30)
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
        this.resources.Tablespaces.Tablespaces.map(x =>
          this.fsData.push(x['Free MB'])
        )
      })
    },
    async getNRecords (n) {
      await axios.get(`http://localhost:3000/database/${n}`).then(response => {
        response.data
          .reverse()
          .map(x => this.sLabels.push(x['Date'].substr(11, 18)))
        console.log(this.sLabels)
      })
      await axios
        .get(`http://localhost:3000/performance/${n}`)
        .then(response => {
          response.data.reverse().map(x => this.sData.push(x['Time Consumed']))
          console.log(this.sData)
        })
      this.loaded = true
    },
    makeGradient () {
      var gradientFill = document
        .getElementById('canvas')
        .getContext('2d')
        .createLinearGradient(500, 0, 100, 0)
      gradientFill.addColorStop(0, 'rgba(103, 126, 243, 1)')
      gradientFill.addColorStop(1, 'rgba(52, 191, 253, 1)')
      this.backgroundColor[0] = gradientFill

      var gradientFill2 = document
        .getElementById('canvas')
        .getContext('2d')
        .createLinearGradient(500, 0, 100, 0)
      gradientFill2.addColorStop(0, 'rgba(255, 148, 139, 1)')
      gradientFill2.addColorStop(1, ' rgba(255, 114, 136, 1)')
      this.backgroundColor[1] = gradientFill2

      var gradientFill3 = document
        .getElementById('canvas')
        .getContext('2d')
        .createLinearGradient(0, 0, 2000, 0)
      gradientFill3.addColorStop(0, 'rgba(12, 182, 225, 1)')
      gradientFill3.addColorStop(1, 'rgba(37, 235, 163, 1)')
      this.backgroundColor[2] = gradientFill3
      this.lineBackgroundColor = gradientFill3
      this.lineBorderColor = gradientFill3

      var gradientFill4 = document
        .getElementById('canvas')
        .getContext('2d')
        .createLinearGradient(500, 0, 100, 0)
      gradientFill4.addColorStop(0, 'rgba(131, 125, 252, 1)')
      gradientFill4.addColorStop(1, 'rgba(235, 130, 239, 1)')
      this.backgroundColor[3] = gradientFill4
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

.title {
  font-size: 20px;
  font-weight: bold;
  padding-bottom: 5px;
}

.pie {
  height: 85%;
}
</style>
