'use strict'

const BaseTransporter = require('./base')
const config = require('../../config')

class SendgridTransporter extends BaseTransporter {
  constructor() {
    const { user, pass } = config.smtp.sendgrid.auth
    
    super('smtp.sendgrid.net', 587, {
      user,
      pass
    })

    this.volunteerUrl = new URL(config.volunteer.domainName)
  }

  get noReplyFromAddress() {
    return 'noreply@aralpinoy.xyz'
  }

  get supportFromAddress() {
    return 'support@aralpinoy.xyz'
  }

  sendResetPasswordRequest(to, url) {
    return this.transporter.sendMail({
      from: this.noReplyFromAddress,
      to,
      subject: 'Reset your password',
      template: 'reset-password-request',
      context: {
        url
      }
    })
  }

  sendResetPasswordSuccess(to) {
    return this.transporter.sendMail({
      from: this.supportFromAddress,
      to,
      replyTo: 'support@aralpinoy.xyz',
      subject: 'Password has been reset',
      template: 'reset-password-success'
    })
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
  async sendIkdAcknowledgement(params) {
    const {
      email,
      donor: {
        name: donorName,
        item
      }
    } = params

    await this.transporter.sendMail({
      from: this.supportFromAddress,
      to: email.to,
      replyTo: 'support@aralpinoy.xyz',
      subject: 'Thank you for your In-Kind Donation!',
      template: 'inkind-donation-acknowledgement',
      context: {
        donorName,
        item: {
          name: item.name,
          quantity: item.quantity,
          unit: item.unit
        },
        volunteerHref: this.volunteerUrl.href,
        volunteerDomain: this.volunteerUrl.hostname
      }
    })
  }

  /**
   * Send event invitation email using SendGrid mail transporter
   * @param {Object} email Email details
   * @param {string} email.to To address
   * @param {Object} event Event details
   * @param {string} event.name Event name
   * @param {string} event.url URL to the event
   */
  async sendEventInvitation(email, event) {
    const {
      to
    } = email

    const {
      name,
      url
    } = event

    await this.transporter.sendMail({
      from: this.noReplyFromAddress,
      to,
      subject: 'You are invited to an event!',
      template: 'event-invitation',
      context: {
        event: {
          name,
          url
        },
      }
    })
  }

  /**
   * Send new event job email using SendGrid mail transporter
   * @param {Object} email Email details
   * @param {string} email.to To address
   * @param {Object} event Event details
   * @param {string} event.name Event name
   * @param {string} event.url URL to the event
   * @param {string} event.jobName Job name that was added to the event
   */
  async sendNewEventJob(email, event) {
    const {
      to
    } = email

    const {
      name,
      url,
      jobName
    } = event

    await this.transporter.sendMail({
      from: this.noReplyFromAddress,
      to,
      subject: 'An event you volunteered has a new role!',
      template: 'new-event-job',
      context: {
        event: {
          name,
          url,
          jobName
        },
      }
    })
  }

  /**
   * Send insufficient event volunteers email using SendGrid mail transporter
   * @param {Object} email Email details
   * @param {string} email.to To address
   * @param {Object} event Event details
   * @param {string} event.name Event name
   * @param {string} event.url URL to the event
   * @param {string} event.jobName Job name that was added to the event
   */
  async sendInsufficientEventVolunteersEmail(email, event) {
    const {
      to
    } = email

    const {
      name,
      url,
    } = event

    await this.transporter.sendMail({
      from: this.noReplyFromAddress,
      to,
      subject: 'Notice: An event needs more volunteers',
      template: 'insufficient-event-volunteers',
      context: {
        event: {
          name,
          url,
        },
      }
    })
  }
}

module.exports = SendgridTransporter