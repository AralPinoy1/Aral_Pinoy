'use strict'

const { Types } = require('mongoose')
const Joi = require('joi')

const EventEvaluationModel = require('../../models/events/evaluations')
const EventVolunteerModel = require('../../models/events/volunteers')
const EventModel = require('../../models/events')
const EventQuestionModel = require('../../models/events/questions')
const UserModel = require('../../models/users')

const { STATUSES } = require('../../constants/events')

const { 
  NotFoundError,
  ConflictError
} = require('../../errors')

const questionTypeValidators = {
  polar: Joi.number().integer().min(0).max(1),
  matrix: Joi.string().valid('Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'),
  'matrix:satisfied': Joi.string().valid('Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'),
  'matrix:likely': Joi.string().valid('Very Likely', 'Likely', 'Neutral', 'Unlikely', 'Very Unlikely')
}

class EventEvaluationController {
  static async create(eventId, userId, evaluation) {
    const {
      rating,
      comment,
      sdgAnswers,
      universalQuestionnaireAnswers,
      questionnaireAnswers,
    } = evaluation

    const eventVolunteer = await EventVolunteerModel.findOne({
      user: userId,
      event: eventId
    }, ['_id', '__v', 'absent', 'hasEventEvaluation'], {
      lean: true
    })

    if (eventVolunteer === null) {
      throw new ConflictError('Invalid evaluation: User did not volunteer to this event')
    }

    if (eventVolunteer.absent) {
      throw new ConflictError('absent')
    }

    if (eventVolunteer.hasEventEvaluation === true) {
      throw new ConflictError('Evaluation from user already exists!')
    }

    const event = await EventModel.findById(eventId, ['_id', 'status', 'sdgs', 'questions'], {
      lean: true
    })

    if (event === null) {
      throw new NotFoundError(`Event does not exist: ${eventId}`)
    }

    if (event.status !== STATUSES.ENDED) {
      throw new NotFoundError(`Unable to add evaluation: Event is [${event.status}]`)
    }

    const user = await UserModel.findOne({
      _id: userId,
      roles: {
        $in: ['volunteer']
      }
    }, ['_id'], {
      lean: true
    })

    if (user === null) {
      throw new NotFoundError(`User does not exist: ${userId}`)
    }

    await EventEvaluationController.validateEvaluationAnswers(event, {
      sdgAnswers,
      universalQuestionnaireAnswers,
      questionnaireAnswers
    })

    try {
      const eventEvaluation = new EventEvaluationModel({
        user,
        event,
        rating,
        comment,
        sdgAnswers,
        universalQuestionnaireAnswers,
        questionnaireAnswers,
      })

      const eventVolunteerUpdateResults = await EventVolunteerModel.updateOne({
        _id: eventVolunteer._id,
        __v: eventVolunteer.__v
      }, {
        $set: {
          eventEvaluation: eventEvaluation._id
        },
        $inc: {
          __v: 1
        }
      })
  
      if (eventVolunteerUpdateResults.matchedCount === 0) {
        throw new ConflictError('Event volunteer was recently updated. Please try again')
      }

      await eventEvaluation.save()
  
      return eventEvaluation.toObject({ 
        minimize: true,
        versionKey: false,
        useProjection: true
      })
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictError('Evaluation from user already exists!')
      }
      
      throw error
    }
  }

  static async validateEvaluationAnswers(event, evaluation) {
    const {
      sdgAnswers,
      universalQuestionnaireAnswers,
      questionnaireAnswers,
    } = evaluation

    if (event.sdgs !== undefined) {
      if (!Array.isArray(sdgAnswers)) {
        throw new ConflictError('Answers for evaluation sdg is required')
      }

      const sdgLength = sdgAnswers.length

      if (sdgLength !== event.sdgs.length) {
        throw new ConflictError('Answers for evaluation sdg is incomplete')
      }

      for (let i = 0; i < sdgLength; i++) {
        const sdg = event.sdgs[i]
        const sdgAnswer = sdgAnswers[i]

        if (sdgAnswer.length !== sdg.questions.length) {
          throw new ConflictError('Answers for evaluation sdg is incomplete')
        }
        
        for (let j = 0; j < sdgAnswer.length; j++) {
          const sdgQuestion = sdg.questions[j]
          const answer = sdgAnswer[j]

          const questionValidator = questionTypeValidators[sdgQuestion.type]

          if (questionValidator === undefined) {
            throw new ConflictError('invalid_sdg_question_type')
          }
          
          const { error } = questionValidator.validate(answer)

          if (error !== undefined) {
            throw new ConflictError('invalid_answer_to_sdg_question')
          }
        }
      }
    } else if (sdgAnswers !== undefined) {
      throw new ConflictError('Answers were provided to evaluation sdg questionnaire')
    }

    if (event.questions !== undefined) {
      if (!Array.isArray(questionnaireAnswers)) {
        throw new ConflictError('Answers for evaluation questionnaire is required')
      }

      const questionnaireLength = questionnaireAnswers.length

      if (questionnaireLength !== event.questions.length) {
        throw new ConflictError('Answers for evaluation questionnaire is incomplete')
      }

      for (let i = 0; i < questionnaireLength; i++) {
        const eventQuestion = event.questions[i]
        const answer = questionnaireAnswers[i]

        const questionValidator = questionTypeValidators[eventQuestion.type]

        if (questionValidator === undefined) {
          throw new ConflictError('invalid_question_type')
        }

        const { error } = questionValidator.validate(answer)

        if (error !== undefined) {
          throw new ConflictError('invalid_answer_to_question')
        }
      }
    } else if (questionnaireAnswers !== undefined) {
      throw new ConflictError('Answers were provided to evaluation questionnaire')
    }

    const universalQuestions = await EventQuestionModel.find()

    if (universalQuestions.length === 0 && universalQuestionnaireAnswers.length > 0) {
      throw new ConflictError('no_universal_questions')
    } else if (universalQuestions.length > 0 && universalQuestionnaireAnswers.length === 0) {
      throw new ConflictError('no_answers_for_universal_questions')
    }

    for (const { question, answer } of universalQuestionnaireAnswers) {
      const universalQuestion = universalQuestions.find((universalQuestion) => universalQuestion.label === question.label)

      if (universalQuestion === undefined) {
        throw new ConflictError('invalid_universal_question')
      }

      const questionValidator = questionTypeValidators[universalQuestion.type]

      if (questionValidator === undefined) {
        throw new ConflictError('invalid_universal_question_type')
      }

      const { error } = questionValidator.validate(answer)
      
      if (error !== undefined) {
        throw new ConflictError('invalid_answer_to_universal_question')
      }
    }
  }

  static async list(options = {}) {
    const {
      limit,
      offset,
      filters: {
        userId,
        eventId
      }
    } = options

    const matchQuery = {}
    const queryOptions = { 
      lean: true,
      limit,
      skip: offset
    }

    if (userId !== undefined) {
      matchQuery.user = new Types.ObjectId(userId)
    }

    if (eventId !== undefined) {
      matchQuery.event = new Types.ObjectId(eventId)
    }

    const [evaluations, total] = await Promise.all([
      EventEvaluationModel.find(matchQuery, undefined, queryOptions),
      EventEvaluationModel.countDocuments(matchQuery)
    ])

    return {
      results: evaluations,
      total
    }
  }

  static async get(id) {
    const evaluation = await EventEvaluationModel.findById(id, undefined, {
      lean: true,
      populate: ['user']
    })

    if (evaluation === null) {
      throw new NotFoundError(`Event evaluation does not exist: ${id}`)
    }

    return evaluation
  }
}

module.exports = EventEvaluationController