<template>
  <div class="onboarding-wizard">
    <h2>Mandanten-Onboarding</h2>
    <div class="step-indicator">
      <div v-for="(step, index) in steps" :key="index" :class="['step', { active: currentStep === index + 1, completed: completedSteps.includes(index + 1) }]">
        {{ step.title }}
      </div>
    </div>
    <div class="step-content">
      <div v-if="currentStep === 1">
        <h3>Willkommen bei BestNote!</h3>
        <p>Wir richten Ihren Verein ein. Dies dauert nur wenige Minuten.</p>
        <button @click="nextStep">Los geht's</button>
      </div>
      <div v-if="currentStep === 2">
        <h3>Grunddaten</h3>
        <input v-model="mandant.name" placeholder="Vereinsname" />
        <input v-model="mandant.domain" placeholder="Subdomain (optional)" />
        <button @click="prevStep">Zurück</button>
        <button @click="nextStep">Weiter</button>
      </div>
      <div v-if="currentStep === 3">
        <h3>Branding</h3>
        <input v-model="branding.primary_color" type="color" />
        <input v-model="branding.secondary_color" type="color" />
        <input v-model="branding.logo_url" placeholder="Logo URL (optional)" />
        <button @click="prevStep">Zurück</button>
        <button @click="nextStep">Weiter</button>
      </div>
      <div v-if="currentStep === 4">
        <h3>Daten importieren</h3>
        <p>Importieren Sie Ihre Daten aus SoftNote oder starten Sie leer.</p>
        <button @click="prevStep">Zurück</button>
        <button @click="completeOnboarding">Fertig</button>
      </div>
      <div v-if="currentStep === 5">
        <h3>Einrichtung abgeschlossen!</h3>
        <p>Ihr Mandant ist bereit. Viel Erfolg mit BestNote!</p>
        <button @click="goToDashboard">Zum Dashboard</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OnboardingWizard',
  data() {
    return {
      currentStep: 1,
      completedSteps: [],
      mandant: {
        name: '',
        domain: ''
      },
      branding: {
        primary_color: '#007bff',
        secondary_color: '#6c757d',
        logo_url: ''
      },
      steps: [
        { title: 'Willkommen' },
        { title: 'Grunddaten' },
        { title: 'Branding' },
        { title: 'Import' },
        { title: 'Fertig' }
      ]
    }
  },
  methods: {
    nextStep() {
      if (this.currentStep < 5) {
        this.completedSteps.push(this.currentStep);
        this.currentStep++;
      }
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    completeOnboarding() {
      // Hier würde die API-Anfrage erfolgen
      this.completedSteps.push(this.currentStep);
      this.currentStep = 5;
    },
    goToDashboard() {
      // Navigation zum Dashboard
      this.$emit('onboardingComplete');
    }
  }
}
</script>

<style scoped>
.onboarding-wizard {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
.step-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}
.step {
  flex: 1;
  text-align: center;
  padding: 10px;
  border-radius: 5px;
  background-color: #f0f0f0;
  margin: 0 5px;
}
.step.active {
  background-color: #007bff;
  color: white;
}
.step.completed {
  background-color: #28a745;
  color: white;
}
.step-content {
  text-align: center;
}
input {
  display: block;
  margin: 10px auto;
  padding: 8px;
  width: 80%;
}
button {
  margin: 10px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
</style>