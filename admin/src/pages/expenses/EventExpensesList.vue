<template>
  <div>
    <b-container class="py-5">
      <b-row>
        <b-col cols="12">
          <b-card
            class="card"
            style="border-radius: 20px;"
          >
            <b-container fluid>
              <b-row>
                <b-col cols="12">
                  <h1 style="font-family:'Bebas Neue', cursive;">
                    Event Expenses
                  </h1>
                </b-col>
              </b-row>

              <b-row>
                <b-col cols="12">
                  <b-container fluid>
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
                                    v-model="groupedExpenses.perPage"
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
                          :items="getGroupedExpenses"
                          :fields="groupedExpenses.fields"
                          :current-page="groupedExpenses.currentPage"
                          :per-page="groupedExpenses.perPage"
                          stacked="sm"
                          style="background:white"
                          show-empty
                          primary-key="event._id"
                          hover
                          @row-clicked="showEventExpenses"
                        >
                          <template #cell(event)="{ value }">
                            <b-link :to="`/events/${value._id}`">
                              {{ value.name }}
                            </b-link>
                          </template>

                          <template #cell(createdAt)="{ value }">
                            {{
                              new Date(value).toLocaleString('en-us', {
                                dateStyle: 'medium'
                              })
                            }}
                          </template>

                          <template #cell(budget)="{ item }">
                            <span v-if="item.event.budget !== undefined">
                              {{
                                new Intl.NumberFormat('en-us', {
                                  style: 'currency',
                                  currency: 'PHP'
                                }).format(
                                  getTotalAmountFromBreakdown(item.event.budget.breakdown)
                                )
                              }}
                            </span>

                            <span v-else>
                              {{
                                new Intl.NumberFormat('en-us', {
                                  style: 'currency',
                                  currency: 'PHP'
                                }).format(0)
                              }}
                            </span>
                          </template>

                          <template #cell(amount)="{ value }">
                            {{
                              new Intl.NumberFormat('en-us', {
                                style: 'currency',
                                currency: 'PHP'
                              }).format(value)
                            }}
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
                          v-model="groupedExpenses.currentPage"
                          :total-rows="groupedExpenses.total"
                          :per-page="groupedExpenses.perPage"
                          align="fill"
                          size="sm"
                          class="my-0"
                        />
                      </b-col>
                    </b-row>
                  </b-container>
                </b-col>
              </b-row>
            </b-container>
          </b-card>
        </b-col>
      </b-row>
    </b-container>

    <expenses-list-modal
      :show="expensesListModal.show"
      :event="expensesListModal.event"
      @close="expensesListModal.show = false"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import ExpensesListModal from '../../components/expenses/ExpensesListModal'

import EventExpenseRepository from '../../repositories/events/expenses'
import { apiClient } from '../../axios'

const eventExpenseRepository = new EventExpenseRepository(apiClient)

const GROUPED_EXPENSES_SORT_MAPPING = {
  createdAt: 'createdAt'
}

export default {
  components: {
    ExpensesListModal
  },
  data () {
    return {
      pageOptions: [5, 10, 20],
      groupedExpenses: {
        total: 0,
        results: [],
        fields: [
          { key: 'event', label: 'Event' },
          { key: 'createdAt', label: 'Event Start Date', sortable: true },
          { key: 'budget', label: 'Proposed Budget' },
          { key: 'amount', label: 'Actual Expenses' }
        ],
        currentPage: 1,
        perPage: 5
      },
      expensesListModal: {
        show: false,
        event: null
      }
    }
  },
  computed: {
    ...mapGetters(['token']),
    groupedExpensePageOffset () {
      const { currentPage, perPage } = this.groupedExpenses

      return (currentPage - 1) * perPage
    }
  },
  created () {
    eventExpenseRepository.setAuthorizationHeader(`Bearer ${this.token}`)
  },
  methods: {
    async getGroupedExpenses (ctx) {
      const {
        sortBy,
        sortDesc
      } = ctx

      const limit = this.groupedExpenses.perPage
      const offset = this.groupedExpensePageOffset
      const sort = {
        field: 'createdAt',
        order: 'desc'
      }

      if (sortBy !== undefined && sortBy !== '') {
        sort.field = GROUPED_EXPENSES_SORT_MAPPING[sortBy]
        sort.order = sortDesc ? 'desc' : 'asc'
      }

      const { results, total } = await eventExpenseRepository.list({}, {
        limit,
        offset,
        sort,
        grouped: true
      })

      this.groupedExpenses.total = total

      return results
    },
    getTotalAmountFromBreakdown (breakdown) {
      let total = 0

      for (const item of breakdown) {
        total += item.amount
      }

      return total
    },
    showEventExpenses (groupedExpense) {
      const {
        _id,
        name,
        budget
      } = groupedExpense.event

      this.expensesListModal.event = {
        _id,
        name,
        budget,
        totalExpenses: groupedExpense.amount
      }
      this.expensesListModal.show = true
    }
  }
}
</script>
