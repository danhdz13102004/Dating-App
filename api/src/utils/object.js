function deepFreeze(value) {
  // Track processed objects to avoid circular references
  const processed = new WeakSet()

  function freeze(item) {
    // Skip primitive types (not objects or null)
    if(item === null || typeof item !== 'object') {
      return item
    }
    
    if(processed.has(item)) {
      return item
    }
    
    processed.add(item)
    
    // Special handling for built-in object types
    if(item instanceof Date || item instanceof RegExp || item instanceof Function) {
      return Object.freeze(item)
    }
    
    if(item instanceof Map) {
      // Process each key-value pair in the Map
      for (const [key, val] of item.entries()) {
        const frozenKey = freeze(key)
        const frozenVal = freeze(val)
        
        // Replace entry ifeither key or value changed during freezing
        if(key !== frozenKey || val !== frozenVal) {
          item.delete(key)
          item.set(frozenKey, frozenVal)
        }
      }
      return Object.freeze(item)
    }
    
    if(item instanceof Set) {
      // Process each value in the Set
      const values = Array.from(item)
      item.clear()
      for (const val of values) {
        item.add(freeze(val))
      }
      return Object.freeze(item)
    }
    
    if(Array.isArray(item)) {
      // Recursively freeze array elements
      for (let i = 0; i < item.length; i++) {
        item[i] = freeze(item[i])
      }
    } else {
      // Recursively freeze object properties
      Object.getOwnPropertyNames(item).forEach(prop => {
        const descriptor = Object.getOwnPropertyDescriptor(item, prop)
        if(descriptor && descriptor.writable) {
          item[prop] = freeze(item[prop])
        }
      })
      
      // Don't forget about Symbol properties
      Object.getOwnPropertySymbols(item).forEach(sym => {
        const descriptor = Object.getOwnPropertyDescriptor(item, sym)
        if(descriptor && descriptor.writable) {
          item[sym] = freeze(item[sym])
        }
      })
    }
    
    // Apply final freeze to the object itself
    return Object.freeze(item)
  }
  
  return freeze(value)
}

module.exports = {
  deepFreeze,
}