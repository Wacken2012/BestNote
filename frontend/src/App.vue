<template>
  <div id="app">
    <header>
      <div class="nav-header">
        <h1>BestNote</h1>
        <nav>
          <button class="hamburger" @click="toggleMenu" aria-label="Menü öffnen/schließen">
            <span :class="{ open: menuOpen }"></span>
            <span :class="{ open: menuOpen }"></span>
            <span :class="{ open: menuOpen }"></span>
          </button>
          <ul :class="{ open: menuOpen }">
            <li><router-link to="/">Dashboard</router-link></li>
            <li><router-link to="/import">Import</router-link></li>
            <li><router-link to="/export">Export</router-link></li>
            <li><router-link to="/calendar">Kalender</router-link></li>
          </ul>
        </nav>
      </div>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import { ref } from 'vue';
export default {
  name: 'App',
  setup() {
    const menuOpen = ref(false);
    function toggleMenu() {
      menuOpen.value = !menuOpen.value;
    }
    return { menuOpen, toggleMenu };
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
  padding: 0;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
}

nav {
  position: relative;
}

nav ul {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
  transition: max-height 0.3s;
}

nav ul li {
  font-size: 1.1rem;
}

nav ul li a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 0.8rem;
  border-radius: 4px;
  transition: background 0.2s;
}

nav ul li a.router-link-active {
  background: #1abc9c;
}

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 1rem;
}
.hamburger span {
  display: block;
  height: 3px;
  width: 2rem;
  background: white;
  margin: 0.3rem 0;
  border-radius: 2px;
  transition: 0.3s;
}
.hamburger span.open:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}
.hamburger span.open:nth-child(2) {
  opacity: 0;
}
.hamburger span.open:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

@media (max-width: 700px) {
  .nav-header {
    flex-direction: column;
    align-items: flex-start;
  }
  nav ul {
    flex-direction: column;
    background: #2c3e50;
    position: absolute;
    top: 3.5rem;
    right: 0;
    width: 200px;
    max-height: 0;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 10;
  }
  nav ul.open {
    max-height: 400px;
    padding: 1rem 0;
  }
  .hamburger {
    display: flex;
  }
}

main {
  padding: 2rem;
}
</style>