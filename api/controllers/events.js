'use strict'

const { Storage } = require('@google-cloud/storage')
const { Types } = require('mongoose')

const config = require('../config')

const EventModel = require('../models/events')
const EventVolunteerModel = require('../models/events/volunteers')
const EventJobModel = require('../models/event-jobs')
const EventExpenseModel = require('../models/events/expenses')
const EventTemplateModel = require('../models/events/templates')
const SkillModel = require('../models/skills')
const SdgModel = require('../models/sdgs')
const InkindDonationModel = require('../models/inkind-donations')
const IkdTransactionModel = require('../models/inkind-donations/transactions')
const IkdOutboundTransactionModel = require('../models/inkind-donations/outbound-transactions')
const UserModel = require('../models/users')
const NotificationModel = require('../models/notifications')

const GoogleCalendarController = require('./google/calendar')
const SendgridMailController = require('./mail/sendgrid')

const NOTIFICATION_TYPES = require('../constants/notifications').TYPES
const { STATUSES } = require('../constants/events')
const { OUTBOUND_RECEIVER_TYPES, TRANSACTION_STATUSES } = require('../constants/inkind-donations')

const { 
  NotFoundError,
  ConflictError
} = require('../errors')

/** @typedef {import('mongoose').Document} Document */

const storage = new Storage({
  keyFilename: config.google.cloud.serviceAccount,
  projectId: 'aral-pinoy'
})

const EVENTS_BUCKET_URL = config.google.cloud.storage.bucketNames.events

const eventsBucket = storage.bucket(EVENTS_BUCKET_URL)

const whitespaceRegex = /\s+/g

const SORT_ORDER_MAPPING = {
  asc : 1,
  desc: -1
}

const EVENT_STATUS_OUTBOUND_TRANSACTION_MAP = {
  [STATUSES.CANCELED]: TRANSACTION_STATUSES.RETURNED,
  [STATUSES.ENDED]: TRANSACTION_STATUSES.COMPLETE
}

function sanitize(name) {
  return name.replace(whitespaceRegex,' ')
}

class EventsController {
  static uploadFile(filename, buffer) {
    const bucketFile = eventsBucket.file(filename)

    return bucketFile.save(buffer, {
      public: true
    })
  }

