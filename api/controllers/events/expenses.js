'use strict'

const { Types } = require('mongoose')

const EventExpenseModel = require('../../models/events/expenses')
const EventModel = require('../../models/events')

const { 
  NotFoundError,
} = require('../../errors')

const SORT_ORDER_MAPPING = {
  asc : 1,
  desc: -1
}

function transformEventPopulation(event) {
  return event.toObject({
    getters: true
  })
}

class EventExpenseController {
  static async list(options = {}) {
    const {
      limit,
      offset,
      filters: {
        eventId
      },
      sort: {
        field: sortField,
        order: sortOrder
      }
    } = options

    const matchQuery = {}
    const queryOptions = { 
      limit,
      skip: offset,
      populate: {
        path: 'event'
      }
    }

    if (eventId !== undefined) {
      matchQuery.event = new Types.ObjectId(eventId)
    }

    if (sortField !== undefined && sortOrder !== undefined) {
      queryOptions.sort = {
        [sortField]: SORT_ORDER_MAPPING[sortOrder]
      }
    }

    const [expenses, total] = await Promise.all([
      EventExpenseModel.find(matchQuery, undefined, queryOptions),
      EventExpenseModel.countDocuments(matchQuery)
    ])

    return {
      results: expenses,
      total
    }
  }

  static async groupList(options = {}) {
    const {
      limit,
      offset,
      sort: {
        field: sortField,
        order: sortOrder
      }
    } = options

    const aggregationQuery = [{
      $group: {
        _id: '$event',
        amount: {
          $sum: '$amount'
        },
        createdAt: {
          $max: '$createdAt'
        }
      }
    }, {
      $addFields: {
        event: '$_id'
      }
    }, {
      $project: {
        _id: 0
      }
    }, {
      $project: {
        event: 1,
        amount: {
          $divide: ['$amount', 1000]
        },
        createdAt: 1,
      }
    }]

    if (sortField !== undefined && sortOrder !== undefined) {
      aggregationQuery.push({
        $sort: {
          [sortField]: SORT_ORDER_MAPPING[sortOrder]
        }
      })
    }
    
    aggregationQuery.push({
      $skip: offset
    }, {
      $limit: limit
    })

    const aggregationResults = await Promise.all([
      EventExpenseModel.aggregate(aggregationQuery),
      EventExpenseModel.aggregate([ 
        {
          $group: {
            _id: '$event'
          }
        },
        {
          $count: 'count'
        }
      ])
    ])

    const populatedResults = await EventModel.populate(aggregationResults[0], {
      path: 'event',
      model: EventModel,
      transform: transformEventPopulation
    })

    return {
      results : populatedResults,
      total : aggregationResults[1].length > 0 ? aggregationResults[1][0].count : 0
    }
  }

  static async get(id) {
    const expense = await EventExpenseModel.findById(id, undefined, {
      lean: true,
      populate: ['event']
    })

    if (expense === null) {
      throw new NotFoundError('event_expense')
    }

    return expense
  }
}

module.exports = EventExpenseController