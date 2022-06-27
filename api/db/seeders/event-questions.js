'use strict'

const debug = require('debug')

const EventQuestionModel = require('../../models/events/questions')

const logger = debug('api:server')

const eventQuestions = [
  {
    label: 'How satisfied were you with the event in meeting your expectations?',
    norm: 'how satisfied were you on the event in meeting your expectations?',
    type: 'matrix:satisfied',
    eventTypes: [
      'Coastal Cleanup',
      'Tree Planting',
      'Feeding Event',
      'Tutoring Event',
      'Donation Drive',
    ]
  },
  {
    label: 'How likely are you to join another event in the future?',
    norm: 'how likely are you to join another event in the future?',
    type: 'matrix:likely',
    eventTypes: [
      'Coastal Cleanup',
      'Tree Planting',
      'Feeding Event',
      'Tutoring Event',
      'Donation Drive',
    ]
  },
  {
    label: 'How likely are you to recommend a friend to join Aral Pinoy events?',
    norm: 'how likely are you to recommend a friend to join aral pinoy events?',
    type: 'matrix:likely',
    eventTypes: [
      'Coastal Cleanup',
      'Tree Planting',
      'Feeding Event',
      'Tutoring Event',
      'Donation Drive',
    ]
  },
]

async function initialize() {
  for (const event of eventQuestions) {
    const { upsertedCount } = await EventQuestionModel.updateOne({
      norm: event.norm
    }, {
      $setOnInsert: event
    }, {
      upsert: true
    })

    if (upsertedCount > 0) {
      logger(`Seeded Event Question: ${event.norm}`)
    }
  }
}

module.exports = initialize
