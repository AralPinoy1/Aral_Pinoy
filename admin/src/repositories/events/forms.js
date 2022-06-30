'use strict'

/** @typedef {import('axios').Axios} Axios */

const REPOSITORY_BASE_URL = '/event-forms'

class EventFormRepository {
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
   * Download event inventory list file
   * @param {string} eventId Event Id
   * @returns {Promise<Blob>}
   */
  async downloadInventoryListFile (eventId) {
    const { data } = await this.apiClient.get(`${REPOSITORY_BASE_URL}/inventory-list-file/${eventId}`, {
      headers: this.headers,
      responseType: 'blob'
    })

    return data
  }

  /**
   * Download event expense breakdown file
   * @param {string} eventId Event Id
   * @returns {Promise<Blob>}
   */
  async downloadExpenseBreakdownFile (eventId) {
    const { data } = await this.apiClient.get(`${REPOSITORY_BASE_URL}/expense-breakdown-file/${eventId}`, {
      headers: this.headers,
      responseType: 'blob'
    })

    return data
  }

  /**
   * Download event volunteer attendance file
   * @param {string} eventId Event Id
   * @returns {Promise<Blob>}
   */
  async downloadVolunteerAttendanceFile (eventId) {
    const { data } = await this.apiClient.get(`${REPOSITORY_BASE_URL}/volunteer-attendance-file/${eventId}`, {
      headers: this.headers,
      responseType: 'blob'
    })

    return data
  }
}

module.exports = EventFormRepository
