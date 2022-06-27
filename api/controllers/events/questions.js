'use strict'

const EventQuestionModel = require('../../models/events/questions')

const {
  NotFoundError
} = require('../../errors')

const whitespaceRegex = /\s+/g

const SORT_ORDER_MAPPING = {
  asc : 1,
  desc: -1
}

function sanitize(name) {
  return name.replace(whitespaceRegex, ' ')
}

class EventQuestionController {

  /**
   * @param {Object} eventQuestion
   * @param {string} eventQuestion.label
   * @param {string} eventQuestion.type 
   * @returns {Promise<Object>} 
   */
  static async create(eventQuestion) {
    const {
      label,
      type,
      eventTypes
    } = eventQuestion

    /** @type {Document} */
    const result = await EventQuestionModel.create({
      label,
      norm: sanitize(label),
      type,
      eventTypes
    })

    return result.toObject({
      minimize: true,
      versionKey: false,
      useProjection: true
    })
  }

  /**
   * @param {Object} [options={}]
   * @param {Object} [options.filters]
   * @param {string[]} [options.filters.eventTypes]
   * @param {Object} [options.sort]
   * @param {string} options.sort.field
   * @param {string} options.sort.order
   * @returns 
   */
  static async list(options = {}) {
    const {
      filters,
      sort: {
        field: sortField,
        order: sortOrder
      }
    } = options

    const matchQuery = {}

    if (filters !== undefined) {
      const { eventTypes } = filters

      if (Array.isArray(eventTypes) && eventTypes.length > 0) {
        matchQuery.eventTypes = {
          $in: eventTypes
        }
      }
    }

    const queryOptions = {}

    if (sortField !== undefined && sortOrder !== undefined ) {
      queryOptions.sort = {
        [sortField]: SORT_ORDER_MAPPING[sortOrder]
      }
    }

    const eventQuestions = await EventQuestionModel.find(matchQuery, undefined, queryOptions)

    return {
      results: eventQuestions
    }
  }

  /**
   * @param {string} id Event question ID
   * @returns {Promise<void>}
   */
  static async deleteEventQuestion(id) {
    const { deletedCount } = await EventQuestionModel.deleteOne({
      _id: id
    })

    if (deletedCount === 0) {
      throw new NotFoundError('event-question')
    }
  }
}

module.exports = EventQuestionController