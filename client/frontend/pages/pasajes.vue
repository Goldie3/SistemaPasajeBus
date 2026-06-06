<template>
  <div>
    <h2>Pasajes</h2>

    <form @submit.prevent="guardar">
      <input v-model="form.nombre" placeholder="Nombre" :disabled="loading" />
      <input v-model="form.apellido" placeholder="Apellido" :disabled="loading" />
      <input v-model="form.fecha" type="date" :disabled="loading" />
      <input v-model="form.precio" type="number" step="0.01" placeholder="Precio" :disabled="loading" />
      <select v-model="form.rutaId" :disabled="loading">
        <option disabled value="">Selecciona una ruta</option>
        <option v-for="ruta in rutas" :key="ruta.id" :value="ruta.id">
          {{ ruta.Nombre }}
        </option>
      </select>
      <button type="submit" :disabled="loading">
        {{ editando ? 'Actualizar' : 'Agregar' }}
      </button>
      <button type="button" v-if="editando" @click="cancelar">Cancelar</button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>Ruta</th>
          <th>Fecha</th>
          <th>Precio</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pasaje in pasajes" :key="pasaje.id">
          <td>{{ pasaje.id }}</td>
          <td>{{ pasaje.nombre }}</td>
          <td>{{ pasaje.apellido }}</td>
          <td>{{ pasaje.ruta?.Nombre }}</td>
          <td>{{ new Date(pasaje.fecha).toLocaleDateString() }}</td>
          <td>${{ pasaje.precio }}</td>
          <td>
            <button @click="editar(pasaje)">Editar</button>
            <button @click="eliminar(pasaje.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
const pasajes = ref([])
const rutas = ref([])
const form = reactive({
  nombre: '',
  apellido: '',
  fecha: '',
  precio: '',
  rutaId: '',
})
const editando = ref(null)
const loading = ref(false)
const error = ref('')

const token = useCookie('auth_token')
const headers = computed(() => ({
  Authorization: `Bearer ${token.value}`
}))

const cargar = async () => {
  const [p, r] = await Promise.all([
    $fetch('/api/pasajes', { headers: headers.value }),
    $fetch('/api/rutas', { headers: headers.value }),
  ])
  pasajes.value = p
  rutas.value = r
}

const guardar = async () => {
  loading.value = true
  error.value = ''
  try {
    if (editando.value) {
      await $fetch(`/api/pasajes/${editando.value}`, {
        method: 'PUT',
        headers: headers.value,
        body: form,
      })
    } else {
      await $fetch('/api/pasajes', {
        method: 'POST',
        headers: headers.value,
        body: form,
      })
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
  editando.value = pasaje.id
  form.nombre = pasaje.nombre
  form.apellido = pasaje.apellido
  form.fecha = pasaje.fecha?.split('T')[0]
  form.precio = pasaje.precio
  form.rutaId = pasaje.rutaId
}

const cancelar = () => {
  editando.value = null
  Object.keys(form).forEach(k => form[k] = '')
}

const eliminar = async (id) => {
  if (!confirm('¿Eliminar este pasaje?')) return
  try {
    await $fetch(`/api/pasajes/${id}`, {
      method: 'DELETE',
      headers: headers.value,
    })
    await cargar()
  } catch (err) {
    error.value = err.data?.message || 'Error al eliminar'
  }
}

onMounted(cargar)
</script>