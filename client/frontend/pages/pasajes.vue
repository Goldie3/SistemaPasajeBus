<template>
  <div class="admin-page">
    <div class="container" style="padding-top: 100px; padding-bottom: 40px;">
      <NuxtLink to="/principal" class="volver-link">← Volver al inicio</NuxtLink>
      <div class="page-header">
        <h1>Gestión de Pasajes</h1>
        <p>Administra los pasajes registrados en el sistema</p>
      </div>

      <div class="card" style="padding:24px;margin-bottom:24px;">
        <h3 style="font-size:18px;margin-bottom:16px;">{{ editando ? 'Editar Pasaje' : 'Nuevo Pasaje' }}</h3>

        <form @submit.prevent="guardar" class="form-grid">
          <div class="field">
            <label>Usuario</label>
            <select v-model="form.usuarioId" :disabled="loading">
              <option value="">Sin asignar</option>
              <option v-for="u in usuarios" :key="u.id" :value="u.id">{{ u.nombre }} — {{ u.email }}</option>
            </select>
          </div>
          <div class="field">
            <label>Nombre *</label>
            <input v-model="form.nombre" placeholder="Nombre del pasajero" :disabled="loading" required />
          </div>
          <div class="field">
            <label>Apellido</label>
            <input v-model="form.apellido" placeholder="Apellido del pasajero" :disabled="loading" />
          </div>
          <div class="field">
            <label>Ruta *</label>
            <select v-model="form.rutaId" :disabled="loading" @change="onRutaChange" required>
              <option disabled value="">Selecciona una ruta</option>
              <option v-for="r in rutas" :key="r.id" :value="r.id">
                {{ r.origen }} → {{ r.destino }} — ${{ Number(r.precio).toLocaleString('es-CL') }}
              </option>
            </select>
          </div>
          <div class="field">
            <label>Asiento *</label>
            <input v-model.number="form.asiento" type="number" min="1" :max="rutaActual?.capacidad ?? 999" placeholder="Nº asiento" :disabled="loading || !form.rutaId" required />
            <small v-if="rutaActual" style="color:#9ca3af;">Capacidad: {{ rutaActual.capacidad }} asientos</small>
          </div>
          <div class="form-actions" style="grid-column:1/-1;">
            <button class="btn btn--primary" type="submit" :disabled="loading || !form.nombre || !form.rutaId || !form.asiento">
              {{ editando ? 'Actualizar' : 'Agregar pasaje' }}
            </button>
            <button v-if="editando" class="btn btn--secondary" type="button" @click="cancelar">Cancelar</button>
          </div>
        </form>

        <p v-if="error" class="alert alert--error" style="margin-top:16px;">{{ error }}</p>
      </div>

      <div class="card" style="padding:24px;">
        <h3 style="font-size:18px;margin-bottom:16px;">Listado de Pasajes</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Usuario</th><th>Nombre</th><th>Ruta</th><th>Fecha</th><th>Precio</th><th>Asiento</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pasaje in pasajes" :key="pasaje.id">
                <td>{{ pasaje.id }}</td>
                <td>
                  <span v-if="pasaje.usuario">{{ pasaje.usuario.email }}</span>
                  <span v-else style="color:#9ca3af;">—</span>
                </td>
                <td>{{ pasaje.nombre }} {{ pasaje.apellido ?? '' }}</td>
                <td v-if="pasaje.ruta">{{ pasaje.ruta.origen }} → {{ pasaje.ruta.destino }}</td>
                <td v-else>—</td>
                <td>{{ pasaje.ruta ? formatearFecha(pasaje.ruta.fecha) : '—' }}</td>
                <td>{{ pasaje.ruta ? `$${Number(pasaje.ruta.precio).toLocaleString('es-CL')}` : '—' }}</td>
                <td>{{ pasaje.asiento }}</td>
                <td class="actions">
                  <button class="btn btn--secondary" style="padding:6px 14px;font-size:12px;" @click="editar(pasaje)">Editar</button>
                  <button class="btn btn--danger" style="padding:6px 14px;font-size:12px;" @click="eliminar(pasaje.id)">Eliminar</button>
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

const pasajes = ref([])
const rutas = ref([])
const usuarios = ref([])
const form = reactive({ usuarioId: '', nombre: '', apellido: '', rutaId: '', asiento: '' })
const editando = ref(null)
const loading = ref(false)
const error = ref('')

const rutaActual = computed(() => rutas.value.find(r => r.id === form.rutaId) ?? null)
const formatearFecha = (f) => f ? new Date(f).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

const cargar = async () => {
  const [p, r, u] = await Promise.all([
    $fetch('/api/pasajes/admin', { headers: headers.value }),
    $fetch('/api/rutas', { headers: headers.value }),
    $fetch('/api/auth/usuarios', { headers: headers.value }),
  ])
  pasajes.value = Array.isArray(p) ? p : (p.data ?? [])
  rutas.value = Array.isArray(r) ? r : (r.data ?? [])
  usuarios.value = Array.isArray(u) ? u : (u.data ?? [])
}

const onRutaChange = () => { form.asiento = '' }

const guardar = async () => {
  if (!form.nombre || !form.rutaId || !form.asiento) return
  loading.value = true; error.value = ''
  try {
    const body = { usuarioId: form.usuarioId || null, nombre: form.nombre, apellido: form.apellido, rutaId: form.rutaId, asiento: form.asiento }
    if (editando.value) { await $fetch(`/api/pasajes/${editando.value}`, { method: 'PUT', headers: headers.value, body }) }
    else { await $fetch('/api/pasajes', { method: 'POST', headers: headers.value, body }) }
    cancelar(); await cargar()
  } catch (err) { error.value = err.data?.message || 'Error al guardar' }
  finally { loading.value = false }
}

const editar = (p) => {
  editando.value = p.id; form.usuarioId = p.usuarioId ?? ''; form.nombre = p.nombre
  form.apellido = p.apellido ?? ''; form.rutaId = p.rutaId; form.asiento = p.asiento
}

const cancelar = () => {
  editando.value = null; Object.assign(form, { usuarioId: '', nombre: '', apellido: '', rutaId: '', asiento: '' })
}

const eliminar = async (id) => {
  if (!confirm('¿Eliminar este pasaje?')) return
  try { await $fetch(`/api/pasajes/${id}`, { method: 'DELETE', headers: headers.value }); await cargar() }
  catch (err) { error.value = err.data?.message || 'Error al eliminar' }
}

onMounted(async () => {
  try {
    const data = await $fetch('/api/auth/me', { headers: headers.value })
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
