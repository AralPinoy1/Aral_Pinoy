'use strict'

const debug = require('debug')

const EventTypeModel = require('../../models/events/types')

const logger = debug('api:server')

const eventTypes = [
  {
    label: 'Coastal Cleanup',
    norm: 'coastal cleanup',
  },
  {
    label: 'Tree Planting',
    norm: 'tree planting',
  },
  {
    label: 'Feeding Event',
    norm: 'feeding event',
  },
  {
    label: 'Tutoring Event',
    norm: 'tutoring event',
  },
  {
    label: 'Donation Drive',
    norm: 'donation drive',
  },
]

async function initialize() {
  for (const eventType of eventTypes) {
    const { upsertedCount } = await EventTypeModel.updateOne({
      norm: eventType.norm
    }, {
      $setOnInsert: eventType
    }, {
      upsert: true
    })

    if (upsertedCount > 0) {
      logger(`Seeded Event Type: ${eventType.norm}`)
    }
  }
}

module.exports = initialize
