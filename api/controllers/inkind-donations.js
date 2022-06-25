'use strict'

const { Storage } = require('@google-cloud/storage')
const { Types } = require('mongoose')
const { addMonths, endOfMonth, startOfDay } = require('date-fns')

const config = require('../config')

const InkindDonationModel = require('../models/inkind-donations')
const InkindDonationCategoryModel = require('../models/inkind-donations/categories')
const InkindDonationDonorModel = require('../models/inkind-donations/donors')
const InkindDonationGroupModel = require('../models/inkind-donations/groups')
const IkdTransactionModel = require('../models/inkind-donations/transactions')

const SendgridMailController = require('../controllers/mail/sendgrid')

const { CATEGORY_CUSTOM_FIELD_DATA_TYPES, TRANSACTION_STATUSES } = require('../constants/inkind-donations')

const { 
  ConflictError,
  BadRequestError,
  NotFoundError
} = require('../errors')

const storage = new Storage({
  keyFilename: config.google.cloud.serviceAccount,
  projectId: 'aral-pinoy'
})

const INKIND_DONATION_RECEIPTS_BUCKET_URL = config.google.cloud.storage.bucketNames.inkindDonationReceipts

const ikdReceiptsBucket = storage.bucket(INKIND_DONATION_RECEIPTS_BUCKET_URL)

const SORT_ORDER_MAPPING = {
  asc : 1,
  desc: -1
}

const whitespaceRegex = /\s+/g

function sanitize(name) {
  return name.replace(whitespaceRegex,' ')
}

class InkindDonationsController {
  static async create(inkindDonation) {
    const {
      sku,
      name,
      description,
      quantity,
      unit,
      donor,
      donorEmail,
      categoryId,
      categoryCustomFields = [],
      group,
      file
    } = inkindDonation

    let category

    if (categoryId !== undefined) {
      const categoryResults = await InkindDonationCategoryModel.findById(categoryId, ['name', 'customFields'], { lean: true })

      if (categoryResults === null) {
        throw new NotFoundError(`Category does not exist: ${categoryId}`)
      }

      category = {
        name: categoryResults.name,
        customFields: {}
      }

      for (const { key, value } of categoryCustomFields) {
        const field = categoryResults.customFields[key]

        if (field !== undefined) {
          if (CATEGORY_CUSTOM_FIELD_DATA_TYPES[field.dataType] === true) {
            const dateValue = new Date(value)

            if (isNaN(dateValue)) {
              throw new BadRequestError(`Category data type is invalid for "${field.label}": ${value}`)
            }

            category.customFields[key] = startOfDay(dateValue)
          }
        }
      }
    }

    if (donor !== undefined) {
      const donorName = sanitize(donor)
      const donorNorm = donorName.toLowerCase()

      await InkindDonationDonorModel.updateOne({
        norm: donorNorm,
      }, {
        $setOnInsert: {
          name: donorName,
          norm: donorNorm,
        },
        $set: {
          email: donorEmail
        }
      } , {
        upsert: true
      })

      if (donorEmail !== undefined && quantity > 0) {
        await SendgridMailController.sendIkdAcknowledgement(donorEmail, {
          name,
          quantity,
          unit
        }).catch(console.error)
      }
    }

    if (group !== undefined) {
      const groupName = sanitize(group)
      const groupNorm = groupName.toLowerCase()

      await InkindDonationGroupModel.updateOne({
        norm: groupNorm
      }, {
        $setOnInsert: {
          name: groupName,
          norm: groupNorm,
          unit
        }
      } , {
        upsert: true
      })
    }

    try {
      const results = await InkindDonationModel.create({
        sku,
        skuText: sku,
        name,
        description,
        quantity,
        donor,
        unit,
        category,
        group
      })

      if (quantity > 0) {
        await InkindDonationsController.createTransaction({
          item: {
            sku,
            name,
            category,
            quantity: 0
          },
          date: new Date(),
          reason: 'Added new items',
          quantity,
          file
        }).catch((error) => console.log(error))
      }
      
      return results.toObject({ 
        minimize: true,
        versionKey: false,
        useProjection: true
      })
    } catch (error) {
      if (error.code === 11000 && error.keyPattern.sku === 1) {
        throw new ConflictError('duplicate_ikd_sku')
      }

      throw error
    }
  }

