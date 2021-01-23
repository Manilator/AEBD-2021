<template>
  <div>
    <div class="main-subtitle">Activity</div>
    <div class="horizontal-container">
      <div class="sessions-info box">
        <div class="mini-title">Sessions</div>
        <div class="counter">{{ sessions }}</div>
      </div>
      <div class="sql-info box">
        <div class="mini-title">SQL Requests (24 hr)</div>
        <div v-if="this.loaded" class="counter">
          {{ total_sql_24hr.Requests.length }}
        </div>
      </div>
    </div>
    <div class="box">
      <div class="text-box">
        <div class="title">SQL Requests (24 hr)</div>
        <b-table
          sticky-header
          dark
          hover
          small
          fixed
          :items="total_sql_24hr.Requests"
          :fields="sqlFields"
          :busy="sqlBusy"
          style="overflow-x: hidden!important;"
        >
          <template #table-busy>
            <div class="text-center text-danger my-2">
              <b-spinner class="align-middle"></b-spinner>
              <strong>Loading...</strong>
            </div>
          </template>
        </b-table>
      </div>
    </div>
    <div class="box">
      <div class="text-box">
        <div class="title">Number of Sessions</div>
        <line-chart
          v-if="this.loaded"
          :labels="this.labels"
          :borderColor="this.borderColor"
          :backgroundColor="this.backgroundColor"
          :data="this.data"
          :label="this.label"
        ></line-chart>
      </div>
    </div>
    <canvas id="canvas"></canvas>
  </div>
</template>

<script>
import axios from 'axios'
import LineChart from '@/components/LineChart'

export default {
  name: 'MainPage',
  components: {
    LineChart
  },
  data () {
    return {
      sessions: '',
      total_sql_24hr: '',
      sqlBusy: true,
      sqlFields: [
        {
          key: 'SQL_TEXT',
          sortable: false
        },
        {
          key: 'FIRST_LOAD_TIME',
          sortable: true
        }
      ],
      loaded: false,
      label: 'Number of Sessions',
      labels: [],
      data: [],
      borderColor: 'rgba(255,99,132,1)',
      backgroundColor: 'rgba(255, 99, 132, 1)'
    }
  },
  mounted () {
    this.makeGradient()
    this.getActivity()
    this.getNRecords(30)
  },
  methods: {
    getActivity () {
      axios.get('http://localhost:3000/activity').then(response => {
        this.sessions = response.data['Number of sessions']
        this.total_sql_24hr = response.data['SQL Requests']
        this.sqlBusy = false
      })
    },
    async getNRecords (n) {
      await axios.get(`http://localhost:3000/database/${n}`).then(response => {
        response.data
          .reverse()
          .map(x => this.labels.push(x['Date'].substr(11, 18)))
      })
      await axios.get(`http://localhost:3000/activity/${n}`).then(response => {
        response.data
          .reverse()
          .map(x => this.data.push(x['Number of sessions']))
      })
      this.loaded = true
    },
    makeGradient () {
      var gradientFill = document
        .getElementById('canvas')
        .getContext('2d')
        .createLinearGradient(0, 0, 2000, 0)
      gradientFill.addColorStop(0, 'rgba(255, 148, 139, 0.2)')
      gradientFill.addColorStop(1, ' rgba(255, 114, 136, 0.2)')
      this.backgroundColor = gradientFill

      var gradientFill2 = document
        .getElementById('canvas')
        .getContext('2d')
        .createLinearGradient(0, 0, 2000, 0)
      gradientFill2.addColorStop(0, 'rgba(255, 148, 139, 1)')
      gradientFill2.addColorStop(1, ' rgba(255, 114, 136, 1)')
      this.borderColor = gradientFill2
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.horizontal-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.title {
  font-size: 20px;
  font-weight: bold;
  padding-bottom: 5px;
}

.mini-title {
  font-size: 15px;
  font-weight: bold;
}

.counter {
  font-size: 40px;
  text-align: right;
  font-weight: bold;
}

.sessions-info {
  background: rgb(12, 182, 225);
  background: linear-gradient(
    45deg,
    rgba(12, 182, 225, 1) 0%,
    rgba(37, 235, 163, 1) 100%
  );
}

.sql-info {
  background: rgb(131, 125, 252);
  background: linear-gradient(
    45deg,
    rgba(131, 125, 252, 1) 0%,
    rgba(235, 130, 239, 1) 100%
  );
}
</style>
