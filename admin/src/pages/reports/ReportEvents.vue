<template>
  <div>
    <b-container class="py-5">
      <b-row class="pb-3">
        <b-col cols="12">
          <b-card
            bg-variant="light"
            style="border-radius: 20px;"
          >
            <b-container fluid>
              <b-row>
                <b-col cols="12">
                  <h2 style="font-family:'Bebas Neue', cursive;">
                    Events Report
                  </h2>
                </b-col>
              </b-row>

              <b-row class="py-2">
                <b-col
                  cols="12"
                  md="6"
                >
                  <label
                    for="start-datepicker"
                    style="font-family: 'Bebas Neue', cursive;"
                  >
                    From
                  </label>

                  <b-form-datepicker
                    id="start-datepicker"
                    v-model="startDate"
                    :max="endDate"
                    value-as-date
                    class="mb-2"
                  />
                </b-col>

                <b-col
                  cols="12"
                  md="6"
                >
                  <label
                    for="end-datepicker"
                    style="font-family: 'Bebas Neue', cursive;"
                  >
                    To
                  </label>

                  <b-form-datepicker
                    id="end-datepicker"
                    v-model="endDate"
                    :max="new Date()"
                    value-as-date
                    class="mb-2"
                  />
                </b-col>
              </b-row>

              <b-row class="py-2">
                <b-col cols="12">
                  <b-button
                    pill
                    variant="danger"
                    :disabled="isGeneratingReport"
                    @click="getReportEvents"
                  >
                    <b-spinner
                      v-if="isGeneratingReport"
                      style="width: 1rem; height: 1rem;"
                    />

                    <template v-else>
                      Generate Report
                    </template>
                  </b-button>
                </b-col>
              </b-row>
            </b-container>
          </b-card>
        </b-col>
      </b-row>

      <b-row
        v-if="!isGeneratingReport"
        class="pb-3"
      >
        <b-col
          class="pb-3"
          cols="12"
        >
          <b-card
            bg-variant="light"
            style="border-radius: 20px;"
          >
            <b-container
              fluid
            >
              <b-row
                class="py-2"
              >
                <b-col cols="12">
                  <h1 style="font-family:'Bebas Neue', cursive;">
                    Event Evaluations
                  </h1>
                </b-col>

                <template
                  v-for="({ eventType, eventDataset }) in eventEvaluationCharts"
                >
                  <b-col
                    :key="eventType"
                    cols="12"
                  >
                    <h3 style="font-family:'Bebas Neue', cursive;">
                      {{ eventType }}
                    </h3>
                  </b-col>

                  <div :key="`${eventType}-dataset`">
                    <b-col
                      v-for="(eventEvaluation, index) in eventDataset"
                      :key="`${eventType}-dataset-${index}`"
                      class="pb-5 d-flex w-100 justify-content-center"
                      cols="12"
                    >
                      <bar-chart
                        :height="450"
                        :width="600"
                        :chart-data="{
                          labels: eventEvaluation.labels,
                          datasets: eventEvaluation.datasets
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
                        }"
                      />
                    </b-col>
                  </div>

                  <hr :key="`${eventType}-hr`">
                </template>
              </b-row>
            </b-container>
          </b-card>
        </b-col>

        <b-col cols="12">
          <b-card
            bg-variant="light"
            style="border-radius: 20px;"
          >
            <b-container
              fluid
            >
              <b-row
                class="py-2"
              >
                <b-col cols="12">
                  <h1 style="font-family:'Bebas Neue', cursive;">
                    Post-Event Summaries
                  </h1>
                </b-col>
              </b-row>

              <b-row class="pb-3">
                <b-col cols="12">
                  <b-list-group>
                    <b-list-group-item
                      v-for="event in report.events"
                      :key="event._id"
                      button
                      @click="$router.push({ path: `/events/${event._id}/summary` })"
                    >
                      {{ event.name }} <br>
                      <span style="color: grey; font-size: 12px">
                        {{ toDate(event.date.start).toLocaleString('en-us', { dateStyle: 'medium', timeStyle: 'short' }) }}
                        -
                        {{ toDate(event.date.end).toLocaleString('en-us', { dateStyle: 'medium', timeStyle: 'short' }) }}
                      </span>
                    </b-list-group-item>
                  </b-list-group>
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

import ReportRepository from '../../repositories/reports'
import { apiClient } from '../../axios'

import BarChart from '../../components/charts/Bar'

const reportRepository = new ReportRepository(apiClient)

const today = new Date()

const successColor = '#198754'

const polarQuestionColors = {
  1: successColor,
  0: '#9c2531'
}

const matrixQuestionColors = {
  'Very Satisfied': successColor,
  'Very Likely': successColor,
  Satisfied: '#16786e',
  Likely: '#16786e',
  Neutral: '#b8b8b8',
  Dissatisfied: '#dc3545',
  Unlikely: '#16786e',
  'Very Dissatisfied': '#9c2531',
  'Very Unlikely': '#9c2531'
}

export default {
  name: 'ReportEvents',
  components: {
    BarChart
  },
  data () {
    return {
      startDate: today,
      endDate: today,
      isGeneratingReport: false,
      report: {
        events: [],
        eventEvaluations: []
      }
    }
  },
  computed: {
    ...mapGetters(['token']),
    eventEvaluationCharts () {
      const eventEvaluations = this.report.eventEvaluations

      if (eventEvaluations.length === 0) {
        return []
      }

      const charts = []

      for (const { eventType, data } of eventEvaluations) {
        const eventDataset = []

        for (const { labels, datasets } of data) {
          const coloredDatasets = []

          for (let i = 0; i < datasets.length; i++) {
            const dataset = datasets[i]

            const backgroundColor = polarQuestionColors[dataset.label] || matrixQuestionColors[dataset.label]

            coloredDatasets.push({
              label: dataset.label,
              data: dataset.data,
              backgroundColor: backgroundColor
            })
          }

          eventDataset.push({
            labels,
            datasets: coloredDatasets
          })
        }

        charts.push({
          eventType,
          eventDataset
        })
      }

      return charts
    }
  },
  watch: {
    endDate (value) {
      const startDate = new Date(this.startDate)
      const endDate = new Date(value)

      if (startDate > endDate) {
        this.startDate = endDate
      }
    }
  },
  created () {
    reportRepository.setAuthorizationHeader(`Bearer ${this.token}`)
  },
  methods: {
    async getReportEvents () {
      const startDate = this.startDate.toJSON()
      const endDate = this.endDate.toJSON()

      this.isGeneratingReport = true

      try {
        const { results } = await reportRepository.getEvents({
          start: startDate,
          end: endDate
        })

        this.report.events = results.events
        this.report.eventEvaluations = results.eventEvaluations
      } finally {
        this.isGeneratingReport = false
      }
    },
    toDate (string) {
      const date = new Date(string)

      if (isNaN(date)) {
        return
      }

      return date
    }
  }
}
</script>
