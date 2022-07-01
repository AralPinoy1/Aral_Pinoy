'use strict'

const { startOfDay, endOfDay } = require('date-fns')
const Zip = require('adm-zip')
const { stringify } = require('csv-stringify/sync')

const EventModel = require('../../models/events')
const EventEvaluationModel = require('../../models/events/evaluations')

const {
  ConflictError
} = require('../../errors')

function getEvaluationLabels(type) {
  if (type === 'polar') {
    return ['1', '0']
  }
  
  if (type === 'matrix' || type === 'matrix:satisfied') {
    return ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']
  } 
  
  if (type === 'matrix:likely') {
    return ['Very Likely', 'Likely', 'Neutral', 'Unlikely', 'Very Unlikely']
  }
}

const CSV_HEADERS = ['Answer', 'Value']

const whitespaceRegex = /\s+/g
const allWordCharactersRegex = /[\W]+/g

/**
 * 
 * @param {string} value
 * @returns {string} 
 */
function sanitize(value) {
  return value.replace(whitespaceRegex, '_').replace(allWordCharactersRegex, '').toLowerCase()
}

class ReportEventsController {
  /**
   * 
   * @param {Object} dateRange Date range object
   * @param {Date} dateRange.start Start date
   * @param {Date} dateRange.end End date
   * @returns {Promise<Object>}
   */
  static async get(dateRange) {
    const {
      start,
      end
    } = dateRange

    const events = await EventModel.find({
      status: 'ENDED',
      'date.start': {
        $gte: startOfDay(start),
        $lte: endOfDay(end),
      }
    }, ['_id', 'type', 'name', 'date'], {
      lean: true
    })

    const eventIds = []
    const eventMap = new Map()

    for (const event of events) {
      eventIds.push(event._id)
      eventMap.set(event._id.toString(), event)
    }

    const evaluations = await EventEvaluationModel.find({
      event: {
        $in: eventIds
      },
      universalQuestionnaireAnswers: {
        $exists: true
      }
    })

    const eventTypeUniversalQuestionMap = new Map()

    for (const evaluation of evaluations) {
      const event = eventMap.get(evaluation.event.toString())

      let universalQuestionMap = eventTypeUniversalQuestionMap.get(event.type)
      
      if (universalQuestionMap === undefined) {
        universalQuestionMap = new Map()

        eventTypeUniversalQuestionMap.set(event.type, universalQuestionMap)
      }
       
      for (const universalQuestion of evaluation.universalQuestionnaireAnswers) {
        const evaluationLabels = getEvaluationLabels(universalQuestion.question.type)

        let universalAnswerMap = universalQuestionMap.get(universalQuestion.question.label)

        if (universalAnswerMap === undefined) {
          universalAnswerMap = {}

          for (const label of evaluationLabels) {
            universalAnswerMap[label] = 0
          }

          universalQuestionMap.set(universalQuestion.question.label, universalAnswerMap)
        }
        
        universalAnswerMap[universalQuestion.answer] += 1
      }
    }

    const eventEvaluations = []

    for (const [eventType, universalQuestionMap] of eventTypeUniversalQuestionMap.entries()) {
      const data = []

      for (const [question, universalAnswerMap] of universalQuestionMap.entries()) {
        const datasets = []
  
        for (const [answer, counter] of Object.entries(universalAnswerMap)) {
          datasets.push({
            label: answer,
            data: [counter]
          })
        }
        
        data.push({
          labels: [question],
          datasets
        })
      }

      eventEvaluations.push({
        eventType,
        data
      })
    }

    return {
      events,
      eventEvaluations
    }
  }

  /**
   * 
   * @param {Object} dateRange Date range object
   * @param {Date} dateRange.start Start date
   * @param {Date} dateRange.end End date
   * @returns {Promise<Object>}
   */
  static async export(dateRange) {
    const {
      start,
      end
    } = dateRange

    const events = await EventModel.find({
      status: 'ENDED',
      'date.start': {
        $gte: startOfDay(start),
        $lte: endOfDay(end),
      }
    }, ['_id', 'type', 'name', 'date'], {
      lean: true
    })

    if (events.length === 0) {
      throw new ConflictError('no-results')
    }

    const eventIds = []
    const eventMap = new Map()

    for (const event of events) {
      eventIds.push(event._id)
      eventMap.set(event._id.toString(), event)
    }

    const evaluations = await EventEvaluationModel.find({
      event: {
        $in: eventIds
      },
      universalQuestionnaireAnswers: {
        $exists: true
      }
    })

    const eventTypeUniversalQuestionMap = new Map()

    for (const evaluation of evaluations) {
      const event = eventMap.get(evaluation.event.toString())

      let universalQuestionMap = eventTypeUniversalQuestionMap.get(event.type)
      
      if (universalQuestionMap === undefined) {
        universalQuestionMap = new Map()

        eventTypeUniversalQuestionMap.set(event.type, universalQuestionMap)
      }
       
      for (const universalQuestion of evaluation.universalQuestionnaireAnswers) {
        const evaluationLabels = getEvaluationLabels(universalQuestion.question.type)

        let universalAnswerMap = universalQuestionMap.get(universalQuestion.question.label)

        if (universalAnswerMap === undefined) {
          universalAnswerMap = {}

          for (const label of evaluationLabels) {
            universalAnswerMap[label] = 0
          }

          universalQuestionMap.set(universalQuestion.question.label, universalAnswerMap)
        }
        
        universalAnswerMap[universalQuestion.answer] += 1
      }
    }

    const parentZip = new Zip()

    for (const [eventType, universalQuestionMap] of eventTypeUniversalQuestionMap.entries()) {
      const zip = new Zip()

      for (const [question, universalAnswerMap] of universalQuestionMap.entries()) {
        const data = []

        for (const [answer, counter] of Object.entries(universalAnswerMap)) {
          data.push([
            answer,
            counter
          ])
        }

        const csvString = stringify([
          CSV_HEADERS,
          ...data
        ])

        zip.addFile(`${sanitize(question)}_report_from_${start.toJSON()}_to_${end.toJSON()}.csv`, Buffer.from(csvString, 'utf8'))
      }

      parentZip.addFile(`${sanitize(eventType)}_from_${start.toJSON()}_to_${end.toJSON()}.zip`, zip.toBuffer())
    }

    return parentZip
  }
}

module.exports = ReportEventsController