<template>
  <div>
    <b-container class="py-5">
      <b-row class="pb-5">
        <b-col cols="12">
          <b-card style="border-radius: 20px;">
            <b-container fluid>
              <h2 style="font-family:'Bebas Neue', cursive; color: black; position: relative; font-size: 20px; text-align: left;">
                <b-link to="/events">
                  Upcoming Events <b-icon icon="chevron-right" />
                </b-link>
              </h2>

              <b-row>
                <b-col
                  v-for="event in events.results"
                  :key="event._id"
                  cols="12"
                  md="3"
                >
                  <b-card style="border-radius: 20px;">
                    <b-link
                      :to="`/events/${event._id}`"
                      style="font-size:20px;"
                    >
                      {{ event.name }}
                    </b-link><br>

                    <b-row style="text-align: left">
                      <b-col
                        v-if="event.location !== undefined"
                        class="pb-2"
                        cols="12"
                      >
                        <b-icon icon="geo-alt" /> {{ event.location.name }}
                      </b-col>

                      <b-col
                        class="pb-2"
                        cols="12"
                      >
                        <b-icon icon="calendar" />
                        {{
                          new Date(event.date.start).toLocaleString('en-us', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })
                        }}
                      </b-col>

                      <b-col
                        class="pb-3"
                        cols="12"
                      >
                        <b-icon icon="clock" /> {{ getDurationBetweenDates(event.date.start, event.date.end) }}
                      </b-col>
                    </b-row>

                    <b-row v-if="event.goals.monetaryDonation.target !== 0">
                      <b-col
                        class="pt-2"
                        cols="12"
                      >
                        <b-progress
                          height="1.5rem"
                          :max="event.goals.monetaryDonation.target"
                        >
                          <b-progress-bar
                            variant="success"
                            :value="hasGoalReached(event.goals.monetaryDonation) ? event.goals.monetaryDonation.current : 0"
                            :label="getMonetaryDonationCurrentLabel(event.goals.monetaryDonation)"
                          />

                          <b-progress-bar
                            variant="danger"
                            :value="hasGoalReached(event.goals.monetaryDonation) ? 0 : event.goals.monetaryDonation.target"
                            :label="getMonetaryDonationTargetLabel(event.goals.monetaryDonation)"
                          />
                        </b-progress>
                      </b-col>
                    </b-row>

                    <b-row v-if="event.goals.numVolunteers.target !== 0">
                      <b-col
                        class="pt-2"
                        cols="12"
                      >
                        <b-progress
                          height="1.5rem"
                          :max="event.goals.numVolunteers.target"
                        >
                          <b-progress-bar
                            variant="success"
                            :value="hasGoalReached(event.goals.numVolunteers) ? event.goals.numVolunteers.current : 0"
                            :label="getVolunteerGoalCurrentLabel(event.goals.numVolunteers)"
                          />

                          <b-progress-bar
                            variant="danger"
                            :value="hasGoalReached(event.goals.numVolunteers) ? 0 : event.goals.numVolunteers.target"
                            :label="getVolunteerGoalTargetLabel(event.goals.numVolunteers)"
                          />
                        </b-progress>
                      </b-col>
                    </b-row>
                  </b-card>
                </b-col>
              </b-row>
            </b-container>
          </b-card>
        </b-col>
      </b-row>

      <b-row class="pb-5">
        <b-col cols="12">
          <b-card style="border-radius: 20px;">
            <b-container fluid>
              <h2 style="font-family:'Bebas Neue', cursive; color: black; position: relative; font-size: 20px; text-align: left;">
                SDG Campaign
              </h2>

              <b-skeleton-wrapper :loading="report.sdgEvaluation.isLoading">
                <template #loading>
                  <b-spinner
                    class="my-5"
                    style="width: 10rem; height: 10rem;"
                  />
                </template>

                <div v-if="!report.sdgEvaluation.isLoading">
                  <b-row>
                    <b-col
                      cols="12"
                      md="4"
                    >
                      <bar-chart
                        :height="400"
                        :chart-data="{
                          labels: report.sdgEvaluation.noPoverty.labels,
                          datasets: [{
                            ...report.sdgEvaluation.noPoverty.datasets[0],
                            backgroundColor: [
                              'rgb(54, 235, 151)',
                            ],
                          }, {
                            ...report.sdgEvaluation.noPoverty.datasets[1],
                            backgroundColor: [
                              'rgb(255, 99, 132)',
                            ],
                          }]
                        }"
                        :options="{
                          scales: {
                            yAxes: {
                              ticks: {
                                min: 0,
                                beginAtZero: true,
                                precision: 0
                              }
                            }
                          },
                          responsive: true,
                          plugins: {
                            title: {
                              display: true,
                              text: '#1 No Poverty'
                            },
                            tooltip: {
                              callbacks: {
                                title: handleSdgChartTooltip.bind(this, 'sdgEvaluation.noPoverty')
                              }
                            }
                          }
                        }"
                      />
                    </b-col>

                    <b-col
                      cols="12"
                      md="4"
                    >
                      <bar-chart
                        :height="400"
                        :chart-data="{
                          labels: report.sdgEvaluation.qualityEducation.labels,
                          datasets: [{
                            ...report.sdgEvaluation.qualityEducation.datasets[0],
                            backgroundColor: [
                              'rgb(54, 235, 151)',
                            ],
                          }, {
                            ...report.sdgEvaluation.qualityEducation.datasets[1],
                            backgroundColor: [
                              'rgb(255, 99, 132)',
                            ],
                          }]
                        }"
                        :options="{
                          scales: {
                            yAxes: {
                              ticks: {
                                min: 0,
                                beginAtZero: true,
                                precision: 0
                              }
                            }
                          },
                          responsive: true,
                          plugins: {
                            title: {
                              display: true,
                              text: '#4 Quality Education'
                            },
                            tooltip: {
                              callbacks: {
                                title: handleSdgChartTooltip.bind(this, 'sdgEvaluation.qualityEducation')
                              }
                            }
                          }
                        }"
                      />
                    </b-col>

                    <b-col
                      cols="12"
                      md="4"
                    >
                      <bar-chart
                        :height="400"
                        :chart-data="{
                          labels: report.sdgEvaluation.climateAction.labels,
                          datasets: [{
                            ...report.sdgEvaluation.climateAction.datasets[0],
                            backgroundColor: [
                              'rgb(54, 235, 151)',
                            ],
                          }, {
                            ...report.sdgEvaluation.climateAction.datasets[1],
                            backgroundColor: [
                              'rgb(255, 99, 132)',
                            ],
                          }]
                        }"
                        :options="{
                          scales: {
                            yAxes: {
                              ticks: {
                                min: 0,
                                beginAtZero: true,
                                precision: 0
                              }
                            }
                          },
                          responsive: true,
                          plugins: {
                            title: {
                              display: true,
                              text: '#13 Climate Action'
                            },
                            tooltip: {
                              callbacks: {
                                title: handleSdgChartTooltip.bind(this, 'sdgEvaluation.climateAction')
                              }
                            }
                          }
                        }"
                      />
                    </b-col>
                  </b-row>
                </div>
              </b-skeleton-wrapper>
            </b-container>
          </b-card>
        </b-col>
      </b-row>

      <b-row class="pb-5">
        <b-col cols="12">
          <b-card style="border-radius: 20px;">
            <b-container fluid>
              <h2 style="font-family:'Bebas Neue', cursive; color: black; position: relative; font-size: 20px; text-align: left;">
                Last 30 Days Income & Expense Report
              </h2>

              <b-skeleton-wrapper :loading="report.isLoadingIncomeStatement">
                <template #loading>
                  <b-spinner
                    class="my-5"
                    style="width: 10rem; height: 10rem;"
                  />
                </template>

                <div v-if="!report.isLoadingIncomeStatement">
                  <b-row>
                    <b-col
                      cols="12"
                    >
                      <trend-chart
                        :height="150"
                        :chart-data="{
                          labels: report.incomeStatement.labels,
                          datasets: [{
                            ...report.incomeStatement.datasets[0],
                            borderColor: 'rgb(54, 235, 151)',
                            backgroundColor: [
                              'rgb(54, 235, 151)',
                            ],
                          }, {
                            ...report.incomeStatement.datasets[1],
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: [
                              'rgb(255, 99, 132)',
                            ],
                          }]
                        }"
                        :options="{
                          scales: {
                            yAxes: {
                              ticks: {
                                min: 0,
                                beginAtZero: true,
                                precision: 0
                              }
                            }
                          },
                          responsive: true
                        }"
                      />
                    </b-col>
                  </b-row>
                </div>
              </b-skeleton-wrapper>
            </b-container>
          </b-card>
        </b-col>
      </b-row>

      <b-row>
        <b-col cols="12">
          <b-card style="border-radius: 20px;">
            <b-container fluid>
              <h2 style="font-family:'Bebas Neue', cursive; text-align: left;">
                Latest Donations Collected
              </h2>

              <b-row class="mb-4">
                <b-col cols="12">
                  <b-card style="border-radius: 20px;">
                    <b-container fluid>
                      <b-row class="mb-3">
                        <b-col cols="12">
                          <h3 style="font-family:'Bebas Neue', cursive;">
                            In-Kind Donations
                          </h3>
                        </b-col>
                      </b-row>

                      <b-row class="mb-3">
                        <b-col cols="12">
                          <b-table
                            :items="groupedIkd.results"
                            :fields="groupedIkd.fields"
                            :current-page="1"
                            :per-page="5"
                            stacked="md"
                            show-empty
                            small
                            hover
                          />
                        </b-col>
                      </b-row>

                      <b-row>
                        <b-col cols="12">
                          <b-button
                            to="/inkind-donations"
                            pill
                            variant="danger"
                          >
                            View More In-Kind Donations
                          </b-button>
                        </b-col>
                      </b-row>
                    </b-container>
                  </b-card>
                </b-col>
              </b-row>

              <b-row class="mb-4">
                <b-col cols="12">
                  <b-card style="border-radius: 20px;">
                    <b-container fluid>
                      <b-row class="mb-3">
                        <b-col cols="12">
                          <h3 style="font-family:'Bebas Neue', cursive;">
                            Monetary Donations
                          </h3>
                        </b-col>
                      </b-row>

                      <b-row class="mb-3">
                        <b-col cols="12">
                          <b-table
                            :items="eventDonations.results"
                            :fields="eventDonations.fields"
                            :current-page="1"
                            :per-page="5"
                            stacked="md"
                            show-empty
                            small
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

                            <template #cell(event)="{ item }">
                              <b-link :to="`/events/${item.event._id}`">
                                {{ item.event.name }}
                              </b-link>
                            </template>
                          </b-table>
                        </b-col>
                      </b-row>

                      <b-row>
                        <b-col cols="12">
                          <b-button
                            to="/monetary-donations"
                            pill
                            variant="danger"
                          >
                            View More Monetary Donations
                          </b-button>
                        </b-col>
                      </b-row>
                    </b-container>
                  </b-card>
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
import {
  isSameDay,
  intervalToDuration,
  formatDuration,
  subDays
} from 'date-fns'

