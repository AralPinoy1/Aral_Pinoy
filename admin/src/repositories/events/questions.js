'use strict'

const axios = require('axios')

/** @typedef {import('axios').Axios} Axios */

const REPOSITORY_ROUTE_PREFIX = '/event-questions'

class EventQuestionRepository {
  /**
   *
   * @param {Axios} apiClient
   */
  constructor (apiClient) {
    const { baseURL } = apiClient.defaults

    this.apiClient = axios.create({
      baseURL
    })
  }

  setAuthorizationHeader (value) {
    this.apiClient.defaults.headers.Authorization = value
  }

  async create (payload) {
    const { data } = await this.apiClient.post('/event-questions', payload)

    return data
  }

  async list (options = {}) {
    const {
      sort: {
        field: sortField,
        order: sortOrder
      } = {}
    } = options

    const queryString = new URLSearchParams()

    if (sortField !== undefined && sortOrder !== undefined) {
      queryString.set('sort.field', sortField)
      queryString.set('sort.order', sortOrder)
    }

    const { data } = await this.apiClient.get(`${REPOSITORY_ROUTE_PREFIX}?${queryString.toString()}`)

    return {
      results: data.results
    }
  }

  async deleteEventQuestion (id) {
    await this.apiClient.delete(`${REPOSITORY_ROUTE_PREFIX}/${id}`)
  }
}

module.exports = EventQuestionRepository
