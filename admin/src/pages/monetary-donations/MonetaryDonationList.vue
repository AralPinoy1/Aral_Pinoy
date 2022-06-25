<template>
  <div>
    <b-container class="py-5">
      <b-row>
        <b-col cols="12">
          <b-card style="border-radius: 20px;">
            <b-container fluid>
              <b-row>
                <b-col cols="12">
                  <h1 style="font-family:'Bebas Neue', cursive;">
                    Monetary Donations Received
                  </h1>
                </b-col>
              </b-row>

              <b-row>
                <b-col cols="12">
                  <b-tabs
                    pills
                    card
                  >
                    <b-tab
                      title="Donated to Aral Pinoy Organization"
                      active
                    >
                      <b-row class="my-2">
                        <b-col cols="12">
                          <b-container>
                            <b-row
                              class="mb-4"
                              align-h="around"
                              align-v="center"
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

                              <b-col cols="4">
                                <b-dropdown
                                  class="w-50"
                                  size="sm"
                                  text="Filter by Status"
                                >
                                  <b-dropdown-form style="width: 100%">
                                    <div
                                      v-for="option in monetaryDonations.statusOptions"
                                      :key="option"
                                      class="form-check form-switch"
                                    >
                                      <label
                                        class="form-check-label"
                                        :for="`status-checkbox-${option}`"
                                      >
                                        {{ option.toUpperCase() }}
                                      </label>

                                      <input
                                        :id="`status-checkbox-${option}`"
                                        v-model="monetaryDonations.filters.statuses"
                                        class="form-check-input"
                                        type="checkbox"
                                        :value="option"
                                      >
                                    </div>
                                  </b-dropdown-form>
                                </b-dropdown>
                              </b-col>
                            </b-row>
                          </b-container>
                        </b-col>
                      </b-row>

                      <b-row class="pt-4">
                        <b-col cols="12">
                          <b-table
                            ref="monetaryDonations"
                            :items="getMonetaryDonations"
                            :fields="monetaryDonations.fields"
                            :current-page="monetaryDonations.pagination.currentPage"
                            :per-page="monetaryDonations.pagination.perPage"
                            stacked="md"
                            style="background:white"
                            show-empty
                            primary-key="_id"
                            hover
                          >
                            <template #cell(volunteerName)="{ item }">
                              <b-link
                                v-if="item.user !== undefined"
                                :to="`/volunteers/${item.user._id}`"
                              >
                                {{ item.user.firstName }} {{ item.user.lastName }}
                              </b-link>

                              <span v-else>
                                Anonymous
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
                              <span v-if="getValueFromPath(item, 'metadata.contactDetails.email') !== undefined">
                                <a :href="`mailto:${getValueFromPath(item, 'metadata.contactDetails.email')}`">
                                  {{ getValueFromPath(item, 'metadata.contactDetails.email') }}
                                </a>
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

                      <b-row class="pt-4 justify-content-md-center">
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
                    </b-tab>

                    <b-tab title="Donated to Aral Pinoy Events">
                      <b-row class="my-2">
                        <b-col cols="12">
                          <b-container>
                            <b-row
                              class="mb-4"
                              align-h="around"
                              align-v="center"
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
                                      v-model="events.pagination.perPage"
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

                      <b-row class="pt-4">
                        <b-col cols="12">
                          <b-table
                            :items="getEvents"
                            :fields="events.fields"
                            :current-page="events.pagination.currentPage"
                            :per-page="events.pagination.perPage"
                            stacked="md"
                            style="background:white"
                            show-empty
                            primary-key="_id"
                            hover
                            @row-clicked="showEventDonations"
                          >
                            <template #cell(startDate)="{ item }">
                              {{
                                new Date(item.date.start).toLocaleString('en-us', {
                                  dateStyle: 'medium'
                                })
                              }}
                            </template>

                            <template #cell(name)="{ item }">
                              <b-link :to="`/events/${item._id}`">
                                {{ item.name }}
                              </b-link>
                            </template>

                            <template #cell(donationGoal)="{ item }">
                              {{
                                new Intl.NumberFormat('en-us', {
                                  style: 'currency',
                                  currency: 'PHP'
                                }).format(item.goals.monetaryDonation.target)
                              }}
                            </template>

                            <template #cell(donationCurrent)="{ item }">
                              {{
                                new Intl.NumberFormat('en-us', {
                                  style: 'currency',
                                  currency: 'PHP'
                                }).format(item.goals.monetaryDonation.current)
                              }}
                            </template>
                          </b-table>
                        </b-col>
                      </b-row>

                      <MonetaryDonationEventDonationList
                        :show="eventDonations.modal"
                        :event="eventDonations.event"
                        @close="eventDonations.modal = false"
                      />

                      <b-row class="pt-4 justify-content-md-center">
                        <b-col
                          cols="6"
                          class="my-1"
                        >
                          <b-pagination
                            v-model="events.pagination.currentPage"
                            :total-rows="events.total"
                            :per-page="events.pagination.perPage"
                            align="fill"
                            size="sm"
                            class="my-0"
                          />
                        </b-col>
                      </b-row>
                    </b-tab>
                  </b-tabs>
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
import { get } from 'lodash'

