
import { log } from './logger';





export const doesFieldValueExists = (record, fieldsToValidate) => {
  let doesFieldValueExistsResponse = true;
  log.debug(`fieldsToValidate=> ${fieldsToValidate}`);
  log.debug(`record123=> ${JSON.stringify(record)}`);
  for (var fieldToValidate of fieldsToValidate) {

    if (record.hasOwnProperty(fieldToValidate)) {
      log.debug("product---------");
      log.debug(fieldToValidate + ": " + record[fieldToValidate]);
      // if (record[fieldToValidate].trim().length<1) {
      //     doesFieldValueExistsResponse = false;
      // }
    } else {
      log.debug("fieldToValidate---------" + fieldToValidate);
      log.debug("record[fieldToValidate]---------" + record[fieldToValidate]);
      doesFieldValueExistsResponse = false;
      return doesFieldValueExistsResponse;
    }

  }

  return doesFieldValueExistsResponse;
};


export const doesFieldKeyExists = (record, fieldsToValidate) => {
  let doesFieldValueExistsResponse = true;
  log.debug(`fieldsToValidate=> ${fieldsToValidate}`);
  for (var fieldToValidate of fieldsToValidate) {
    log.debug(`record.length=> ${record.length}`);

    if (!record.hasOwnProperty(fieldToValidate)) {
      log.debug(`fieldToValidate=> ${fieldToValidate}`);
      doesFieldValueExistsResponse = false;
      return doesFieldValueExistsResponse;
    }

  }

  return doesFieldValueExistsResponse;

};

export const doesFieldKeyHasValue = (record, keyAttrib, ValueDtls) => {
  let doesFieldKeyHasValueResponse = true;


  if (!record.hasOwnProperty(keyAttrib)) {
    let keyVal = record[keyAttrib];
    if (ValueDtls === keyVal) {
      doesFieldKeyHasValueResponse = true;
    }
  } else {
    doesFieldKeyHasValueResponse = false;
  }


  return doesFieldKeyHasValueResponse;

};



export const validateRequestFields = (record: any, fieldsToValidate: any) => {
  let doesFieldValueExistsResponse = true;

  for (var fieldToValidate of fieldsToValidate) {

    if (!record.hasOwnProperty(fieldToValidate)) {
      doesFieldValueExistsResponse = false;
    }
  }

  if (!doesFieldValueExistsResponse) {
    log.debug(`Required fields are missing`);
    let error = "Required fields are missing";
    return error;
  }
  return doesFieldValueExistsResponse;
};
