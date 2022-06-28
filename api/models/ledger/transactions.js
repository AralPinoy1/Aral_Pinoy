'use strict'

const mongoose = require('mongoose')

function getAmount(value) {
  return value / 1000
}

function setAmount(value) {
  return value * 1000
}


const schema = new mongoose.Schema({
  type: {
    type: String
  },
  status: String,
  amount: {
    type: Number,
    get: getAmount,
    set: setAmount
  },
  metadata: {
    event: {
      type: mongoose.Types.ObjectId,
      ref: 'Event',
    },
    receipt: {
      originalFilename: String,
      storagePath: String,
      url: String
    },
  },
}, {
  collection: 'ledgerTransactions',
  id: false,
  validateBeforeSave: false,
  timestamps: true,
  toObject: {
    getters: true
  },
  toJSON: {
    getters: true
  }
})

module.exports = mongoose.model('LedgerTransaction', schema)
