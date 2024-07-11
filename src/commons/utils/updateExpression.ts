import { log } from "./logger";

var updateExpression = "set ";
var expressionAttributeValues = {};

const makeUpdateParams = (input: any, parent: any, pkVal: any, skVal: any) => {
  log.info(`Called makeUpdateParams`);
  if (typeof input === "object" && !Array.isArray(input)) {
    // Object
    for (const key in input) {
      if (key === pkVal || key === skVal) continue;

      if (parent === "") {
        makeUpdateParams(input[key], key, pkVal, skVal);
      } else {
        makeUpdateParams(input[key], `${parent}.${key}`, pkVal, skVal);
      }
    }
  } else {
    // Array, String, Number
    var arr = parent.split(".");
    var attrKey = "";
    for (var i in arr) {
      attrKey += arr[i];
    }

    var arr: any = attrKey.split("-");
    var attrKey = "";
    for (var i in arr) {
      attrKey += arr[i];
    }

    updateExpression += ` ${parent} = :${attrKey} ,`;
    // ExpressionAttributeNames['#'+property] = property ;
    expressionAttributeValues[":" + attrKey] = input;
  }
};

export const getUpdateExpressions = (input: any, pkVal: any, skVal: any) => {
  log.info(`Called getUpdateExpressions`);
  updateExpression = "set ";
  expressionAttributeValues = {};

  makeUpdateParams(input, "", pkVal, skVal);
  log.info(`Called getUpdateExpressions-1`);
  updateExpression = updateExpression.slice(0, -1);

  if (updateExpression == "set  = : " || updateExpression == "se") {
    return {
      updateExpression: null,
      expressionAttributeValues: null,
    };
  }
  log.info(`Called getUpdateExpressions-2`);
  log.info(`updateExpression=> ${updateExpression}`);
  log.info(`expressionAttributeValues=> ${expressionAttributeValues}`);
  return {
    updateExpression: updateExpression,
    expressionAttributeValues: expressionAttributeValues,
  };
};
