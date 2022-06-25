'use strict'

const { addMonths, endOfMonth } = require('date-fns')
const debug = require('debug')

const InkindDonationModel = require('../models/inkind-donations')
const NotificationModel = require('../models/notifications')
const UserModel = require('../models/users')
const NOTIFICATION_TYPES = require('../constants/notifications').TYPES

const logger = debug('api:cron:check-expiring-inventory-items')

async function getAdminsAndOfficers() {
  const users = await UserModel.find({
    roles: {
      $in: ['admin','officer']
    }
  }, ['_id'])

  return users
}

async function getExpiringItems(dateThreshold) {
  const expiringItems = await InkindDonationModel.find({
    $and: [
      {
        deleted : false,
        'category.customFields': {
          $exists: true
        }
      },
      {
        $or: [
          {
            'category.customFields.expirationDate': {
              $lte: dateThreshold
            }
          },
          {
            'category.customFields.bestBeforeDate': {
              $lte: dateThreshold
            }
          }
        ]
      }
    ]
  }, ['sku', 'name', 'quantity', 'category'])

  return expiringItems
}

async function getUnmentionedExpiringItems(expiringItems) {
  const expiringItemIds = []
  const expiringItemsMap = new Map()

  for (const item of expiringItems) {
    expiringItemIds.push(item._id)
    expiringItemsMap.set(item._id.toString(), item)
  }

  const notifications = await NotificationModel.find({
    'typeDetails.expiringItems._id': {
      $in: expiringItemIds
    },
  }, ['typeDetails'])

  if (notifications.length === 0) {
    return Array.from(expiringItemsMap.values())
  }

  for (const notification of notifications) {
    const items = notification.typeDetails.expiringItems

    for (const item of items) {
      if (expiringItemsMap.has(item._id.toString())) {
        expiringItemsMap.delete(item._id.toString())
      }
    }
  }

  return Array.from(expiringItemsMap.values())
}

async function run() {
  logger('Running cron task')

  const users = await getAdminsAndOfficers()

  if (users.length === 0) {
    logger('No users found')

    return
  }

  const nextMonth = addMonths(new Date(), 1)
  const endOfNextMonth = endOfMonth(nextMonth)
  logger(`Searching for items before provided date: ${endOfNextMonth.toJSON()}`)

  const expiringItems = await getExpiringItems(endOfNextMonth)

  if (expiringItems.length === 0) {
    logger('No expiring items found')

    return
  }

  logger('Searching for un-notified expiring items')
  
  const unmentionedExpiringItems = await getUnmentionedExpiringItems(expiringItems)

  if (unmentionedExpiringItems.length === 0) {
    logger('No un-notified expiring items found')

    return
  }

  for (const user of users) {
    const userId = user._id

    await NotificationModel.create({
      user: userId,
      seen: false,
      read: false,
      type: NOTIFICATION_TYPES.EXPIRING_INVENTORY_ITEM,
      typeDetails: {
        expiringItems: unmentionedExpiringItems,
        dateThreshold: endOfNextMonth
      },
      createdAt: new Date()
    })
    
    logger(`User notification sent to ${user._id.toString()}`)
  }

  logger('Task ended successfully')
}

module.exports = function (agenda) {
  agenda.define('check expiring inventory items', run)
}