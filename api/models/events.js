'use strict'

const mongoose = require('mongoose')

function getAmount(value) {
  return value / 1000
}

function setAmount(value) {
  return value * 1000
}

const sdgQuestionSchema = new mongoose.Schema({
  label: String,
  type: {
    type: String
  }
}, {
  _id: false,
  validateBeforeSave: false
})

const sdgSchema = new mongoose.Schema({
  name: String,
  description: String,
  imageUrl: String,
  questions: [sdgQuestionSchema]
}, {
  _id: false,
  validateBeforeSave: false
})

const contactMethodSchema = new mongoose.Schema({
  type: String,
  value: String
}, {
  _id: false,
  validateBeforeSave: false
})

const contactSchema = new mongoose.Schema({
  name: String,
  contactMethods: [contactMethodSchema]
}, {
  _id: false,
  validateBeforeSave: false
})

const ikdSchema = new mongoose.Schema({
  item: {
    sku: String,
    name: String,
    category: mongoose.SchemaTypes.Mixed
  },
  quantity: Number,
  usedQuantity: Number
}, {
  _id: false,
  validateBeforeSave: false
})

const skillSchema = new mongoose.Schema({
  name: String,
  norm: String,
  description: String,
}, {
  _id: false,
  validateBeforeSave: false
})

const jobSchema = new mongoose.Schema({
  name: String,
  description: String,
  slots: {
    current: {
      type: Number,
      default: 0
    },
    max: Number
  },
  skills: {
    type: [skillSchema],
    default: []
  }
}, {
  _id: false,
  validateBeforeSave: false
})

const questionSchema = new mongoose.Schema({
  label: String,
  type: {
    type: String
  }
}, {
  _id: false,
  validateBeforeSave: false
})

const budgetBreakdownSchema  = new mongoose.Schema({
  type: {
    type: String
  },
  amount: {
    type: Number,
    get: getAmount,
    set: setAmount
  },
}, {
  _id: false,
  validateBeforeSave: false
})

const budgetSchema = new mongoose.Schema({
  breakdown: {
    type: [budgetBreakdownSchema],
  }
}, {
  _id: false,
  validateBeforeSave: false
})

const schema = new mongoose.Schema({
  name: {
    type: String,
    text: true
  },
  type: {
    type: String
  },
  description: String,
  status: {
    type: String,
    default: 'UPCOMING'
  },
  date: {
    start: Date,
    end: Date
  },
  logoUrl: String,
  review: String,
  goals : {
    numVolunteers: {
      current: {
        type: Number,
        default: 0
      },
      target: Number,
    },
    monetaryDonation: {
      current: {
        type: Number,
        default: 0,
        get: getAmount,
        set: setAmount
      },
      target: {
        type: Number,
        get: getAmount,
        set: setAmount
      }
    }
  },
  location: {
    name: String
  },
  contacts: {
    type: [contactSchema],
    default: undefined
  },
  sdgs: {
    type: [sdgSchema],
    default: undefined
  },
  ikds: {
    type: [ikdSchema],
    default: undefined
  },
  jobs: {
    type: [jobSchema],
    default: undefined
  },
  questions: {
    type: [questionSchema],
    default: undefined
  },
  incidents : {
    type: [String],
    default: undefined
  },
  budget: {
    type: budgetSchema
  }
}, {
  id: false,
  validateBeforeSave: false,
  toObject: {
    getters: true
  },
  toJSON: {
    getters: true
  }
})

module.exports = mongoose.model('Event', schema)
