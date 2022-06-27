'use strict'

const SendgridTransporter = require('../../mail/transporters/sendgrid')

const transporter = new SendgridTransporter()

class SendgridMailController {
  static async sendResetPasswordRequest(to, url) {
    await transporter.sendResetPasswordRequest(to, url)
  }

  static async sendResetPasswordSuccess(to) {
    await transporter.sendResetPasswordSuccess(to)
  }

  /**
   * Send in-kind donation acknowledgement email via SendGrid
   * @param {Object} params Parameters
   * @param {Object} params.email Email object
   * @param {string} params.email.to To address
   * @param {Object} params.donor Donor details
   * @param {string} params.donor.name Donor name
   * @param {Object} params.donor.item Donated item
   * @param {Object} params.donor.item.name Item name
   * @param {Object} params.donor.item.quantity Item quantity
   * @param {Object} params.donor.item.unit Unit of measurement
   * @returns {Promise<void>}
   */
  static async sendIkdAcknowledgement(params) {
    await transporter.sendIkdAcknowledgement(params)
  }

  /**
   * Send event invitation email via SendGrid
   * @param {Object} email Email details
   * @param {string} email.to To address
   * @param {Object} event Event details
   * @param {string} event.name Event name
   * @param {string} event.url URL to the event
   */
  static async sendEventInvitation(email, event) {
    await transporter.sendEventInvitation(email, event)
  }

  /**
   * Send new event job email via SendGrid
   * @param {Object} email Email details
   * @param {string} email.to To address
   * @param {Object} event Event details
   * @param {string} event.name Event name
   * @param {string} event.url URL to the event
   * @param {string} event.jobName Job name that was added to the event
   */
  static async sendNewEventJob(email, event) {
    await transporter.sendNewEventJob(email, event)
  }

  /**
   * Send insufficient event volunteers email via SendGrid
   * @param {Object} email Email details
   * @param {string} email.to To address
   * @param {Object} event Event details
   * @param {string} event.name Event name
   * @param {string} event.url URL to the event
   */
  static async sendInsufficientEventVolunteersEmail(email, event) {
    await transporter.sendInsufficientEventVolunteersEmail(email, event)
  }
}

module.exports = SendgridMailController