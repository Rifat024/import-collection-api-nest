
export const AppConfig = {
  REGION: 'us-east-1',
  environment: 'dev',
  AWS_SECRET_KEY_ID: process.env.AWS_SECRET_KEY_ID,
  AWS_SECRET_KEY_VAL: process.env.AWS_SECRET_KEY_VAL,
  logLevel: process.env.LOG_LEVEL || "info",
  requestRetryAttemptCount: process.env.REQUEST_RETRY_ATTEMPT_COUNT,
  requestRetryAttemptDelay: process.env.REQUEST_RETRY_ATTEMPT_DELAY,
  requestTimeout: process.env.REQUEST_TIMEOUT,
  AUTH_URL: process.env.AUTH_URL,
  AUTH_CLIENT_ID: process.env.AUTH_CLIENT_ID,
  AUTH_CLIENT_SECRET: process.env.AUTH_CLIENT_SECRET,
  X_API_KEY: process.env.X_API_KEY,

  SECRET_KEY_ACCESS_TOKEN: 'SECRET_KEY_ACCESS_TOKEN',
  // DBT_APITOOL_COLLECTIONS: `ats-dev-DBT_APITOOL_COLLECTIONS`,
  // DBT_APITOOL_REQUESTS: `ats-dev-DBT_APITOOL_REQUESTS`,
  // DBT_APITOOL_REQUESTS_EXAMPLE: `ats-dev-DBT_APITOOL_REQUESTS_EXAMPLE`,
  // DBT_APITOOL_COLLECTIONS: `${process.env.APP_PREFIX}-${process.env.env}-${process.env.DBT_APITOOL_COLLECTIONS}`,
  // DBT_APITOOL_REQUESTS: `${process.env.APP_PREFIX}-${process.env.env}-${process.env.DBT_APITOOL_REQUESTS}`,
  // DBT_APITOOL_REQUESTS_EXAMPLE: `${process.env.APP_PREFIX}-${process.env.env}-${process.env.DBT_APITOOL_REQUESTS_EXAMPLE}`,
  
  API_RESPONSE: {
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    UNPROCESSABLE: 'UNPROCESSABLE'

  },

  ITEM_CATEGORY: {
    COLLECTION: "COLLECTION",
    FOLDER: "FOLDER",
    REQUEST: "REQUEST",
    EXAMPLE: "EXAMPLE"
  },
}

/**
 * Environment constants.  Can be utilized to write environment specific logic.
 */
export const Environment = {
  DEV: "dev",
  TEST: "test",
  QA: "qa",
  PROD: "prod",
  LOCAL: "local",
};

export const httpStatusCodes = {
  BAD_REQUEST: "400",
  INTERNAL_SERVER_ERROR: "500",
  SUCCESS: "200",
  CREATED: "201",
  NOT_FOUND: "404",
};
