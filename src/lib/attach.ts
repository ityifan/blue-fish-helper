import * as _ from 'lodash'

function assginSafe(source: Record<any, any>, extend: string, newData: any) {
  if (extend) {
    const oldData = _.get(source, extend)
    const newSetData = typeof oldData === 'object' ? _.assign(oldData, newData) : newData
    _.set(source, extend, newSetData)
  } else {
    _.assign(source, newData)
  }
}

export default new (class {
  getIds(list: any[], keys: string[]) {
    const key = keys[0] || ''
    const ids = [] as string[]
    if (key)
      _.forEach(list, (v) => {
        const item = _.get(v, key)
        if (typeof item === 'string') ids.push(item)
        else if (Array.isArray(item)) ids.push(...this.getIds(item, keys.slice(1)))
      })
    else
      _.forEach(list, (v) => {
        if (typeof v === 'string') ids.push(v)
      })
    return ids
  }

  setValues(list: any[], dataMap: any, keys: string[], extend = '', defaultValue = {}) {
    const key = keys[0] || ''
    const values = [] as any[]
    if (key)
      _.forEach(list, (v) => {
        const item = _.get(v, key)
        if (typeof item === 'string') {
          assginSafe(v, extend, dataMap[item] || defaultValue)
        } else if (Array.isArray(item)) {
          const newArrayValues = this.setValues(item, dataMap, keys.slice(1), extend, defaultValue)
          if (newArrayValues.length > 0) _.set(v, extend, newArrayValues)
        }
      })
    else
      _.forEach(list, (v) => {
        if (typeof v === 'string') values.push(dataMap[v] || defaultValue)
      })
    return values
  }
})()
