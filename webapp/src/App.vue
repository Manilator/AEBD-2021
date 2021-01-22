<template>
  <div id="app">
    <div class="navbar">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/users">Users</a></li>
      </ul>
      </div>
      <div class="main-container">
        <div class="main-title">Oracle Database Status Dashboard</div>
        <router-view/>
      </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Muli');

#app {
  font-family: 'Muli', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  flex: row;
}

.main-title {
  margin: 15px;
  margin-bottom: 0px;
  font-size: 30px;
  font-weight: bold;
}

.navbar {
  display: block;
  text-align: center;
}

ul {
  list-style-type: none;
  padding: 0px;
  margin: auto;
}

.main-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 15px;
  margin-right: 15px;
}
</style>
