<template>
  <b-navbar class="navbar">
    <b-navbar-brand to="/dashboard">
      <img
        :src="logo"
        style="margin-left: 25px; width: 55px; height: 32px"
      >
    </b-navbar-brand>

    <template v-if="isLoggedIn">
      <b-navbar-nav class="ml-auto">
        <b-navbar-nav right>
          <b-nav-item-dropdown
            style="margin-left: 18px; color: black;"
            class="events"
            text="Events"
          >
            <b-dropdown-item to="/events">
              Event List
            </b-dropdown-item>
            <b-dropdown-item to="/event-calendar">
              Event Calendar
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-navbar-nav>

      <b-navbar-nav>
        <b-nav-item
          to="/volunteers"
          style="margin-left: 18px;"
          class="volunteers"
        >
          Volunteers
        </b-nav-item>
      </b-navbar-nav>

      <!-- <b-navbar-nav>
        <b-nav-item to="/officers" style="margin-left: 18px;" class="officers">Officers</b-nav-item>
      </b-navbar-nav> -->

      <b-navbar-nav class="ml-auto">
        <b-navbar-nav right>
          <div>
            <b-nav-item-dropdown
              style="margin-left: 18px; color: black;"
              class="donations"
              text="Inventory"
            >
              <b-dropdown-item to="/inkind-donations">
                Items
              </b-dropdown-item>

              <b-dropdown-item to="/inkind-donations/outbound">
                Donated In-Kind
              </b-dropdown-item>

              <b-dropdown-divider />

              <b-dropdown-group
                id="dropdown-group-2"
                header="Monetary"
                style="font-family: 'Bebas Neue', cursive; color: black;"
              >
                <b-dropdown-item to="/monetary-donations">
                  Donations Received
                </b-dropdown-item>
              </b-dropdown-group>
            </b-nav-item-dropdown>
          </div>
        </b-navbar-nav>
      </b-navbar-nav>

      <b-navbar-nav>
        <b-nav-item
          to="/ledger-transactions"
          style="margin-left: 18px;"
          class="volunteers"
        >
          Withdrawals
        </b-nav-item>
      </b-navbar-nav>

      <b-navbar-nav>
        <b-nav-item
          to="/expenses"
          style="margin-left: 18px;"
          class="volunteers"
        >
          Expenses
        </b-nav-item>
      </b-navbar-nav>

      <b-navbar-nav class="ml-auto">
        <b-navbar-nav right>
          <b-nav-item-dropdown
            style="margin-left: 18px; color: black;"
            class="reports"
            text="Reports"
          >
            <b-dropdown-item to="/reports/events">
              Event Summaries
            </b-dropdown-item>

            <b-dropdown-item to="/reports/inkind-donations">
              Items Inventory
            </b-dropdown-item>

            <b-dropdown-item to="/reports/income-statement">
              Income & Expenses
            </b-dropdown-item>

            <b-dropdown-item to="/reports/monetary-donations">
              Monetary Donations
            </b-dropdown-item>

            <b-dropdown-item to="/reports/volunteers">
              Volunteer
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-navbar-nav>

      <b-navbar-toggle target="nav-collapse" />

      <b-collapse
        id="nav-collapse"
        is-nav
      />

      <b-navbar-nav class="ml-auto">
        <b-navbar-nav right>
          <b-nav-item-dropdown
            style="margin-right: 40px; color: black;"
            class="user"
          >
            <template #button-content>
              {{ user.firstName }}
              <span
                v-if="unseenNotificationsCount > 0"
                class="position-absolute translate-middle badge rounded-pill bg-danger"
              >
                {{ unseenNotificationCountString }}
              </span>
            </template>

            <b-dropdown-item to="/profile">
              Profile
            </b-dropdown-item>

            <b-dropdown-item to="/notifications">
              Notifications
              <span
                v-if="unseenNotificationsCount !== 0"
                class="position-absolute translate-middle badge rounded-pill bg-danger"
              >
                {{ unseenNotificationCountString }}
              </span>
            </b-dropdown-item>

            <b-dropdown-item to="/forms">
              Forms
            </b-dropdown-item>

            <b-dropdown-item to="/edit-homepage">
              Edit Homepage
            </b-dropdown-item>

            <b-dropdown-item to="/skills">
              Edit Skills
            </b-dropdown-item>

            <b-dropdown-item to="/event-questions">
              Edit Questions
            </b-dropdown-item>

            <b-dropdown-item @click="logout">
              Logout
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-navbar-nav>
    </template>
  </b-navbar>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import NotificationRepository from '../repositories/notifications'
import { apiClient } from '../axios'

const logo = require('../assets/aralpinoy.png')

const notificationRepository = new NotificationRepository(apiClient)

export default {
  name: 'Navbar',
  data () {
    return {
      logo
    }
  },
  computed: {
    ...mapGetters(['user', 'token', 'isLoggedIn', 'unseenNotificationsCount']),
    unseenNotificationCountString () {
      if (this.unseenNotificationsCount > 99) {
        return '99+'
      }

      return this.unseenNotificationsCount
    }
  },
  async created () {
    notificationRepository.setAuthorizationHeader(`Bearer ${this.token}`)

    await this.getUnseenNotificationCount()
  },
  methods: {
    ...mapActions(['setUnseenNotificationsCount']),
    async getUnseenNotificationCount () {
      const count = await notificationRepository.countUnseen({
        userId: this.user._id
      })

      this.setUnseenNotificationsCount(count)
    },
    logout () {
      this.$store.dispatch('logout')

      this.$router.push({
        path: '/login'
      })
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
.navbar{
  background-color: #b6b6b6;
}
.events, .volunteers, .officers, .donations, .reports, .user {
  color: black;
  font-family: 'Bebas Neue', cursive;
  font-size: 18px;
}
</style>
