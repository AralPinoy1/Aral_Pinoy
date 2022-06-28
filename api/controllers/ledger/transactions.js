'use strict'

const { Storage } = require('@google-cloud/storage')
const { Types } = require('mongoose')

const config = require('../../config')

const LedgerTransactionModel = require('../../models/ledger/transactions')

const { TRANSACTION_STATUSES } = require('../../constants/ledger')

const SORT_ORDER_MAPPING = {
  asc : 1,
  desc: -1
}

const storage = new Storage({
  keyFilename: config.google.cloud.serviceAccount,
  projectId: 'aral-pinoy'
})

const BUCKET_URL = config.google.cloud.storage.bucketNames.ledgerTransactionReceipts

const ledgerTransactionReceiptBucket = storage.bucket(BUCKET_URL)

class LedgerTransactionController {
  static uploadFile(filename, buffer) {
    const bucketFile = ledgerTransactionReceiptBucket.file(filename)

    return bucketFile.save(buffer, {
      public: true
    })
  }

  /**
   * @param {Object} transaction
   * @param {string} transaction.type 
   * @param {number} transaction.amount
   * @param {Object} transaction.metadata
   * @param {string} transaction.metadata.eventId
   * @param {File} transaction.metadata.receipt
   * @returns {Promise<Object>} 
   */
  static async create(transaction) {
    const {
      type,
      amount,
      metadata
    } = transaction

    const transactionId = new Types.ObjectId()
    const transactionMetadata = {}

    if (metadata.eventId !== undefined) {
      transactionMetadata.event = new Types.ObjectId(metadata.eventId)
    }

    if (metadata.receipt !== undefined) {
      const file = metadata.receipt
    
      const { originalname, buffer} = file
      const filename = `${transactionId.toString()}/receipt-${Date.now().toString(36)}-${encodeURI(originalname)}`
      await LedgerTransactionController.uploadFile(filename, buffer)
  
      const documentationUrl = `https://storage.googleapis.com/${BUCKET_URL}/${filename}`

      transactionMetadata.receipt = {
        originalFilename: originalname,
        storagePath: filename,
        url: documentationUrl
      }
    }

    /** @type {Document} */
    const result = await LedgerTransactionModel.create({
      _id: transactionId,
      type,
      status: TRANSACTION_STATUSES.COMPLETED,
      amount,
      metadata: transactionMetadata
    })

    return result.toObject({
      minimize: true,
      versionKey: false,
      useProjection: true
    })
  }

  /**
   * @param {Object} [options={}]
   * @param {number} [options.limit]
   * @param {number} [options.offset]
   * @param {Object} [options.sort]
   * @param {string} options.sort.field
   * @param {string} options.sort.order
   * @returns 
   */
  static async list(options = {}) {
    const {
      limit,
      offset,
      sort: {
        field: sortField,
        order: sortOrder
      }
    } = options

    const queryOptions = {
      limit,
      skip: offset,
      populate: [
        {
          path: 'metadata.event'
        }
      ]
    }

    if (sortField !== undefined && sortOrder !== undefined ) {
      queryOptions.sort = {
        [sortField]: SORT_ORDER_MAPPING[sortOrder]
      }
    }

    const [ledgerTransactions, total] = await Promise.all([
      LedgerTransactionModel.find(undefined, undefined, queryOptions),
      LedgerTransactionModel.countDocuments()
    ])

    return {
      results: ledgerTransactions,
      total
    }
  }
}

module.exports = LedgerTransactionController