<template>
  <div>
    <div class="main-subtitle">Users</div>
    <div class="horizontal-container">
      <div class="box users-info">
        <div class="mini-title">Users</div>
        <div class="counter">{{ users.Users.length }}</div>
      </div>
      <div class="box roles-info">
        <div class="mini-title">Roles</div>
        <div class="counter">{{ roles.Roles.length }}</div>
      </div>
    </div>
    <div class="box">
      <div class="text-box">
        <div class="title">Users</div>
        <b-table
          sticky-header
          dark
          hover
          small
          :items="users.Users"
          :fields="usersFields"
          :busy="usersBusy"
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
        <div class="title">Roles</div>
        <b-table
          sticky-header
          dark
          hover
          small
          :items="roles.Roles"
          :fields="rolesFields"
          :busy="rolesBusy"
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
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'MainPage',
  data () {
    return {
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

.users-info {
  background: rgb(103, 126, 243);
  background: linear-gradient(
    45deg,
    rgba(103, 126, 243, 1) 0%,
    rgba(89, 151, 254, 1) 49%,
    rgba(52, 191, 253, 1) 100%
  );
}

.roles-info {
  background: rgb(255, 148, 139);
  background: linear-gradient(
    45deg,
    rgba(255, 148, 139, 1) 0%,
    rgba(255, 114, 136, 1) 100%
  );
}
</style>