  static async create(event) {
    const {
      name,
      type,
      description,
      date,
      goals,
      location,
      contacts,
      logoFile,
      sdgIds,
      ikdItems,
      jobs: eventJobs,
      questions: eventQuestions,
      budget: eventBudget,
      saveAsTemplate = false,
      templateName,
      templateDescription
    } = event

    const sanitizedName = sanitize(name)

    const eventId = new Types.ObjectId()
    let logoUrl
    let sdgs
    let ikds
    let jobs
    let questions
    let targetVolunteers = 0

    if (logoFile !== undefined) {
      const { originalname, buffer} = logoFile

      const filename = `${eventId.toString()}/logo-${Date.now().toString(36)}-${originalname}`

      await EventsController.uploadFile(filename, buffer)

      logoUrl = `https://storage.googleapis.com/${EVENTS_BUCKET_URL}/${filename}`
    }

    if (Array.isArray(ikdItems) && ikdItems.length > 0) {
      ikds = []

      for (const item of ikdItems) {
        const ikd = await InkindDonationModel.findOne(
          {
            _id : item.ikdId,
            deleted: false
          }, 
          ['sku', 'name', 'category.name', '__v'], 
          {
            lean: true
          }
        )

        if (ikd === null) {
          throw new NotFoundError(`In-kind Donation does not exist: ${item.ikdId}`)
        }

        const itemToAdd = {
          sku: ikd.sku,
          name: ikd.name,
        }

        if (ikd.category !== undefined) {
          itemToAdd.category = {
            name: ikd.category.name
          }
        }

        ikds.push({
          item: itemToAdd,
          quantity: item.quantity
        })

        const itemUpdateResults = await InkindDonationModel.updateOne({
          _id: new Types.ObjectId(item.ikdId), 
          deleted: false,
          __v : ikd.__v
        }, {
          $inc: {
            quantity: -(item.quantity),
            __v : 1
          }
        })
    
        if (itemUpdateResults.matchedCount === 0) {
          throw new ConflictError('In-kind donation was recently updated, please try again')
        }

        await IkdOutboundTransactionModel.create({
          quantity: item.quantity,
          date: date.start,
          item: itemToAdd,
          receiver: {
            type: OUTBOUND_RECEIVER_TYPES.EVENT,
            event: eventId
          }
        })
      }
    }

    if (Array.isArray(sdgIds) && sdgIds.length > 0) {
      sdgs = []

      for (const sdgId of sdgIds) {
        const sdg = await SdgModel.findById(sdgId)

        if (sdg === null) {
          throw new NotFoundError(`SDG does not exist: ${sdgId}`)
        }

        sdgs.push({
          name: sdg.name,
          description: sdg.description,
          imageUrl: sdg.imageUrl,
          questions: sdg.questions
        })
      }
    }

    if (Array.isArray(eventJobs) && eventJobs.length > 0) {
      jobs = []

      for (const job of eventJobs) {
        const jobSkills = []
        const skillIds = []

        if (Array.isArray(job.skillIds)) {
          for (const skillId of job.skillIds) {
            const skill = await SkillModel.findById(skillId, ['name', 'norm', 'description'], {
              lean: true
            })
  
            if (skill === null) {
              throw new NotFoundError(`Skill does not exist: ${skillId}`)
            }
  
            jobSkills.push({
              name: skill.name,
              norm: skill.norm,
              description: skill.description,
            })
            skillIds.push(skill._id)
          }
        }
        
        const sanitizedJobName = sanitize(job.name)
        const jobNorm = sanitizedJobName.toLowerCase()

        await EventJobModel.updateOne({
          norm: jobNorm
        }, {
          $setOnInsert: {
            name: sanitizedJobName,
            norm: jobNorm,
            description: job.description,
            skills: skillIds
          }
        }, {
          upsert: true
        })

        targetVolunteers += job.requirements.max

        jobs.push({
          name: sanitizedJobName,
          description: job.description,
          slots: {
            current: 0,
            max: job.requirements.max
          },
          skills: jobSkills
        })
      }
    }

    if (Array.isArray(eventQuestions) && eventQuestions.length > 0) {
      questions = []
      
      for (const question of eventQuestions) {
        questions.push({
          label: question.label,
          type: question.type
        })
      }
    }

    /** @type {Document} */
    const results = await EventModel.create({
      _id: eventId,
      name: sanitizedName,
      type,
      description,
      date,
      location,
      status: 'UPCOMING',
      goals: {
        numVolunteers: {
          current: 0,
          target: targetVolunteers
        },
        monetaryDonation: {
          current: 0,
          target: goals.monetaryDonation
        }
      },
      contacts,
      logoUrl,
      sdgs,
      ikds,
      jobs,
      questions,
      budget: eventBudget
    })

    const eventDocument = results.toObject({
      minimize: true,
      versionKey: false,
      useProjection: true
    })

    await EventsController.createGoogleEvent(eventDocument).catch((error) => console.dir(error, { depth: null }))

    if (saveAsTemplate) {
      const sanitizedTemplateName = sanitize(templateName)

      await EventsController.createTemplate({
        name: sanitizedTemplateName,
        description: templateDescription,
        location,
        goals,
        sdgIds,
        jobs: eventJobs,
        questions: eventQuestions
      }).catch((error) => console.error(error))
    }

    return eventDocument
  }

  static async createGoogleEvent(event) {
    if (config.environment.isDevelopment) {
      return
    }

    const {
      _id,
      name,
      description,
      location,
      date
    } = event

    const adminsAndOfficers = await UserModel.find({
      roles: {
        $in: ['admin','officer']
      }
    }, ['email'], {
      lean: true
    })

    const attendees = adminsAndOfficers.map((user) => ({
      email: user.email
    }))

    await GoogleCalendarController.createEvent({
      id: _id.toString(),
      summary: name,
      address: location.name,
      description,
      attendees,
      startDate: date.start,
      endDate: date.end,
    })
  }

  static async createTemplate(template) {
    const {
      name,
      description,
      goals,
      location,
      sdgIds,
      jobs: eventJobs,
      questions
    } = template

    let jobs

    if (Array.isArray(eventJobs) && eventJobs.length > 0) {
      jobs = []

      for (const job of eventJobs) {
        jobs.push({
          name: sanitize(job.name),
          description: job.description,
          requirements: job.requirements,
          skills: job.skillIds
        })
      }
    }

    await EventTemplateModel.create({
      name,
      description,
      location,
      goals,
      sdgIds,
      jobs,
      questions
    })
  }

