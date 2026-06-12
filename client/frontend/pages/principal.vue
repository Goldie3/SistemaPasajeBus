<!-- pages/dashboard.vue -->
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
        <NuxtLink to="/busquedarutas" class="card">
          <h3>🛣️ Buscar Rutas</h3>
          <p>Encuentra rutas disponibles para viajar</p>
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
          ✓ Pasaje creado correctamente. Asiento {{ asientoConfirmado }}.
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
            <select v-model="form.rutaId" required :disabled="cargandoRutas" @change="onRutaChange">
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
            <input v-model="form.fecha" type="date" :min="hoy" required @change="onFechaChange" />
          </div>

          <!-- Mapa de asientos -->
          <div v-if="form.rutaId && form.fecha" class="field">
            <label>
              Asiento *
              <span v-if="cargandoAsientos" class="cargando-asientos">Cargando...</span>
              <span v-else class="disponibles-badge">{{ disponibles }} disponibles</span>
            </label>

            <div v-if="!cargandoAsientos" class="asientos-grid">
              <button v-for="n in capacidad" :key="n" type="button" class="asiento" :class="{
                'asiento--ocupado': ocupados.includes(n),
                'asiento--seleccionado': form.asiento === n,
              }" :disabled="ocupados.includes(n)" @click="form.asiento = n">
                {{ n }}
              </button>
            </div>

            <div class="leyenda">
              <div class="leyenda-item">
                <div class="leyenda-color leyenda-color--disponible"></div> Disponible
              </div>
              <div class="leyenda-item">
                <div class="leyenda-color leyenda-color--ocupado"></div> Ocupado
              </div>
              <div class="leyenda-item">
                <div class="leyenda-color leyenda-color--seleccionado"></div> Seleccionado
              </div>
            </div>

            <p v-if="form.asiento" class="asiento-seleccionado-txt">
              Asiento seleccionado: <strong>{{ form.asiento }}</strong>
            </p>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn--secondary" @click="cerrarModal">Cancelar</button>
            <button type="submit" class="btn btn--primary" :disabled="enviando || !form.asiento">
              {{ enviando ? 'Creando...' : 'Reservar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import '~/assets/principal.css'
definePageMeta({ middleware: 'auth' })

const token = useCookie('auth_token')
const router = useRouter()
const usuario = ref(null)

// Modal
const modalAbierto = ref(false)
const rutas = ref([])
const cargandoRutas = ref(false)
const cargandoAsientos = ref(false)
const enviando = ref(false)
const exito = ref(false)
const error = ref('')
const asientoConfirmado = ref(null)

// Asientos
const capacidad = ref(0)
const ocupados = ref([])
const disponibles = computed(() => capacidad.value - ocupados.value.length)

const hoy = new Date().toISOString().split('T')[0]

const form = reactive({
  nombre: '',
  apellido: '',
  rutaId: '',
  fecha: hoy,
  asiento: null,
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

const cargarAsientos = async () => {
  if (!form.rutaId || !form.fecha) return
  cargandoAsientos.value = true
  form.asiento = null
  try {
    const data = await $fetch(`/api/pasajes/ruta/${form.rutaId}/asientos`, {
      params: { fecha: form.fecha },
      headers: { Authorization: `Bearer ${token.value}` }
    })
    console.log('Asientos data:', data)  // ← acá
    capacidad.value = data.capacidad
    ocupados.value = data.ocupados
  } catch {
    error.value = 'No se pudieron cargar los asientos.'
  } finally {
    cargandoAsientos.value = false
  }
}

const onRutaChange = () => cargarAsientos()
const onFechaChange = () => cargarAsientos()

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
  capacidad.value = 0
  ocupados.value = []
  Object.assign(form, { nombre: '', apellido: '', rutaId: '', fecha: hoy, asiento: null })
}

const crearPasaje = async () => {
  if (!form.asiento) {
    error.value = 'Debes seleccionar un asiento.'
    return
  }
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
        fecha: form.fecha,
        asiento: form.asiento,
      }
    })
    asientoConfirmado.value = form.asiento
    exito.value = true
    await cargarAsientos()
    Object.assign(form, { nombre: '', apellido: '', asiento: null })
  } catch (e) {
    error.value = e?.data?.message
      ?? e?.response?._data?.message
      ?? 'Ocurrió un error al crear el pasaje.'
  } finally {
    enviando.value = false
  }
}

const cerrarSesion = () => {
  token.value = null
  router.push('/login')
}
</script>
