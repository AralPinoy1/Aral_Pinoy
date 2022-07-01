'use strict'

const { startOfDay, endOfDay } = require('date-fns')
const Zip = require('adm-zip')
const { stringify } = require('csv-stringify/sync')

const MonetaryDonationModel = require('../../models/monetary-donations')
const EventDonationModel = require('../../models/events/donations')

const {
  ConflictError
} = require('../../errors')

const ANONYMOUS_DONOR = 'Anonymous'

const CSV_HEADERS_BY_INDIVIDUAL = ['Name', 'Value']
const CSV_HEADERS_BY_COMPANY = ['Company Name', 'Value']

class ReportMonetaryDonationController {
  /**
   * 
   * @param {Object} dateRange Date range object
   * @param {Date} dateRange.start Start date
   * @param {Date} dateRange.end End date
   * @returns 
   */
  static async get(dateRange) {
    const {
      start,
      end
    } = dateRange

    const totalDonationsByPerson = {
      labels: [],
      data: []
    }
    const totalDonationsByCompany = {
      labels: [],
      data: []
    }
    const monetaryDonationsByPerson = {
      labels: [],
      data: []
    }
    const monetaryDonationsByCompany = {
      labels: [],
      data: []
    }
    const eventDonationsByPerson = {
      labels: [],
      data: []
    }
    const eventDonationsByCompany = {
      labels: [],
      data: []
    }
    
    const monetaryDonations = await MonetaryDonationModel.find({
      createdAt: {
        $gte: startOfDay(start),
        $lte: endOfDay(end)
      }
    }, ['amount', 'metadata'])

    const eventDonations = await EventDonationModel.find({
      createdAt: {
        $gte: startOfDay(start),
        $lte: endOfDay(end)
      }
    }, ['amount', 'metadata'])

    const totalDonationAmountByPersonMap = new Map()
    const totalDonationAmountByCompanyMap = new Map()
    
    const {
      donorAmountByPersonMap: monetaryDonationAmountByPersonMap,
      donorAmountByCompanyMap: monetaryDonationAmountByCompanyMap
    } = ReportMonetaryDonationController.resolveMonetaryDonationsDonorAmounts(monetaryDonations)

    for (const [donor, amount] of monetaryDonationAmountByPersonMap.entries()) {
      monetaryDonationsByPerson.labels.push(donor)
      monetaryDonationsByPerson.data.push(amount)

      let totalAmount = totalDonationAmountByPersonMap.get(donor)

      if (totalAmount === undefined) {
        totalAmount = amount
      } else {
        totalAmount += amount
      }

      totalDonationAmountByPersonMap.set(donor, totalAmount)
    }

    for (const [donor, amount] of monetaryDonationAmountByCompanyMap.entries()) {
      monetaryDonationsByCompany.labels.push(donor)
      monetaryDonationsByCompany.data.push(amount)

      let totalAmount = totalDonationAmountByCompanyMap.get(donor)

      if (totalAmount === undefined) {
        totalAmount = amount
      } else {
        totalAmount += amount
      }

      totalDonationAmountByCompanyMap.set(donor, totalAmount)
    }

    const {
      donorAmountByPersonMap: eventDonationAmountByPersonMap,
      donorAmountByCompanyMap: eventDonationAmountByCompanyMap
    } = ReportMonetaryDonationController.resolveEventDonationsDonorAmounts(eventDonations)

    for (const [donor, amount] of eventDonationAmountByPersonMap.entries()) {
      eventDonationsByPerson.labels.push(donor)
      eventDonationsByPerson.data.push(amount)

      let totalAmount = totalDonationAmountByPersonMap.get(donor)

      if (totalAmount === undefined) {
        totalAmount = amount
      } else {
        totalAmount += amount
      }
      
      totalDonationAmountByPersonMap.set(donor, totalAmount)
    }

    for (const [donor, amount] of eventDonationAmountByCompanyMap.entries()) {
      eventDonationsByCompany.labels.push(donor)
      eventDonationsByCompany.data.push(amount)

      let totalAmount = totalDonationAmountByCompanyMap.get(donor)

      if (totalAmount === undefined) {
        totalAmount = amount
      } else {
        totalAmount += amount
      }

      totalDonationAmountByCompanyMap.set(donor, totalAmount)
    }

    for (const [donor, amount] of totalDonationAmountByPersonMap.entries()) {
      totalDonationsByPerson.labels.push(donor)
      totalDonationsByPerson.data.push(amount)
    }

    for (const [donor, amount] of totalDonationAmountByCompanyMap.entries()) {
      totalDonationsByCompany.labels.push(donor)
      totalDonationsByCompany.data.push(amount)
    }

    return {
      totalDonationsByPerson,
      totalDonationsByCompany,
      monetaryDonationsByPerson,
      monetaryDonationsByCompany,
      eventDonationsByPerson,
      eventDonationsByCompany
    }
  }

