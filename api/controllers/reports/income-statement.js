'use strict'

const { 
  startOfDay,
  endOfDay,
  format,
  parse
} = require('date-fns')

const MonetaryDonationModel = require('../../models/monetary-donations')
const EventDonationModel = require('../../models/events/donations')
const EventExpenseModel = require('../../models/events/expenses')
const EventModel = require('../../models/events')

const DATE_FORMAT = 'MM/dd/yy'

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
      const transactionDate = format(monetaryDonation.createdAt, 'MM/dd/yy')

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
      const transactionDate = format(eventDonation.createdAt, 'MM/dd/yy')

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
}

module.exports = ReportIncomeStatementController