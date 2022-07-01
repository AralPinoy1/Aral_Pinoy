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
                    Volunteer Report
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
                    @click="getReportVolunteers"
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
        v-if="!isGeneratingReport && hasGeneratedReport"
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
                    Volunteer Report from
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
                  <h3 style="font-family:'Bebas Neue', cursive;">
                    Demographics
                  </h3>
                </b-col>
              </b-row>

              <b-row
                class="py-4"
              >
                <b-col cols="12">
                  <h2 style="font-family:'Bebas Neue', cursive;">
                    Age
                  </h2>
                </b-col>

                <b-col
                  class="d-flex w-100 justify-content-center"
                  cols="12"
                >
                  <bar-chart
                    :height="400"
                    :chart-data="{
                      labels: report.age.labels,
                      datasets: [{
                        label: '',
                        data: report.age.data,
                        backgroundColor: [
                          'rgb(54, 162, 235)',
                          'rgb(255, 99, 132)',
                          'rgb(255, 219, 99)',
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
                    Gender
                  </h2>
                </b-col>

                <b-col
                  class="d-flex w-100 justify-content-center"
                  cols="12"
                >
                  <pie-chart
                    :styles="{ 'width': '30%' }"
                    :chart-data="{
                      labels: report.gender.labels,
                      datasets: [{
                        label: '',
                        data: report.gender.data,
                        backgroundColor: [
                          'rgb(54, 162, 235)',
                          'rgb(255, 99, 132)',
                        ],
                      }]
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

import ReportRepository from '../../repositories/reports'
import { apiClient } from '../../axios'

import BarChart from '../../components/charts/Bar'
import PieChart from '../../components/charts/Pie'

const reportRepository = new ReportRepository(apiClient)

const today = new Date()

export default {
  name: 'ReportVolunteers',
  components: {
    BarChart,
    PieChart
  },
  data () {
    return {
      startDate: today,
      endDate: today,
      isGeneratingReport: false,
      hasGeneratedReport: false,
      report: {
        startDate: today,
        endDate: today,
        age: {
          labels: [],
          data: []
        },
        gender: {
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
    reportRepository.setAuthorizationHeader(`Bearer ${this.token}`)
  },
  methods: {
    async getReportVolunteers () {
      this.report.startDate = new Date(this.startDate)
      this.report.endDate = new Date(this.endDate)

      const startDate = this.startDate.toJSON()
      const endDate = this.endDate.toJSON()

      this.hasGeneratedReport = false
      this.isGeneratingReport = true

      try {
        const { results } = await reportRepository.getVolunteers({
          start: startDate,
          end: endDate
        })

        this.report.age = results.age
        this.report.gender = results.gender

        this.hasGeneratedReport = true
      } finally {
        this.isGeneratingReport = false
      }
    }
  }
}
</script>
