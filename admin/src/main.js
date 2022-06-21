import Vue from 'vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import VueRouter from 'vue-router'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Vuex from 'vuex'
import VModal from 'vue-js-modal'

import App from './App'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import EditHomepage from './pages/EditHomepage'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import EventCalendar from './pages/EventCalendar'
import Notifications from './pages/Notifications'

import EditSDG1 from './pages/AdminEditSDG1.vue'
import EditSDG4 from './pages/AdminEditSDG4.vue'
import EditSDG13 from './pages/AdminEditSDG13.vue'

// /volunteers
import VolunteerList from './pages/volunteers/VolunteerList'
import VolunteerProfile from './pages/volunteers/VolunteerProfile'

// /officers
import OfficerList from './pages/officers/OfficerList'
import OfficerProfile from './pages/officers/OfficerProfile'
import OfficerAdd from './pages/officers/OfficerAdd'

// /events
import EventList from './pages/events/EventList'
import EventDetails from './pages/events/EventDetails'
import EventSummary from './pages/events/EventSummary'
import EventPreAdd from './pages/events/EventPreAdd'
import EventAdd from './pages/events/EventAdd'
import EventEvaluation from './pages/events/EventEvaluation'

// /event-templates
import EventTemplateAdd from './pages/events/templates/EventTemplateAdd'
import EventTemplateSelect from './pages/events/templates/EventTemplateSelect'

// /inkind-donations
import InkindDonationList from './pages/inkind-donations/InkindDonationList'
import InkindDonationAdjustmentList from './pages/inkind-donations/InkindDonationAdjustmentList'
import InkindDonationCategoryList from './pages/inkind-donations/InkindDonationCategoryList'
import InkindDonationOutboundList from './pages/inkind-donations/InkindDonationOutboundList'

// /expenses
import EventExpensesList from './pages/expenses/EventExpensesList'

// /monetary-donations
import MonetaryDonationList from './pages/monetary-donations/MonetaryDonationList.vue'

// /skills
import Skills from './pages/skills/SkillList'

// /reports
import ReportIncomeStatement from './pages/reports/ReportIncomeStatement'
import ReportInkindDonations from './pages/reports/ReportInkindDonations'
import ReportMonetaryDonations from './pages/reports/ReportMonetaryDonations'
import ReportEvents from './pages/reports/ReportEvents'
import ReportVolunteers from './pages/reports/ReportVolunteers'

import VolunteerSuggestion from './pages/events/VolunteerSuggestion.vue'
import Donate from './pages/AdminDonate.vue'

// /demo
import DemoCronJobs from './pages/demo/DemoCronJobs'

// /forms
import Forms from './pages/Forms'

// /event-questions
import EventQuestionList from './pages/events/questions/EventQuestionList'

import { apiClient } from './axios'
import vuexStore from './store'

library.add(fas)
library.add(fab)
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)
Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(VModal)

const store = new Vuex.Store(vuexStore)

const routes = [
  {
    path: '/',
    component: Dashboard,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/event-calendar',
    component: EventCalendar,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/profile',
    component: Profile,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/notifications',
    component: Notifications,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/edit-homepage',
    component: EditHomepage,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/forgot-password',
    component: ForgotPassword
  },
  {
    path: '/reset-password',
    component: ResetPassword
  },
  {
    path: '/skills',
    component: Skills,
    meta: {
      requiresAuth: true
    }
  },

  // /events
  {
    path: '/events',
    component: EventList,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/events/pre-add',
    component: EventPreAdd,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/events/add',
    component: EventAdd,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/events/:id',
    component: EventDetails,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/events/:id/summary',
    component: EventSummary,
    meta: {
      requiresAuth: true
    }
  },

  // /event-templates
  {
    path: '/event-templates/add',
    component: EventTemplateAdd,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/event-templates/select',
    component: EventTemplateSelect,
    meta: {
      requiresAuth: true
    }
  },

  // /event-evaluations
  {
    path: '/event-evaluations/:id',
    component: EventEvaluation,
    meta: {
      requiresAuth: true
    }
  },

  // /volunteers
  {
    path: '/volunteers',
    component: VolunteerList,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/volunteers/:id',
    component: VolunteerProfile,
    meta: {
      requiresAuth: true
    }
  },

  // /officers
  {
    path: '/officers',
    component: OfficerList,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/officers/add',
    component: OfficerAdd,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/officers/:id',
    component: OfficerProfile,
    meta: {
      requiresAuth: true
    }
  },

  // /inkind-donations
  {
    path: '/inkind-donations',
    component: InkindDonationList,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/inkind-donations/adjustments',
    component: InkindDonationAdjustmentList,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/inkind-donations/categories',
    component: InkindDonationCategoryList,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/inkind-donations/outbound',
    component: InkindDonationOutboundList,
    meta: {
      requiresAuth: true
    }
  },

  // /expenses
  {
    path: '/expenses',
    component: EventExpensesList,
    meta: {
      requiresAuth: true
    }
  },

  // /monetary-donations
  {
    path: '/monetary-donations',
    component: MonetaryDonationList,
    meta: {
      requiresAuth: true
    }
  },

  // /reports
  {
    path: '/reports/inkind-donations',
    component: ReportInkindDonations,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/reports/monetary-donations',
    component: ReportMonetaryDonations,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/reports/events',
    component: ReportEvents,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/reports/volunteers',
    component: ReportVolunteers,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/reports/income-statement',
    component: ReportIncomeStatement,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/edit-sdg1',
    component: EditSDG1,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/edit-sdg4',
    component: EditSDG4,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/edit-sdg13',
    component: EditSDG13,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/volunteersuggestion',
    component: VolunteerSuggestion,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/donate',
    component: Donate,
    meta: {
      requiresAuth: true
    }
  },

  {
    path: '/forms',
    component: Forms,
    meta: {
      requiresAuth: true
    }
  },

  {
    path: '/event-questions',
    component: EventQuestionList,
    meta: {
      requiresAuth: true
    }
  },

  // Testing purposes
  {
    path: '/demo/cron-jobs',
    component: DemoCronJobs,
    meta: {
      requiresAuth: true
    }
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    if (!store.getters.isLoggedIn) {
      next({ path: '/login' })
    } else {
      next() // go to wherever I'm going
    }
  } else {
    if (to.path === '/login' && store.getters.isLoggedIn) {
      next({ path: '/dashboard' })
    } else {
      next() // does not require auth, make sure to always call next()!
    }
  }
})

apiClient.interceptors.response.use((response) => response, function (error) {
  if (error.response?.status === 401) {
    store.dispatch('logout')

    router.push({
      path: '/login?status=401'
    })
  }

  return Promise.reject(error)
})

new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')
