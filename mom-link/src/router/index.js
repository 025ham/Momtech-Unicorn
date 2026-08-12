import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../views/MainLayout.vue'
import HomeView from '../views/HomeView.vue'
import MonitorView from '@/views/MonitorView.vue'
import AIAnalysisView from '@/views/AIAnalysisView.vue'
import ProfileView from '@/views/ProfileView.vue'
import HealthReportView from '@/views/HealthReportView.vue'
import EmergencyView from '@/views/EmergencyView.vue'
import BluetoothView from '@/views/BluetoothView.vue'
import WelcomeView from '@/views/WelcomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/welcome',
      component: WelcomeView
    },
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: '/', name: 'home', component: HomeView },
        { path: '/monitor', name: 'monitor', component: MonitorView },
        { path: '/ai-analysis', name: 'ai-analysis', component: AIAnalysisView },
        { path: '/profile', name: 'profile', component: ProfileView },
        { path: '/health-report', name: 'health-report', component: HealthReportView },
        { path: '/bluetooth', name: 'bluetooth', component: BluetoothView },
      ]
    },
    {
      path: '/emergency',
      name: 'emergency',
      component: EmergencyView
    }
  ]
})

export default router
