import * as dayjs from 'dayjs'
import * as _ from 'lodash'
import attach from './lib/attach'

export default new (class {
  // 附加数据
  // eslint-disable-next-line @typescript-eslint/default-param-last
  async attach(list: any[], key: string, extend = '', worker: (ids: string[]) => Promise<{ [key: string]: any }>, value = {}) {
    const keys = key.split('->')

    // 获取需要的ID列表
    const ids = attach.getIds(list, keys)

    // 根据ID列表通过worker获取数据
    const data = ids.length < 1 ? {} : await worker(ids)

    // 遍历数据，将数据附加到list
    attach.setValues(list, data, keys, extend, value)
  }

  // 延迟执行函数
  async timeout(ms = 0) {
    return await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), ms)
    })
  }

  // 运行代码后安全退出
  run(runner: () => Promise<void>) {
    runner()
      .then(() => process.exit(0))
      .catch((e) => {
        console.error(e)
        process.exit(1)
      })
  }

  // 时间日期格式化
  datetime(format = 'YYYY-MM-DD HH:mm:ss', time?: number) {
    // https://day.js.org/docs/zh-CN/display/format
    return dayjs(time).format(format)
  }

  // try但不报错
  try<T>(work: () => T) {
    try {
      return work()
    } catch (e) { _.noop }
  }

  // 解析成数组，如果已经是数组则直接返回，不是数组则将值放在数组中
  parseArray<T = any>(data: any): T[] {
    return Array.isArray(data) ? data : [data]
  }

  // 解析成排序过的QueryString
  sortQueryString(...data: Array<{ [index: string]: any }>) {
    const qsArray = [] as string[]
    _.forEach(data, (d) => {
      _.forEach(d, (v, k) => {
        const val = typeof v === 'object' ? JSON.stringify(v) : v
        qsArray.push(k + '=' + val)
      })
    })
    qsArray.sort()
    return qsArray.join('&')
  }

  // 列表转换成树形式
  list2tree(list: any[], rootValue: any = '', idKey = 'id', pidKey = 'parentId', childKey = 'child') {
    const temp = {} as any
    const tree = [] as any[]
    list.forEach((item) => {
      temp[item[idKey]] = item
    })
    list.forEach((item) => {
      if (item[pidKey] === rootValue) tree.push(temp[item[idKey]])
      else if (temp[item[pidKey]]) {
        temp[item[pidKey]][childKey] = temp[item[pidKey]][childKey] || []
        temp[item[pidKey]][childKey].push(temp[item[idKey]])
      }
    })
    return tree
  }

  // 列表转成对象形式
  list2object<T>(list: T[], key = 'id') {
    const temp: { [s: string]: T } = {}
    list.forEach((item: any) => {
      const id = item[key] || false
      if (id) temp[id] = item
    })
    return temp
  }

  // 异步遍历循环
  async asyncEach(list: any, iteratee: (item: any, key: string | number) => void) {
    for (const i in list) {
      // eslint-disable-next-line no-prototype-builtins
      if (list.hasOwnProperty(i)) {
        await iteratee(list[i], i)
      }
    }
  }

  // 安全的异步遍历循环
  async asyncEachSafe(list: any, callback: (item: any, key: string | number) => void) {
    for (const i in list) {
      try {
        // eslint-disable-next-line no-prototype-builtins
        if (list.hasOwnProperty(i)) {
          await callback(list[i], i)
        }
      } catch (e) { _.noop }
    }
  }

  // 将所有键转换为camelCase风格
  camelCaseKeys(data: any) {
    if (_.isPlainObject(data)) {
      const result = {} as any
      _.forEach(data, (v, k) => {
        k = _.camelCase(k)
        v = this.camelCaseKeys(v)
        result[k] = v
      })
      return result
    } else if (_.isArray(data)) {
      return _.map(data, (v) => {
        v = this.camelCaseKeys(v)
        return v
      })
    } else return data
  }

  // 将所有键转换为snakeCase风格
  snakeCaseKeys(data: any) {
    if (_.isPlainObject(data)) {
      const result = {} as any
      _.forEach(data, (v, k) => {
        k = _.snakeCase(k)
        v = this.snakeCaseKeys(v)
        result[k] = v
      })
      return result
    } else if (_.isArray(data)) {
      return _.map(data, (v) => {
        v = this.snakeCaseKeys(v)
        return v
      })
    } else return data
  }

  // 判断汉字长度
  stringLength(str: string) {
    // eslint-disable-next-line no-control-regex
    return str.replace(/[^\x00-\xff]/g, '01').length
  }
})()
