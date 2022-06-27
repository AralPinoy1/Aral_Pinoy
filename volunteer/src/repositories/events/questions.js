'use strict'

/** @typedef {import('axios').Axios} Axios */

const REPOSITORY_BASE_URL = '/event-questions'

class EventQuestionRepository {
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
   * @param {Object} [options.filters={}] Filter options
   * @param {string[]} [options.filters.eventTypes] Filter by event types
   * @param {Object} [options.sort={}] Sort options
   * @param {string} options.sort.field Field to sort
   * @param {string} options.sort.order Order of sort
   * @returns {Promise<{ results: Object[] }>}
   */
  async list (options = {}) {
    const {
      filters = {},
      sort = {}
    } = options

    const queryString = new URLSearchParams()

    if (Array.isArray(filters.eventTypes)) {
      for (const eventType of filters.eventTypes) {
        queryString.append('filters.eventTypes[]', eventType)
      }
    }

    if (sort.field !== undefined && sort.order !== undefined) {
      queryString.set('sort.field', sort.field)
      queryString.set('sort.order', sort.order)
    }

    const { data } = await this.apiClient.get(`${REPOSITORY_BASE_URL}?${queryString.toString()}`, {
      headers: this.headers
    })

    return {
      results: data.results
    }
  }
}

module.exports = EventQuestionRepository
