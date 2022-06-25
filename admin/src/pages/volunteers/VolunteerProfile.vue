<template>
  <div>
    <div class="py-5">
      <img
        :src="logo"
        style="width: 320px; height: 150px"
      >
    </div>

    <b-container
      v-if="isLoadingUser"
      style="height: 100vh"
    >
      <b-row
        class="vh-100"
        align-h="center"
      >
        <b-col
          cols="12"
          align-self="center"
        >
          <b-spinner style="width: 10rem; height: 10rem;" />
        </b-col>
      </b-row>
    </b-container>

    <b-container v-else>
      <b-row class="pb-4">
        <b-col cols="12">
          <b-card style="border-radius: 20px;">
            <h3 style="font-family:'Bebas Neue', cursive; color: black; position: relative;">
              User Profile
            </h3>

            <b-container fluid>
              <b-row class="my-1">
                <label
                  for="input-small"
                  style="font-family:'Bebas Neue', cursive;"
                >Email Address</label>
                <b-col>
                  <b-skeleton
                    v-if="isLoadingUser"
                    type="input"
                  />
                  <b-form-input
                    v-else
                    v-model="user.email"
                    disabled
                  />
                </b-col>
              </b-row>

              <b-row class="my-1">
                <label
                  for="input-small"
                  style="font-family:'Bebas Neue', cursive;"
                >First Name</label>
                <b-col>
                  <b-skeleton
                    v-if="isLoadingUser"
                    type="input"
                  />
                  <b-form-input
                    v-else
                    v-model="user.firstName"
                    disabled
                  />
                </b-col>
              </b-row>

              <b-row class="my-1">
                <label
                  for="input-small"
                  style="font-family:'Bebas Neue', cursive;"
                >Last Name</label>
                <b-col>
                  <b-skeleton
                    v-if="isLoadingUser"
                    type="input"
                  />
                  <b-form-input
                    v-else
                    v-model="user.lastName"
                    disabled
                  />
                </b-col>
              </b-row>

              <b-row class="my-1">
                <label
                  for="input-small"
                  style="font-family:'Bebas Neue', cursive;"
                >Contact Number</label>
                <b-col>
                  <b-skeleton
                    v-if="isLoadingUser"
                    type="input"
                  />
                  <b-form-input
                    v-else
                    v-model="user.contactNumber"
                    disabled
                  />
                </b-col>
              </b-row>

              <b-row class="my-1">
                <label
                  for="input-small"
                  style="font-family:'Bebas Neue', cursive;"
                >Gender</label>
                <b-col>
                  <b-skeleton
                    v-if="isLoadingUser"
                    type="input"
                  />
                  <b-form-input
                    v-else
                    v-model="user.gender"
                    disabled
                  />
                </b-col>
              </b-row>

              <b-row class="my-1">
                <label
                  for="input-small"
                  style="font-family:'Bebas Neue', cursive;"
                >Date of Birth</label>
                <b-col>
                  <b-skeleton
                    v-if="isLoadingUser"
                    type="input"
                  />
                  <b-form-input
                    v-else
                    v-model="birthDate"
                    disabled
                  />
                </b-col>
              </b-row>

              <b-row class="my-1">
                <label
                  for="input-small"
                  style="font-family:'Bebas Neue', cursive;"
                >
                  Province
                </label>

                <b-col>
                  <b-skeleton
                    v-if="isLoadingUser"
                    type="input"
                  />

                  <b-form-input
                    v-else
                    :value="user.location !== undefined ? user.location.province : ''"
                    disabled
                  />
                </b-col>
              </b-row>

              <b-row class="my-1">
                <label
                  for="input-small"
                  style="font-family:'Bebas Neue', cursive;"
                >
                  City
                </label>

                <b-col>
                  <b-skeleton
                    v-if="isLoadingUser"
                    type="input"
                  />

                  <b-form-input
                    v-else
                    :value="user.location !== undefined ? user.location.city : ''"
                    disabled
                  />
                </b-col>
              </b-row>
            </b-container>
          </b-card>
        </b-col>
      </b-row>

      <b-row class="pb-4">
        <b-col cols="12">
          <b-card style="border-radius: 20px;">
            <b-container fluid>
              <b-row>
                <b-col cols="12">
                  <h1 style="font-family:'Bebas Neue', cursive;">
                    Events Volunteered
                  </h1>
                </b-col>
              </b-row>

              <b-row class="my-2">
                <b-col cols="12">
                  <b-container>
                    <b-row
                      class="mb-4"
                      align-v="center"
                      align-h="start"
                    >
                      <b-col cols="4">
                        <b-row align-v="center">
                          <b-col cols="3">
                            <label
                              for="per-page-select"
                              style="font-size: 15px; font-family:'Bebas Neue', cursive;"
                            >
                              Per Page&nbsp;&nbsp;
                            </label>
                          </b-col>

                          <b-col>
                            <select
                              v-model="eventVolunteers.pagination.perPage"
                              class="form-select form-select-sm"
                              aria-label="Default select example"
                            >
                              <option
                                v-for="option in pageOptions"
                                :key="option"
                              >
                                {{ option }}
                              </option>
                            </select>
                          </b-col>
                        </b-row>
                      </b-col>
                    </b-row>
                  </b-container>
                </b-col>
              </b-row>

              <b-row>
                <b-col cols="12">
                  <b-table
                    ref="eventVolunteersTable"
                    :items="getEventVolunteers"
                    :fields="eventVolunteers.fields"
                    :current-page="eventVolunteers.pagination.currentPage"
                    :per-page="eventVolunteers.pagination.perPage"
                    show-empty
                    small
                    stacked="md"
                    hover
                    striped
                    style="background:white"
                  >
                    <template #cell(event)="{ item }">
                      <b-link :to="`/events/${item.event._id}`">
                        {{ item.event.name }}
                      </b-link>
                    </template>

                    <template #cell(startDate)="{ item }">
                      <span>
                        {{
                          new Date(item.event.date.start).toLocaleString('en-us', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })
                        }}
                      </span>
                    </template>

                    <template #cell(status)="{ item }">
                      <span>
                        {{ item.event.status }}
                      </span>
                    </template>

                    <template #cell(absent)="{ value }">
                      <span>
                        {{ value ? 'YES' : 'NO  ' }}
                      </span>
                    </template>

                    <template #cell(shouldPenalize)="{ item, value }">
                      <span v-if="item.absent && value !== undefined">
                        {{ value ? 'NO' : 'YES  ' }}
                      </span>
                    </template>
                  </b-table>
                </b-col>
              </b-row>

              <b-row class="justify-content-md-center">
                <b-col
                  cols="6"
                  class="my-1"
                >
                  <b-pagination
                    v-model="eventVolunteers.pagination.currentPage"
                    :total-rows="eventVolunteers.total"
                    :per-page="eventVolunteers.pagination.perPage"
                    align="fill"
                    size="sm"
                    class="my-0"
                  />
                </b-col>
              </b-row>
            </b-container>
          </b-card>
        </b-col>
      </b-row>

      <b-row class="pb-4">
        <b-col cols="12">
          <b-card style="border-radius: 20px;">
            <b-container fluid>
              <b-row>
                <b-col cols="12">
                  <h1 style="font-family:'Bebas Neue', cursive;">
                    Event Donation History
                  </h1>
                </b-col>
              </b-row>

              <b-row class="my-2">
                <b-col cols="12">
                  <b-container>
                    <b-row
                      class="mb-4"
                      align-v="center"
                      align-h="start"
                    >
                      <b-col cols="4">
                        <b-row align-v="center">
                          <b-col cols="3">
                            <label
                              for="per-page-select"
                              style="font-size: 15px; font-family:'Bebas Neue', cursive;"
                            >
                              Per Page&nbsp;&nbsp;
                            </label>
                          </b-col>

                          <b-col>
                            <select
                              v-model="eventDonations.pagination.perPage"
                              class="form-select form-select-sm"
                              aria-label="Default select example"
                            >
                              <option
                                v-for="option in pageOptions"
                                :key="option"
                              >
                                {{ option }}
                              </option>
                            </select>
                          </b-col>
                        </b-row>
                      </b-col>
                    </b-row>
                  </b-container>
                </b-col>
              </b-row>

              <b-row>
                <b-col cols="12">
                  <b-table
                    :items="getEventDonations"
                    :fields="eventDonations.fields"
                    :current-page="eventDonations.pagination.currentPage"
                    :per-page="eventDonations.pagination.perPage"
                    show-empty
                    small
                    stacked="md"
                    hover
                    striped
                    style="background:white"
                  >
                    <template #cell(createdAt)="{ value }">
                      <span v-if="value !== undefined && value !== ''">
                        {{
                          new Date(value).toLocaleString('en-us', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })
                        }}
                      </span>
                    </template>

                    <template #cell(amount)="{ value }">
                      <span>
                        {{
                          new Intl.NumberFormat('en-us', {
                            style: 'currency',
                            currency: 'PHP'
                          }).format(value)
                        }}
                      </span>
                    </template>

                    <template #cell(event)="{ item }">
                      <b-link :to="`/events/${item.event._id}`">
                        {{ item.event.name }}
                      </b-link>
                    </template>

                    <template #cell(status)="{ value }">
                      <span>
                        {{ value.toUpperCase() }}
                      </span>
                    </template>
                  </b-table>
                </b-col>
              </b-row>

              <b-row class="justify-content-md-center">
                <b-col
                  cols="6"
                  class="my-1"
                >
                  <b-pagination
                    v-model="eventDonations.pagination.currentPage"
                    :total-rows="eventDonations.total"
                    :per-page="eventDonations.pagination.perPage"
                    align="fill"
                    size="sm"
                    class="my-0"
                  />
                </b-col>
              </b-row>
            </b-container>
          </b-card>
        </b-col>
      </b-row>

      <b-row class="pb-4">
        <b-col cols="12">
          <b-card style="border-radius: 20px;">
            <b-container fluid>
              <b-row>
                <b-col cols="12">
                  <h1 style="font-family:'Bebas Neue', cursive;">
                    Aral Pinoy Donation History
                  </h1>
                </b-col>
              </b-row>

              <b-row class="my-2">
                <b-col cols="12">
                  <b-container>
                    <b-row
                      class="mb-4"
                      align-v="center"
                      align-h="start"
                    >
                      <b-col cols="4">
                        <b-row align-v="center">
                          <b-col cols="3">
                            <label
                              for="per-page-select"
                              style="font-size: 15px; font-family:'Bebas Neue', cursive;"
                            >
                              Per Page&nbsp;&nbsp;
                            </label>
                          </b-col>

                          <b-col>
                            <select
                              v-model="monetaryDonations.pagination.perPage"
                              class="form-select form-select-sm"
                              aria-label="Default select example"
                            >
                              <option
                                v-for="option in pageOptions"
                                :key="option"
                              >
                                {{ option }}
                              </option>
                            </select>
                          </b-col>
                        </b-row>
                      </b-col>
                    </b-row>
                  </b-container>
                </b-col>
              </b-row>

              <b-row>
                <b-col cols="12">
                  <b-table
                    :items="getMonetaryDonations"
                    :fields="monetaryDonations.fields"
                    :current-page="monetaryDonations.pagination.currentPage"
                    :per-page="monetaryDonations.pagination.perPage"
                    show-empty
                    small
                    stacked="md"
                    hover
                    striped
                    style="background:white"
                  >
                    <template #cell(createdAt)="{ value }">
                      <span v-if="value !== undefined && value !== ''">
                        {{
                          new Date(value).toLocaleString('en-us', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })
                        }}
                      </span>
                    </template>

                    <template #cell(contact)="{ item }">
                      <span style="font-size: 14px">
                        {{
                          getContactFromMonetaryDonationMetadata(item.metadata)
                        }}
                      </span>
                    </template>

                    <template #cell(amount)="{ value }">
                      <span>
                        {{
                          new Intl.NumberFormat('en-us', {
                            style: 'currency',
                            currency: 'PHP'
                          }).format(value)
                        }}
                      </span>
                    </template>

                    <template #cell(status)="{ value }">
                      <span>
                        {{ value.toUpperCase() }}
                      </span>
                    </template>
                  </b-table>
                </b-col>
              </b-row>

              <b-row class="justify-content-md-center">
                <b-col
                  cols="6"
                  class="my-1"
                >
                  <b-pagination
                    v-model="monetaryDonations.pagination.currentPage"
                    :total-rows="monetaryDonations.total"
                    :per-page="monetaryDonations.pagination.perPage"
                    align="fill"
                    size="sm"
                    class="my-0"
                  />
                </b-col>
              </b-row>
            </b-container>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { apiClient } from '../../axios'
