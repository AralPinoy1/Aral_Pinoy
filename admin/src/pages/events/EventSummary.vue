<template>
  <div>
    <b-container class="py-5">
      <b-row>
        <b-col cols="12">
          <b-card
            class="card"
            style="border-radius: 20px;"
          >
            <b-skeleton-wrapper :loading="!isFullyLoaded">
              <template #loading>
                <b-card class="mb-3">
                  <b-skeleton width="85%" />
                  <b-skeleton width="55%" />
                  <b-skeleton width="70%" />
                </b-card>

                <b-card class="mb-3">
                  <b-skeleton-img
                    no-aspect
                    height="150px"
                  />
                </b-card>

                <b-card class="mb-3">
                  <b-skeleton width="85%" />
                  <b-skeleton width="55%" />
                  <b-skeleton width="70%" />
                </b-card>
              </template>

              <b-container
                v-if="isFullyLoaded"
                fluid
              >
                <b-row>
                  <b-col cols="12">
                    <h1 style="font-family:'Bebas Neue', cursive;">
                      {{ event.name }}
                    </h1>
                  </b-col>

                  <b-col cols="12">
                    <h3 style="font-family:'Bebas Neue', cursive;">
                      Event Summary
                    </h3>
                  </b-col>
                </b-row>

                <b-row
                  v-if="incidents.length > 0"
                  class="mb-3"
                >
                  <b-col cols="12">
                    <b-card
                      title="Incidents"
                      style="text-align: left"
                    >
                      <b-list-group flush>
                        <b-list-group-item
                          v-for="(incident, index) of incidents"
                          :key="index"
                          href="#"
                        >
                          {{ incident }}
                        </b-list-group-item>
                      </b-list-group>
                    </b-card>
                  </b-col>
                </b-row>

                <b-row
                  v-if="usedItemsChart !== undefined"
                  class="mb-3"
                >
                  <b-col cols="12">
                    <b-card
                      title="Consumable and Non-Consumable"
                      style="text-align: left"
                    >
                      <b-row>
                        <b-col cols="12">
                          <b-container fluid>
                            <b-row
                              class="py-5"
                            >
                              <b-col cols="12">
                                <bar-chart
                                  :height="200"
                                  :chart-data="{
                                    labels: usedItemsChart.labels,
                                    datasets: usedItemsChart.datasets
                                  }"
                                  :options="{
                                    tooltips: {
                                      enabled: false
                                    },
                                    elements: {
                                      bar: {
                                        borderWidth: 2,
                                      }
                                    },
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
                                        position: 'top',
                                      },
                                      title: {
                                        display: false,
                                      }
                                    }
                                  }"
                                />
                              </b-col>
                            </b-row>
                          </b-container>
                        </b-col>
                      </b-row>
                    </b-card>
                  </b-col>
                </b-row>

                <b-row
                  v-if="eventVolunteers.length > 0"
                  class="mb-3"
                >
                  <b-col cols="12">
                    <b-card
                      title="Attendance"
                      style="text-align: left"
                    >
                      <b-row>
                        <b-col cols="12">
                          <b-container fluid>
                            <b-row
                              class="py-5"
                            >
                              <b-col cols="12">
                                <bar-chart
                                  :height="200"
                                  :chart-data="{
                                    labels: volunteerAttendanceChart.labels,
                                    datasets: volunteerAttendanceChart.datasets
                                  }"
                                  :options="{
                                    datasets: {
                                      bar: {
                                        barPercentage: '0.25',
                                      }
                                    },
                                    tooltips: {
                                      enabled: false
                                    },
                                    elements: {
                                      bar: {
                                        borderWidth: 2,
                                      }
                                    },
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
                                        position: 'top',
                                      },
                                      title: {
                                        display: true,
                                        text: volunteerAttendanceChart.title
                                      }
                                    }
                                  }"
                                />
                              </b-col>
                            </b-row>
                          </b-container>
                        </b-col>
                      </b-row>

                      <b-row>
                        <b-col cols="12">
                          <h4>
                            List of Volunteers
                          </h4>
                        </b-col>
                      </b-row>

                      <b-list-group flush>
                        <b-list-group-item
                          v-for="item in eventVolunteers"
                          :key="item._id"
                          href="#"
                        >
                          <b-icon
                            :class="item.absent ? 'text-danger' : 'text-success'"
                            :icon="item.absent ? 'x-circle' : 'check-circle'"
                          />  {{ `${item.user.firstName} ${item.user.lastName}` }}
                        </b-list-group-item>
                      </b-list-group>
                    </b-card>
                  </b-col>
                </b-row>

                <b-row
                  v-if="hasBudget || eventExpenses.length > 0"
                  class="mb-3"
                >
                  <b-col cols="12">
                    <b-card
                      title="Budget and Expenses"
                      style="text-align: left"
                    >
                      <b-row>
                        <b-col cols="12">
                          <b-container fluid>
                            <b-row
                              class="py-5"
                            >
                              <b-col cols="12">
                                <bar-chart
                                  :height="250"
                                  :chart-data="{
                                    labels: eventBudgetVsExpensesChart.labels,
                                    datasets: eventBudgetVsExpensesChart.datasets
                                  }"
                                  :options="{
                                    datasets: {
                                      bar: {
                                        barPercentage: '0.25',
                                      }
                                    },
                                    tooltips: {
                                      enabled: false
                                    },
                                    elements: {
                                      bar: {
                                        borderWidth: 2,
                                      }
                                    },
                                    scales: {
                                      yAxes: {
                                        ticks: {
                                          min: 0,
                                          beginAtZero: true,
                                          precision: 0
                                        }
                                      },
                                    },
                                    responsive: true,
                                    plugins: {
                                      title: {
                                        display: true,
                                        text: 'Proposed vs Actual Amount'
                                      }
                                    }
                                  }"
                                />
                              </b-col>
                            </b-row>
                          </b-container>

                          <b-container
                            v-if="hasBudget"
                            fluid
                            style="width: 500px; height: 500px"
                          >
                            <b-row>
                              <b-col cols="12">
                                <pie-chart
                                  :height="100"
                                  :width="100"
                                  :chart-data="{
                                    labels: eventBudgetChart.labels,
                                    datasets: eventBudgetChart.datasets
                                  }"
                                  :options="{
                                    responsive: true,
                                    plugins: {
                                      legend: {
                                        position: 'top',
                                      },
                                      title: {
                                        display: true,
                                        text: 'Proposed Budget'
                                      }
                                    }
                                  }"
                                />
                              </b-col>
                            </b-row>
                          </b-container>

                          <b-container
                            fluid
                            style="width: 500px; height: 500px"
                          >
                            <b-row>
                              <b-col cols="12">
                                <pie-chart
                                  :height="100"
                                  :width="100"
                                  :chart-data="{
                                    labels: eventExpensesChart.labels,
                                    datasets: eventExpensesChart.datasets
                                  }"
                                  :options="{
                                    responsive: true,
                                    plugins: {
                                      legend: {
                                        position: 'top',
                                      },
                                      title: {
                                        display: true,
                                        text: 'Actual Expenses'
                                      }
                                    }
                                  }"
                                />
                              </b-col>
                            </b-row>
                          </b-container>
                        </b-col>
                      </b-row>
                    </b-card>
                  </b-col>
                </b-row>

                <b-row
                  v-if="goalsChart.length > 0"
                  class="mb-3"
                >
                  <b-col cols="12">
                    <b-card
                      title="Goals"
                      style="text-align: left"
                    >
                      <b-row
                        v-for="(goal, i) in goalsChart"
                        :key="`evaluation-${i}`"
                      >
                        <b-col cols="12">
                          <b-container fluid>
                            <b-row
                              class="py-5"
                            >
                              <b-col cols="12">
                                <bar-chart
                                  :height="100"
                                  :chart-data="{
                                    labels: goal.labels,
                                    datasets: goal.datasets
                                  }"
                                  :options="{
                                    indexAxis: 'y',
                                    datasets: {
                                      bar: {
                                        barPercentage: '0.4',
                                      }
                                    },
                                    tooltips: {
                                      enabled: false
                                    },
                                    elements: {
                                      bar: {
                                        borderWidth: 2,
                                      }
                                    },
                                    scales: {
                                      yAxes: {
                                        display: false,
                                        stacked: true,
                                      },
                                      xAxes: {
                                        stacked: true,
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
                                        position: 'top',
                                      },
                                      title: {
                                        display: true,
                                        text: goal.title
                                      }
                                    }
                                  }"
                                />
                              </b-col>
                            </b-row>
                          </b-container>
                        </b-col>
                      </b-row>
                    </b-card>
                  </b-col>
                </b-row>

                <b-row
                  v-if="sdgEvaluationChart.length > 0"
                  class="mb-3"
                >
                  <b-col cols="12">
                    <b-card
                      title="SDG Evaluations"
                      style="text-align: left"
                    >
                      <b-row
                        v-for="(evaluation, i) in sdgEvaluationChart"
                        :key="`evaluation-${i}`"
                        class="mb-4"
                      >
                        <b-col cols="12">
                          <b-card
                            :title="evaluation.name"
                            style="text-align: left"
                          >
                            <b-container fluid>
                              <b-row
                                v-for="(question, j) in evaluation.questions"
                                :key="`question-${j}`"
                                class="py-5"
                              >
                                <b-col cols="12">
                                  <bar-chart
                                    :height="150"
                                    :chart-data="{
                                      labels: question.labels,
                                      datasets: question.datasets
                                    }"
                                    :options="{
                                      datasets: {
                                        bar: {
                                          barPercentage: '0.15',
                                        }
                                      },
                                      elements: {
                                        bar: {
                                          borderWidth: 2,
                                        }
                                      },
                                      scales: {
                                        yAxes: {
                                          ticks: {
                                            min: 0,
                                            beginAtZero: true,
                                            precision: 0
                                          }
                                        },
                                        xAxes: {
                                          display: false,
                                        }
                                      },
                                      responsive: true,
                                      plugins: {
                                        legend: {
                                          position: 'top',
                                        },
                                        title: {
                                          display: true,
                                          text: question.title
                                        }
                                      }
                                    }"
                                  />
                                </b-col>
                              </b-row>
                            </b-container>
                          </b-card>
                        </b-col>
                      </b-row>
                    </b-card>
                  </b-col>
                </b-row>

                <b-row
                  v-if="eventQuestionnaireChart.length > 0"
                  class="mb-3"
                >
                  <b-col cols="12">
                    <b-card
                      title="Event Questionnaire"
                      style="text-align: left"
                    >
                      <b-row
                        v-for="(question, i) in eventQuestionnaireChart"
                        :key="`evaluation-${i}`"
                      >
                        <b-col cols="12">
                          <b-container fluid>
                            <b-row
                              class="py-5"
                            >
                              <b-col cols="12">
                                <bar-chart
                                  :height="150"
                                  :chart-data="{
                                    labels: question.labels,
                                    datasets: question.datasets
                                  }"
                                  :options="{
                                    datasets: {
                                      bar: {
                                        barPercentage: '0.65',
                                      }
                                    },
                                    elements: {
                                      bar: {
                                        borderWidth: 2,
                                      }
                                    },
                                    scales: {
                                      yAxes: {
                                        ticks: {
                                          min: 0,
                                          beginAtZero: true,
                                          precision: 0
                                        }
                                      },
                                    },
                                    responsive: true,
                                    plugins: {
                                      legend: {
                                        position: 'top',
                                      },
                                      title: {
                                        display: true,
                                        text: question.title
                                      }
                                    }
                                  }"
                                />
                              </b-col>
                            </b-row>
                          </b-container>
                        </b-col>
                      </b-row>

                      <b-row
                        v-for="(question, i) in universalQuestionnaireChart"
                        :key="`universal-question-${i}`"
                      >
                        <b-col cols="12">
                          <b-container fluid>
                            <b-row
                              class="py-5"
                            >
                              <b-col cols="12">
                                <bar-chart
                                  :height="150"
                                  :chart-data="{
                                    labels: question.labels,
                                    datasets: question.datasets
                                  }"
                                  :options="{
                                    datasets: {
                                      bar: {
                                        barPercentage: '0.65',
                                      }
                                    },
                                    elements: {
                                      bar: {
                                        borderWidth: 2,
                                      }
                                    },
                                    scales: {
                                      yAxes: {
                                        ticks: {
                                          min: 0,
                                          beginAtZero: true,
                                          precision: 0
                                        }
                                      },
                                    },
                                    responsive: true,
                                    plugins: {
                                      legend: {
                                        position: 'top',
                                      },
                                      title: {
                                        display: true,
                                        text: question.title
                                      }
                                    }
                                  }"
                                />
                              </b-col>
                            </b-row>
                          </b-container>
                        </b-col>
                      </b-row>
                    </b-card>
                  </b-col>
                </b-row>
              </b-container>
            </b-skeleton-wrapper>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as randomColor from 'randomcolor'

