'use strict'

const IkdOutboundTransactionModel = require('../../models/inkind-donations/outbound-transactions')
const IkdOrganizationModel = require('../../models/inkind-donations/organizations')
const InkindDonationModel = require('../../models/inkind-donations')
const EventModel = require('../../models/events')

const { 
  TRANSACTION_STATUSES,
  OUTBOUND_RECEIVER_TYPES
} = require('../../constants/inkind-donations')

const { 
  BadRequestError,
  NotFoundError, 
  ConflictError
} = require('../../errors')

const SORT_ORDER_MAPPING = {
  asc : 1,
  desc: -1
}

const whitespaceRegex = /\s+/g

function sanitize(name) {
  return name.replace(whitespaceRegex,' ')
}

class InkindDonationOutboundTransactionsController {
  static async create(transaction) {
    const {
      sku,
      quantity,
      date
    } = transaction
    
    const item = await InkindDonationModel.findOne({
      sku,
      deleted: false
    }, ['name', 'category', '__v'], {
      lean: true
    })
    
    if (item === null) {
      throw new NotFoundError(`In-Kind Donation does not exist: ${sku}`)
    }

    const receiver = {
      type: transaction.receiver.type
    }

    if (receiver.type === OUTBOUND_RECEIVER_TYPES.ORGANIZATION) {
      const organization = transaction.receiver.organization

      const orgName = sanitize(organization.name)
      const orgNorm = orgName.toLowerCase()

      await IkdOrganizationModel.updateOne({
        norm: orgNorm
      }, {
        $setOnInsert: {
          name: orgName,
          norm: orgNorm
        }
      } , {
        upsert: true
      })

      receiver.organization = organization
    } else if (receiver.type === OUTBOUND_RECEIVER_TYPES.EVENT) {
      const eventId = transaction.receiver.eventId

      const event = await EventModel.findById(eventId, ['_id'], { lean: true })

      if (event === null) {
        throw new NotFoundError(`Event does not exist: ${eventId}`)
      }

      receiver.event = event
    }
    
    const createdTransaction = await IkdOutboundTransactionModel.create({
      item: {
        sku,
        name: item.name,
        category: item.category
      },
      quantity,
      date: new Date(date),
      receiver
    })
    
    return createdTransaction.toObject({ 
      minimize: true,
      versionKey: false,
    })
  }

  static async list(options = {}) {
    const {
      limit,
      offset,
      filters = {},
      sort = {}
    } = options

    const {
      receiverType: filterReceiverType,
      status: filterStatus
    } = filters

    const {
      field: sortField,
      order: sortOrder
    } = sort

    const filterQuery = {}
    const queryOptions = { 
      lean: true,
      limit,
      skip: offset,
      populate: {
        path: 'receiver.event',
        select: ['_id', 'name']
      }
    }

    if (filterReceiverType !== undefined) {
      filterQuery['receiver.type'] = filterReceiverType
    }

    if (filterStatus !== undefined) {
      filterQuery.status = {
        $in: filterStatus
      }
    }

    if (sortField !== undefined && sortOrder !== undefined) {
      queryOptions.sort = {
        [sortField]: SORT_ORDER_MAPPING[sortOrder]
      }
    }

    const [transactions, total] = await Promise.all([
      IkdOutboundTransactionModel.find(filterQuery, undefined, queryOptions),
      IkdOutboundTransactionModel.countDocuments(filterQuery)
    ])

    return {
      results: transactions,
      total
    }
  }

  static async get(id) {
    const transaction = await IkdOutboundTransactionModel.findById(id, undefined, { lean: true })

    if (transaction === null) {
      throw new NotFoundError(`In-kind donation outbound transaction does not exist: ${id}`)
    }

    return transaction
  }

  static async updateStatus(id, status) {
    const transaction = await IkdOutboundTransactionModel.findById({
      _id: id,
    }, [
      '__v',
      'type',
      'quantity',
      'status',
      'item.sku',
      'receiver.type'
    ], {
      lean: true
    })

    if (transaction === null) {
      throw new NotFoundError(`In-kind donation outbound transaction does not exist: ${id}`)
    }

    if (transaction.status === status) {
      return
    }

    if (transaction.status !== TRANSACTION_STATUSES.PENDING) {
      throw new BadRequestError(`Outbound transaction cannot be updated: Status is "${transaction.status}"`)
    }

    if (transaction.receiver.type === OUTBOUND_RECEIVER_TYPES.EVENT) {
      throw new BadRequestError('Outbound event transactions cannot be updated')
    }

    if (status !== TRANSACTION_STATUSES.RETURNED) {
      const item = await InkindDonationModel.findOne({
        sku: transaction.item.sku,
        deleted: false
      }, ['__v'], {
        lean: true
      })
  
      if (item === null) {
        throw new NotFoundError(`In-kind donation SKU item does not exist: ${transaction.item.sku}`)
      }
      
      const itemUpdateResults = await InkindDonationModel.updateOne({
        sku: transaction.item.sku,
        deleted: false,
        __v : item.__v
      }, {
        $inc: {
          quantity: -Math.abs(transaction.quantity),
          __v : 1
        }
      })
  
      if (itemUpdateResults.matchedCount === 0) {
        throw new ConflictError('In-kind donation was updated, please try again')
      }
    }

    const transactionResults = await IkdOutboundTransactionModel.updateOne({
      _id: id,
      __v: transaction.__v
    }, {
      $set: {
        status
      },
      $inc: {
        __v : 1
      }
    })

    if (transactionResults.matchedCount === 0) {
      throw new ConflictError('Outbound transaction was already updated, please try again')
    }
  }
}

module.exports = InkindDonationOutboundTransactionsController