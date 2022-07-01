'use strict'

const path = require('path') 

const PDFPrinter = require('pdfmake')

const EventModel = require('../../models/events')
const EventVolunteerModel = require('../../models/events/volunteers')

const {
  NotFoundError,
  ConflictError
} = require('../../errors')

const printer = new PDFPrinter({
  Roboto: {
    normal: path.resolve(__dirname, '../../assets', 'fonts/Roboto-Regular.ttf'),
    bold: path.resolve(__dirname, '../../assets', 'fonts/Roboto-Medium.ttf'),
    italics: path.resolve(__dirname, '../../assets', 'fonts/Roboto-Italic.ttf'),
    bolditalics: path.resolve(__dirname, '../../assets', 'fonts/Roboto-MediumItalic.ttf')
  }
})

const logoFilePath = path.resolve(__dirname, '../../assets', './aralpinoy.png')

class EventFormController {
  /**
   * Retrieves the volunteer attendance file
   * @param {string} eventId Event Id
   * @returns {Promise<PDFDocument>}
   */
  static async getVolunteerAttendanceFile(eventId) {
    const event = await EventModel.findById(eventId, ['_id', 'name', 'date', 'goals'])
    
    if (event === null) {
      throw new NotFoundError('event')
    }

    if (event.goals.numVolunteers.target === 0) {
      throw new ConflictError('no_volunteers')
    }

    const eventVolunteers = await EventVolunteerModel.find({
      event: event._id
    }, ['user'], {
      populate: [{
        path: 'user'
      }]
    })

    const headerRow = ['Name', 'Absent', 'Excused']
    const rows = []

    for (const { user } of eventVolunteers) {
      const name = `${user.firstName} ${user.lastName}`

      rows.push([
        {
          text: name
        },
        {
          text: '(     )',
          alignment: 'center'
        },
        {
          text: '(     )',
          alignment: 'center'
        },
      ])
    }
    
    return printer.createPdfKitDocument({
      pageSize: 'letter',
      content: [
        {
          image: logoFilePath,
          fit: [100, 100],
          alignment: 'center'
        },
        { text: 'Volunteer Attendance List', margin: 5, fontSize: 20, alignment: 'center' },
        { text: event.name, margin: 5, fontSize: 14, alignment: 'center' },
        { text: new Date(event.date.start).toLocaleString('en-us', { dateStyle: 'medium', timeStyle: 'short' }), margin: 5, fontSize: 14, alignment: 'center' },
        { text: '', margin: 10 },
        {
          layout: 'lightHorizontalLines',
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto'],
            body: [
              headerRow,
              ...rows,
            ]
          }
        }
      ]
    }, {})
  }

  /**
   * Retrieves the inventory list file
   * @param {string} eventId Event Id
   * @returns {Promise<PDFDocument>}
   */
  static async getInventoryListFile(eventId) {
    const event = await EventModel.findById(eventId,['_id', 'name', 'date', 'ikds'])
    
    if (event === null) {
      throw new NotFoundError('event')
    }

    if (!Array.isArray(event.ikds) || event.ikds.length === 0) {
      throw new ConflictError('no_inventory_items')
    }

    const headerRow = ['Item Name', 'Quantity Brought', 'Quantity Used']
    const rows = []
    let pageRowLimit = 27
    const extraPageRowLimit = 36

    for (const { item, quantity } of event.ikds) {
      rows.push([
        {
          text: item.name
        },
        {
          text: quantity,
          alignment: 'center'
        },
        {
          text: '_____',
          alignment: 'center'
        }
      ])

      pageRowLimit -= 1

      if (pageRowLimit === 0) {
        pageRowLimit += extraPageRowLimit
      }
    }

    // Create empty rows
    for (let i = 0; i < pageRowLimit; i++) {
      rows.push([
        {
          text: ' '
        },
        {
          text: ' ',
        },
        {
          text: ' ',
        }
      ])
    }

    for (let i = 0; i < extraPageRowLimit; i++) {
      rows.push([
        {
          text: ' '
        },
        {
          text: ' ',
        },
        {
          text: ' ',
        }
      ])
    }
    
    return printer.createPdfKitDocument({
      pageSize: 'letter',
      content: [
        {
          image: logoFilePath,
          fit: [100, 100],
          alignment: 'center'
        },
        { text: 'Inventory List', margin: 5, fontSize: 20, alignment: 'center' },
        { text: event.name, margin: 5, fontSize: 14, alignment: 'center' },
        { text: new Date(event.date.start).toLocaleString('en-us', { dateStyle: 'medium', timeStyle: 'short' }), margin: 5, fontSize: 14, alignment: 'center' },
        { text: '', margin: 10 },
        {
          layout: 'lightHorizontalLines',
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto'],
            body: [
              headerRow,
              ...rows,
            ]
          }
        }
      ]
    }, {})
  }

  /**
   * Retrieves the inventory list file
   * @param {string} eventId Event Id
   * @returns {Promise<PDFDocument>}
   */
  static async getExpenseBreakdownFile(eventId) {
    const event = await EventModel.findById(eventId,['_id', 'name', 'date', 'budget'])
    
    if (event === null) {
      throw new NotFoundError('event')
    }

    const headerRow = ['Expense', 'Proposed / Actual Cost (₱)', 'Remarks']
    const rows = []
    let pageRowLimit = 27
    let isEmptyBudget = true
    const extraPageRowLimit = 36

    if (event.budget !== undefined && Array.isArray(event.budget.breakdown)) {
      isEmptyBudget = false
      
      for (const { type, amount } of event.budget.breakdown) {
        rows.push([
          {
            text: type
          },
          {
            text: `${amount} / `,
            alignment: 'center'
          },
          {
            text: '',
          }
        ])
  
        pageRowLimit -= 1
  
        if (pageRowLimit === 0) {
          pageRowLimit += extraPageRowLimit
        }
      }
    }

    // Create empty rows
    for (let i = 0; i < pageRowLimit; i++) {
      rows.push([
        {
          text: ' '
        },
        {
          text: ' ',
        },
        {
          text: ' ',
        }
      ])
    }

    if (!isEmptyBudget) {
      for (let i = 0; i < extraPageRowLimit; i++) {
        rows.push([
          {
            text: ' '
          },
          {
            text: ' ',
          },
          {
            text: ' ',
          }
        ])
      }
    }
    
    return printer.createPdfKitDocument({
      pageSize: 'letter',
      content: [
        {
          image: logoFilePath,
          fit: [100, 100],
          alignment: 'center'
        },
        { text: 'Expense Breakdown', margin: 5, fontSize: 20, alignment: 'center' },
        { text: event.name, margin: 5, fontSize: 14, alignment: 'center' },
        { text: new Date(event.date.start).toLocaleString('en-us', { dateStyle: 'medium', timeStyle: 'short' }), margin: 5, fontSize: 14, alignment: 'center' },
        { text: '', margin: 10 },
        {
          layout: 'lightHorizontalLines',
          table: {
            headerRows: 1,
            widths: ['*', 'auto', '*'],
            body: [
              headerRow,
              ...rows,
            ]
          }
        }
      ]
    }, {})
  }
}

module.exports = EventFormController