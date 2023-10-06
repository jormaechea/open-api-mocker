/**
 * Returns a copy of the given object without circular references.
 * @param {Object} obj - The object to remove circular references from.
 * @param {*} defaultValue - The default value to use for circular references.
 * @param {number} circularReferencesLimit - The maximum number of circular references to allow before using the default value.
 * @param {Array} [ancestors=[]] - An array of ancestor objects to check for circular references.
 * @returns {Object} - A copy of the object without circular references.
 */
function replaceCircularReferencesFromObject(obj, defaultValue, circularReferencesLimit, ancestors = []) {
  obj = getValue(obj, defaultValue, circularReferencesLimit, ancestors);
  if (isObjectJSON(obj)) {
    for (let key in obj) {
      obj[key] = replaceCircularReferencesFromObject(
        obj[key],
        defaultValue,
        circularReferencesLimit,
        [...ancestors] // copy of ancestors avoiding mutation with siblings
      );
    }
  }
  return obj;
}

/**
 * Returns a value without circular references.
 * @param {*} value - The value to check for circular references.
 * @param {*} defaultValue - The default value to return if a circular reference is found.
 * @param {number} circularReferencesLimit - The maximum number of circular references to allow before using the default value.
 * @param {Array} ancestors - An array of ancestors to check for circular references.
 * @returns {*} - The value without circular references.
 */
function getValue(value, defaultValue, circularReferencesLimit, ancestors) {
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  if (ancestors.includes(value)) {
    if (countOccurrences(ancestors, value) >= circularReferencesLimit) {
      return defaultValue;
    } else {
      ancestors.push(value); // push original reference
      return Array.isArray(value) ? [...value] : { ...value };
    }
  }
  ancestors.push(value);
  return value;
}

/**
 * Returns the number of occurrences of a value in an array.
 * @param {Array} array - The array to check for occurrences.
 * @param {*} value - The value to check for occurrences.
 * @returns {number} - The number of occurrences of the value in the array.
 */
function countOccurrences(array, value) {
  const count = array.reduce((accumulator, currentValue) => (currentValue === value ? accumulator + 1 : accumulator), 0);
  return count;
}

/**
 * Returns true if the object is a JSON object.
 * @param {*} obj - The object to check.
 * @returns {boolean} - True if the object is a JSON object.
 */
function isObjectJSON(obj) {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    !(obj instanceof Boolean) &&
    !(obj instanceof Date) &&
    !(obj instanceof Number) &&
    !(obj instanceof RegExp) &&
    !(obj instanceof String)
  );
}

module.exports = replaceCircularReferencesFromObject;
