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
                    Income & Expenses Report
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

              <b-row class="py-2 justify-content-center">
                <b-col
                  cols="12"
                  md="3"
                >
                  <b-button
                    pill
                    variant="danger"
                    :disabled="isGeneratingReport"
                    @click="getIncomeStatementReport"
                  >
                    <b-spinner
                      v-if="isGeneratingReport"
                      style="width: 1rem; height: 1rem;"
                    />

                    <template v-else>
                      Generate Chart Report
                    </template>
                  </b-button>
                </b-col>

                <b-col
                  cols="12"
                  md="3"
                >
                  <b-button
                    pill
                    variant="success"
                    :disabled="isExportingReport"
                    @click="downloadIncomeStatementReportExport"
                  >
                    <b-spinner
                      v-if="isExportingReport"
                      style="width: 1rem; height: 1rem;"
                    />

                    <template v-else>
                      Export Report
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
                    Income & Expenses Report from
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
                    Donations
                  </h2>
                </b-col>

                <b-col
                  class="d-flex w-100 justify-content-center"
                  cols="12"
                >
                  <trend-chart
                    :height="500"
                    :width="500"
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
                        borderColor: 'rgb(54, 178, 235)',
                        backgroundColor: [
                          'rgb(54, 178, 235)',
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
                    }"
                  />
                </b-col>
              </b-row>

              <b-row
                class="py-4"
              >
                <b-col cols="12">
                  <h2 style="font-family:'Bebas Neue', cursive;">
                    Expenses
                  </h2>
                </b-col>

                <b-col
                  class="d-flex w-100 justify-content-center"
                  cols="12"
                >
                  <bar-chart
                    :height="500"
                    :width="500"
                    :chart-data="{
                      labels: report.expenses.labels,
                      datasets: [{
                        ...report.expenses.datasets[0],
                        borderColor: 'rgb(54, 235, 151)',
                        backgroundColor: [
                          'rgb(54, 235, 151)',
                        ],
                      }, {
                        ...report.expenses.datasets[1],
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
            </b-container>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import TrendChart from '../../components/charts/Trend'
import BarChart from '../../components/charts/Bar'

import { apiClient } from '../../axios'
import ReportRepository from '../../repositories/reports'
import ReportExportRepository from '../../repositories/reports/exports'

import downloadFileAsLink from '../../utils/download-file'

const reportRepository = new ReportRepository(apiClient)

const today = new Date()

export default {
  name: 'ReportIncomeStatement',
  components: {
    TrendChart,
    BarChart
  },
  data () {
    return {
      reportExportRepository: null,
      startDate: today,
      endDate: today,
      isGeneratingReport: false,
      isExportingReport: false,
      report: {
        isGenerated: false,
        startDate: today,
        endDate: today,
        incomeStatement: {
          labels: [],
          datasets: []
        },
        expenses: {
          labels: [],
          datasets: []
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

    this.reportExportRepository = new ReportExportRepository(apiClient, {
      bearerToken: this.token
    })
  },
  methods: {
    async getIncomeStatementReport () {
      const startDate = this.startDate.toJSON()
      const endDate = this.endDate.toJSON()

      this.isGeneratingReport = true
      this.report.isGenerated = false

      this.report.startDate = startDate
      this.report.endDate = endDate

      try {
        const { results } = await reportRepository.getIncomeStatement({
          start: startDate,
          end: endDate
        })

        this.report.incomeStatement = results.incomeStatement
        this.report.expenses = results.expenses

        this.report.isGenerated = true
      } finally {
        this.isGeneratingReport = false
      }
    },
    async downloadIncomeStatementReportExport () {
      const startDate = this.startDate.toJSON()
      const endDate = this.endDate.toJSON()

      this.isExportingReport = true

      /** @type {ReportExportRepository} */
      const reportExportRepository = this.reportExportRepository

      try {
        const file = await reportExportRepository.exportIncomeStatement({
          start: startDate,
          end: endDate
        })

        downloadFileAsLink(file, `income-and-expenses-report-${Date.now()}.zip`)
      } finally {
        this.isExportingReport = false
      }
    }
  }
}
</script>
