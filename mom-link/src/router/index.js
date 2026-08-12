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
      path: '/',
      component: WelcomeView
    },
    {
      path: '/home',
      component: MainLayout,
      children: [
        { path: '/home', name: 'home', component: HomeView },
        { path: '/home/monitor', name: 'monitor', component: MonitorView },
        { path: '/home/ai-analysis', name: 'ai-analysis', component: AIAnalysisView },
        { path: '/home/profile', name: 'profile', component: ProfileView },
        { path: '/home/health-report', name: 'health-report', component: HealthReportView },
        { path: '/home/bluetooth', name: 'bluetooth', component: BluetoothView },
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
