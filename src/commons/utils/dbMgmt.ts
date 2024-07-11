import { log } from "./logger";
import { currentDateTime, lockExpiryTime } from "../constants";
import { validateRequestFields } from "./validateUtils";
import { getDbClient } from "./dbConnector";
import { getUpdateExpressions } from "./updateExpression";

// const docClient = getDbClient();
// log.debug(`docClient---->${JSON.stringify(docClient)}`);

export const addRecord = async (recordObj: any, requiredFields: any, tableName: any) => {
  let response = {};
  try {
    const validationResponse = validateRequestFields(recordObj, requiredFields);
    if (validationResponse === true) {
      recordObj.creationDate = currentDateTime();
      const params = {
        TableName: tableName,
        Item: recordObj,
      };
      const docClient = getDbClient();
      // log.debug(`docClient---->${JSON.stringify(docClient)}`);
      log.debug(`params -> ${JSON.stringify(params)}`);
      const data = await docClient.put(params).promise();
      // const data={};
    } else {
      log.debug(`Required data is missing ${validationResponse}`);
      let errorMsg = validationResponse;
      response = {
        body: "INSERT_FAILED",
        description: errorMsg,
        statusCode: "501",
      };

      return response;
    }
  } catch (error) {
    log.debug(`addNewReceiverInfo|error -> ${JSON.stringify(error)}`);
    response = { body: "INSERT_FAILED", description: error, statusCode: "500" };
    return response;
    //throw new Error(error);
  }
  response = { body: "INSERT_SUCCESS", statusCode: "200" };
  log.debug(`response ${JSON.stringify(response)}`);
  return response;
};

export async function getRecord(recordObj: any, requiredFields: any, params: any) {
  let response = {};
  try {
    const docClient = getDbClient();
    // log.debug(`docClient---->${JSON.stringify(docClient)}`);
    const validationResponse = validateRequestFields(recordObj, requiredFields);
    log.debug(`validationResponse -> ${validationResponse}`);
    if (validationResponse === true) {
      log.debug(`params -> ${JSON.stringify(params)}`);
      let dataResponse = await docClient.query(params).promise();
      log.debug(`data is waitin.....`);
      log.debug(`data is ${JSON.stringify(dataResponse)}`);
      response = { body: dataResponse, statusCode: "200" };
      return response;
    } else {
      log.debug(`Required data is missing ${validationResponse}`);
      let errorMsg = validationResponse;
      response = {
        body: "GET_FAILED",
        description: errorMsg,
        statusCode: "501",
      };

      return response;
    }
  } catch (error) {
    log.debug("here............errorrrrrr 3333333333333");
    log.debug(`here............errorrrrrr ${error}`);
    log.debug(`getRecord|  error -> ${JSON.stringify(error)}`);
    response = { body: "GET_FAILED", description: error, statusCode: "500" };
    return response;
    //throw new Error(error);
  }
};

export async function updateRecord(
  recordObj: any,
  requiredFields: any,
  pkFieldNm: any,
  skFieldNm: any,
  tableName: any,
  keyObj: any
) {
  let response = {};
  try {
    const validationResponse = validateRequestFields(recordObj, requiredFields);
    if (validationResponse === true) {
      recordObj.lastUpdatedDate = currentDateTime();
      let updateExpressionInfo = getUpdateExpressions(
        recordObj,
        pkFieldNm,
        skFieldNm
      );
      const params = {
        TableName: tableName,
        Key: keyObj,
        UpdateExpression: updateExpressionInfo.updateExpression,
        ExpressionAttributeValues: {
          ...updateExpressionInfo.expressionAttributeValues,
        },
        ReturnValues: "UPDATED_NEW",
      };

      const docClient = getDbClient();
      // log.debug(`docClient---->${JSON.stringify(docClient)}`);

      console.log(`params -> ${JSON.stringify(params)}`);
      const data = await docClient.update(params).promise();
      console.log(`data is ${JSON.stringify(data)}`);

      response = { body: data, statusCode: "200" };

      return response;
    } else {
      log.debug(`Required data is missing ${validationResponse}`);
      let errorMsg = validationResponse;
      response = {
        body: "UPDATE_FAILED",
        description: errorMsg,
        statusCode: "501",
      };

      return response;
    }
  } catch (error) {
    log.debug(`updateRecord| ${tableName} error -> ${JSON.stringify(error)}`);
    response = { body: "UPDATE_FAILED", description: error, statusCode: "500" };
    return response;

  }
}

export async function addBatchRecord(params: any) {
  let response = {};
  try {
    const docClient = getDbClient();
    log.debug(`params -> ${JSON.stringify(params)}`);
    const data = await docClient.batchWrite(params).promise();
    log.debug(`batch Write Response -> ${JSON.stringify(data)}`);
    response = { 'body': 'INSERT_SUCCESS', 'statusCode': '200', 'description': data }
    log.debug(`response ${JSON.stringify(response)}`)
    return response;
  } catch (error) {
    log.debug(`batch Write error -> ${JSON.stringify(error)}`);
    response = { 'body': 'INSERT_FAILED', 'description': error, 'statusCode': '500' }
    return response;
    //throw new Error(error);
  }
};
