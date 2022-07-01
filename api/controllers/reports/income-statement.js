'use strict'

const { 
  startOfDay,
  endOfDay,
  format,
  parse
} = require('date-fns')
const Zip = require('adm-zip')
const { stringify } = require('csv-stringify/sync')

const MonetaryDonationModel = require('../../models/monetary-donations')
const EventDonationModel = require('../../models/events/donations')
const EventExpenseModel = require('../../models/events/expenses')
const EventModel = require('../../models/events')

const EVENT_STATUSES = require('../../constants/events').STATUSES

const {
  ConflictError
} = require('../../errors')

const DATE_FORMAT = 'MM/dd/yy'

const CSV_HEADERS_FOR_INCOME_STATEMENT = ['Date', 'Value']
const CSV_HEADERS_FOR_EXPENSES = ['Event Name', 'Value']

/**
 * @param {string} firstDateStr First date
 * @param {string} secondDateStr Second date
 */
function sortByDate(firstDateStr, secondDateStr) {
  const firstDate = parse(firstDateStr, DATE_FORMAT, new Date())
  const secondDate = parse(secondDateStr, DATE_FORMAT, new Date())

  return firstDate - secondDate
}

class ReportIncomeStatementController {
  /**
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

    const todayInBase36 = Date.now().toString(36)

    const monetaryDonations = await MonetaryDonationModel.find({
      createdAt: {
        $gte: startOfDay(start),
        $lte: endOfDay(end)
      }
    }, ['amount', 'createdAt'])
    const eventDonations = await EventDonationModel.find({
      createdAt: {
        $gte: startOfDay(start),
        $lte: endOfDay(end)
      }
    }, ['amount', 'createdAt'])
    const eventExpenses = await EventExpenseModel.find({
      createdAt: {
        $gte: startOfDay(start),
        $lte: endOfDay(end)
      }
    }, ['event', 'amount', 'createdAt'], {
      populate: [{
        path: 'event'
      }]
    })

    const incomeStatement = {
      labels: [],
      datasets: [{
        label: 'Event Donations',
        data: []
      }, {
        label: 'Aral Pinoy Donations',
        data: []
      }]
    }

    const expenses = {
      labels: [],
      datasets: [{
        label: 'Proposed Expenses',
        data: []
      }, {
        label: 'Actual Expenses',
        data: []
      }]
    }

    if (monetaryDonations.length === 0 && eventDonations.length === 0 && eventExpenses.length === 0) {
      return {
        incomeStatement
      }
    }

    const dateIncomeStatementMap = new Map()
    const eventExpensesMap = new Map()

    for (const monetaryDonation of monetaryDonations) {
      const transactionDate = format(monetaryDonation.createdAt, DATE_FORMAT)

      let incomeStatementMap = dateIncomeStatementMap.get(transactionDate)

      if (incomeStatementMap === undefined) {
        incomeStatementMap = {
          totalEventDonations: 0,
          totalDonations: 0
        }

        dateIncomeStatementMap.set(transactionDate, incomeStatementMap)
      }

      incomeStatementMap.totalDonations += monetaryDonation.amount
    }

    for (const eventDonation of eventDonations) {
      const transactionDate = format(eventDonation.createdAt, DATE_FORMAT)

      let incomeStatementMap = dateIncomeStatementMap.get(transactionDate)

      if (incomeStatementMap === undefined) {
        incomeStatementMap = {
          totalEventDonations: 0,
          totalDonations: 0
        }

        dateIncomeStatementMap.set(transactionDate, incomeStatementMap)
      }

      incomeStatementMap.totalEventDonations += eventDonation.amount
    }

    for (const expense of eventExpenses) {
      const key = `${expense.event._id.toString()}:${todayInBase36}:${expense.event.name}`

      let expensesMap = eventExpensesMap.get(key)

      if (expensesMap === undefined) {
        expensesMap = {
          totalProposed: 0,
          totalActual: 0
        }

        eventExpensesMap.set(key, expensesMap)
      }

      expensesMap.totalActual += expense.amount
    }

    const events = await EventModel.find({
      status: EVENT_STATUSES.ENDED,
      'date.start': {
        $gte: startOfDay(start),
        $lte: endOfDay(end)
      },
      budget: {
        $exists: true
      }
    })

    for (const event of events) {
      const key = `${event._id.toString()}:${todayInBase36}:${event.name}`
      
      let expensesMap = eventExpensesMap.get(key)

      if (expensesMap === undefined) {
        expensesMap = {
          totalProposed: 0,
          totalActual: 0
        }

        eventExpensesMap.set(key, expensesMap)
      }

      let totalBudget = 0

      for (const item of event.budget.breakdown) {
        totalBudget += item.amount
      }

      expensesMap.totalProposed += totalBudget
    }

    for (const [date, incomeStatementMap] of dateIncomeStatementMap.entries()) {
      incomeStatement.labels.push(date)

      const {
        totalEventDonations,
        totalDonations
      } = incomeStatementMap

      incomeStatement.datasets[0].data.push(totalEventDonations)
      incomeStatement.datasets[1].data.push(totalDonations)
    }

    incomeStatement.labels = incomeStatement.labels.sort(sortByDate)

    for (const [key, expenseMap] of eventExpensesMap.entries()) {
      expenses.labels.push(key.split(`:${todayInBase36}:`)[1])

      const { 
        totalProposed,
        totalActual
      } = expenseMap

      expenses.datasets[0].data.push(totalProposed)
      expenses.datasets[1].data.push(totalActual)
    }

    expenses.labels = expenses.labels.sort(sortByDate)

    return {
      incomeStatement,
      expenses
    }
  }

  /**
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

    const todayInBase36 = Date.now().toString(36)

    const monetaryDonations = await MonetaryDonationModel.find({
      createdAt: {
        $gte: startOfDay(start),
        $lte: endOfDay(end)
      }
    }, ['amount', 'createdAt'])
    const eventDonations = await EventDonationModel.find({
      createdAt: {
        $gte: startOfDay(start),
        $lte: endOfDay(end)
      }
    }, ['amount', 'createdAt'])
    const eventExpenses = await EventExpenseModel.find({
      createdAt: {
        $gte: startOfDay(start),
        $lte: endOfDay(end)
      }
    }, ['event', 'amount', 'createdAt'], {
      populate: [{
        path: 'event'
      }]
    })

    if (monetaryDonations.length === 0 && eventDonations.length === 0 && eventExpenses.length === 0) {
      throw new ConflictError('no-results')
    }

    const dateIncomeStatementMap = new Map()
    const eventExpensesMap = new Map()

    for (const monetaryDonation of monetaryDonations) {
      const transactionDate = format(new Date(monetaryDonation.createdAt), DATE_FORMAT)

      let incomeStatementMap = dateIncomeStatementMap.get(transactionDate)

      if (incomeStatementMap === undefined) {
        incomeStatementMap = {
          totalEventDonations: 0,
          totalDonations: 0
        }

        dateIncomeStatementMap.set(transactionDate, incomeStatementMap)
      }

      incomeStatementMap.totalDonations += monetaryDonation.amount
    }

    for (const eventDonation of eventDonations) {
      const transactionDate = format(new Date(eventDonation.createdAt), DATE_FORMAT)

      let incomeStatementMap = dateIncomeStatementMap.get(transactionDate)

      if (incomeStatementMap === undefined) {
        incomeStatementMap = {
          totalEventDonations: 0,
          totalDonations: 0
        }

        dateIncomeStatementMap.set(transactionDate, incomeStatementMap)
      }

      incomeStatementMap.totalEventDonations += eventDonation.amount
    }

    for (const expense of eventExpenses) {
      const key = `${expense.event._id.toString()}:${todayInBase36}:${expense.event.name}`

      let expensesMap = eventExpensesMap.get(key)

      if (expensesMap === undefined) {
        expensesMap = {
          totalProposed: 0,
          totalActual: 0
        }

        eventExpensesMap.set(key, expensesMap)
      }

      expensesMap.totalActual += expense.amount
    }

    const events = await EventModel.find({
      status: EVENT_STATUSES.ENDED,
      'date.start': {
        $gte: startOfDay(start),
        $lte: endOfDay(end)
      },
      budget: {
        $exists: true
      }
    })

    for (const event of events) {
      const key = `${event._id.toString()}:${todayInBase36}:${event.name}`
      
      let expensesMap = eventExpensesMap.get(key)

      if (expensesMap === undefined) {
        expensesMap = {
          totalProposed: 0,
          totalActual: 0
        }

        eventExpensesMap.set(key, expensesMap)
      }

      let totalBudget = 0

      for (const item of event.budget.breakdown) {
        totalBudget += item.amount
      }

      expensesMap.totalProposed += totalBudget
    }

    const totalEventIncomeEntries = []
    const totalMonetaryIncomeEntries = []
    const totalProposedExpensesEntries = []
    const totalActualExpensesEntries = []

    for (const [date, incomeStatementMap] of dateIncomeStatementMap.entries()) {
      const {
        totalEventDonations,
        totalDonations
      } = incomeStatementMap

      const parsedDate = parse(date, DATE_FORMAT, new Date())

      const formattedDate = parsedDate.toLocaleString('en-us', { dateStyle: 'medium', timeZone: 'Asia/Manila' })

      totalEventIncomeEntries.push([
        formattedDate,
        totalEventDonations
      ])

      totalMonetaryIncomeEntries.push([
        formattedDate,
        totalDonations
      ])
    }

    for (const [key, expenseMap] of eventExpensesMap.entries()) {
      const label = key.split(`:${todayInBase36}:`)[1]

      const { 
        totalProposed,
        totalActual
      } = expenseMap

      totalProposedExpensesEntries.push([
        label,
        totalProposed
      ])

      totalActualExpensesEntries.push([
        label,
        totalActual
      ])
    }

    const csvStringTotalEventIncome = stringify([
      CSV_HEADERS_FOR_INCOME_STATEMENT,
      ...totalEventIncomeEntries
    ])

    const csvStringTotalMonetaryIncome = stringify([
      CSV_HEADERS_FOR_INCOME_STATEMENT,
      ...totalMonetaryIncomeEntries
    ])

    const csvStringTotalProposedExpense = stringify([
      CSV_HEADERS_FOR_EXPENSES,
      ...totalProposedExpensesEntries
    ])

    const csvStringTotalActualExpense = stringify([
      CSV_HEADERS_FOR_EXPENSES,
      ...totalActualExpensesEntries
    ])

    const zip = new Zip()

    zip.addFile(`total_event_donations_report_from_${start.toJSON()}_to_${end.toJSON()}.csv`, Buffer.from(csvStringTotalEventIncome, 'utf8'))
    zip.addFile(`total_aral_pinoy_donations_report_from_${start.toJSON()}_to_${end.toJSON()}.csv`, Buffer.from(csvStringTotalMonetaryIncome, 'utf8'))
    zip.addFile(`total_proposed_expense_report_from_${start.toJSON()}_to_${end.toJSON()}.csv`, Buffer.from(csvStringTotalProposedExpense, 'utf8'))
    zip.addFile(`total_actual_expense_report_from_${start.toJSON()}_to_${end.toJSON()}.csv`, Buffer.from(csvStringTotalActualExpense, 'utf8'))

    return zip
  }
}

module.exports = ReportIncomeStatementController