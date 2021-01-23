<template>
  <div id="app">
    <div class="navbar">
      <ul>
        <li><a href="/"><img src="https://cdn.discordapp.com/attachments/744576072435367958/802627770114375730/dashboard.svg" height="30px" class="button"/></a></li>
        <li><a href="/users"><img src="https://cdn.discordapp.com/attachments/744576072435367958/802627887051309057/group.svg" height="30px" class="button"/></a></li>
        <li><a href="/activity"><img src="https://cdn.discordapp.com/attachments/744576072435367958/802628088328093726/request.svg" height="30px" class="button"/></a></li>
      </ul>
    </div>
    <div class="main-container">
      <div class="main-title">Oracle Database Status Dashboard</div>
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
$table-dark-bg: rgb(53, 64, 87);

@import '~bootstrap/scss/bootstrap.scss';
@import '~bootstrap-vue/src/index.scss';

body {
  background-color: rgb(53, 64, 87);
  color: white;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
#app {
  font-family: 'Muli', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  flex-direction: row;
}

.button {
  margin: 5px;
}

.main-title {
  margin: 15px;
  margin-bottom: 0px;
  font-size: 30px;
  font-weight: bold;
}
.main-subtitle {
  margin: 15px;
  margin-bottom: 0px;
  font-size: 25px;
  font-weight: bold;
}
.navbar {
  display: block;
  text-align: center;
  background-color: rgb(43, 46, 61);
  padding: 0px;
}

li {
  width: 100%;
  padding: 10px;
  top: 50%;
}

li:hover {
  background-color: rgb(52, 55, 73);
}

ul {
  list-style-type: none;
  padding: 0px;
  margin: auto;
  margin-top: 70px;
  
}
.main-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 15px;
  margin-right: 15px;
}
.box {
  padding: 10px;
  margin: 15px;
  margin-bottom: 0;
  width: inherit;
  flex: 1;
  background-color: rgb(43, 46, 61);
  box-shadow: 5px 5px 10px #0000002c;
  border-radius: 10px;
}
.text-box {
  padding: 10px;
}
.table {
  th,
  td,
  thead {
    border-color: rgb(52, 57, 75);
  }
}

.b-table-sticky-header {
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    width: 8px !important;
    background-color: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #4ba6fe;
    border-radius: 10px;
  }
}

.table-sm {
  tr {
    background-color: rgb(43, 46, 61);
    border-radius: 10px;
  }
}
</style>