  static async list(options = {}) {
    const {
      limit,
      offset,
      filters = {},
      sort
    } = options

    const {
      name: filterName,
      status: filterStatus,
      hasMonetaryGoal: filterHasMonetaryGoal
    } = filters

    const query = {}
    const queryOptions = {
      limit,
      skip: offset
    }

    if (filterName !== undefined && filterName !== '') {
      query.$text = {
        $search: decodeURIComponent(filterName)
      }
    }

    if (filterStatus !== undefined) {
      if (Array.isArray(filterStatus)) {
        query.status = {
          $in: filterStatus
        }
      } else {
        query.status = filterStatus
      }
    }

    if (filterHasMonetaryGoal !== undefined) {
      query['goals.monetaryDonation.target'] = {
        $gt: 0
      }
    }

    if (sort !== undefined) {
      const { field, order } = sort

      queryOptions.sort = {
        [field]: SORT_ORDER_MAPPING[order]
      }
    }

    const [events, total] = await Promise.all([
      EventModel.find(query, undefined, queryOptions),
      EventModel.countDocuments(query)
    ])

    return {
      results: events,
      total
    }
  }

  static async get(id) {
    const event = await EventModel.findById(id, undefined)

    if (event === null) {
      throw new NotFoundError(`Event does not exist: ${id}`)
    }

    return event.toObject({
      getters: true
    })
  }

  static async update(id, event) {
    const {
      name,
      description,
      location,
      date,
      ikdItems,
      jobs
    } = event

    const currentEvent = await EventModel.findById(id, ['_id', 'name', '__v', 'date', 'status', 'ikds', 'jobs'])

    if (currentEvent === null) {
      throw new NotFoundError('event')
    }

    if (currentEvent.status !== STATUSES.UPCOMING) {
      throw new ConflictError('non_upcoming_event')
    }

    const $set = {}
    const $unset = {}

    if (name !== undefined) {
      $set.name = name
    }

    if (description !== undefined) {
      if (description === null) {
        $unset.description = ''
      } else {
        $set.description = description 
      }
    }

    if (location !== undefined) {
      $set.location = location
    }

    if (date !== undefined) {
      $set['date.start'] = date.start
      $set['date.end'] = date.end
    }

    if (Array.isArray(ikdItems)) {
      if (currentEvent.ikds !== undefined) {
        await IkdOutboundTransactionModel.deleteMany({
          receiver: {
            type: OUTBOUND_RECEIVER_TYPES.EVENT,
            event: currentEvent._id
          }
        })
  
        await EventsController.restoreIkds(currentEvent.ikds)
      }

      if (ikdItems.length === 0) {
        $unset.ikds = ''
      }else {
        const ikds = []

        for (const item of ikdItems) {
          const ikd = await InkindDonationModel.findOne({
            sku: item.sku,
            deleted: false,
          }, ['sku', 'name', 'category', '__v'], {
            lean: true
          })
  
          if (ikd === null) {
            throw new NotFoundError(`In-kind Donation does not exist: ${item.sku}`)
          }
  
          const itemToAdd = {
            sku: ikd.sku,
            name: ikd.name,
          }
  
          if (ikd.category !== undefined) {
            itemToAdd.category = ikd.category
          }
  
          ikds.push({
            item: itemToAdd,
            quantity: item.quantity
          })
  
          const itemUpdateResults = await InkindDonationModel.updateOne({
            _id: ikd._id, 
            deleted: false,
            __v : ikd.__v
          }, {
            $inc: {
              quantity: -(item.quantity),
              __v : 1
            }
          })
      
          if (itemUpdateResults.matchedCount === 0) {
            throw new ConflictError('In-kind donation was recently updated, please try again')
          }
  
          await IkdOutboundTransactionModel.create({
            quantity: item.quantity,
            date: currentEvent.date.start,
            item: itemToAdd,
            receiver: {
              type: OUTBOUND_RECEIVER_TYPES.EVENT,
              event: currentEvent._id
            }
          })
        }

        $set.ikds = ikds
      }
    }

    if (Array.isArray(jobs)) {
      if (jobs.length === 0) {
        $unset.jobs = ''
      } else {
        const currentJobs = currentEvent.jobs || []

        const { resolvedJobs, newJobs, targetVolunteers } = await EventsController.resolveJobs(currentJobs, jobs)
        
        for (const newJob of newJobs) {
          await EventsController.createNewEventJobNotification(currentEvent, newJob.name)
        }

        $set.jobs = resolvedJobs
        $set['goals.numVolunteers.target'] = targetVolunteers
      }
    }

    const { matchedCount } = await EventModel.updateOne({
      _id: id,
      __v: currentEvent.__v
    }, {
      $set,
      $unset,
      $inc: {
        __v: 1
      }
    })

    if (matchedCount === 0) {
      throw new ConflictError('version_conflict')
    }

    EventsController.updateGoogleEvent(id, {
      name,
      description,
      location,
      date
    }, { sendUpdates: 'all' }).catch(console.error)
  }

