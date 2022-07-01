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
                    Monetary Donations Report
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
                    @click="getReportMonetaryDonations"
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
        v-if="report.isGenerated"
        class="pb-3"
      >
        <b-col cols="12">
          <b-card
            bg-variant="light"
            style="border-radius: 20px;"
          >
            <b-container
              fluid
            >
              <b-row
                class="py-4"
              >
                <b-col cols="12">
                  <h1 style="font-family:'Bebas Neue', cursive;">
                    Monetary Donations Report from
                    {{ new Date(report.startDate).toLocaleString('en-us', { dateStyle: 'medium' }) }}
                    -
                    {{ new Date(report.endDate).toLocaleString('en-us', { dateStyle: 'medium' }) }}
                  </h1>
                </b-col>
              </b-row>

              <b-row
                class="py-4"
              >
                <b-col cols="12">
                  <h2 style="font-family:'Bebas Neue', cursive;">
                    Total Donations by Company
                  </h2>
                </b-col>

                <b-col
                  class="d-flex w-100 justify-content-center"
                  cols="12"
                >
                  <bar-chart
                    :height="600"
                    :width="600"
                    :chart-data="{
                      labels: report.totalDonationsByCompany.labels,
                      datasets: [{
                        label: '',
                        data: report.totalDonationsByCompany.data,
                        backgroundColor: report.totalDonationsByCompany.backgroundColors,
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
                        legend: {
                          display: false
                        },
                      }
                    }"
                  />
                </b-col>
              </b-row>

              <b-row
                class="py-4"
              >
                <b-col cols="12">
                  <h2 style="font-family:'Bebas Neue', cursive;">
                    Total Donations by Individuals
                  </h2>
                </b-col>

                <b-col
                  class="d-flex w-100 justify-content-center"
                  cols="12"
                >
                  <bar-chart
                    :height="600"
                    :width="600"
                    :chart-data="{
                      labels: report.totalDonationsByPerson.labels,
                      datasets: [{
                        label: '',
                        data: report.totalDonationsByPerson.data,
                        backgroundColor: report.totalDonationsByPerson.backgroundColors,
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
                        legend: {
                          display: false
                        },
                      }
                    }"
                  />
                </b-col>
              </b-row>

              <b-row
                class="py-4"
              >
                <b-col cols="12">
                  <h2 style="font-family:'Bebas Neue', cursive;">
                    Monetary Donations by Company
                  </h2>
                </b-col>

                <b-col
                  class="d-flex w-100 justify-content-center"
                  cols="12"
                >
                  <bar-chart
                    :height="600"
                    :width="600"
                    :chart-data="{
                      labels: report.monetaryDonationsByCompany.labels,
                      datasets: [{
                        label: '',
                        data: report.monetaryDonationsByCompany.data,
                        backgroundColor: report.monetaryDonationsByCompany.backgroundColors,
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
                        legend: {
                          display: false
                        },
                      }
                    }"
                  />
                </b-col>
              </b-row>

              <b-row
                class="py-4"
              >
                <b-col cols="12">
                  <h2 style="font-family:'Bebas Neue', cursive;">
                    Monetary Donations by Individuals
                  </h2>
                </b-col>

                <b-col
                  class="d-flex w-100 justify-content-center"
                  cols="12"
                >
                  <bar-chart
                    :height="600"
                    :width="600"
                    :chart-data="{
                      labels: report.monetaryDonationsByPerson.labels,
                      datasets: [{
                        label: '',
                        data: report.monetaryDonationsByPerson.data,
                        backgroundColor: report.monetaryDonationsByPerson.backgroundColors,
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
                        legend: {
                          display: false
                        },
                      }
                    }"
                  />
                </b-col>
              </b-row>

              <b-row
                class="py-4"
              >
                <b-col cols="12">
                  <h2 style="font-family:'Bebas Neue', cursive;">
                    Event Donations by Company
                  </h2>
                </b-col>

                <b-col
                  class="d-flex w-100 justify-content-center"
                  cols="12"
                >
                  <bar-chart
                    :height="600"
                    :width="600"
                    :chart-data="{
                      labels: report.eventDonationsByCompany.labels,
                      datasets: [{
                        label: '',
                        data: report.eventDonationsByCompany.data,
                        backgroundColor: report.eventDonationsByCompany.backgroundColors,
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
                        legend: {
                          display: false
                        },
                      }
                    }"
                  />
                </b-col>
              </b-row>

              <b-row
                class="py-4"
              >
                <b-col cols="12">
                  <h2 style="font-family:'Bebas Neue', cursive;">
                    Event Donations by Individuals
                  </h2>
                </b-col>

                <b-col
                  class="d-flex w-100 justify-content-center"
                  cols="12"
                >
                  <bar-chart
                    :height="600"
                    :width="600"
                    :chart-data="{
                      labels: report.eventDonationsByPerson.labels,
                      datasets: [{
                        label: '',
                        data: report.eventDonationsByPerson.data,
                        backgroundColor: report.eventDonationsByPerson.backgroundColors,
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
                        legend: {
                          display: false
                        },
                      }
                    }"
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
import * as randomColor from 'randomcolor'

