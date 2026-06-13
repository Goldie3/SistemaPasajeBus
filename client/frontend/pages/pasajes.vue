<template>
  <div class="pasajes-container">

    <div class="header">
      <h1>🎫 Gestión de Pasajes</h1>
      <p>Administra los pasajes registrados en el sistema</p>
    </div>

    <div class="form-card">
      <h2>{{ editando ? 'Editar Pasaje' : 'Nuevo Pasaje' }}</h2>

      <form @submit.prevent="guardar">

        <div class="field">
          <label>Nombre</label>
          <input v-model="form.nombre" placeholder="Nombre del pasajero" :disabled="loading" />
        </div>

        <div class="field">
          <label>Apellido</label>
          <input v-model="form.apellido" placeholder="Apellido del pasajero" :disabled="loading" />
        </div>

        <div class="field">
          <label>Ruta</label>
          <select v-model="form.rutaId" :disabled="loading" @change="onRutaChange">
            <option disabled value="">Selecciona una ruta</option>
            <option v-for="ruta in rutas" :key="ruta.id" :value="ruta.id">
              {{ ruta.origen }} → {{ ruta.destino }}
              ({{ formatearFechaHora(ruta.fecha) }}) — ${{ Number(ruta.precio).toLocaleString('es-CL') }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Asiento</label>
          <input
            v-model.number="form.asiento"
            type="number"
            min="1"
            :max="rutaActual?.capacidad ?? 999"
            placeholder="Número de asiento"
            :disabled="loading || !form.rutaId"
          />
          <small v-if="rutaActual" style="color:#6b7280;">
            Capacidad: {{ rutaActual.capacidad }} asientos
          </small>
        </div>

        <div class="buttons">
          <button class="btn-primary" type="submit" :disabled="loading">
            {{ editando ? 'Actualizar' : 'Agregar' }}
          </button>
          <button v-if="editando" class="btn-secondary" type="button" @click="cancelar">
            Cancelar
          </button>
        </div>

      </form>

      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <div class="table-card">
      <h2>Listado de Pasajes</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Ruta</th>
            <th>Fecha salida</th>
            <th>Precio</th>
            <th>Asiento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pasaje in pasajes" :key="pasaje.id">
            <td>{{ pasaje.id }}</td>
            <td>{{ pasaje.nombre }}</td>
            <td>{{ pasaje.apellido ?? '—' }}</td>
            <td>
              <span v-if="pasaje.ruta">
                {{ pasaje.ruta.origen }} → {{ pasaje.ruta.destino }}
              </span>
              <span v-else>—</span>
            </td>
            <td>{{ pasaje.ruta ? formatearFechaHora(pasaje.ruta.fecha) : '—' }}</td>
            <td>${{ pasaje.ruta ? Number(pasaje.ruta.precio).toLocaleString('es-CL') : '—' }}</td>
            <td>{{ pasaje.asiento }}</td>
            <td class="actions">
              <button class="btn-edit" @click="editar(pasaje)">Editar</button>
              <button class="btn-delete" @click="eliminar(pasaje.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import '~/assets/pasajes.css'
definePageMeta({ middleware: 'auth' })

const pasajes  = ref([])
const rutas    = ref([])
const form     = reactive({ nombre: '', apellido: '', rutaId: '', asiento: '' })
const editando = ref(null)
const loading  = ref(false)
const error    = ref('')

const token   = useCookie('auth_token')
const headers = computed(() => ({ Authorization: `Bearer ${token.value}` }))

const rutaActual = computed(() =>
  rutas.value.find(r => r.id === form.rutaId) ?? null
)

const formatearFechaHora = (f) => f
  ? new Date(f).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
  : '—'

const cargar = async () => {
  const [p, r] = await Promise.all([
    $fetch('/api/pasajes/admin', { headers: headers.value }),
    $fetch('/api/rutas',   { headers: headers.value }),
  ])
  pasajes.value = Array.isArray(p) ? p : (p.data ?? [])
  rutas.value   = Array.isArray(r) ? r : (r.data ?? [])
}

const onRutaChange = () => {
  form.asiento = ''
}

const guardar = async () => {
  loading.value = true
  error.value   = ''
  try {
    const body = {
      nombre:   form.nombre,
      apellido: form.apellido || null,
      rutaId:   form.rutaId,
      asiento:  form.asiento,
    }
    if (editando.value) {
      await $fetch(`/api/pasajes/${editando.value}`, { method: 'PUT', headers: headers.value, body })
    } else {
      await $fetch('/api/pasajes', { method: 'POST', headers: headers.value, body })
    }
    cancelar()
    await cargar()
  } catch (err) {
    error.value = err.data?.message || 'Error al guardar'
  } finally {
    loading.value = false
  }
}

const editar = (pasaje) => {
  editando.value  = pasaje.id
  form.nombre     = pasaje.nombre
  form.apellido   = pasaje.apellido ?? ''
  form.rutaId     = pasaje.rutaId
  form.asiento    = pasaje.asiento
}

const cancelar = () => {
  editando.value = null
  Object.assign(form, { nombre: '', apellido: '', rutaId: '', asiento: '' })
}

const eliminar = async (id) => {
  if (!confirm('¿Eliminar este pasaje?')) return
  try {
    await $fetch(`/api/pasajes/${id}`, { method: 'DELETE', headers: headers.value })
    await cargar()
  } catch (err) {
    error.value = err.data?.message || 'Error al eliminar'
  }
}

onMounted(cargar)
</script>