import BarChart from '../../components/charts/Bar'
import PieChart from '../../components/charts/Pie'

import { apiClient } from '../../axios'
import EventRepository from '../../repositories/events'
import EventExpenseRepository from '../../repositories/events/expenses'
import EventVolunteerRepository from '../../repositories/events/volunteers'
import EventEvaluationRepository from '../../repositories/events/evaluations'

const eventRepository = new EventRepository(apiClient)
const eventExpenseRepository = new EventExpenseRepository(apiClient)
const eventVolunteerRepository = new EventVolunteerRepository(apiClient)
const eventEvaluationRepository = new EventEvaluationRepository(apiClient)

const successColor = '#198754'
const dangerColor = '#dc3545'

const polarQuestionColors = {
  Yes: successColor,
  No: '#9c2531'
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

const POLAR_QUESTION_MAP = {
  1: 'Yes',
  0: 'No'
}

export default {
  components: {
    BarChart,
    PieChart
  },
  data () {
    return {
      event: null,
      eventExpenses: [],
      eventVolunteers: [],
      eventEvaluations: [],
      eventSdgAnswersMap: {},
      eventEvaluationAnswersMap: {},
      eventUniversalAnswersMap: {},
      isLoadingEvent: false,
      isLoadingEventExpenses: false,
      isLoadingEventVolunteers: false,
      isLoadingEventEvaluations: false
    }
  },
  computed: {
    ...mapGetters(['token']),
    eventId () {
      return this.$route.params.id
    },
    isFullyLoaded () {
      return !this.isLoadingEvent && !this.isLoadingEventExpenses && !this.isLoadingEventVolunteers && !this.isLoadingEventEvaluations
    },
    incidents () {
      const event = this.event

      if (event === null) {
        return []
      }

      return Array.isArray(event.incidents) ? event.incidents : []
    },
    hasBudget () {
      const event = this.event

      return event.budget !== undefined && event.budget.breakdown.length > 0
    },
    usedItemsChart () {
      if (this.event === null) {
        return
      }

      const items = this.event.ikds

      if (!Array.isArray(items) || items.length === 0) {
        return
      }
      const datasets = []
      const backgroundColor = randomColor({
        hue: 'random',
        luminosity: 'dark',
        count: items.length
      })

      let itemIndex = 0

      for (const item of items) {
        const {
          item: {
            name
          },
          usedQuantity = 0
        } = item

        datasets.push({
          label: name,
          backgroundColor: backgroundColor[itemIndex],
          data: [usedQuantity]
        })

        itemIndex += 1
      }

      return {
        labels: [''],
        datasets
      }
    },
    volunteerAttendanceChart () {
      const volunteers = this.eventVolunteers

      let present = 0
      let absent = 0

      for (const volunteer of volunteers) {
        if (volunteer.absent) {
          absent += 1
        } else {
          present += 1
        }
      }

      return {
        title: 'Volunteer Attendance',
        labels: [''],
        datasets: [
          {
            label: 'Present',
            backgroundColor: successColor,
            data: [present]
          },
          {
            label: 'Absent',
            backgroundColor: dangerColor,
            data: [absent]
          }
        ]
      }
    },
    goalsChart () {
      if (!this.event.goals) {
        return
      }

      const { current, target } = this.event.goals.monetaryDonation
      // const jobs = this.event.jobs

      const goals = []

      if (current !== 0 || target !== 0) {
        const datasets = []

        const remainder = target - current

        if (remainder < 0) {
          const absRemainder = Math.abs(remainder)

          datasets.push({
            label: 'Current',
            backgroundColor: successColor,
            data: [current - absRemainder]
          })

          datasets.push({
            label: 'Excess',
            backgroundColor: '#198587',
            data: [absRemainder]
          })
        } else if (remainder > 0) {
          datasets.push({
            label: 'Current',
            backgroundColor: successColor,
            data: [current]
          })

          datasets.push({
            label: 'Remaining Target',
            backgroundColor: dangerColor,
            data: [remainder]
          })
        } else {
          datasets.push({
            label: 'Current',
            backgroundColor: successColor,
            data: [current]
          })
        }

        goals.push({
          title: 'Monetary Donation',
          labels: [''],
          datasets
        })
      }

      // if (Array.isArray(jobs)) {
      //   for (const job of jobs) {
      //     const datasets = [
      //       {
      //         label: 'Joined',
      //         backgroundColor: successColor,
      //         data: [job.slots.current]
      //       }
      //     ]

      //     const remainingTarget = job.slots.max - job.slots.current

      //     if (remainingTarget > 0) {
      //       datasets.push({
      //         label: 'Remaining Target',
      //         backgroundColor: dangerColor,
      //         data: [remainingTarget]
      //       })
      //     }

      //     goals.push({
      //       title: `Role: ${job.name}`,
      //       labels: [''],
      //       datasets
      //     })
      //   }
      // }

      return goals
    },
    eventBudgetChart () {
      const budgetBreakdown = this.event.budget.breakdown

      const backgroundColor = randomColor({
        count: budgetBreakdown.length,
        format: 'rgb'
      })

      const labels = []
      const data = []

      for (const item of budgetBreakdown) {
        labels.push(item.type)
        data.push(item.amount)
      }

      return {
        labels,
        datasets: [
          {
            backgroundColor,
            data
          }
        ]
      }
    },
    eventExpensesChart () {
      const expenses = this.eventExpenses

      const backgroundColor = randomColor({
        count: expenses.length,
        format: 'rgb'
      })

      const labels = []
      const data = []

      for (const expense of expenses) {
        labels.push(expense.type)
        data.push(expense.amount)
      }

      return {
        labels,
        datasets: [
          {
            backgroundColor,
            data
          }
        ]
      }
    },
    eventBudgetVsExpensesChart () {
      const budgetBreakdown = this.hasBudget ? this.event.budget.breakdown : []
      const expenses = this.eventExpenses

      let totalBudget = 0
      let totalExpenses = 0

      for (const item of budgetBreakdown) {
        totalBudget += item.amount
      }

      for (const expense of expenses) {
        totalExpenses += expense.amount
      }

      return {
        labels: [''],
        datasets: [
          {
            label: 'Proposed Amount',
            data: [totalBudget],
            backgroundColor: [
              'rgb(54, 235, 151)'
            ]
          },
          {
            label: 'Actual Amount',
            data: [totalExpenses],
            backgroundColor: [
              'rgb(255, 99, 132)'
            ]
          }
        ]
      }
    },
    sdgEvaluationChart () {
      const charts = []

      for (const [, value] of Object.entries(this.eventSdgAnswersMap)) {
        const questions = []

        for (const [, question] of Object.entries(value.questionMap)) {
          const yData = question.data.Yes
          const nData = question.data.No

          questions.push({
            title: question.label,
            labels: [''],
            datasets: [
              {
                label: 'Yes',
                backgroundColor: successColor,
                data: [yData]
              }, {
                label: 'No',
                backgroundColor: dangerColor,
                data: [nData]
              }
            ]
          })
        }

        charts.push({
          name: value.name,
          questions
        })
      }

      return charts
    },
    eventQuestionnaireChart () {
      const charts = []

      for (const [, value] of Object.entries(this.eventEvaluationAnswersMap)) {
        const {
          type,
          label,
          data
        } = value

        if (type === 'polar') {
          charts.push({
            title: label,
            labels: [''],
            datasets: [
              {
                label: 'Yes',
                backgroundColor: polarQuestionColors.Yes,
                data: [data['1']]
              },
              {
                label: 'No',
                backgroundColor: polarQuestionColors.No,
                data: [data['0']]
              }
            ]
          })
        } else if (type === 'matrix' || type === 'matrix:satisfied') {
          charts.push({
            title: label,
            labels: [''],
            datasets: [
              {
                label: 'Very Satisfied',
                backgroundColor: matrixQuestionColors['Very Satisfied'],
                data: [data['Very Satisfied']]
              },
              {
                label: 'Satisfied',
                backgroundColor: matrixQuestionColors.Satisfied,
                data: [data.Satisfied]
              },
              {
                label: 'Neutral',
                backgroundColor: matrixQuestionColors.Neutral,
                data: [data.Neutral]
              },
              {
                label: 'Dissatisfied',
                backgroundColor: matrixQuestionColors.Dissatisfied,
                data: [data.Dissatisfied]
              },
              {
                label: 'Very Dissatisfied',
                backgroundColor: matrixQuestionColors['Very Dissatisfied'],
                data: [data['Very Dissatisfied']]
              }
            ]
          })
        } else if (type === 'matrix:likely') {
          charts.push({
            title: label,
            labels: [''],
            datasets: [
              {
                label: 'Very Likely',
                backgroundColor: matrixQuestionColors['Very Likely'],
                data: [data['Very Likely']]
              },
              {
                label: 'Likely',
                backgroundColor: matrixQuestionColors.Likely,
                data: [data.Likely]
              },
              {
                label: 'Neutral',
                backgroundColor: matrixQuestionColors.Neutral,
                data: [data.Neutral]
              },
              {
                label: 'Unlikely',
                backgroundColor: matrixQuestionColors.Unlikely,
                data: [data.Unlikely]
              },
              {
                label: 'Very Unlikely',
                backgroundColor: matrixQuestionColors['Very Unlikely'],
                data: [data['Very Unlikely']]
              }
            ]
          })
        }
      }

      return charts
    },
    universalQuestionnaireChart () {
      const charts = []

      for (const [, value] of Object.entries(this.eventUniversalAnswersMap)) {
        const {
          type,
          label,
          data
        } = value

        if (type === 'polar') {
          charts.push({
            title: label,
            labels: [''],
            datasets: [
              {
                label: 'Yes',
                backgroundColor: polarQuestionColors.Yes,
                data: [data['1']]
              },
              {
                label: 'No',
                backgroundColor: polarQuestionColors.No,
                data: [data['0']]
              }
            ]
          })
        } else if (type === 'matrix' || type === 'matrix:satisfied') {
          charts.push({
            title: label,
            labels: [''],
            datasets: [
              {
                label: 'Very Satisfied',
                backgroundColor: matrixQuestionColors['Very Satisfied'],
                data: [data['Very Satisfied']]
              },
              {
                label: 'Satisfied',
                backgroundColor: matrixQuestionColors.Satisfied,
                data: [data.Satisfied]
              },
              {
                label: 'Neutral',
                backgroundColor: matrixQuestionColors.Neutral,
                data: [data.Neutral]
              },
              {
                label: 'Dissatisfied',
                backgroundColor: matrixQuestionColors.Dissatisfied,
                data: [data.Dissatisfied]
              },
              {
                label: 'Very Dissatisfied',
                backgroundColor: matrixQuestionColors['Very Dissatisfied'],
                data: [data['Very Dissatisfied']]
              }
            ]
          })
        } else if (type === 'matrix:likely') {
          charts.push({
            title: label,
            labels: [''],
            datasets: [
              {
                label: 'Very Likely',
                backgroundColor: matrixQuestionColors['Very Likely'],
                data: [data['Very Likely']]
              },
              {
                label: 'Likely',
                backgroundColor: matrixQuestionColors.Likely,
                data: [data.Likely]
              },
              {
                label: 'Neutral',
                backgroundColor: matrixQuestionColors.Neutral,
                data: [data.Neutral]
              },
              {
                label: 'Unlikely',
                backgroundColor: matrixQuestionColors.Unlikely,
                data: [data.Unlikely]
              },
              {
                label: 'Very Unlikely',
                backgroundColor: matrixQuestionColors['Very Unlikely'],
                data: [data['Very Unlikely']]
              }
            ]
          })
        }
      }

      return charts
    }
  },
  async created () {
    const authHeader = `Bearer ${this.token}`

    eventRepository.setAuthorizationHeader(authHeader)
    eventExpenseRepository.setAuthorizationHeader(authHeader)
    eventVolunteerRepository.setAuthorizationHeader(authHeader)
    eventEvaluationRepository.setAuthorizationHeader(authHeader)

    await this.getEvent()

    if (this.event !== null) {
      await Promise.all([
        this.getEventExpenses(),
        this.getEventVolunteers(),
        this.getEventEvaluations()
      ])
    }
  },
  methods: {
    async getEvent () {
      const eventId = this.eventId

      this.isLoadingEvent = true

      try {
        const event = await eventRepository.get(eventId)

        this.event = event
      } finally {
        this.isLoadingEvent = false
      }
    },
    async getEventExpenses () {
      const eventId = this.eventId

      this.isLoadingEventExpenses = true

      let hasMore = false
      let expenses = []

      try {
        do {
          const { results, total } = await eventExpenseRepository.list({
            eventId
          }, {
            limit: 100
          })

          expenses = expenses.concat(results)

          if (expenses.length >= total) {
            hasMore = false
          }
        } while (hasMore)

        this.eventExpenses = expenses
      } finally {
        this.isLoadingEventExpenses = false
      }
    },
    async getEventVolunteers () {
      const eventId = this.eventId

      this.isLoadingEventVolunteers = true

      let volunteers = []
      let hasMore = true

      try {
        do {
          const { results, total } = await eventVolunteerRepository.list({
            eventId
          }, {
            limit: 100,
            expand: true
          })

          volunteers = volunteers.concat(results)

          if (volunteers.length >= total) {
            hasMore = false
          }
        } while (hasMore)

        this.eventVolunteers = volunteers
      } finally {
        this.isLoadingEventVolunteers = false
      }
    },
    async getEventEvaluations () {
      const event = this.event

      this.isLoadingEventEvaluations = true

      let evaluations = []
      let hasMore = true

      try {
        do {
          const { results, total } = await eventEvaluationRepository.list({
            eventId: event._id
          }, {
            limit: 100,
            expand: true
          })

          evaluations = evaluations.concat(results)

          if (evaluations.length >= total) {
            hasMore = false
          }
        } while (hasMore)

        this.eventEvaluations = evaluations

        const { questions, sdgs } = event

        const eventEvaluationAnswersMap = {}
        const eventUniversalAnswersMap = {}
        const eventSdgAnswersMap = {}

        for (const evaluation of evaluations) {
          if (Array.isArray(evaluation.questionnaireAnswers)) {
            for (let i = 0; i < evaluation.questionnaireAnswers.length; i++) {
              const answer = evaluation.questionnaireAnswers[i]
              const question = questions[i]
              const eventQuestion = this.event.questions[i]

              let map = eventEvaluationAnswersMap[i]

              if (map === undefined) {
                if (eventQuestion.type === 'matrix' || eventQuestion.type === 'matrix:satisfied') {
                  map = {
                    type: eventQuestion.type,
                    label: question.label,
                    data: {
                      'Very Satisfied': 0,
                      Satisfied: 0,
                      Neutral: 0,
                      Dissatisfied: 0,
                      'Very Dissatisfied': 0
                    }
                  }
                } else if (eventQuestion.type === 'matrix:likely') {
                  map = {
                    type: eventQuestion.type,
                    label: question.label,
                    data: {
                      'Very Likely': 0,
                      Likely: 0,
                      Neutral: 0,
                      Unlikely: 0,
                      'Very Unlikely': 0
                    }
                  }
                } else if (eventQuestion.type === 'polar') {
                  map = {
                    type: eventQuestion.type,
                    label: question.label,
                    data: {
                      1: 0,
                      0: 0
                    }
                  }
                }
              }

              map.data[answer] += 1

              eventEvaluationAnswersMap[i] = map
            }
          }

          if (Array.isArray(evaluation.sdgAnswers)) {
            for (let i = 0; i < evaluation.sdgAnswers.length; i++) {
              const answers = evaluation.sdgAnswers[i]
              const sdg = sdgs[i]

              let sdgMap = eventSdgAnswersMap[i]

              if (sdgMap === undefined) {
                sdgMap = {
                  name: sdg.name,
                  questionMap: {}
                }
              }

              for (let j = 0; j < answers.length; j++) {
                const answer = answers[j]
                const question = sdg.questions[j]

                let questionMap = sdgMap.questionMap[j]

                if (questionMap === undefined) {
                  questionMap = {
                    label: question.label,
                    data: {
                      Yes: 0,
                      No: 0
                    }
                  }
                }

                questionMap.data[POLAR_QUESTION_MAP[answer]] += 1

                sdgMap.questionMap[j] = questionMap
              }

              eventSdgAnswersMap[i] = sdgMap
            }
          }

          if (Array.isArray(evaluation.universalQuestionnaireAnswers)) {
            for (let i = 0; i < evaluation.universalQuestionnaireAnswers.length; i++) {
              const { question, answer } = evaluation.universalQuestionnaireAnswers[i]

              let map = eventUniversalAnswersMap[question.label]

              if (map === undefined) {
                if (question.type === 'matrix' || question.type === 'matrix:satisfied') {
                  map = {
                    type: question.type,
                    label: question.label,
                    data: {
                      'Very Satisfied': 0,
                      Satisfied: 0,
                      Neutral: 0,
                      Dissatisfied: 0,
                      'Very Dissatisfied': 0
                    }
                  }
                } else if (question.type === 'matrix:likely') {
                  map = {
                    type: question.type,
                    label: question.label,
                    data: {
                      'Very Likely': 0,
                      Likely: 0,
                      Neutral: 0,
                      Unlikely: 0,
                      'Very Unlikely': 0
                    }
                  }
                } else if (question.type === 'polar') {
                  map = {
                    type: question.type,
                    label: question.label,
                    data: {
                      1: 0,
                      0: 0
                    }
                  }
                }
              }

              map.data[answer] += 1

              eventUniversalAnswersMap[i] = map
            }
          }
        }

        this.eventEvaluationAnswersMap = eventEvaluationAnswersMap
        this.eventUniversalAnswersMap = eventUniversalAnswersMap
        this.eventSdgAnswersMap = eventSdgAnswersMap
      } finally {
        this.isLoadingEventEvaluations = false
      }
    }
  }
}
</script>
