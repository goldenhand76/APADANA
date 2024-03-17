export function reservedDate(obj) {
    const monthOptions = { month: 'long' };
    const dayOptions = { day: 'numeric'};
    const startDay = new Date(obj.checkin).toLocaleDateString("fa-IR", dayOptions);
    const startMonth = new Date(obj.checkin).toLocaleDateString("fa-IR", monthOptions);
    const endDay = new Date(obj.checkout).toLocaleDateString("fa-IR", dayOptions);
    const endMonth = new Date(obj.checkout).toLocaleDateString("fa-IR", monthOptions);
    return `${startDay + " " + (startMonth === endMonth ? "" : startMonth)} تا ${endDay + " " + endMonth}`;
}

export function formatDate(date) {
    const monthOptions = { month: 'long' };
    const dayOptions = { day: 'numeric' };
    return `${new Date(date).toLocaleDateString("fa-IR", dayOptions) + " " + new Date(date).toLocaleDateString("fa-IR", monthOptions)} `;
}

export function formatDateToJalali(date) {
    const monthOptions = { month: 'long' };
    const dayOptions = { day: 'numeric' };
    const yearOptions = { year: 'numeric' };
    return `${new Date(date).toLocaleDateString("fa-IR", dayOptions) + " " + new Date(date).toLocaleDateString("fa-IR", monthOptions) + " " + new Date(date).toLocaleDateString("fa-IR", yearOptions)} `;
}

export function pageTitleChanged(addText, title) {
    if(title)
        document.title = title;
    else {
        const splitText = document.title.split(" | ");
        const baseText = splitText.length > 1 ? splitText[1] : splitText[0];
        document.title = addText + " | " +  baseText;
    }
}

export function getFilterOrder(search) {
    const queryParam = {};
    const str = search.split("?")[1];
    const parts = str.split("&");
    if(parts.length > 1) {
      let filters = parts[0].split("filters")[1];
      queryParam.filters = filters.split("=")[1];
      let orders = parts[1].split("orders")[1];
      queryParam.orders = orders.split("=")[1];
    }
    else {
      let filters = str.split("filters");
      if(filters[1])
        queryParam.filters = filters[1].split("=")[1];
      let orders = str.split("orders");
      if(orders[1])
        queryParam.orders = orders[1].split("=")[1];
    }
    return queryParam;
}

export function mergedFilterOrderWithURL(data) {
    let url = data.req;
    let orders = [];
    let filters = [];
    let pagerUri;
    if(data.param) {
        const search = data.param.search;
        if(data.param.page)
            pagerUri= `page=${data.param.page}&count=${data.param.count}`;
        if(search) {
            if(search.filters)
                filters = JSON.parse(unescape(search.filters));
            if(search.orders)
                orders = JSON.parse(unescape(search.orders));
        }
        if(data.orders)
            orders = orders.concat(JSON.parse(data.orders));
        if(data.filters)
            filters = filters.concat(JSON.parse(data.filters));
    }

    if(pagerUri || orders.length > 0 || filters.length > 0) {
        url +="?";
        if(pagerUri)
            url += pagerUri;
        if(filters.length > 0) {
            if(url.indexOf("?") > -1)
                url += "&";
            url += "filters="+JSON.stringify(filters);
        }
        if(orders.length > 0) {
            if(url.indexOf("?") > -1)
                url += "&";
            url += "orders="+JSON.stringify(orders);
        }
    }
    return url;
}

function iso7064Mod97_10(iban) {
    var remainder = iban,
        block;
  
    while (remainder.length > 2) {
      block = remainder.slice(0, 9);
      remainder = parseInt(block, 10) % 97 + remainder.slice(block.length);
    }
  
    return parseInt(remainder, 10) % 97;
}

export function validateIranianSheba(str) { 
    var pattern = /ir[0-9]{24}/gi;
    
    if (str.length !== 26) {
        return false;
    }
    
    if (!pattern.test(str)) {
        return false;
    }
    
    var newStr = str.substr(4);
    var d1 = str.charCodeAt(0) - 65 + 10;
    var d2 = str.charCodeAt(1) - 65 + 10;
    newStr += d1.toString() + d2.toString() + str.substr(2, 2);
    
    var remainder = iso7064Mod97_10(newStr);
    if (remainder !== 1) {
        return false;
    }
    
    return true;
}

export function fixNumbers(str) {
    const
        persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g],
        engNumbers  = [/0/g, /1/g, /2/g, /3/g, /4/g, /5/g, /6/g, /7/g, /8/g, /9/g];
    if(typeof str === 'string') {
        for(var i = 0; i < 10; i++) {
            str = str.replace(persianNumbers[i], i).replace(engNumbers[i], i);
        }
    }
    return str;
}