import BarChart from '../components/charts/Bar'
import TrendChart from '../components/charts/Trend'

import { apiClient } from '../axios'
import InkindDonationRepository from '../repositories/inkind-donations'
import EventDonationRepository from '../repositories/events/donations'
import ReportRepository from '../repositories/reports'

const logo = require('../assets/aralpinoywords.png')

const inkindDonationRepository = new InkindDonationRepository(apiClient)
const eventDonationRepository = new EventDonationRepository(apiClient)
const reportRepository = new ReportRepository(apiClient)

function splitByWordCount (sentence, count) {
  const words = sentence.split(' ')
  const result = []

  while (words.length > 0) {
    result.push(words.splice(0, count).join(' '))
  }

  return result
}

export default {
  name: 'Dashboard',
  components: {
    BarChart,
    TrendChart
  },
  data () {
    return {
      logo,
      isDisabled: false,
      fields: [
        { key: 'date', label: 'Date', sortable: true, class: 'text-center' },
        { key: 'item', label: 'Item', sortable: true, class: 'text-center' },
        { key: 'qty', label: 'Quantity', sortable: true, class: 'text-center' },
        { key: 'ctgry', label: 'Category', sortable: true, class: 'text-center' },
        { key: 'bestbefore', label: 'Best Before', sortable: true, class: 'text-center' },
        { key: 'expiration', label: 'Expiration Date', sortable: true, class: 'text-center' }
      ],
      totalRows: 1,
      currentPage: 1,
      currentPages: 1,
      perPage: 5,
      perPages: 5,
      filter: null,
      isLoadingEvents: false,
      events: {
        results: []
      },
      groupedIkd: {
        results: [],
        fields: [
          { key: '_id', label: 'Item Group' },
          { key: 'quantity', label: 'Quantity' }
        ]
      },
      eventDonations: {
        results: [],
        fields: [
          { key: 'createdAt', label: 'Transaction Date & Time' },
          { key: 'amount', label: 'Amount' },
          { key: 'volunteerName', label: 'Donor' },
          { key: 'contact', label: 'Contact' },
          { key: 'event', label: 'Event' }
        ]
      },
      report: {
        sdgEvaluation: {
          isLoading: false,
          noPoverty: {
            labels: [],
            reverseLabelMap: {},
            datasets: []
          },
          qualityEducation: {
            labels: [],
            reverseLabelMap: {},
            datasets: []
          },
          climateAction: {
            labels: [],
            reverseLabelMap: {},
            datasets: []
          }
        },
        isLoadingIncomeStatement: false,
        incomeStatement: {
          labels: [],
          datasets: []
        }
      }
    }
  },
  computed: {
    ...mapGetters(['token'])
  },
  created () {
    const authHeader = `Bearer ${this.token}`

    inkindDonationRepository.setAuthorizationHeader(authHeader)
    eventDonationRepository.setAuthorizationHeader(authHeader)
    reportRepository.setAuthorizationHeader(authHeader)

    this.getEvents()
    this.getGroupedIkd()
    this.getEventDonations()
    this.getSdgsReport()
    this.getIncomeStatementReport()
  },
  methods: {
    async getEvents () {
      this.isLoadingEvents = true

      const queryString = new URLSearchParams()

      queryString.set('limit', 4)
      queryString.set('filters.status', 'UPCOMING')
      queryString.set('sort.field', 'date.start')
      queryString.set('sort.order', 'asc')

      try {
        const { data } = await apiClient.get(`/events?${queryString.toString()}`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })

        this.events.results = data.results
      } finally {
        this.isLoadingEvents = false
      }
    },
    async getGroupedIkd () {
      const { results } = await inkindDonationRepository.list({}, {
        limit: 5,
        offset: 0,
        grouped: true
      })

      this.groupedIkd.results = results
    },
    async getEventDonations () {
      const { results } = await eventDonationRepository.list({
        status: 'success'
      }, {
        limit: 5,
        offset: 0,
        expand: true,
        sort: {
          field: 'createdAt',
          order: 'desc'
        }
      })

      this.eventDonations.results = results
    },
    async getSdgsReport () {
      this.report.sdgEvaluation.isLoading = true

      try {
        const { results } = await reportRepository.getSdgs({
          start: new Date(0).toJSON(),
          end: new Date().toJSON()
        })

        this.report.sdgEvaluation.noPoverty = results.noPovertySdgEvaluation
        this.report.sdgEvaluation.qualityEducation = results.qualityEducationSdgEvaluation
        this.report.sdgEvaluation.climateAction = results.climateActionSdgEvaluation
      } finally {
        this.report.sdgEvaluation.isLoading = false
      }
    },
    async getIncomeStatementReport () {
      this.report.isLoadingIncomeStatement = true

      try {
        const { results } = await reportRepository.getIncomeStatement({
          start: subDays(new Date(), 30).toJSON(),
          end: new Date().toJSON()
        })

        this.report.incomeStatement = results.incomeStatement
      } finally {
        this.report.isLoadingIncomeStatement = false
      }
    },
    getValueFromPath (object, path, defaultValue) {
      return get(object, path, defaultValue)
    },
    isSameDay (firstDate, secondDate) {
      return isSameDay(new Date(firstDate), new Date(secondDate))
    },
    getDurationBetweenDates (start, end) {
      const duration = intervalToDuration({
        start: new Date(start),
        end: new Date(end)
      })

      return formatDuration(duration)
    },
    hasGoalReached ({ current, target }) {
      return current >= target
    },
    getMonetaryDonationCurrentLabel ({ current, target }) {
      if (current >= target) {
        const currentCurrency = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'PHP'
        }).format(current)

        const targetCurrency = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'PHP'
        }).format(target)

        return `${currentCurrency} / ${targetCurrency}`
      }

      return ''
    },
    getMonetaryDonationTargetLabel ({ current, target }) {
      if (current >= target) {
        const currency = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'PHP'
        }).format(current)

        return currency
      }

      const difference = target - current
      const currency = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP'
      }).format(difference)

      return `We still need ${currency} to reach our goal!`
    },
    getVolunteerGoalCurrentLabel ({ current, target }) {
      if (current >= target) {
        const volunteerNoun = target === 1 ? 'volunteer' : 'volunteers'

        return `${current} / ${target} ${volunteerNoun}`
      }

      return undefined
    },
    getVolunteerGoalTargetLabel ({ current, target }) {
      if (current >= target) {
        return ''
      }

      const difference = target - current
      const volunteerNoun = difference === 1 ? 'volunteer' : 'volunteers'

      return `We still need ${difference} ${volunteerNoun}!`
    },
    handleSdgChartTooltip (path, context) {
      const sdgEvaluation = get(this.report, path)
      const title = context[0].label

      const reversedLabel = sdgEvaluation.reverseLabelMap[title]

      return splitByWordCount(reversedLabel, 6)
    }
  }
}
</script>