  static resolveMonetaryDonationsDonorAmounts(monetaryDonations = []) {
    const donorAmountByPersonMap = new Map()
    const donorAmountByCompanyMap = new Map()

    for (const monetaryDonation of monetaryDonations) {
      const donorCompany = ReportMonetaryDonationController.resolveDonorByCompany(monetaryDonation.metadata)

      if (donorCompany !== undefined) {
        const amountDonatedByCompany = donorAmountByCompanyMap.get(donorCompany)

        if (amountDonatedByCompany === undefined) {
          donorAmountByCompanyMap.set(donorCompany, monetaryDonation.amount)
        } else {
          donorAmountByCompanyMap.set(donorCompany, amountDonatedByCompany + monetaryDonation.amount)
        }
        
        continue
      }

      const donorPerson = ReportMonetaryDonationController.resolveDonorByPerson(monetaryDonation.metadata)
      const amountDonatedByPerson = donorAmountByPersonMap.get(donorPerson)

      if (amountDonatedByPerson === undefined) {
        donorAmountByPersonMap.set(donorPerson, monetaryDonation.amount)
      } else {
        donorAmountByPersonMap.set(donorPerson, amountDonatedByPerson + monetaryDonation.amount)
      }
    }

    return {
      donorAmountByPersonMap,
      donorAmountByCompanyMap
    }
  }

  static resolveEventDonationsDonorAmounts(eventDonations = []) {
    const donorAmountByPersonMap = new Map()
    const donorAmountByCompanyMap = new Map()

    for (const eventDonation of eventDonations) {
      const donorCompany = ReportMonetaryDonationController.resolveDonorByCompany(eventDonation.metadata)

      if (donorCompany !== undefined) {
        const amountDonatedByCompany = donorAmountByCompanyMap.get(donorCompany)

        if (amountDonatedByCompany === undefined) {
          donorAmountByCompanyMap.set(donorCompany, eventDonation.amount)
        } else {
          donorAmountByCompanyMap.set(donorCompany, amountDonatedByCompany + eventDonation.amount)
        }
        
        continue
      }

      const donorPerson = ReportMonetaryDonationController.resolveDonorByPerson(eventDonation.metadata)
      const amountDonatedByPerson = donorAmountByPersonMap.get(donorPerson)

      if (amountDonatedByPerson === undefined) {
        donorAmountByPersonMap.set(donorPerson, eventDonation.amount)
      } else {
        donorAmountByPersonMap.set(donorPerson, amountDonatedByPerson + eventDonation.amount)
      }
    }

    return {
      donorAmountByPersonMap,
      donorAmountByCompanyMap
    }
  }

  /**
   * 
   * @param {Object} metadata Metadata
   * @returns {string}
   */
  static resolveDonorByPerson(metadata) {
    if (metadata === undefined) {
      return ANONYMOUS_DONOR
    }

    const contactDetails = metadata.contactDetails

    if (contactDetails !== undefined && contactDetails.firstName !== undefined && contactDetails.lastName !== undefined) {
      return `${contactDetails.firstName} ${contactDetails.lastName}`
    }

    return ANONYMOUS_DONOR
  }

  /**
   * 
   * @param {Object} metadata Metadata
   * @returns {string}
   */
  static resolveDonorByCompany(metadata) {
    if (metadata === undefined) {
      return
    }
      
    const contactDetails = metadata.contactDetails

    if (contactDetails === undefined || contactDetails.companyName === undefined) {
      return
    }

    return contactDetails.companyName
  }

