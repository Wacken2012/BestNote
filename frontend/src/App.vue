<template>
  <div id="app">
    <header>
      <h1>BestNote</h1>
    </header>
    <main>
      <Dashboard />
    </main>
  </div>
</template>

<script>
import Dashboard from './components/Dashboard.vue'

export default {
  name: 'App',
  components: {
    Dashboard
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

header {
  background: #2c3e50;
  color: white;
  padding: 1rem;
}

main {
  padding: 2rem;
}
</style>