  static async restoreIkds(eventIkds) {
    for (const { item, quantity } of eventIkds) {
      await InkindDonationModel.updateOne({
        sku: item.sku,
        deleted: false,
      }, {
        $inc: {
          quantity,
          __v : 1
        }
      })
    }
  }

  static async resolveJobs(eventJobs, jobs) {
    const resolvedJobs = []
    const newJobs = []
    const existingJobMap = new Map()
    let targetVolunteers = 0

    for (const job of eventJobs) {
      existingJobMap.set(job.name, job)

      targetVolunteers += job.slots.max
    }

    for (const job of jobs) {
      const existingJob = existingJobMap.get(job.name)

      if (existingJob === undefined) {
        const eventJob = await EventsController.createEventJob(job)

        newJobs.push(eventJob)
        resolvedJobs.push(eventJob)

        targetVolunteers += eventJob.slots.max
      } else {
        const eventJob = await EventsController.createEventJob(job, false)

        eventJob.slots.current = existingJob.slots.current

        resolvedJobs.push(eventJob)

        targetVolunteers -= existingJob.slots.max
        targetVolunteers += eventJob.slots.max

        existingJobMap.delete(job.name)
      }
    }

    for (const [, job] of existingJobMap.entries()) {
      if (job.slots.current > 0) {
        throw new ConflictError('job_has_a_volunteer')
      }
    }

    return {
      resolvedJobs,
      newJobs,
      targetVolunteers
    }
  }

  static async updateGoogleEvent(id, event, options = {}) {
    if (config.environment.isDevelopment) {
      return
    }

    const {
      name,
      description,
      location,
      date
    } = event

    const update = {
      summary: name,
      description
    }

    if (location !== undefined && location.name !== undefined) {
      update.locationName = location.name
    }

    if (date !== undefined) {
      update.startDate = date.start
      update.endDate = date.end
    }

    await GoogleCalendarController.patchEvent(id, update, options)
  }

  static async updateStatus(id, details) {
    const {
      status,
      incidents,
      itemsUnused,
      expenses,
      absentUsers,
      review
    } = details

    const event = await EventModel.findById(id, ['_id', 'name', '__v', 'status', 'ikds', 'goals', 'date'])

    if (event === null) {
      throw new NotFoundError(`Event does not exist: ${id}`)
    }

    if (event.status === STATUSES.ENDED || event.status === STATUSES.CANCELED) {
      throw new ConflictError(`Unable to update event: Status is ${event.status}`)
    }

    const expenseTransactions = []

    if (Array.isArray(expenses) && expenses.length > 0) {
      // if (event.goals.monetaryDonation.current === 0) {
      //   throw new ConflictError('monetary_donation_zero_balance')
      // }

      for (const expense of expenses) {
        const sanitizedType = sanitize(expense.type)

        expenseTransactions.push(
          EventExpenseModel.create({
            event: event._id,
            type: sanitizedType,
            typeNorm: sanitizedType.toLowerCase(),
            amount: expense.amount,
            remarks: expense.remarks,
            createdAt: event.date.start
          })
        )
      }
    }

    const ikdUsedQuantityMap = {}
    const ikdTransactions = []

    if (Array.isArray(event.ikds) &&  event.ikds.length > 0) {
      const itemsUnusedMap = new Map()
      const date = new Date()

      for (const item of itemsUnused) {
        itemsUnusedMap.set(item.sku, item.quantity)
      }

      for (let i = 0; i < event.ikds.length; i++) {
        const ikd = event.ikds[i]

        const unUsedQuantity = itemsUnusedMap.get(ikd.item.sku)

        if (unUsedQuantity === undefined) {
          ikdUsedQuantityMap[`ikds.${i}.usedQuantity`] = ikd.quantity

          continue
        }

        const usedQuantity = ikd.quantity - unUsedQuantity

        if (usedQuantity > 0) {
          ikdUsedQuantityMap[`ikds.${i}.usedQuantity`] = usedQuantity
        }

        ikdTransactions.push(
          EventsController.createTransaction({
            sku: ikd.item.sku,
            quantity: unUsedQuantity,
            date,
            reason: `Unused item from '${event.name}' event`
          })
        )
      }
    }

    const $set = {
      status,
      ...ikdUsedQuantityMap
    }

    if (review !== undefined) {
      $set.review = review
    }

    if (Array.isArray(incidents) && incidents.length > 0) {
      $set.incidents = incidents
    }

    if (Array.isArray(absentUsers) && absentUsers.length > 0) {
      const eventVolunteerUpdates = []

      for (const absentUser of absentUsers) {
        eventVolunteerUpdates.push(
          EventVolunteerModel.updateOne({
            event: event._id,
            user: new Types.ObjectId(absentUser.userId)
          }, {
            $set: {
              absent: true,
              shouldPenalize: absentUser.shouldPenalize
            }
          })
        )
      }

      await Promise.all(eventVolunteerUpdates)
    }

    const eventUpdateResults = await EventModel.updateOne({
      _id: new Types.ObjectId(id),
      __v : event.__v
    }, {
      $set,
      $inc: {
        __v: 1
      }
    })

    if (eventUpdateResults.matchedCount === 0) {
      throw new ConflictError('Event was recently updated, please try again')
    }

    if (status === STATUSES.CANCELED && !config.environment.isDevelopment) {
      await GoogleCalendarController.updateEventStatus(id, status).catch((error) => console.dir(error, { depth: null }))
    }

    if (expenseTransactions.length > 0) {
      await Promise.all(expenseTransactions)
    }

    if (ikdTransactions.length > 0) {
      await Promise.all(ikdTransactions)
    }

    await IkdOutboundTransactionModel.updateMany({
      'receiver.event': event._id,
      status: TRANSACTION_STATUSES.PENDING
    }, {
      $set: {
        status: EVENT_STATUS_OUTBOUND_TRANSACTION_MAP[status]
      },
      $inc: {
        __v: 1
      }
    })
  }

