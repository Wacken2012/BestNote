<template>
  <div class="login-component">
    <div class="login-form" v-if="!isLoggedIn">
      <h2>BestNote Login</h2>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="username">Benutzername:</label>
          <input
            v-model="credentials.username"
            id="username"
            type="text"
            required
            placeholder="admin oder user2"
          />
        </div>
        <div class="form-group">
          <label for="password">Passwort:</label>
          <input
            v-model="credentials.password"
            id="password"
            type="password"
            required
            placeholder="password"
          />
        </div>
        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? 'Anmelden...' : 'Anmelden' }}
        </button>
      </form>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      <div class="demo-info">
        <h4>Demo-Accounts:</h4>
        <ul>
          <li><strong>admin</strong> (Mandant 1)</li>
          <li><strong>user2</strong> (Mandant 2)</li>
          <li>Passwort: <strong>password</strong></li>
        </ul>
      </div>
    </div>

    <div class="user-info" v-else>
      <h3>Angemeldet als {{ userInfo.username }}</h3>
      <p>Mandant: {{ userInfo.mandant_id }}</p>
      <button @click="logout" class="logout-btn">Abmelden</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginComponent',
  data() {
    return {
      credentials: {
        username: '',
        password: ''
      },
      loading: false,
      error: null,
      isLoggedIn: false,
      userInfo: null
    }
  },
  mounted() {
    // Prüfen, ob bereits eingeloggt
    const token = localStorage.getItem('auth_token')
    if (token) {
      this.isLoggedIn = true
      // Token decodieren um User-Info zu bekommen (vereinfacht)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        this.userInfo = {
          username: payload.username,
          mandant_id: payload.mandant_id
        }
      } catch (e) {
        this.logout()
      }
    }
  },
  methods: {
    async login() {
      this.loading = true
      this.error = null

      try {
        const response = await fetch('/mandant/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.credentials)
        })

        if (response.ok) {
          const data = await response.json()
          localStorage.setItem('auth_token', data.access_token)
          this.isLoggedIn = true
          this.userInfo = {
            username: data.username || this.credentials.username,
            mandant_id: data.mandant_id
          }
          this.$emit('login-success', this.userInfo)
        } else {
          const errorData = await response.json()
          this.error = errorData.detail || 'Login fehlgeschlagen'
        }
      } catch (error) {
        console.error('Login-Fehler:', error)
        this.error = 'Netzwerkfehler beim Login'
      } finally {
        this.loading = false
      }
    },
    logout() {
      localStorage.removeItem('auth_token')
      this.isLoggedIn = false
      this.userInfo = null
      this.credentials = { username: '', password: '' }
      this.$emit('logout')
    }
  }
}
</script>

<style scoped>
.login-component {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.login-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.login-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  margin-top: 15px;
  padding: 10px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.demo-info {
  margin-top: 30px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}

.demo-info h4 {
  margin-top: 0;
  color: #007bff;
}

.demo-info ul {
  margin: 10px 0 0 0;
  padding-left: 20px;
}

.user-info {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.logout-btn {
  margin-top: 15px;
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #c82333;
}
</style>