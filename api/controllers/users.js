'use strict'

const { Types } = require('mongoose')

const UserModel = require('../models/users')
const SkillModel = require('../models/skills')

const SORT_ORDER_MAPPING = {
  asc : 1,
  desc: -1
}

const { NotFoundError } = require('../errors')

class UserController {
  static async create(req, res, next) {
    const {
      email,
      password,
      contactNumber,
      firstName,
      middleName,
      lastName,
      gender,
      birthDate,
      location,
      skills: skillIds
    } = req.body

    try {
      const skills = await SkillModel.find({
        _id: {
          $in: skillIds
        }
      }, ['_id', 'name', 'description'], {
        lean: true
      })

      const results = new UserModel({
        email,
        password,
        contactNumber,
        firstName,
        middleName,
        lastName,
        gender,
        birthDate: new Date(birthDate),
        location,
        roles: ['officer'],
        skills
      })

      const user = results.toObject({ 
        minimize: true,
        versionKey: false,
        useProjection: true
      })

      user.skills = skills

      return res.status(201).json(user)
    } catch (error) {
      if (error.code === 11000 && error.keyPattern.email === 1) {
        return res.status(400).json({
          code: 'EmailAlreadyExists',
          status: 400,
          message: `Duplicate email: ${error.keyValue.email}`
        })
      }

      next(error)
    }
  }

  static async list(options = {}) {
    const {
      countVolunteeredEvents,
      filters = {},
    } = options

    const {
      roles: filterRoles,
      name: filterName,
      skills: skillIds
    } = filters

    const filterQuery = {}

    if (filterName !== undefined && filterName !== '') {
      filterQuery.$text = {
        $search: decodeURIComponent(filterName)
      }
    }

    if (filterRoles !== undefined && filterRoles.length > 0) {
      filterQuery.roles = {
        $in : filterRoles
      }
    }

    let listUsersQuery
    
    if (countVolunteeredEvents) {
      listUsersQuery = UserController.listUsersWithEventCount(filterQuery, {
        limit: options.limit,
        offset : options.offset,
        sort : options.sort,
        skillIds
      })
    } else {
      listUsersQuery = UserController.listUsers(filterQuery, {
        limit: options.limit,
        offset : options.offset,
        sort : options.sort,
        skillIds
      })
    }

    const [users, total] = await Promise.all([
      listUsersQuery,
      UserModel.countDocuments(filterQuery)
    ])

    return {
      results: users,
      total
    }
  }

  /**
   * @private
   * @param {Object} [filterQuery={}] 
   * @param {Object} [options={}] 
   * @param {Object} [options.sort]
   * @param {number} [options.limit]
   * @param {number} [options.skip]
   */
  static async listUsers(filterQuery = {}, options = {}) {
    const {
      limit,
      offset,
      sort = {},
      skillIds
    } = options

    const {
      field: sortField,
      order: sortOrder
    } = sort

    const aggregationQuery = [{
      $match: {
        ...filterQuery
      }
    }, {
      $lookup: {
        from: 'skills',
        localField: 'skills',
        foreignField: '_id',
        as: 'skills'
      }
    }]

    if (Array.isArray(skillIds) && skillIds.length > 0) {
      aggregationQuery.push({
        $match: {
          'skills._id': {
            $in: skillIds.map((id) => new Types.ObjectId(id))
          }
        }
      })
    }

    if (offset !== undefined) {
      aggregationQuery.push({
        $skip: offset
      }) 
    }

    if (limit !== undefined) {
      aggregationQuery.push({
        $limit: limit
      }) 
    }

    if (sortField !== undefined && sortOrder !== undefined) {
      aggregationQuery.push({
        $sort: {
          [sortField]: SORT_ORDER_MAPPING[sortOrder]
        }
      })
    }

    return await UserModel.aggregate(aggregationQuery)
  }

