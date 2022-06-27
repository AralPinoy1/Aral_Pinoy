'use strict'

/** @typedef {import('axios').Axios} Axios */

const REPOSITORY_BASE_URL = '/event-evaluations'

class EventEvaluationRepository {
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
   * @param {Object} payload Payload
   * @returns {Promise<{ results: Object[] }>}
   */
  async create (payload) {
    const { data } = await this.apiClient.post(REPOSITORY_BASE_URL, payload, {
      headers: this.headers
    })

    return data
  }
}

module.exports = EventEvaluationRepository
