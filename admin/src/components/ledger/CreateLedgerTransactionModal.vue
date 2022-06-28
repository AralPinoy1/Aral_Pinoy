<template>
  <b-modal
    v-model="modal"
    size="xl"
    hide-footer
    @hide="$emit('close')"
  >
    <b-overlay
      :show="isLoading"
      rounded="sm"
    >
      <b-card>
        <b-container fluid>
          <b-row>
            <b-col cols="12">
              <h1
                style="font-family:'Bebas Neue', cursive;"
                no-body
                class="text-center"
              >
                Add Transaction
              </h1>
            </b-col>
          </b-row>

          <b-alert
            :show="!!errorMessage"
            variant="danger"
          >
            {{ errorMessage }}
          </b-alert>

          <b-row class="pt-1">
            <b-col
              cols="12"
            >
              <label
                for="select-ledger-transaction-type"
              >
                Transaction Type
              </label>

              <select
                id="select-ledger-transaction-type"
                v-model="form.type"
                class="form-select"
              >
                <option
                  v-for="type in transactionTypeOptions"
                  :key="type.value"
                  :value="type.value"
                >
                  {{ type.label }}
                </option>
              </select>
            </b-col>
          </b-row>

          <b-row class="pt-3">
            <b-col
              cols="12"
            >
              <label for="input-ledger-transaction-amount">
                Amount
              </label>

              <b-form-input
                id="input-ledger-transaction-amount"
                v-model="form.amount"
                :formatter="toCurrency"
                lazy-formatter
                required
                list="ledger-transaction-amount-datalist"
                @focus="form.amount = fromCurrencyToNumber(form.amount)"
              />

              <datalist id="ledger-transaction-amount-datalist">
                <option
                  v-for="(choice, index) in [500, 1000, 2000, 5000, 10000]"
                  :key="index"
                >
                  {{ choice }}
                </option>
              </datalist>
            </b-col>
          </b-row>

          <b-row class="pt-3">
            <b-col
              cols="12"
              md="6"
            >
              <label for="date-picker-ledger-transaction-date">
                Transaction Date
              </label>

              <b-form-datepicker
                id="date-picker-ledger-transaction-date"
                v-model="form.date"
                label="Transaction Date"
                value-as-date
              />
            </b-col>

            <b-col
              cols="12"
              md="6"
            >
              <label for="time-picker-ledger-transaction-date">
                Transaction Time
              </label>

              <b-form-timepicker
                id="time-picker-ledger-transaction-date"
                v-model="form.time"
                locale="en"
                required
              />
            </b-col>
          </b-row>

          <b-row class="pt-3">
            <b-col cols="12">
              <label for="search-ledger-transaction-metadata-event">
                Event
              </label>

              <b-dropdown
                :text="form.metadata.event ? form.metadata.event.name : 'Select an event'"
                style="width: 100%"
                menu-class="w-100"
                variant="outline-primary"
                :no-caret="!!form.metadata.event"
                no-flip
              >
                <b-dropdown-form>
                  <b-form-group
                    label="Search Event"
                    @submit.stop.prevent
                  >
                    <b-form-input
                      id="search-ledger-transaction-metadata-event"
                      debounce="500"
                      @update="searchEventNames"
                    />
                  </b-form-group>
                </b-dropdown-form>

                <b-dropdown-divider />

                <b-dropdown-item
                  v-for="event in eventOptions"
                  :key="event._id"
                  @click="form.metadata.event = event"
                >
                  {{ event.name }}
                </b-dropdown-item>
              </b-dropdown>
            </b-col>
          </b-row>

          <b-row
            class="pt-3"
          >
            <b-col cols="12">
              <label
                for="item-file-upload"
                class="form-label"
              >
                Transaction Receipt
              </label>

              <input
                id="item-file-upload"
                class="form-control"
                type="file"
                @change="handleFileUpload"
              >
            </b-col>
          </b-row>

          <b-row
            class="pt-4 pb-3"
            align-h="center"
          >
            <b-col cols="2">
              <b-button
                style="font-size: 16px; padding: 8px; width: 150px;"
                pill
                variant="danger"
                @click="confirmModal = !confirmModal"
              >
                Add Transaction
              </b-button>
            </b-col>
          </b-row>
        </b-container>
      </b-card>
    </b-overlay>

    <b-modal
      v-model="confirmModal"
      @ok="createLedgerTransaction"
      @cancel="confirmModal = false"
    >
      <b-container fluid>
        <h1 style="font-family:'Bebas Neue', cursive; text-align:center;">
          Are you sure with all the details?
        </h1>
      </b-container>
    </b-modal>
  </b-modal>
</template>

<script>
import { mapGetters } from 'vuex'
import { set as setDate } from 'date-fns'

import { apiClient } from '../../axios'
import LedgerTransactionRepository from '../../repositories/ledger/transactions'
import EventRepository from '../../repositories/events'

import formattersMixin from '../../mixins/formatters'

const eventRepository = new EventRepository(apiClient)

export default {
  name: 'CreateLedgerTransactionModal',
  mixins: [
    formattersMixin
  ],
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      ledgerTransactionRepository: null,
      modal: false,
      isLoading: false,
      confirmModal: false,
      form: {
        type: '',
        amount: 1,
        date: new Date(),
        time: '00:00:00',
        metadata: {
          event: null
        },
        file: null
      },
      transactionTypeOptions: [
        {
          label: 'Withdrawal',
          value: 'WITHDRAWAL'
        }
      ],
      eventOptions: [],
      errorMessage: ''
    }
  },
  computed: {
    ...mapGetters(['token'])
  },
  watch: {
    show (val) {
      this.modal = val
    }
  },
  created () {
    this.ledgerTransactionRepository = new LedgerTransactionRepository(apiClient, {
      bearerToken: this.token
    })

    eventRepository.setAuthorizationHeader(`Bearer ${this.token}`)
  },
  methods: {
    async createLedgerTransaction () {
      this.errorMessage = ''
      this.isLoading = true

      const {
        type,
        amount,
        date,
        time,
        metadata: {
          event
        },
        file
      } = this.form

      const [hours, minutes, seconds] = time.split(':')

      const transactionDate = setDate(date, {
        hours,
        minutes,
        seconds
      })

      /** @type {LedgerTransactionRepository} */
      const ledgerTransactionRepository = this.ledgerTransactionRepository

      const metadata = {
        eventId: undefined,
        receipt: file
      }

      if (event) {
        metadata.eventId = event._id
      }

      try {
        await ledgerTransactionRepository.create({
          type,
          amount: this.fromCurrencyToNumber(amount),
          date: new Date(transactionDate).toJSON(),
          metadata
        })

        this.$router.go()
      } catch (error) {
        this.isLoading = false
      }
    },
    async searchEventNames (value) {
      const { results } = await eventRepository.list({
        name: value
      }, {
        limit: 10,
        offset: 0,
        sort: {
          field: 'name',
          order: 'asc'
        }
      })

      this.eventOptions = results
    },
    handleFileUpload (event) {
      const files = event.target.files

      if (files.length === 0) {
        this.form.file = null

        return
      }

      const [file] = files

      this.form.file = file
    }
  }
}
</script>