import ReportRepository from '../../repositories/reports'
import { apiClient } from '../../axios'

import BarChart from '../../components/charts/Bar'
// import TrendChart from '../../components/charts/Trend'

const reportRepository = new ReportRepository(apiClient)

const today = new Date()

export default {
  name: 'ReportMonetaryDonations',
  components: {
    BarChart
    // TrendChart
  },
  data () {
    return {
      startDate: today,
      endDate: today,
      isGeneratingReport: false,
      report: {
        // incomeStatement: {
        //   labels: ['Mar 1', 'Mar 2', 'Mar 3'],
        //   dataset: [{
        //     data: [7008, 5000, 9000]
        //   }, {
        //     data: [1234, 3333, 7601]
        //   }]
        // },
        isGenerated: false,
        startDate: today,
        endDate: today,
        totalDonationsByCompany: {
          labels: [],
          data: []
        },
        totalDonationsByPerson: {
          labels: [],
          data: []
        },
        monetaryDonationsByCompany: {
          labels: [],
          data: []
        },
        monetaryDonationsByPerson: {
          labels: [],
          data: []
        },
        eventDonationsByCompany: {
          labels: [],
          data: []
        },
        eventDonationsByPerson: {
          labels: [],
          data: []
        }
      }
    }
  },
  computed: {
    ...mapGetters(['token'])
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
    const authHeader = `Bearer ${this.token}`

    reportRepository.setAuthorizationHeader(authHeader)
  },
  methods: {
    async getReportMonetaryDonations () {
      const startDate = this.startDate.toJSON()
      const endDate = this.endDate.toJSON()

      this.isGeneratingReport = true
      this.report.isGenerated = false

      this.report.startDate = startDate
      this.report.endDate = endDate

      try {
        const { results } = await reportRepository.getMonetaryDonations({
          start: startDate,
          end: endDate
        })

        // total donations
        this.report.totalDonationsByCompany = results.totalDonationsByCompany
        this.report.totalDonationsByCompany.backgroundColors = randomColor({
          hue: 'random',
          luminosity: 'dark',
          count: results.monetaryDonationsByCompany.labels.length
        })

        this.report.totalDonationsByPerson = results.totalDonationsByPerson
        this.report.totalDonationsByPerson.backgroundColors = randomColor({
          hue: 'random',
          luminosity: 'dark',
          count: results.monetaryDonationsByPerson.labels.length
        })

        // monetary donations
        this.report.monetaryDonationsByCompany = results.monetaryDonationsByCompany
        this.report.monetaryDonationsByCompany.backgroundColors = randomColor({
          hue: 'random',
          luminosity: 'dark',
          count: results.monetaryDonationsByCompany.labels.length
        })

        this.report.monetaryDonationsByPerson = results.monetaryDonationsByPerson
        this.report.monetaryDonationsByPerson.backgroundColors = randomColor({
          hue: 'random',
          luminosity: 'dark',
          count: results.monetaryDonationsByPerson.labels.length
        })

        // event donations
        this.report.eventDonationsByCompany = results.eventDonationsByCompany
        this.report.eventDonationsByCompany.backgroundColors = randomColor({
          hue: 'random',
          luminosity: 'dark',
          count: results.monetaryDonationsByCompany.labels.length
        })

        this.report.eventDonationsByPerson = results.eventDonationsByPerson
        this.report.eventDonationsByPerson.backgroundColors = randomColor({
          hue: 'random',
          luminosity: 'dark',
          count: results.monetaryDonationsByPerson.labels.length
        })

        this.report.isGenerated = true
      } finally {
        this.isGeneratingReport = false
      }
    }
  }
}
</script>