import EventDonationRepository from '../../repositories/events/donations'
import EventVolunteerRepository from '../../repositories/events/volunteers'
import MonetaryDonationRepository from '../../repositories/monetary-donations'

const logo = require('../../assets/aralpinoywords.png')

const eventDonationRepository = new EventDonationRepository(apiClient)
const eventVolunteerRepository = new EventVolunteerRepository(apiClient)
const monetaryDonationRepository = new MonetaryDonationRepository(apiClient)

const EVENTS_VOLUNTEERED_SORT_MAPPING = {
  startDate: 'event.date.start'
}

const EVENT_DONATIONS_SORT_MAPPING = {
  createdAt: 'createdAt',
  amount: 'amount'
}

const MONETARY_DONATIONS_SORT_MAPPING = {
  createdAt: 'createdAt',
  amount: 'amount'
}

export default {
  name: 'VolunteerProfile',
  data () {
    return {
      logo,
      user: null,
      isLoadingUser: false,
      pageOptions: [5, 10, 15],
      eventVolunteers: {
        results: [],
        total: 0,
        pagination: {
          perPage: 5,
          currentPage: 1
        },
        fields: [
          { key: 'event', label: 'Event' },
          { key: 'startDate', label: 'Date & Time', sortable: true },
          { key: 'event.location.name', label: 'Venue' },
          { key: 'status', label: 'Status' },
          { key: 'absent', label: 'Is Absent' },
          { key: 'shouldPenalize', label: 'Is Excused' }
        ]
      },
      eventDonations: {
        results: [],
        total: 0,
        pagination: {
          perPage: 5,
          currentPage: 1
        },
        fields: [
          { key: '_id', label: 'Reference Number' },
          { key: 'createdAt', label: 'Transaction Date & Time', sortable: true },
          { key: 'amount', label: 'Amount', sortable: true },
          { key: 'event', label: 'Event' },
          { key: 'status', label: 'Status' }
        ]
      },
      monetaryDonations: {
        results: [],
        total: 0,
        pagination: {
          perPage: 5,
          currentPage: 1
        },
        fields: [
          { key: '_id', label: 'Reference Number' },
          { key: 'createdAt', label: 'Transaction Date & Time', sortable: true },
          { key: 'contact', label: 'Contact Details' },
          { key: 'amount', label: 'Amount', sortable: true },
          { key: 'status', label: 'Status' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['token']),
    birthDate () {
      if (this.isLoadingUser) {
        return ''
      }

      if (!this.user.birthDate) {
        return ''
      }

      return new Date(this.user.birthDate).toLocaleString('en-us', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    eventDonationsPageOffset () {
      return (this.eventDonations.pagination.currentPage - 1) * this.eventDonations.pagination.perPage
    },
    eventVolunteersPageOffset () {
      return (this.eventVolunteers.pagination.currentPage - 1) * this.eventVolunteers.pagination.perPage
    }
  },
  async created () {
    await this.getUser()

    const authHeader = `Bearer ${this.token}`

    eventDonationRepository.setAuthorizationHeader(authHeader)
    eventVolunteerRepository.setAuthorizationHeader(authHeader)
    monetaryDonationRepository.setAuthorizationHeader(authHeader)
  },
  methods: {
    async getUser () {
      this.isLoadingUser = true

      const { id } = this.$route.params

      try {
        const { data } = await apiClient.get(`/users/${id}`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })

        this.user = data
      } finally {
        this.isLoadingUser = false
      }
    },
    async getEventVolunteers (ctx) {
      const {
        sortBy,
        sortDesc
      } = ctx

      const userId = this.user._id

      const perPage = this.eventVolunteers.pagination.perPage
      const pageOffset = this.eventVolunteersPageOffset
      const sort = {
        field: undefined,
        order: undefined
      }

      if (sortBy !== undefined && sortBy !== '') {
        sort.field = EVENTS_VOLUNTEERED_SORT_MAPPING[sortBy]
        sort.order = sortDesc ? 'desc' : 'asc'
      }

      const { results, total } = await eventVolunteerRepository.list({
        userId,
        eventStatuses: ['UPCOMING', 'ENDED']
      }, {
        limit: perPage,
        offset: pageOffset,
        expand: true,
        sort
      })

      this.eventVolunteers.total = total

      return results
    },
    async getEventDonations (ctx) {
      const {
        sortBy,
        sortDesc
      } = ctx

      const userId = this.user._id

      const perPage = this.eventDonations.pagination.perPage
      const pageOffset = this.eventDonationsPageOffset
      const sort = {
        field: 'createdAt',
        order: 'desc'
      }

      if (sortBy !== undefined && sortBy !== '') {
        sort.field = EVENT_DONATIONS_SORT_MAPPING[sortBy]
        sort.order = sortDesc ? 'desc' : 'asc'
      }

      const { results, total } = await eventDonationRepository.list({
        userId
      }, {
        limit: perPage,
        offset: pageOffset,
        expand: true,
        sort
      })

      this.eventDonations.total = total

      return results
    },
    async getMonetaryDonations (ctx) {
      const {
        sortBy,
        sortDesc
      } = ctx

      const userId = this.user._id

      const perPage = this.eventDonations.pagination.perPage
      const pageOffset = this.eventDonationsPageOffset
      const sort = {
        field: 'createdAt',
        order: 'desc'
      }

      if (sortBy !== undefined && sortBy !== '') {
        sort.field = MONETARY_DONATIONS_SORT_MAPPING[sortBy]
        sort.order = sortDesc ? 'desc' : 'asc'
      }

      const { results, total } = await monetaryDonationRepository.list({
        userId
      }, {
        limit: perPage,
        offset: pageOffset,
        expand: true,
        sort
      })

      this.monetaryDonations.total = total

      return results
    },
    getContactFromMonetaryDonationMetadata (metadata) {
      if (metadata === undefined) {
        return ''
      }

      if (metadata.contactDetails === undefined) {
        return ''
      }

      const contactDetails = metadata.contactDetails

      const nameBuilder = []

      if (contactDetails.firstName !== undefined) {
        nameBuilder.push(contactDetails.firstName)
      }

      if (contactDetails.middleName !== undefined) {
        nameBuilder.push(contactDetails.middleName)
      }

      if (contactDetails.lastName !== undefined) {
        nameBuilder.push(contactDetails.lastName)
      }

      const name = nameBuilder.join(' ')

      if (contactDetails.email !== undefined) {
        return `${name} <${contactDetails.email}>`
      } else if (contactDetails.phone !== undefined) {
        return `${name} <${contactDetails.phone}>`
      }

      return name
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans&display=swap');
</style>