export function compare2Objects(x, y) {
    var p;

    // remember that NaN === NaN returns false
    // and isNaN(undefined) returns true
    if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
         return true;
    }

    // Compare primitives and functions.     
    // Check if both arguments link to the same object.
    // Especially useful on the step where we compare prototypes
    if (x === y) {
        return true;
    }

    // Works in case when functions are created in constructor.
    // Comparing dates is a common scenario. Another built-ins?
    // We can even handle functions passed across iframes
    if ((typeof x === 'function' && typeof y === 'function') ||
       (x instanceof Date && y instanceof Date) ||
       (x instanceof RegExp && y instanceof RegExp) ||
       (x instanceof String && y instanceof String) ||
       (x instanceof Number && y instanceof Number)) {
        return x.toString() === y.toString();
    }

    // At last checking prototypes as good as we can
    if (!(x instanceof Object && y instanceof Object)) {
        return false;
    }

    if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
        return false;
    }

    if (x.constructor !== y.constructor) {
        return false;
    }

    if (x.prototype !== y.prototype) {
        return false;
    }

    // // Check for infinitive linking loops
    // if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
    //      return false;
    // }

    // Quick checking of one object being a subset of another.
    // todo: cache the structure of arguments[0] for performance
    for (p in y) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
        }
        else if (typeof y[p] !== typeof x[p]) {
            return false;
        }
    }

    for (p in x) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
        }
        else if (typeof y[p] !== typeof x[p]) {
            return false;
        }

        switch (typeof (x[p])) {
            case 'object':
            case 'function':

                // leftChain.push(x);
                // rightChain.push(y);

                if (!compare2Objects (x[p], y[p])) {
                    return false;
                }

                // leftChain.pop();
                // rightChain.pop();
                break;

            default:
                if (x[p] !== y[p]) {
                    return false;
                }
                break;
        }
    }

    return true;
}

export function priceTextFormat(price) {
    if(price < 1000000 && price > 1000) {
        return Math.round(price / 1000) + " هزار";
    }
    else if(price >= 1000000) {
        return (price / 1000000 + " میلیون");
    }
    else {
        return price;
    }
}

export function getOrderNumberToText(key) {
    switch (key) {
        case 0:
            return "صفر"
            break;
        case 1:
            return "اول"
            break;
        case 2:
            return "دوم"
            break;
        case 3:
            return "سوم"
            break;
        case 4:
            return "چهارم"
            break;
        case 5:
            return "پنجم"
            break;
        case 6:
            return "ششم"
            break;
        case 7:
            return "هفتم"
            break;
        case 8:
            return "هشتم"
            break; 
        case 9:
            return "نهم"
            break;
        case 10:
            return "دهم"
            break;
        case 11:
            return "یازدهم"
            break;    

    default:
        break;
    }
}

  
const latinToPersianMap = ['۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹', '۰'];
const latinNumbers = [/1/g, /2/g, /3/g, /4/g, /5/g, /6/g, /7/g, /8/g, /9/g, /0/g];

function prepareNumber(input) {
  let string;
  if (typeof input === 'number') {
    string = input.toString();
  } else if (typeof input === 'undefined') {
    string = '';
  } else {
    string = input;
  }

  return string;
}

function latinToPersian(string) {
  let result = string;

  for (let index = 0; index < 10; index++) {
    result = result.replace(latinNumbers[index], latinToPersianMap[index]);
  }

  return result;
}

export function persianNumber(input) {
  return latinToPersian(prepareNumber(input));
}

export function hasPermission(permission, action) {
    if(permission) {
        switch (action) {
            case "List":
                return permission.search;
                break;
            case "New":
                return permission.store;
                break;
            case "Edit":
                return permission.update;
                break;
            case "Delete":
                return permission.delete;
                break;
            default:
                return false;
                break;
        }
    }
    else {
        return false;
    }
}

export function roundDecimal2Digit(number) {
    return Math.round(number * 100) / 100;
}

export function findPermission(permission) {
    const permissions = [
        {
            "name": "role-search",
            "module": "Role",
            "parent": "User",
            "action": "search",
            "url": "User/Role/List",
        }
    ];
    for (let i = 0; i < permissions.length; i++) {
        if(permissions[i]?.name === permission?.name) {
            return permissions[i];
        }
    }
}

export function generatePermissions(list) {
    const permissions = {};
    for (let i = 0; i < list.length; i++) {
        const permission = findPermission(list[i])
        if(!permissions[permission?.parent]) {
            permissions[permission?.parent] = {};
        }
        if(!permissions[permission?.parent][permission?.module]) {
            permissions[permission?.parent][permission?.module] = {};
        }
        permissions[permission?.parent][permission?.module][permission?.action] = true;
    }
    return permissions;
}