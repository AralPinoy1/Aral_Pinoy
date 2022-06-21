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
      type
    } = eventQuestion

    /** @type {Document} */
    const result = await EventQuestionModel.create({
      label,
      norm: sanitize(label),
      type
    })

    return result.toObject({
      minimize: true,
      versionKey: false,
      useProjection: true
    })
  }

  /**
   * @param {Object} [options={}]
   * @param {Object} [options.sort]
   * @param {string} options.sort.field
   * @param {string} options.sort.order
   * @returns 
   */
  static async list(options = {}) {
    const {
      sort
    } = options

    const queryOptions = {}

    if (sort !== undefined) {
      const { field, order } = sort

      queryOptions.sort = {
        [field]: SORT_ORDER_MAPPING[order]
      }
    }

    const eventQuestions = await EventQuestionModel.find(undefined, undefined, queryOptions)

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