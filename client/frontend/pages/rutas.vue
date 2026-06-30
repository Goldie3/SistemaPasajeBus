<template>
  <div class="admin-page">
    <div class="container" style="padding-top: 100px; padding-bottom: 40px;">
      <NuxtLink to="/principal" class="volver-link">← Volver al inicio</NuxtLink>
      <div class="page-header">
        <h1>Gestión de Rutas</h1>
        <p>Administra las rutas disponibles del sistema</p>
      </div>

      <div class="card" style="padding:24px;margin-bottom:24px;">
        <h3 style="font-size:18px;margin-bottom:16px;">{{ editando ? 'Editar Ruta' : 'Nueva Ruta' }}</h3>

        <form @submit.prevent="guardar" class="form-grid">
          <div class="field">
            <label>Origen</label>
            <input v-model="form.origen" placeholder="Ciudad de origen" :disabled="loading" />
          </div>
          <div class="field">
            <label>Destino</label>
            <input v-model="form.destino" placeholder="Ciudad de destino" :disabled="loading" />
          </div>
          <div class="field">
            <label>Parada <span style="color:#9ca3af;font-weight:400;">(opcional)</span></label>
            <input v-model="form.parada" placeholder="Ciudad intermedia" :disabled="loading" />
          </div>
          <div class="field">
            <label>Fecha y hora</label>
            <input v-model="form.fecha" type="datetime-local" :disabled="loading" />
          </div>
          <div class="field">
            <label>Precio (CLP)</label>
            <input v-model="form.precio" type="number" step="0.01" placeholder="0" :disabled="loading" />
          </div>
          <div class="field">
            <label>Capacidad</label>
            <input v-model="form.capacidad" type="number" min="1" placeholder="Nº asientos" :disabled="loading" />
          </div>
          <div class="form-actions" style="grid-column:1/-1;">
            <button class="btn btn--primary" type="submit" :disabled="loading">
              {{ editando ? 'Actualizar' : 'Agregar ruta' }}
            </button>
            <button v-if="editando" class="btn btn--secondary" type="button" @click="cancelar">Cancelar</button>
          </div>
        </form>

        <p v-if="error" class="alert alert--error" style="margin-top:16px;">{{ error }}</p>
      </div>

      <div class="card" style="padding:24px;">
        <h3 style="font-size:18px;margin-bottom:16px;">Listado de Rutas</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Origen</th><th>Destino</th><th>Parada</th><th>Fecha</th><th>Precio</th><th>Capacidad</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ruta in rutas" :key="ruta.id">
                <td>{{ ruta.id }}</td>
                <td>{{ ruta.origen }}</td>
                <td>{{ ruta.destino }}</td>
                <td>{{ ruta.parada ?? '—' }}</td>
                <td>{{ formatearFecha(ruta.fecha) }}</td>
                <td>${{ Number(ruta.precio).toLocaleString('es-CL') }}</td>
                <td>{{ ruta.capacidad }}</td>
                <td class="actions">
                  <button class="btn btn--secondary" style="padding:6px 14px;font-size:12px;" @click="editar(ruta)">Editar</button>
                  <button class="btn btn--danger" style="padding:6px 14px;font-size:12px;" @click="eliminar(ruta.id)">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth', layout: 'auth' })


const token = useCookie('auth_token')
const headers = computed(() => ({ Authorization: `Bearer ${token.value}` }))
const router = useRouter()

const rutas = ref([])
const form = reactive({ origen: '', destino: '', parada: '', fecha: '', precio: '', capacidad: '' })
const editando = ref(null)
const loading = ref(false)
const error = ref('')

const formatearFecha = (f) => f ? new Date(f).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

const cargar = async () => { rutas.value = await $fetch('/rutas', { headers: headers.value }) }

const guardar = async () => {
  loading.value = true; error.value = ''
  try {
    const body = { ...form, parada: form.parada || null }
    if (editando.value) { await $fetch(`/rutas/${editando.value}`, { method: 'PUT', headers: headers.value, body }) }
    else { await $fetch('/rutas', { method: 'POST', headers: headers.value, body }) }
    cancelar(); await cargar()
  } catch (err) { error.value = err.data?.message || 'Error al guardar' }
  finally { loading.value = false }
}

const editar = (r) => {
  editando.value = r.id; form.origen = r.origen; form.destino = r.destino
  form.parada = r.parada ?? ''; form.fecha = r.fecha?.slice(0, 16) ?? ''
  form.precio = r.precio; form.capacidad = r.capacidad
}

const cancelar = () => {
  editando.value = null; Object.assign(form, { origen: '', destino: '', parada: '', fecha: '', precio: '', capacidad: '' })
}

const eliminar = async (id) => {
  if (!confirm('¿Eliminar esta ruta?')) return
  try { await $fetch(`/rutas/${id}`, { method: 'DELETE', headers: headers.value }); await cargar() }
  catch (err) { error.value = err.data?.message || 'Error al eliminar' }
}

onMounted(async () => {
  try {
    const data = await $fetch('/auth/me', { headers: headers.value })
    if (data.data?.rol !== 'admin') { router.push('/principal'); return }
  } catch { router.push('/login'); return }
  await cargar()
})
</script>

<style scoped>
.admin-page { min-height: 100vh; background: #f5f7fa; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
.form-actions { display: flex; gap: 12px; margin-top: 4px; }
</style>
