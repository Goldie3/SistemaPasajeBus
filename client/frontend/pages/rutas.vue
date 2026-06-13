<template>
  <div class="rutas-container">

    <div class="header">
      <h1>🛣️ Gestión de Rutas</h1>
      <p>Administra las rutas disponibles del sistema</p>
    </div>

    <div class="form-card">
      <h2>{{ editando ? 'Editar Ruta' : 'Nueva Ruta' }}</h2>

      <form @submit.prevent="guardar">

        <div class="field">
          <label>Origen</label>
          <input v-model="form.origen" placeholder="Ciudad de origen" :disabled="loading" />
        </div>

        <div class="field">
          <label>Destino</label>
          <input v-model="form.destino" placeholder="Ciudad de destino" :disabled="loading" />
        </div>

        <div class="field">
          <label>Fecha y hora de salida</label>
          <input v-model="form.fecha" type="datetime-local" :disabled="loading" />
        </div>

        <div class="field">
          <label>Precio</label>
          <input v-model="form.precio" type="number" step="0.01" placeholder="Precio en CLP" :disabled="loading" />
        </div>

        <div class="field">
          <label>Capacidad (asientos)</label>
          <input v-model="form.capacidad" type="number" min="1" placeholder="Nº de asientos" :disabled="loading" />
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
      <h2>Listado de Rutas</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Origen</th>
            <th>Destino</th>
            <th>Fecha y hora</th>
            <th>Precio</th>
            <th>Capacidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ruta in rutas" :key="ruta.id">
            <td>{{ ruta.id }}</td>
            <td>{{ ruta.origen }}</td>
            <td>{{ ruta.destino }}</td>
            <td>{{ formatearFechaHora(ruta.fecha) }}</td>
            <td>${{ Number(ruta.precio).toLocaleString('es-CL') }}</td>
            <td>{{ ruta.capacidad }}</td>
            <td class="actions">
              <button class="btn-edit" @click="editar(ruta)">Editar</button>
              <button class="btn-delete" @click="eliminar(ruta.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import '~/assets/rutas.css'
definePageMeta({ middleware: 'auth' })

const rutas    = ref([])
const form     = reactive({ origen: '', destino: '', fecha: '', precio: '', capacidad: '' })
const editando = ref(null)
const loading  = ref(false)
const error    = ref('')

const token   = useCookie('auth_token')
const headers = computed(() => ({ Authorization: `Bearer ${token.value}` }))

const formatearFechaHora = (f) => f
  ? new Date(f).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
  : '—'

const cargar = async () => {
  rutas.value = await $fetch('/api/rutas', { headers: headers.value })
}

const guardar = async () => {
  loading.value = true
  error.value   = ''
  try {
    if (editando.value) {
      await $fetch(`/api/rutas/${editando.value}`, { method: 'PUT', headers: headers.value, body: form })
    } else {
      await $fetch('/api/rutas', { method: 'POST', headers: headers.value, body: form })
    }
    cancelar()
    await cargar()
  } catch (err) {
    error.value = err.data?.message || 'Error al guardar'
  } finally {
    loading.value = false
  }
}

const editar = (ruta) => {
  editando.value   = ruta.id
  form.origen      = ruta.origen
  form.destino     = ruta.destino
  form.fecha       = ruta.fecha ? ruta.fecha.slice(0, 16) : ''
  form.precio      = ruta.precio
  form.capacidad   = ruta.capacidad
}

const cancelar = () => {
  editando.value = null
  Object.assign(form, { origen: '', destino: '', fecha: '', precio: '', capacidad: '' })
}

const eliminar = async (id) => {
  if (!confirm('¿Eliminar esta ruta?')) return
  try {
    await $fetch(`/api/rutas/${id}`, { method: 'DELETE', headers: headers.value })
    await cargar()
  } catch (err) {
    error.value = err.data?.message || 'Error al eliminar'
  }
}

onMounted(cargar)
</script>