  static async createTransaction(transaction) {
    const {
      sku,
      quantity,
      date,
      reason
    } = transaction
    
    const item = await InkindDonationModel.findOne({
      sku,
      deleted: false
    }, ['name', 'category', 'quantity', '__v'], {
      lean: true
    })
    
    if (item === null) {
      throw new NotFoundError(`In-Kind Donation does not exist: ${sku}`)
    }
    
    const itemUpdateResults = await InkindDonationModel.updateOne({
      sku,
      deleted: false,
      __v : item.__v
    }, {
      $inc: {
        quantity,
        __v : 1
      }
    })

    if (itemUpdateResults.matchedCount === 0) {
      throw new ConflictError('In-kind donation was recently updated, please try again')
    }
    
    await IkdTransactionModel.create({
      status: TRANSACTION_STATUSES.COMPLETE,
      item: {
        sku,
        name: item.name,
        category: item.category,
        quantity: item.quantity
      },
      reason,
      quantity,
      date: new Date(date),
    })
  }

  static async createEventJob(job, upsert = true) {
    const jobSkills = []
    const skillIds = []

    if (Array.isArray(job.skillIds)) {
      for (const skillId of job.skillIds) {
        let skill

        if (Types.ObjectId.isValid(skillId)) {
          skill = await SkillModel.findById(skillId, ['name', 'norm', 'description'], {
            lean: true
          })
        } else {
          skill = await SkillModel.findOne({
            norm: skillId
          }, ['name', 'norm', 'description'], {
            lean: true
          })
        }

        if (skill === null) {
          throw new NotFoundError(`Skill does not exist: ${skillId}`)
        }

        jobSkills.push({
          name: skill.name,
          norm: skill.norm,
          description: skill.description,
        })

        skillIds.push(skill._id)
      }
    }
      
    const sanitizedJobName = sanitize(job.name)
    const jobNorm = sanitizedJobName.toLowerCase()

    if (upsert === true) {
      await EventJobModel.updateOne({
        norm: jobNorm
      }, {
        $setOnInsert: {
          name: sanitizedJobName,
          norm: jobNorm,
          description: job.description,
          skills: skillIds
        }
      }, {
        upsert: true
      })
    }

    return {
      name: sanitizedJobName,
      description: job.description,
      slots: {
        current: 0,
        max: job.requirements.max
      },
      skills: jobSkills
    }
  }

