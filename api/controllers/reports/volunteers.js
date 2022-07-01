'use strict'

const { startOfDay, endOfDay, differenceInYears } = require('date-fns')
const Zip = require('adm-zip')
const { stringify } = require('csv-stringify/sync')

const EventModel = require('../../models/events')
const EventVolunteerModel = require('../../models/events/volunteers')
const UserModel = require('../../models/users')

const {
  ConflictError
} = require('../../errors')

const AGE_LABELS = {
  MINORS : 'Minors',
  YOUNG_ADULTS : 'Young Adults',
  ADULTS : 'Adults',
  SENIORS: 'Seniors'
}

const GENDER_LABELS = {
  MALE : 'Male',
  FEMALE : 'Female'
}

const AGE_LABELS_ARRAY = Object.values(AGE_LABELS)
const GENDER_LABELS_ARRAY = Object.values(GENDER_LABELS)

const CSV_HEADERS = {
  AGE: ['Age Range', 'Value'],
  GENDER: ['Gender', 'Value']
}

class ReportVolunteersController {
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
      },
      'date.end': {
        $lte: endOfDay(end),
      },
    }, ['_id'], {
      lean: true
    })

    if (events.length === 0) {
      return {
        age: {
          labels: AGE_LABELS_ARRAY,
          data: Array(AGE_LABELS_ARRAY.length).fill(0)
        },
        gender: {
          labels: GENDER_LABELS_ARRAY,
          data: Array(GENDER_LABELS_ARRAY.length).fill(0)
        }
      }
    }

    const eventIds = []

    for (const event of events) {
      eventIds.push(event._id)
    }

    const eventVolunteers = await EventVolunteerModel.find({
      $and: [{
        event: {
          $in: eventIds
        },
      }, {
        $or: [{
          absent: {
            $exists: false
          }
        }, {
          absent: false
        }]
      }]
    
    }, ['user'], {
      lean: true
    })

    if (eventVolunteers.length === 0) {
      return {
        age: {
          labels: AGE_LABELS_ARRAY,
          data: Array(AGE_LABELS_ARRAY.length).fill(0)
        },
        gender: {
          labels: GENDER_LABELS_ARRAY,
          data: Array(GENDER_LABELS_ARRAY.length).fill(0)
        }
      }
    }

    const userIds = []

    for (const eventVolunteer of eventVolunteers) {
      userIds.push(eventVolunteer.user)
    }

    const users = await UserModel.find({
      _id: {
        $in: userIds
      }
    }, ['gender', 'birthDate'], {
      lean: true
    })

    if (users.length === 0) {
      return {
        age: {
          labels: AGE_LABELS_ARRAY,
          data: Array(AGE_LABELS_ARRAY.length).fill(0)
        },
        gender: {
          labels: GENDER_LABELS_ARRAY,
          data: Array(GENDER_LABELS_ARRAY.length).fill(0)
        }
      }
    }

    const ageGroupMap = new Map([
      [AGE_LABELS.MINORS, 0],
      [AGE_LABELS.YOUNG_ADULTS, 0],
      [AGE_LABELS.ADULTS, 0],
      [AGE_LABELS.SENIORS, 0],
    ])

    const genderMap = new Map([
      [GENDER_LABELS.MALE, 0],
      [GENDER_LABELS.FEMALE, 0],
    ])

    for (const user of users) {
      if (user.birthDate !== undefined) {
        const ageGroup = ReportVolunteersController.resolveAgeGroup(user.birthDate)
        const counter = ageGroupMap.get(ageGroup)

        ageGroupMap.set(ageGroup, counter + 1)
      }

      if (user.gender !== undefined) {
        const counter = genderMap.get(user.gender)

        genderMap.set(user.gender, counter + 1)
      }
    }

    return {
      age: {
        labels: AGE_LABELS_ARRAY,
        data: Array.from(ageGroupMap.values())
      },
      gender: {
        labels: GENDER_LABELS_ARRAY,
        data: Array.from(genderMap.values())
      }
    }
  }

  /**
   * 
   * @param {Date} birthDate Birth date
   * @returns {string}
   */
  static resolveAgeGroup(birthDate) {
    const startOfBirthDate = startOfDay(birthDate)

    const age = differenceInYears(new Date(), startOfBirthDate)

    if (age < 18) {
      return AGE_LABELS.MINORS
    }

    if (age >= 18 && age <= 30) {
      return AGE_LABELS.YOUNG_ADULTS
    }

    if (age >= 31 && age <= 59) {
      return AGE_LABELS.ADULTS
    }

    return AGE_LABELS.SENIORS
  }

  /**
   * 
   * @param {Object} dateRange Date range object
   * @param {Date} dateRange.start Start date
   * @param {Date} dateRange.end End date
   * @returns {Promise<Zip>}
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
      },
      'date.end': {
        $lte: endOfDay(end),
      },
    }, ['_id'], {
      lean: true
    })

    if (events.length === 0) {
      throw new ConflictError('no-results')
    }

    const eventIds = []

    for (const event of events) {
      eventIds.push(event._id)
    }

    const eventVolunteers = await EventVolunteerModel.find({
      $and: [{
        event: {
          $in: eventIds
        },
      }, {
        $or: [{
          absent: {
            $exists: false
          }
        }, {
          absent: false
        }]
      }]
    
    }, ['user'], {
      lean: true
    })

    if (eventVolunteers.length === 0) {
      return {
        age: {
          labels: AGE_LABELS_ARRAY,
          data: Array(AGE_LABELS_ARRAY.length).fill(0)
        },
        gender: {
          labels: GENDER_LABELS_ARRAY,
          data: Array(GENDER_LABELS_ARRAY.length).fill(0)
        }
      }
    }

    const userIds = []

    for (const eventVolunteer of eventVolunteers) {
      userIds.push(eventVolunteer.user)
    }

    const users = await UserModel.find({
      _id: {
        $in: userIds
      }
    }, ['gender', 'birthDate'], {
      lean: true
    })

    if (users.length === 0) {
      return {
        age: {
          labels: AGE_LABELS_ARRAY,
          data: Array(AGE_LABELS_ARRAY.length).fill(0)
        },
        gender: {
          labels: GENDER_LABELS_ARRAY,
          data: Array(GENDER_LABELS_ARRAY.length).fill(0)
        }
      }
    }

    const ageGroupMap = new Map([
      [AGE_LABELS.MINORS, 0],
      [AGE_LABELS.YOUNG_ADULTS, 0],
      [AGE_LABELS.ADULTS, 0],
      [AGE_LABELS.SENIORS, 0],
    ])

    const genderMap = new Map([
      [GENDER_LABELS.MALE, 0],
      [GENDER_LABELS.FEMALE, 0],
    ])

    for (const user of users) {
      if (user.birthDate !== undefined) {
        const ageGroup = ReportVolunteersController.resolveAgeGroup(user.birthDate)
        const counter = ageGroupMap.get(ageGroup)

        ageGroupMap.set(ageGroup, counter + 1)
      }

      if (user.gender !== undefined) {
        const counter = genderMap.get(user.gender)

        genderMap.set(user.gender, counter + 1)
      }
    }

    const ageEntries = []

    for (const [ageGroup, value] of ageGroupMap.entries()) {
      ageEntries.push([
        ageGroup,
        value
      ])
    }

    const genderEntries = []

    for (const [gender, value] of genderMap.entries()) {
      genderEntries.push([
        gender,
        value
      ])
    }

    const ageCsvString = stringify([
      CSV_HEADERS.AGE,
      ...ageEntries
    ])

    const genderCsvString = stringify([
      CSV_HEADERS.GENDER,
      ...genderEntries
    ])

    const zip = new Zip()

    zip.addFile(`age_range_report_from_${start.toJSON()}_to_${end.toJSON()}.csv`, Buffer.from(ageCsvString, 'utf8'))
    zip.addFile(`gender_report_from_${start.toJSON()}_to_${end.toJSON()}.csv`, Buffer.from(genderCsvString, 'utf8'))

    return zip
  }
}

module.exports = ReportVolunteersController