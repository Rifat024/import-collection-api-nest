import { log } from './utils/logger';
import * as moment from 'moment';


export const epochDate = (date) =>{
    return Date.parse(date)
  }
  

export const currentDateTime = () => {
    const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss:SSS'; 
    let _now = '' ;
    _now = moment(new Date()).format(DATE_TIME_FORMAT);
    log.debug(`currentDateTime=: ${_now}`);
    
    // let testDate = new Date(_now);
    // //var localTime  = moment.utc(utcdate.text()).toDate();
    // log.debug(`EPOCH testDate  DATE::::::::${testDate}`);
    // log.debug(`EPOCH testDate.toDate  DATE::::::::${testDate.toDate()}`);
    // log.debug(`EPOCH DATE::::::::${Date.parse(new Date(_now))}`);

    log.debug(`EPOCH DATE::::::`);
    lockExpiryTime(10,'minute', new Date());
    return _now;

};


export const expiryDate = () => {
    console.log('expiry date ============')
    const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss:SSS'; 
    let _now = '' ;
    _now = moment("1973-02-14").format(DATE_TIME_FORMAT);
    console.log(`expiryDate=: ${_now}`);
  
    return _now;

};

export const lockExpiryTime =  (lockDurationAmount,lockDurationUnit,date) => {
    //TODO:
    //EXPIRY_TIME =CURRENT TIME +lockDurationAmount -lockDurationUnit
    console.log("===================");
    lockDurationAmount = parseInt(lockDurationAmount);
    const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss:SSS'; 
    //let date = new Date();
    console.log('prev ===>', date.toLocaleString());
  
    switch (lockDurationUnit) {
        case 'minute':
            date.setMinutes(date.getMinutes() + lockDurationAmount);
            break;
        case 'hour':
            date.setHours(date.getHours() + lockDurationAmount);
            break;
        case 'day':
            date.setDate(date.getDate() + lockDurationAmount);
            break;
        case 'week':
            date.setDate(date.getDate() + 7 * lockDurationAmount);
            break;
        case 'month':
            date.setMonth(date.getMonth() + lockDurationAmount);
            break;
        case 'year':
            date.setFullYear(date.getFullYear() + lockDurationAmount);
            break;
    }
    console.log('date epoch ===>', Date.parse(date));
    console.log('date ===>', moment(date).format(DATE_TIME_FORMAT));
   
    return moment(date).format(DATE_TIME_FORMAT);
  }


export const expiryDateWithTime = (expiryTime) => {
    const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss:SSS'; 

    var newDateObj = null;
    if (expiryTime =='30M') {
        newDateObj = moment(new Date()).add(30, 'm').format(DATE_TIME_FORMAT);
        log.debug(`newDateObj.11..22222`);
        
        log.debug(`newDateObj.11111111...${newDateObj}`);
    }
   
    return newDateObj;
    
};

