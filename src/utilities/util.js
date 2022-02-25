import _ from "lodash";
import { version } from "../../package.json";

/** compare two objects by checking specified fields */
const compareValues = (old, current, fields = []) => {
  const changeInfo = {};

  const isNull = (value) => !value && value !== '';

  for (let field of fields) {
    const oldValue = _.get(old, field);
    const currentValue = _.get(current, field);

    if (oldValue === currentValue) {
      continue;
    }

    if (!isNull(oldValue) && !isNull(currentValue)) {
      changeInfo[field] = 'updated';
    } else if (isNull(oldValue)) {
      changeInfo[field] = 'inserted';
    } else {
      changeInfo[field] = 'removed';
    }
  }

  return changeInfo;
}

/** 
 * compare two object by id
 * obj1: old object and always have _id
 * obj2: new object and may not have _id
 */
const compareIDs = (obj1, obj2, idPath = '_id') => {
  let keyReferences = {}, inserted = [], removed = [];

  const ID2Key = {};
  for (let key in obj1) {
    ID2Key[_.get(obj1[key], idPath)] = key;
  }

  for (let key in obj2) {
    const id = _.get(obj2[key], idPath);
    if (!id || !ID2Key[id]) {
      inserted.push(key);
    } else {
      keyReferences[ID2Key[id]] = key;
      delete ID2Key[id];
    }
  }

  removed = Object.values(ID2Key);

  return {
    keyReferences,
    inserted,
    removed
  }
}

const upgradeVersion = (current, increase) => {
  const version = current.split('.');
  increase.split('.').forEach((value, index) => {
    version[index] = Number(version[index]) + Number(value);
  });

  return version.join('.');
}

const compareVersion = (version1, version2) => {
  const ver1 = version1.split('.');
  const ver2 = version2.split('.');

  for (let i = 0; i < 2; i++) {
    if (Number(ver1[i]) < Number(ver2[i])) return -1;
    if (Number(ver1[i]) > Number(ver2[i])) return 1;
  }

  return 0;
}

export const getVersion = () => {
  return version;
}

export const getTextBetweenBrackets = (str) => {
  const reBrackets = /\[\[(.*?)\]]/g;
  const listOfText = [];
  let found;
  while (found = reBrackets.exec(str)) {
    listOfText.push(found[1]);
  };
  return listOfText;
};

const inputTypes = [
  'radio',
  'checkbox',
  'slider',
  'text',
  'ageSelector',
  'date',
  'timeRange'
]

export const checkItemVariableName = (text, activity, itemIndex) => {
  let found = false;
  try {
    const variableNames = getTextBetweenBrackets(text);
    if (variableNames && variableNames.length) {
      for (const variableName of variableNames) {
        const item = _.findIndex(activity.items, { name: variableName });
        found = item > -1;
        if (item > -1 && (!inputTypes.includes(activity.items[item].inputType) || item === itemIndex))
          return { valid: item === itemIndex ? {} : true, found };
      };
    }
  } catch (error) {
    console.warn(error)
  }
  return { valid: false, found };
}

export const checkItemVariableNameIndex = (text, activity) => {
  try {
    const variableNames = getTextBetweenBrackets(text);
    if (variableNames && variableNames.length) {
      for (const variableName of variableNames) {
        const index = _.findIndex(activity.items, { name: variableName });
        if (index > -1 && inputTypes.includes(activity.items[index].inputType))
          return index;
      };
    }
  } catch (error) {
    console.warn(error)
  }
  return -1;
}

export default {
  compareValues,
  compareIDs,
  upgradeVersion,
  compareVersion,
}