  /**
   * 
   * @param {Object} event Event
   * @param {string} jobName Job name
   */
  static async createNewEventJobNotification(event, jobName) {
    const eventId = event._id

    const volunteers = await EventVolunteerModel.find({
      event: eventId
    }, ['user'], {
      populate: {
        path: 'user',
        select: ['_id', 'email']
      }
    })

    const eventUrl = new URL(`/#/events/${eventId.toString()}`, config.volunteer.domainName).href

    for (const volunteer of volunteers) {
      const userId = volunteer.user._id

      const { upsertedCount } = await NotificationModel.updateOne({
        user: userId,
        type: NOTIFICATION_TYPES.NEW_EVENT_ROLE,
        'typeDetails.event': eventId,
        'typeDetails.role': jobName
      }, {
        $setOnInsert: {
          user: userId,
          seen: false,
          read: false,
          type: NOTIFICATION_TYPES.NEW_EVENT_ROLE,
          typeDetails: {
            event: eventId,
            role: jobName
          },
          createdAt: new Date()
        }
      }, {
        upsert: true
      })

      if (upsertedCount > 0) {
        await SendgridMailController.sendNewEventJob({
          to: volunteer.user.email
        }, {
          name: event.name,
          url :eventUrl,
          jobName
        }).catch(console.error)
      }
    }
  }

  static async getRecommendedVolunteers(eventId, options = {}) {
    const event = await EventModel.findById(eventId, ['jobs'])

    if (event === null) {
      throw new NotFoundError('event')
    }

    if (!Array.isArray(event.jobs)) {
      return []
    }

    const filters = options.filters

    const skillNorms = new Set()

    for (const job of event.jobs) {
      const skills = job.skills

      if (!Array.isArray(skills) || skills.length === 0) {
        continue
      }

      for (const skill of skills) {
        skillNorms.add(skill.norm)
      }
    }

    const skillIds = []

    if (skillNorms.size > 0) {
      const skills = await SkillModel.find({
        norm: {
          $in: Array.from(skillNorms)
        }
      }, ['_id'])
      
      for (const skill of skills) {
        skillIds.push(skill._id)
      }
    }

    const volunteeredUsers = await EventVolunteerModel.find({
      event: eventId
    }, ['user'])

    const userFindQuery = {
      roles: 'volunteer'
    }

    if (filters.location !== undefined) {
      const { provinces, cities } = filters.location

      if (Array.isArray(provinces) && provinces.length > 0) {
        userFindQuery['location.province'] = {
          $in: provinces
        }
      }

      if (Array.isArray(cities) && cities.length > 0) {
        userFindQuery['location.city'] = {
          $in: cities
        }
      }
    }

    const filteredSkills = filters.skillIds || []

    if (filteredSkills.length > 0 || skillIds.length > 0) {
      userFindQuery.skills = {
        $in: filteredSkills.map((id) => new Types.ObjectId(id)).concat(skillIds)
      }
    }

    if (volunteeredUsers.length > 0) {
      const volunteeredUserIds = []

      for (const { user } of volunteeredUsers) {
        volunteeredUserIds.push(user)
      }

      userFindQuery._id = {
        $nin: volunteeredUserIds
      }
    }

    const {
      offset,
      limit,
    } = options

    const [users, total] = await Promise.all([
      UserModel.find(
        userFindQuery, 
        ['_id', 'firstName', 'lastName', 'email', 'location', 'skills'], 
        {
          populate: {
            path: 'skills'
          },
          skip: offset,
          limit
        }),
      UserModel.countDocuments(userFindQuery)
    ])

    return {
      results: users,
      total
    }
  }

  static async inviteVolunteers(eventId, userIds) {
    const event = await EventModel.findById(eventId, ['_id', 'name'])

    if (event === null) {
      throw new NotFoundError('event')
    }

    const users = await UserModel.find({
      _id: {
        $in: userIds
      }
    }, ['_id', 'email'])

    if (users.length === 0) {
      throw new NotFoundError('users')
    }

    const eventUrl = new URL(`/#/events/${eventId}`, config.volunteer.domainName).href

    for (const user of users) {
      const { upsertedCount } = await NotificationModel.updateOne({
        user: user._id,
        type: NOTIFICATION_TYPES.EVENT_INVITATION,
        'typeDetails.event': event._id
      }, {
        $setOnInsert: {
          user: user._id,
          seen: false,
          read: false,
          type: NOTIFICATION_TYPES.EVENT_INVITATION,
          typeDetails: {
            event: event._id,
          },
          createdAt: new Date()
        }
      }, {
        upsert: true
      })

      if (upsertedCount > 0) {
        await SendgridMailController.sendEventInvitation({
          to: user.email
        }, {
          name: event.name,
          url: eventUrl
        }).catch(console.error)
      }
    }
  }
}

module.exports = EventsController