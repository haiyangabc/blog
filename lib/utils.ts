// 写一个格式化时间的函数, 输入一个时间和一个格式, 输出一个格式化后的时间, 例如:
export function formatDate(date: Date, format: string) {
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hour = date.getHours()
  let minute = date.getMinutes()
  let second = date.getSeconds()

  let result = format
  
  result = result.replace('YYYY', year.toString())
  result = result.replace('MM', month.toString().padStart(2, '0'))
  result = result.replace('DD', day.toString().padStart(2, '0'))
  result = result.replace('HH', hour.toString().padStart(2, '0'))
  result = result.replace('mm', minute.toString().padStart(2, '0'))
  result = result.replace('ss', second.toString().padStart(2, '0'))
  return result
}