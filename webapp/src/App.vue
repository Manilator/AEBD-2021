<template>
  <div id="app">
    <div class="navbar">
      <div>Oracle Database Info Dashboard</div>
      </div>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* .navbar {
  height: 50px;
  padding: 10px;
  font-size: 25px;
  font-weight: bold;
  background-color: rgb(43, 43, 43);
  position: relative;
  margin-bottom: 10px;
  box-shadow: 0px 5px 20px rgba(0, 0, 0, 0.349);
} */

/* .navbar div {
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  padding-left: 10px;
}  */
</style>
