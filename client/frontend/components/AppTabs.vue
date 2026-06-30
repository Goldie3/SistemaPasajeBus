<template>
  <div class="app-tabs" v-if="tabs.length > 1">
    <div class="container tabs-inner">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="tab-item"
        :class="{ active: tab.active }"
      >
        <span class="tab-icon" v-html="tab.icon"></span>
        {{ tab.label }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ usuario: Object })
const route = useRoute()

const tabs = computed(() => {
  const items = [
    {
      label: 'Inicio',
      to: '/principal',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      adminOnly: false,
      active: route.path === '/principal',
    },
    {
      label: 'Buscar Viajes',
      to: '/busquedarutas',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
      adminOnly: false,
      active: route.path === '/busquedarutas',
    },
    { label: 'Mis Pasajes',
      to: '/mispasajes',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16v10H4z"/><path d="M4 12h16"/><path d="M8 7v10"/><path d="M16 7v10"/></svg>',
      adminOnly: false,
      active: route.path === '/mispasajes',
    },
    {
      label: 'Gestión Rutas',
      to: '/rutas',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
      adminOnly: true,
      active: route.path === '/rutas',
    },
    {
      label: 'Gestión Pasajes',
      to: '/pasajes',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
      adminOnly: true,
      active: route.path === '/pasajes',
    },
  ]
  return items.filter(t => !t.adminOnly || props.usuario?.rol === 'admin')
})
</script>

<style scoped>
.app-tabs {
  position: fixed;
  top: var(--nav-height);
  left: 0;
  right: 0;
  z-index: 999;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.tabs-inner {
  display: flex;
  gap: 0;
  overflow-x: auto;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 12px 20px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-decoration: none;
  border-bottom: 2.5px solid transparent;
  transition: color 0.2s, border-color 0.2s;
  white-space: nowrap;
  font-family: 'Open Sans', sans-serif;
}

.tab-item:hover {
  color: #18cfd7;
}

.tab-item.active {
  color: #18cfd7;
  border-bottom-color: #18cfd7;
}

.tab-icon {
  display: flex;
  align-items: center;
  opacity: 0.7;
}

.tab-item.active .tab-icon {
  opacity: 1;
}
</style>
