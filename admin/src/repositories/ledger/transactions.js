'use strict'

/** @typedef {import('axios').Axios} Axios */

const REPOSITORY_BASE_URL = '/ledger-transactions'

class LedgerTransactionRepository {
  /**
   *
   * @param {Axios} apiClient
   * @param {Object} [options={}]
   * @param {Object} options.bearerToken
   */
  constructor (apiClient, options = {}) {
    this.apiClient = apiClient
    this.headers = {}

    const {
      bearerToken
    } = options

    if (bearerToken !== undefined) {
      this.headers.Authorization = `Bearer ${bearerToken}`
    }
  }

  /**
   *
   * @param {Object} [options={}] Options
   * @param {number} [options.limit] Limit
   * @param {number} [options.offset] Offset
   * @param {Object} [options.sort={}] Sort options
   * @param {string} options.sort.field Field to sort
   * @param {string} options.sort.order Order of sort
   * @returns {Promise<{ results: Object[] }>}
   */
  async list (options = {}) {
    const {
      limit,
      offset,
      sort = {}
    } = options

    const queryString = new URLSearchParams()

    if (limit !== undefined) {
      queryString.set('limit', limit)
    }

    if (offset !== undefined) {
      queryString.set('offset', offset)
    }

    if (sort.field !== undefined && sort.order !== undefined) {
      queryString.set('sort.field', sort.field)
      queryString.set('sort.order', sort.order)
    }

    const { data } = await this.apiClient.get(`${REPOSITORY_BASE_URL}?${queryString.toString()}`, {
      headers: this.headers
    })

    return {
      results: data.results,
      total: data.total
    }
  }

  /**
   * @param {Object} payload Payload
   * @param {string} payload.type Type of ledger transaction
   * @param {number} payload.amount Ledger transaction amount
   * @param {Object} payload.metadata Ledger transaction metadata
   * @param {File} payload.metadata.receipt Ledger transaction receipt file
   * @returns
   */
  async create (payload) {
    const {
      type,
      amount,
      date,
      metadata
    } = payload

    const form = new FormData()

    form.set('type', type)
    form.set('amount', amount)
    form.set('date', date)

    if (metadata.eventId !== undefined) {
      form.set('metadata[eventId]', metadata.eventId)
    }

    if (metadata.receipt !== undefined && metadata.receipt !== null) {
      form.set('receipt', metadata.receipt)
    }

    const { data } = await this.apiClient.post(REPOSITORY_BASE_URL, form, {
      headers: {
        ...this.headers,
        'Content-Type': 'multipart/form-data'
      }
    })

    return data
  }
}

module.exports = LedgerTransactionRepository
