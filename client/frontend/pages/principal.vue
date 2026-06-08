<template>
  <div class="dashboard">
    <nav>
      <h1>Sistema de Pasajes</h1>
      <div class="links">
        <NuxtLink to="/rutas">Rutas</NuxtLink>
        <NuxtLink to="/pasajes">Pasajes</NuxtLink>
        <button @click="cerrarSesion">Cerrar sesión</button>
      </div>
    </nav>

    <main>
      <h2>Bienvenido, {{ usuario?.nombre }}</h2>
      <p>Selecciona una opción del menú para comenzar.</p>

      <div class="cards">
        <NuxtLink to="/rutas" class="card">
          <h3>Rutas</h3>
          <p>Gestiona las rutas disponibles</p>
        </NuxtLink>

        <NuxtLink to="/pasajes" class="card">
          <h3>Pasajes</h3>
          <p>Gestiona los pasajes de los pasajeros</p>
        </NuxtLink>

        <div class="card card--action" @click="abrirModal">
          <h3>✈ Nuevo Viaje</h3>
          <p>Reserva un pasaje eligiendo una ruta</p>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <div v-if="modalAbierto" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal">
        <button class="modal-close" @click="cerrarModal">✕</button>
        <h3>Reservar Viaje</h3>

        <div v-if="exito" class="alert alert--success">
          ✓ Pasaje creado correctamente.
        </div>
        <div v-if="error" class="alert alert--error">
          {{ error }}
        </div>

        <form @submit.prevent="crearPasaje">
          <div class="field">
            <label>Nombre *</label>
            <input v-model="form.nombre" type="text" placeholder="Tu nombre" required />
          </div>

          <div class="field">
            <label>Apellido <span class="opcional">(opcional)</span></label>
            <input v-model="form.apellido" type="text" placeholder="Tu apellido" />
          </div>

          <div class="field">
            <label>Ruta *</label>
            <select v-model="form.rutaId" required :disabled="cargandoRutas">
              <option value="" disabled>
                {{ cargandoRutas ? 'Cargando rutas...' : 'Selecciona una ruta' }}
              </option>
              <option v-for="ruta in rutas" :key="ruta.id" :value="ruta.id">
                {{ ruta.Nombre }}
              </option>
            </select>
          </div>

          <div class="field">
            <label>Fecha *</label>
            <input v-model="form.fecha" type="date" :min="hoy" required />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn--secondary" @click="cerrarModal">Cancelar</button>
            <button type="submit" class="btn btn--primary" :disabled="enviando">
              {{ enviando ? 'Creando...' : 'Reservar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const token = useCookie('auth_token')
const router = useRouter()
const usuario = ref(null)

// Modal
const modalAbierto = ref(false)
const rutas = ref([])
const cargandoRutas = ref(false)
const enviando = ref(false)
const exito = ref(false)
const error = ref('')

const hoy = new Date().toISOString().split('T')[0]

const form = reactive({
  nombre: '',
  apellido: '',
  rutaId: '',
  fecha: hoy
})

onMounted(async () => {
  if (!token.value) {
    router.push('/login')
    return
  }
  try {
    const data = await $fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    usuario.value = data.data
  } catch {
    router.push('/login')
  }
})

const abrirModal = async () => {
  exito.value = false
  error.value = ''
  modalAbierto.value = true

  if (rutas.value.length === 0) {
    cargandoRutas.value = true
    try {
      const data = await $fetch('/api/rutas', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      rutas.value = data.data ?? data
    } catch {
      error.value = 'No se pudieron cargar las rutas.'
    } finally {
      cargandoRutas.value = false
    }
  }
}

const cerrarModal = () => {
  modalAbierto.value = false
  exito.value = false
  error.value = ''
  Object.assign(form, { nombre: '', apellido: '', rutaId: '', fecha: hoy })
}

const crearPasaje = async () => {
  enviando.value = true
  error.value = ''
  exito.value = false
  try {
    await $fetch('/api/pasajes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        nombre: form.nombre,
        apellido: form.apellido || null,
        rutaId: form.rutaId,
        fecha: form.fecha
      }
    })
    exito.value = true
    Object.assign(form, { nombre: '', apellido: '', rutaId: '', fecha: hoy })
  } catch (e) {
    error.value = e?.data?.message ?? 'Ocurrió un error al crear el pasaje.'
  } finally {
    enviando.value = false
  }
}

const cerrarSesion = () => {
  token.value = null
  router.push('/login')
}
</script>

<style scoped>
.dashboard { font-family: sans-serif; }

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid #eee;
}

nav h1 { margin: 0; font-size: 1.2rem; }
.links { display: flex; gap: 1rem; align-items: center; }
.links a { text-decoration: none; color: #333; }
.links a:hover { text-decoration: underline; }

main { padding: 2rem; }

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.card {
  display: block;
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s;
}

.card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.card h3 { margin: 0 0 0.25rem; }
.card p { margin: 0; color: #666; font-size: 0.9rem; }

.card--action {
  cursor: pointer;
  border-color: #3b82f6;
  background: #eff6ff;
}
.card--action h3 { color: #1d4ed8; }
.card--action:hover { box-shadow: 0 2px 12px rgba(59,130,246,0.2); }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 440px;
  position: relative;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

.modal h3 { margin: 0 0 1.5rem; font-size: 1.2rem; }

.modal-close {
  position: absolute;
  top: 1rem; right: 1rem;
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #666;
}
.modal-close:hover { color: #111; }

.field { margin-bottom: 1rem; }
.field label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
  color: #374151;
}
.opcional { font-weight: 400; color: #9ca3af; }

.field input,
.field select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.field input:focus,
.field select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background 0.15s, opacity 0.15s;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.btn--primary { background: #3b82f6; color: #fff; }
.btn--primary:hover:not(:disabled) { background: #2563eb; }

.btn--secondary { background: #f3f4f6; color: #374151; }
.btn--secondary:hover { background: #e5e7eb; }

.alert {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
.alert--success { background: #dcfce7; color: #166534; }
.alert--error   { background: #fee2e2; color: #991b1b; }
</style>