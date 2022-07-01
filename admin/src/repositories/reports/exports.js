'use strict'

/** @typedef {import('axios').Axios} Axios */

const REPOSITORY_BASE_URL = '/report-exports'

class ReportExportRepository {
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
   * Export events report as a file
   * @param {Object} dateRange Date range
   * @param {string} dateRange.start Start date
   * @param {string} dateRange.end End date
   * @returns {Promise<Blob>}
   */
  async exportEvents (dateRange) {
    const {
      start,
      end
    } = dateRange

    const queryString = new URLSearchParams()
    queryString.set('startDate', start)
    queryString.set('endDate', end)

    const { data } = await this.apiClient.get(`${REPOSITORY_BASE_URL}/events?${queryString.toString()}`, {
      headers: this.headers,
      responseType: 'blob'
    })

    return data
  }

  /**
   * Export income statement report as a file
   * @param {Object} dateRange Date range
   * @param {string} dateRange.start Start date
   * @param {string} dateRange.end End date
   * @returns {Promise<Blob>}
   */
  async exportIncomeStatement (dateRange) {
    const {
      start,
      end
    } = dateRange

    const queryString = new URLSearchParams()
    queryString.set('startDate', start)
    queryString.set('endDate', end)

    const { data } = await this.apiClient.get(`${REPOSITORY_BASE_URL}/income-statement?${queryString.toString()}`, {
      headers: this.headers,
      responseType: 'blob'
    })

    return data
  }

  /**
   * Export monetary donations report as a file
   * @param {Object} dateRange Date range
   * @param {string} dateRange.start Start date
   * @param {string} dateRange.end End date
   * @returns {Promise<Blob>}
   */
  async exportMonetaryDonations (dateRange) {
    const {
      start,
      end
    } = dateRange

    const queryString = new URLSearchParams()
    queryString.set('startDate', start)
    queryString.set('endDate', end)

    const { data } = await this.apiClient.get(`${REPOSITORY_BASE_URL}/monetary-donations?${queryString.toString()}`, {
      headers: this.headers,
      responseType: 'blob'
    })

    return data
  }

  /**
   * Export volunteers report as a file
   * @param {Object} dateRange Date range
   * @param {string} dateRange.start Start date
   * @param {string} dateRange.end End date
   * @returns {Promise<Blob>}
   */
  async exportVolunteers (dateRange) {
    const {
      start,
      end
    } = dateRange

    const queryString = new URLSearchParams()
    queryString.set('startDate', start)
    queryString.set('endDate', end)

    const { data } = await this.apiClient.get(`${REPOSITORY_BASE_URL}/volunteers?${queryString.toString()}`, {
      headers: this.headers,
      responseType: 'blob'
    })

    return data
  }
}

module.exports = ReportExportRepository
