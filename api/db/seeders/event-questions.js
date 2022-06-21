'use strict'

const debug = require('debug')

const EventQuestionModel = require('../../models/events/questions')

const logger = debug('api:server')

const eventQuestions = [
  {
    label: 'How satisfied were you on the event in meeting your expectation?',
    norm: 'how satisfied were you on the event in meeting your expectation?',
    type: 'matrix:satisfied'
  },
  {
    label: 'How likely are you to join another event in the future?',
    norm: 'how likely are you to join another event in the future?',
    type: 'matrix:likely'
  },
  {
    label: 'How satisfied are you with the amount of sessions and activities conducted?',
    norm: 'how satisfied are you with the amount of sessions and activities conducted?',
    type: 'matrix:satisfied'
  },
  {
    label: 'How likely are you to recommend a friend to join Aral Pinoy events?',
    norm: 'how likely are you to recommend a friend to join aral pinoy events?',
    type: 'matrix:likely'
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
