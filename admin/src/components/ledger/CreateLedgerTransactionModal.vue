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

import formattersMixin from '../../mixins/formatters'

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
        file: null
      },
      transactionTypeOptions: [
        {
          label: 'Withdrawal',
          value: 'WITHDRAWAL'
        }
      ],
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

      try {
        await ledgerTransactionRepository.create({
          type,
          amount: this.fromCurrencyToNumber(amount),
          date: new Date(transactionDate).toJSON(),
          metadata: {
            receipt: file
          }
        })

        this.$router.go()
      } catch (error) {
        this.isLoading = false
      }
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