  /**
   * 
   * @param {Object} dateRange Date range object
   * @param {Date} dateRange.start Start date
   * @param {Date} dateRange.end End date
   * @returns 
   */
  static async export(dateRange) {
    const {
      start,
      end
    } = dateRange

    const totalDonationAmountByPersonEntries = []
    const totalDonationAmountByCompanyEntries = []

    const eventDonationAmountByPersonEntries = []
    const eventDonationAmountByCompanyEntries = []

    const monetaryDonationAmountByPersonEntries = []
    const monetaryDonationAmountByCompanyEntries = []
    
    const monetaryDonations = await MonetaryDonationModel.find({
      createdAt: {
        $gte: startOfDay(start),
        $lte: endOfDay(end)
      }
    }, ['amount', 'metadata'])

    const eventDonations = await EventDonationModel.find({
      createdAt: {
        $gte: startOfDay(start),
        $lte: endOfDay(end)
      }
    }, ['amount', 'metadata'])

    if (monetaryDonations.length === 0 && eventDonations.length === 0) {
      throw new ConflictError('no-results')
    }

    const totalDonationAmountByPersonMap = new Map()
    const totalDonationAmountByCompanyMap = new Map()
    
    const {
      donorAmountByPersonMap: monetaryDonationAmountByPersonMap,
      donorAmountByCompanyMap: monetaryDonationAmountByCompanyMap
    } = ReportMonetaryDonationController.resolveMonetaryDonationsDonorAmounts(monetaryDonations)

    for (const [donor, amount] of monetaryDonationAmountByPersonMap.entries()) {
      monetaryDonationAmountByPersonEntries.push([
        donor,
        amount
      ])

      let totalAmount = totalDonationAmountByPersonMap.get(donor)

      if (totalAmount === undefined) {
        totalAmount = amount
      } else {
        totalAmount += amount
      }

      totalDonationAmountByPersonMap.set(donor, totalAmount)
    }

    for (const [donor, amount] of monetaryDonationAmountByCompanyMap.entries()) {
      monetaryDonationAmountByCompanyEntries.push([
        donor,
        amount
      ])

      let totalAmount = totalDonationAmountByCompanyMap.get(donor)

      if (totalAmount === undefined) {
        totalAmount = amount
      } else {
        totalAmount += amount
      }

      totalDonationAmountByCompanyMap.set(donor, totalAmount)
    }

    const {
      donorAmountByPersonMap: eventDonationAmountByPersonMap,
      donorAmountByCompanyMap: eventDonationAmountByCompanyMap
    } = ReportMonetaryDonationController.resolveEventDonationsDonorAmounts(eventDonations)

    for (const [donor, amount] of eventDonationAmountByPersonMap.entries()) {
      eventDonationAmountByPersonEntries.push([
        donor,
        amount
      ])

      let totalAmount = totalDonationAmountByPersonMap.get(donor)

      if (totalAmount === undefined) {
        totalAmount = amount
      } else {
        totalAmount += amount
      }
      
      totalDonationAmountByPersonMap.set(donor, totalAmount)
    }

    for (const [donor, amount] of eventDonationAmountByCompanyMap.entries()) {
      eventDonationAmountByCompanyEntries.push([
        donor,
        amount
      ])

      let totalAmount = totalDonationAmountByCompanyMap.get(donor)

      if (totalAmount === undefined) {
        totalAmount = amount
      } else {
        totalAmount += amount
      }

      totalDonationAmountByCompanyMap.set(donor, totalAmount)
    }

    for (const [donor, amount] of totalDonationAmountByPersonMap.entries()) {
      totalDonationAmountByPersonEntries.push([
        donor,
        amount
      ])
    }

    for (const [donor, amount] of totalDonationAmountByCompanyMap.entries()) {
      totalDonationAmountByCompanyEntries.push([
        donor,
        amount
      ])
    }

    const zip = new Zip()

    const csvStringForTotalDonationAmountByPerson = stringify([
      CSV_HEADERS_BY_INDIVIDUAL,
      ...totalDonationAmountByPersonEntries
    ])

    const csvStringForTotalDonationAmountByCompany = stringify([
      CSV_HEADERS_BY_COMPANY,
      ...totalDonationAmountByCompanyEntries
    ])

    const csvStringForEventDonationAmountByPerson = stringify([
      CSV_HEADERS_BY_INDIVIDUAL,
      ...eventDonationAmountByPersonEntries
    ])

    const csvStringForEventDonationAmountByCompany = stringify([
      CSV_HEADERS_BY_COMPANY,
      ...eventDonationAmountByCompanyEntries
    ])

    const csvStringForMonetaryDonationAmountByPerson = stringify([
      CSV_HEADERS_BY_INDIVIDUAL,
      ...monetaryDonationAmountByPersonEntries
    ])

    const csvStringForMonetaryDonationAmountByCompany = stringify([
      CSV_HEADERS_BY_COMPANY,
      ...monetaryDonationAmountByCompanyEntries
    ])

    zip.addFile(`total_donation_by_person_report_from_${start.toJSON()}_to_${end.toJSON()}.csv`, Buffer.from(csvStringForTotalDonationAmountByPerson, 'utf8'))
    zip.addFile(`total_donation_by_company_report_from_${start.toJSON()}_to_${end.toJSON()}.csv`, Buffer.from(csvStringForTotalDonationAmountByCompany, 'utf8'))
    zip.addFile(`event_donation_by_person_report_from_${start.toJSON()}_to_${end.toJSON()}.csv`, Buffer.from(csvStringForEventDonationAmountByPerson, 'utf8'))
    zip.addFile(`event_donation_by_company_report_from_${start.toJSON()}_to_${end.toJSON()}.csv`, Buffer.from(csvStringForEventDonationAmountByCompany, 'utf8'))
    zip.addFile(`aral_pinoy_donation_by_person_report_from_${start.toJSON()}_to_${end.toJSON()}.csv`, Buffer.from(csvStringForMonetaryDonationAmountByPerson, 'utf8'))
    zip.addFile(`aral_pinoy_donation_by_company_report_from_${start.toJSON()}_to_${end.toJSON()}.csv`, Buffer.from(csvStringForMonetaryDonationAmountByCompany, 'utf8'))

    return zip
  }
}

module.exports = ReportMonetaryDonationController