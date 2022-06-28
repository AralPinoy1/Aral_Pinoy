'use strict'

const fs = require('fs')
const path = require('path')

const {
  NODE_ENV = 'development',
  MONGODB_URI,

  JWT_SECRET,
  JWT_EXPIRATION_TIME = '4h',

  ADMIN_DOMAIN_NAME,

  VOLUNTEER_DOMAIN_NAME,
  VOLUNTEER_GOOGLE_OAUTH_REDIRECT_URI,

  GOOGLE_CLOUD_SERVICE_ACCOUNT_CREDENTIALS,

  GOOGLE_OAUTH_TOKEN,

  GOOGLE_OAUTH_API_CLIENT_ID,
  GOOGLE_OAUTH_API_CLIENT_SECRET,
  GOOGLE_OAUTH_API_REDIRECT_URI,

  GOOGLE_OAUTH_VOLUNTEER_CLIENT_ID,
  GOOGLE_OAUTH_VOLUNTEER_CLIENT_SECRET,
  GOOGLE_OAUTH_VOLUNTEER_REDIRECT_URI,

  PAYMAYA_API_BASE_URL = 'https://pg-sandbox.paymaya.com',
  PAYMAYA_API_SECRET_API_KEY = 'sk-X8qolYjy62kIzEbr0QRK1h4b4KDVHaNcwMYk39jInSl',

  SMTP_GMAIL_AUTH_USER,
  SMTP_GMAIL_AUTH_PASS,
  SMTP_SENDGRID_AUTH_USER,
  SMTP_SENDGRID_AUTH_PASS,
} = process.env

const credentialsPath = path.resolve(__dirname, './service-account-key.json')
  
if (MONGODB_URI === '') {
  throw new Error('Environment variable `MONGODB_URI` must be provided')
}
  
if (JWT_SECRET === '') {
  throw new Error('Environment variable `JWT_SECRET` must be provided')
}

if (GOOGLE_CLOUD_SERVICE_ACCOUNT_CREDENTIALS !== '') {
  try {
    const gcloudServiceAccountFile = require(credentialsPath)

    if (GOOGLE_CLOUD_SERVICE_ACCOUNT_CREDENTIALS !== JSON.stringify(gcloudServiceAccountFile)) {
      fs.writeFileSync(credentialsPath, GOOGLE_CLOUD_SERVICE_ACCOUNT_CREDENTIALS)
    }
  } catch (error) {
    fs.writeFileSync(credentialsPath, GOOGLE_CLOUD_SERVICE_ACCOUNT_CREDENTIALS)
  }
}

if (GOOGLE_OAUTH_TOKEN !== '') {
  const oauthCredentialsPath = path.resolve(__dirname, './google-oauth2-token.json')

  try {
    const googleOAuthTokenFile = require(oauthCredentialsPath)

    if (GOOGLE_OAUTH_TOKEN !== JSON.stringify(googleOAuthTokenFile)) {
      fs.writeFileSync(oauthCredentialsPath, GOOGLE_OAUTH_TOKEN)
    }
  } catch (error) {
    fs.writeFileSync(oauthCredentialsPath, GOOGLE_OAUTH_TOKEN)
  }
}

module.exports = {
  environment: {
    isProduction: NODE_ENV === 'production',
    isStaging: NODE_ENV === 'staging',
    isDevelopment: NODE_ENV === 'development',
  },
  mongodb: {
    uri: MONGODB_URI
  },
  jwt: {
    secret: JWT_SECRET,
    expiresIn: JWT_EXPIRATION_TIME
  },
  admin: {
    domainName: ADMIN_DOMAIN_NAME,
  },
  volunteer: {
    domainName: VOLUNTEER_DOMAIN_NAME,
    google: {
      oauth: {
        redirectUri: VOLUNTEER_GOOGLE_OAUTH_REDIRECT_URI
      }
    }
  },
  google: {
    oauth: {
      api: {
        clientId: GOOGLE_OAUTH_API_CLIENT_ID,
        clientSecret: GOOGLE_OAUTH_API_CLIENT_SECRET,
        redirectUri: GOOGLE_OAUTH_API_REDIRECT_URI,
      },
      volunteer: {
        clientId: GOOGLE_OAUTH_VOLUNTEER_CLIENT_ID,
        clientSecret: GOOGLE_OAUTH_VOLUNTEER_CLIENT_SECRET,
        redirectUri: GOOGLE_OAUTH_VOLUNTEER_REDIRECT_URI,
      }
    },
    cloud: {
      serviceAccount: credentialsPath,
      storage: {
        bucketNames: {
          events: NODE_ENV + '_aral-pinoy-events',
          inkindDonationReceipts: NODE_ENV + '_aral-pinoy-inkind-donation-receipts',
          ledgerTransactionReceipts: NODE_ENV + '_aral-pinoy-ledger-transaction-receipts',
        }
      }
    }
  },
  paymaya: {
    api: {
      baseUrl: PAYMAYA_API_BASE_URL,
      secretKey: PAYMAYA_API_SECRET_API_KEY
    }
  },
  smtp: {
    gmail: {
      auth: {
        user: SMTP_GMAIL_AUTH_USER,
        pass: SMTP_GMAIL_AUTH_PASS
      }
    },
    sendgrid: {
      auth: {
        user: SMTP_SENDGRID_AUTH_USER,
        pass: SMTP_SENDGRID_AUTH_PASS
      }
    }
  }
}