  static async list(query) {
    const {
      limit,
      offset,
      grouped,
      filters = {},
      sort = {}
    } = query

    const {
      query: filterQuery,
      categoryCustomFields,
      showExpiringOnly
    } = filters

    const {
      field: sortField,
      order: sortOrder
    } = sort

    let results, total

    if (grouped) {
      const aggregationResults = await Promise.all([
        InkindDonationModel.aggregate([
          {
            $match: {
              deleted: false
            }
          },
          {
            $group: {
              _id: '$group',
              quantity: {
                $sum: '$quantity'
              }
            }
          },
          { 
            $addFields: {
              fieldType: { 
                $type: '$_id'
              } 
            } 
          },
          {
            $sort: {
              fieldType: -1,
              _id: 1,
            }
          },
          {
            $project: {
              fieldType: 0
            }
          },
          {
            $project: {
              _id: {
                $ifNull: ['$_id', 'Ungrouped Items'],
              },
              quantity: 1
            }
          },
          {
            $skip: offset
          },
          {
            $limit: limit
          }
        ]),
        InkindDonationModel.aggregate([
          {
            $match: {
              deleted: false
            }
          },
          {
            $group: {
              _id: '$group'
            }
          },
          {
            $count: 'count'
          }
        ])
      ])

      results = aggregationResults[0]
      const countAggResult = aggregationResults[1]

      if (countAggResult.length > 0) {
        total = aggregationResults[1][0].count
      }
    } else {
      const matchQuery = {
        deleted: false
      }
      const queryOptions = { 
        lean: true,
        limit,
        skip: offset
      }

      if (filterQuery !== undefined && filterQuery !== '') {
        matchQuery.$text = {
          $search: decodeURIComponent(filterQuery)
        }
      }

      if (Array.isArray(categoryCustomFields) && categoryCustomFields.length > 0) {
        for (const customField of categoryCustomFields) {
          const dbField = `category.customFields.${customField}`

          matchQuery[dbField] = {
            $exists: true
          }
        }
      }

      if (showExpiringOnly === true) {
        const today = new Date()

        const nextMonth = addMonths(today, 1)
        const endOfNextMonth = endOfMonth(nextMonth)

        matchQuery.$and = [
          {
            'category.customFields': {
              $exists: true
            }
          },
          {
            $or: [
              {
                'category.customFields.expirationDate': {
                  $gte: today,
                  $lte: endOfNextMonth
                }
              },
              {
                'category.customFields.bestBeforeDate': {
                  $gte: today,
                  $lte: endOfNextMonth
                }
              },
            ]
          }
        ]
      }

      if (sortField !== undefined && sortOrder !== undefined) {
        queryOptions.sort = {
          [sortField]: SORT_ORDER_MAPPING[sortOrder]
        }
      }

      [results, total] = await Promise.all([
        InkindDonationModel.find(matchQuery, undefined, queryOptions),
        InkindDonationModel.countDocuments(matchQuery)
      ])
    }

    return {
      results,
      total
    }
  }

  static async get(id) {
    const inkindDonation = await InkindDonationModel.findOne({
      _id: id,
      deleted: false
    }, undefined, { lean: true })

    if (inkindDonation === null) {
      throw new NotFoundError(`In-kind donation does not exist: ${id}`)
    }

    return inkindDonation
  }

  static async deleteOne(id) {
    const { matchedCount } = await InkindDonationModel.updateOne({
      _id: id,
      deleted: false
    }, {
      $set: {
        deleted: true
      },
      $currentDate: {
        deletedOn: true
      }
    })

    if (matchedCount === 0) {
      throw new NotFoundError('inkind-donation')
    }
  }

  static async createTransaction(transaction) {
    const {
      item,
      date,
      reason,
      quantity,
      file
    } = transaction

    const transactionId = new Types.ObjectId()

    let receiptImageUrl

    if (file !== undefined) {
      const { originalname, buffer} = file

      const filename = `${transactionId.toString()}/receipt-${date.valueOf().toString(36)}-${originalname}`

      await InkindDonationsController.uploadFile(filename, buffer)

      receiptImageUrl = `https://storage.googleapis.com/${INKIND_DONATION_RECEIPTS_BUCKET_URL}/${filename}`
    }
    
    await IkdTransactionModel.create({
      _id: transactionId,
      status: TRANSACTION_STATUSES.COMPLETE,
      item,
      reason,
      quantity,
      date,
      receiptImageUrl
    })
  }

  static uploadFile(filename, buffer) {
    const bucketFile = ikdReceiptsBucket.file(filename)

    return bucketFile.save(buffer, {
      public: true
    })
  }
}

module.exports = InkindDonationsController