import { apiClient } from '../../axios'
import EventRepository from '../../repositories/events'
import MonetaryDonationRepository from '../../repositories/monetary-donations'
import MonetaryDonationEventDonationList from '../../components/monetary-donations/MonetaryDonationEventDonationList'

const logo = require('../../assets/aralpinoywords.png')

const eventRepository = new EventRepository(apiClient)
const monetaryDonationRepository = new MonetaryDonationRepository(apiClient)

const MONETARY_DONATION_SORT_MAPPING = {
  createdAt: 'updatedAt'
}

export default {
  name: 'MonetaryDonationList',
  components: {
    MonetaryDonationEventDonationList
  },
  data () {
    return {
      logo,
      pageOptions: [5, 10, 20],
      monetaryDonations: {
        results: [],
        total: 0,
        filters: {
          statuses: ['success']
        },
        statusOptions: ['success', 'failed', 'pending'],
        pagination: {
          perPage: 5,
          currentPage: 1
        },
        fields: [
          { key: 'createdAt', label: 'Transaction Date & Time', sortable: true },
          { key: 'amount', label: 'Amount' },
          { key: 'volunteerName', label: 'Donor' },
          { key: 'contact', label: 'Contact' },
          { key: 'status', label: 'Status' }
        ]
      },
      events: {
        results: [],
        total: 0,
        pagination: {
          perPage: 5,
          currentPage: 1
        },
        fields: [
          { key: 'startDate', label: 'Date' },
          { key: 'name', label: 'Event Name' },
          { key: 'donationGoal', label: 'Donation Goal', class: 'text-end' },
          { key: 'donationCurrent', label: 'Donation Collection', class: 'text-end' },
          { key: 'status', label: 'Event Status' }
        ]
      },
      eventDonations: {
        modal: false,
        event: {}
      }
    }
  },
  computed: {
    ...mapGetters(['token']),
    eventsPageOffset () {
      return (this.events.pagination.currentPage - 1) * this.events.pagination.perPage
    },
    monetaryDonationsPageOffset () {
      return (this.monetaryDonations.pagination.currentPage - 1) * this.monetaryDonations.pagination.perPage
    }
  },
  watch: {
    'monetaryDonations.filters.statuses' (val) {
      if (val.length === 0) {
        return
      }

      this.$refs.monetaryDonations.refresh()
    }
  },
  created () {
    const authHeader = `Bearer ${this.token}`

    eventRepository.setAuthorizationHeader(authHeader)
    monetaryDonationRepository.setAuthorizationHeader(authHeader)
  },
  methods: {
    async getEvents (ctx) {
      const perPage = this.events.pagination.perPage
      const pageOffset = this.eventsPageOffset

      const { results, total } = await eventRepository.list({
        hasMonetaryGoal: true
      }, {
        limit: perPage,
        offset: pageOffset,
        sort: {
          field: 'date.start',
          order: 'asc'
        }
      })

      this.events.total = total

      return results
    },
    async getMonetaryDonations (ctx) {
      const {
        sortBy,
        sortDesc
      } = ctx

      const perPage = this.monetaryDonations.pagination.perPage
      const pageOffset = this.monetaryDonationsPageOffset
      const status = this.monetaryDonations.filters.statuses
      const sort = {
        field: 'createdAt',
        order: 'desc'
      }

      if (sortBy !== undefined && sortBy !== '') {
        sort.field = MONETARY_DONATION_SORT_MAPPING[sortBy]
        sort.order = sortDesc ? 'desc' : 'asc'
      }

      const { results, total } = await monetaryDonationRepository.list({
        status
      }, {
        limit: perPage,
        offset: pageOffset,
        expand: true,
        sort
      })

      this.monetaryDonations.total = total

      return results
    },
    showEventDonations (event) {
      this.eventDonations.modal = true
      this.eventDonations.event = {
        _id: event._id,
        name: event.name,
        totalDonation: event.goals.monetaryDonation.current
      }
    },
    getValueFromPath (object, path, defaultValue) {
      return get(object, path, defaultValue)
    }
  }
}
</script>
