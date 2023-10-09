/**
 * Returns the given object without circular references.
 * Replaces circular references with the given default value if the number of circular references exceeds the given depth limit.
 * @param {Object} obj - The object to remove circular references from.
 * @param {*} defaultValue - The default value to use for replacing circular references.
 * @param {number} depthLimit - The maximum number of circular references allowed before using the default value.
 * @returns {Object} - The object without circular references.
 */
function replaceCircularReferencesFromObject(obj, defaultValue, depthLimit) {
  const circularReferenceReplacer = new CircularReferenceReplacer(defaultValue, depthLimit);
  const objWithoutCircularReferences = circularReferenceReplacer.replace(obj);
  return objWithoutCircularReferences;
}

class CircularReferenceReplacer {
  #depthLimit;
  #defaultValue;

  /**
   * @param {*} defaultValue - The default value to use for replacing circular references.
   * @param {number} depthLimit - The maximum number of circular references allowed before using the default value.
   */
  constructor(defaultValue, depthLimit) {
    this.#depthLimit = depthLimit;
    this.#defaultValue = defaultValue;
  }

  replace(obj) {
    return this.#replaceRecursively(obj, []);
  }

  #replaceRecursively(obj, ancestors) {
    if (!this.#isJSONObjectOrArray(obj)) {
      return obj;
    }
    if (this.#hasCircularReferences(obj, ancestors) && this.#exceedsDepthLimit(obj, ancestors)) {
      return this.#defaultValue;
    }
    ancestors.push(obj); // push the original reference
    obj = Array.isArray(obj) ? [...obj] : { ...obj };
    for (let key in obj) {
      obj[key] = this.#replaceRecursively(
        obj[key],
        [...ancestors] // copy of ancestors avoiding mutation by siblings
      );
    }
    return obj;
  }

  #hasCircularReferences(obj, ancestors) {
    const hasCircularReferences = ancestors.includes(obj);
    return hasCircularReferences;
  }

  #exceedsDepthLimit(obj, ancestors) {
    const exceedsCircularReferencesLimit = this.#countOccurrences(obj, ancestors) >= this.#depthLimit;
    return exceedsCircularReferencesLimit;
  }

  #countOccurrences(value, array) {
    const count = array.reduce((accumulator, currentValue) => (currentValue === value ? accumulator + 1 : accumulator), 0);
    return count;
  }

  #isJSONObjectOrArray(obj) {
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
}

module.exports = replaceCircularReferencesFromObject;