  /**
   * @private
   * @param {Object} [filterQuery={}] 
   * @param {Object} [options={}] 
   * @param {Object} [options.sort]
   * @param {number} [options.limit]
   * @param {number} [options.skip]
   */
  static async listUsersWithEventCount(filterQuery = {}, options = {}) {
    const { 
      limit,
      offset,
      sort = {},
      skillIds
    } = options

    const {
      field: sortField,
      order: sortOrder
    } = sort

    const aggregationQuery = [{
      $match: {
        ...filterQuery
      }
    }, {
      $lookup: {
        from: 'skills',
        localField: 'skills',
        foreignField: '_id',
        as: 'skills'
      }
    }]

    if (Array.isArray(skillIds) && skillIds.length > 0) {
      aggregationQuery.push({
        $match: {
          'skills._id': {
            $in: skillIds.map((id) => new Types.ObjectId(id))
          }
        }
      })
    }

    if (offset !== undefined) {
      aggregationQuery.push({
        $skip: offset
      }) 
    }

    if (limit !== undefined) {
      aggregationQuery.push({
        $limit: limit
      }) 
    }

    aggregationQuery.push({
      $lookup: {
        from: 'eventVolunteers',
        localField: '_id',
        foreignField: 'user',
        pipeline: [
          {
            $match: {
              $or: [
                {
                  absent: {
                    $exists: false,
                  },
                },
                {
                  absent: false,
                },
              ],
            },
          },
          {
            $lookup: {
              from: 'events',
              localField: 'event',
              foreignField: '_id',
              pipeline: [
                {
                  $match: {
                    status: 'ENDED',
                  },
                },
              ],
              as: 'events',
            },
          },
          {
            $set: { 
              isEventEnded: {
                $size: {
                  $filter: {
                    input: '$events',
                    cond: {
                      status: 'ENDED'
                    }
                  }
                }
              }
            }
          },
          {
            $project: {
              events: 0,
            },
          },
        ],
        as: 'volunteeredEvents',
      },
    }, {
      $set: { 
        eventsVolunteeredCount: {
          $size: {
            $filter: {
              input: '$volunteeredEvents',
              cond: {
                $eq: ['$$this.isEventEnded', 1]
              }
            }
          }
        }
      }
    }, {
      $project: {
        volunteeredEvents: 0
      }
    })

    if (sortField !== undefined && sortOrder !== undefined) {
      aggregationQuery.push({
        $sort: {
          [sortField]: SORT_ORDER_MAPPING[sortOrder]
        }
      })
    }

    return await UserModel.aggregate(aggregationQuery)
  }

  static async get(req, res) {
    const { id } = req.params

    const user = await UserModel.findById(id, undefined, { 
      lean: true,
      populate: ['skills']
    })

    if (user === null) {
      return res.status(404).json({
        code: 'NotFound',
        status: 404,
        message: 'User not found'
      })
    }

    return res.json(user)
  }

  static async update(id, update) {
    const {
      email, // TODO: Remove email from user update
      firstName,
      middleName,
      lastName,
      gender,
      birthDate,
      contactNumber,
      location,
      skillIds
    } = update

    const $set = {}
    const $unset = {}

    if (email !== undefined) {
      $set.email = email
    }

    if (firstName !== undefined) {
      $set.firstName = firstName
    }

    if (middleName === null) {
      $unset.middleName = ''
    } else {
      $set.middleName = middleName
    }

    if (lastName !== undefined) {
      $set.lastName = lastName
    }

    if (gender !== undefined) {
      $set.gender = gender
    }

    if (birthDate !== undefined) {
      $set.birthDate = new Date(birthDate)
    }

    if (location !== undefined) {
      if (location.province !== undefined) {
        $set['location.province'] = location.province
      }

      if (location.city !== undefined) {
        $set['location.city'] = location.city
      }
    }

    if (contactNumber === null) {
      $unset.contactNumber = ''
    } else {
      $set.contactNumber = contactNumber
    }

    if (skillIds !== undefined) {
      $set.skills = skillIds.map((skillId) => Types.ObjectId(skillId))
    }

    const { matchedCount } = await UserModel.updateOne({
      _id: id
    }, {
      $set,
      $unset
    })

    if (matchedCount === 0) {
      throw new NotFoundError('user')
    }
  }
}

module.exports = UserController