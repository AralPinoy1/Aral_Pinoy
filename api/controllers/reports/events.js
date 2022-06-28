'use strict'

const { startOfDay, endOfDay } = require('date-fns')

const EventModel = require('../../models/events')
const EventEvaluationModel = require('../../models/events/evaluations')

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
    }, ['_id', 'name', 'date'], {
      lean: true
    })

    const eventIds = events.map((event) => event._id)

    const evaluations = await EventEvaluationModel.find({
      event: {
        $in: eventIds
      },
      universalQuestionnaireAnswers: {
        $exists: true
      }
    })

    const universalQuestionMap = new Map()

    for (const evaluation of evaluations) {
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

    for (const [key, universalAnswerMap] of universalQuestionMap.entries()) {
      const datasets = []

      for (const [answer, counter] of Object.entries(universalAnswerMap)) {
        datasets.push({
          label: answer,
          data: [counter]
        })
      }
      
      eventEvaluations.push({
        labels: [key],
        datasets
      })
    }

    return {
      events,
      eventEvaluations
    }
  }
}

module.exports = ReportEventsController