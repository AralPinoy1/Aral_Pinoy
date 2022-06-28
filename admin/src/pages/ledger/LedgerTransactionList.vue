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
                    Withdrawals
                  </h1>
                </b-col>
              </b-row>

              <b-row>
                <b-col cols="12">
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
                                  v-model="ledgerTransactions.pagination.perPage"
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
                        ref="ledgerTransactionsTable"
                        :items="getLedgerTransactions"
                        :fields="ledgerTransactions.fields"
                        :current-page="ledgerTransactions.pagination.currentPage"
                        :per-page="ledgerTransactions.pagination.perPage"
                        stacked="md"
                        style="background:white"
                        show-empty
                        primary-key="_id"
                        hover
                      >
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
                          <template v-if="item.metadata && item.metadata.event">
                            <b-link :to="`/events/${item.metadata.event._id}`">
                              {{ item.metadata.event.name }}
                            </b-link>
                          </template>
                        </template>

                        <template #cell(createdAt)="{ value }">
                          <span>
                            {{
                              new Date(value).toLocaleString('en-us', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })
                            }}
                          </span>
                        </template>

                        <template #cell(date)="{ value }">
                          <span>
                            {{
                              new Date(value).toLocaleString('en-us', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })
                            }}
                          </span>
                        </template>

                        <template #cell(actions)="{ item }">
                          <template v-if="item.metadata && item.metadata.receipt">
                            <a
                              :id="`show-receipt-action-${item._id}`"
                              :href="item.metadata.receipt.url"
                              target="_blank"
                            >
                              <b-icon
                                icon="receipt"
                              />
                            </a>

                            <b-tooltip
                              :target="`show-receipt-action-${item._id}`"
                            >
                              See Receipt
                            </b-tooltip>
                          </template>
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
                        v-model="ledgerTransactions.pagination.currentPage"
                        :total-rows="ledgerTransactions.total"
                        :per-page="ledgerTransactions.pagination.perPage"
                        align="fill"
                        size="sm"
                        class="my-0"
                      />
                    </b-col>
                  </b-row>

                  <b-row
                    class="pt-4"
                    align-h="end"
                  >
                    <b-col
                      cols="2"
                      class="my-1"
                    >
                      <button
                        class="btn btn-danger"
                        type="button"
                        @click="createLedgerTransactionModal.show = true"
                      >
                        Add Transaction
                      </button>
                    </b-col>
                  </b-row>
                </b-col>
              </b-row>
            </b-container>
          </b-card>
        </b-col>
      </b-row>
    </b-container>

    <create-ledger-transaction-modal
      :show="createLedgerTransactionModal.show"
      @close="createLedgerTransactionModal.show = false"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import CreateLedgerTransactionModal from '../../components/ledger/CreateLedgerTransactionModal'

import { apiClient } from '../../axios'
import LedgerTransactionRepository from '../../repositories/ledger/transactions'

const logo = require('../../assets/aralpinoywords.png')

const LEDGER_TRANSACTION_SORT_MAPPING = {
  date: 'date',
  createdAt: 'createdAt',
  amount: 'amount'
}

export default {
  name: 'LedgerTransactionList',
  components: {
    CreateLedgerTransactionModal
  },
  data () {
    return {
      ledgerTransactionRepository: null,
      logo,
      pageOptions: [5, 10, 20],
      ledgerTransactions: {
        results: [],
        total: 0,
        pagination: {
          perPage: 5,
          currentPage: 1
        },
        fields: [
          { key: 'date', label: 'Transaction Date & Time', sortable: true },
          { key: 'amount', label: 'Amount', sortable: true },
          { key: 'event', label: 'Event' },
          { key: 'createdAt', label: 'Date of Creation', sortable: true },
          { key: 'actions', label: 'Actions' }
        ]
      },
      createLedgerTransactionModal: {
        show: false
      }
    }
  },
  computed: {
    ...mapGetters(['token'])
  },
  created () {
    this.ledgerTransactionRepository = new LedgerTransactionRepository(apiClient, {
      bearerToken: this.token
    })
  },
  methods: {
    async getLedgerTransactions (ctx) {
      const {
        sortBy,
        sortDesc
      } = ctx

      const perPage = this.ledgerTransactions.pagination.perPage
      const pageOffset = (this.ledgerTransactions.pagination.currentPage - 1) * this.ledgerTransactions.pagination.perPage
      const sort = {
        field: 'createdAt',
        order: 'desc'
      }

      if (sortBy !== undefined && sortBy !== '') {
        sort.field = LEDGER_TRANSACTION_SORT_MAPPING[sortBy]
        sort.order = sortDesc ? 'desc' : 'asc'
      }

      /** @type {LedgerTransactionRepository} */
      const ledgerTransactionRepository = this.ledgerTransactionRepository

      const { results, total } = await ledgerTransactionRepository.list({
        limit: perPage,
        offset: pageOffset,
        sort
      })

      this.ledgerTransactions.total = total

      return results
    }
  }
}
</script>
