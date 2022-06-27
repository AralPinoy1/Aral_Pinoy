'use strict'

const EventTypeModel = require('../../models/events/types')

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

class EventTypeController {

  /**
   * @param {Object} eventType
   * @param {string} eventType.label
   * @returns {Promise<Object>} 
   */
  static async create(eventType) {
    const {
      label
    } = eventType

    const result = await EventTypeModel.create({
      label,
      norm: sanitize(label),
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

    const eventTypes = await EventTypeModel.find(undefined, undefined, queryOptions)

    return {
      results: eventTypes
    }
  }

  /**
   * @param {string} id Event type ID
   * @returns {Promise<void>}
   */
  static async deleteEventType(id) {
    const { deletedCount } = await EventTypeModel.deleteOne({
      _id: id
    })

    if (deletedCount === 0) {
      throw new NotFoundError('event-type')
    }
  }
}

module.exports = EventTypeController