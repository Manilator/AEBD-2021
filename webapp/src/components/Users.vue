<template>
  <div>
    <div class="horizontal-container">
      <div class="database-info box">
        <div class="mini-title">Users</div>
        <div class="counter">{{ users.Users.length }}</div>
      </div>
      <div class="performance-info box">
        <div class="mini-title">Roles</div>
        <div class="counter">{{ roles.Roles.length }}</div>
      </div>
    </div>
    <div class="box">
      <b-table
        sticky-header
        striped
        hover
        :items="users.Users"
        :fields="usersFields"
        :busy="usersBusy"
        class="table-sm"
      >
        <template #table-busy>
          <div class="text-center text-danger my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong>Loading...</strong>
          </div>
        </template>
      </b-table>
    </div>
    <div class="box">
      <b-table
        sticky-header
        striped
        hover
        :items="roles.Roles"
        :fields="rolesFields"
        :busy="rolesBusy"
        class="table-sm"
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
      roles: {},
      usersBusy: true,
      rolesBusy: true,
      usersFields: [
        {
          key: 'USERNAME',
          sortable: true
        },
        {
          key: 'USER_ID',
          sortable: true
        },
        {
          key: 'DEFAULT_TABLESPACE',
          sortable: true
        },
        {
          key: 'TEMPORARY_TABLESPACE',
          sortable: true
        },
        {
          key: 'ACCOUNT_STATUS',
          sortable: true
        },
        {
          key: 'CREATED',
          sortable: true
        }
      ],
      rolesFields: [
        {
          key: 'ROLE',
          sortable: true
        },
        {
          key: 'ROLE_ID',
          sortable: true
        }
      ]
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
        this.usersBusy = false
        this.rolesBusy = false
      })
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

.box {
  border: solid;
  padding: 10px;
  margin: 15px;
  width: inherit;
  flex: 1;
}

.mini-title {
  font-size: 15px;
  font-weight: lighter;
}

.counter {
  font-size: 40px;
  text-align: right;
}
</style>
