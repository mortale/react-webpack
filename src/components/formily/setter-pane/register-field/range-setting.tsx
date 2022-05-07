import * as React from 'react'
import Moment from 'moment'
import Input from 'antd/lib/input'
import DatePicker from 'antd/lib/date-picker'
const { RangePicker: AntdRangePicker } = DatePicker

interface ICommonProps {
  type: string
  value: string[]
  onChange: (value: string[]) => void
  decimal?: number
  suffix?: string
}

// const percentValue = (type: string, v: string, decimal: number) => type === 'percent' && v ? "" + (+v * 100).toFixed(decimal - 2) : v

const transformValue = (v: string) => {
  if (/^\-$/.test(v)) {
    return "0"
  } else if (/\.$/.test(v)) {
    return v.slice(0, v.length - 1)
  } else {
    return null
  }
}

const RangeSetterWithInput: React.FC<ICommonProps> = (props) => {
  const { type, value, onChange, decimal = 2, ...otherProps } = props

  const [cacheValue, setCacheValue] = React.useState(props.value || [])

  const rexExp = React.useMemo(() => new RegExp('^\\-?((0|[1-9][0-9]*)?$|(0|[1-9][0-9]*)(\\.\\d{0,' + decimal + '})?$)'), [decimal])

  const dealWithValue = (index: number, newValue: string) => {
    const targetValue = [...cacheValue]
    if (rexExp.test(newValue)) {
      targetValue[index] = newValue
      return targetValue
    } else {
      return null
    }
  }

  const wapperOnChange = (index: number, e: any) => {
    const newValue = e.target.value
    const targetValue = dealWithValue(index, newValue)
    if (targetValue) {
      const changeValue = [...targetValue]
      setCacheValue(targetValue)
      const correctionValue = transformValue(newValue)
      if (correctionValue) {
        changeValue[index] = correctionValue
      }
      onChange(changeValue)
    }
  }

  const onBlur = () => {
    let [minValue, maxValue] = cacheValue
    minValue = transformValue(minValue) || minValue
    maxValue = transformValue(maxValue) || maxValue
    if (minValue && maxValue && +minValue > +maxValue) {
      setCacheValue([maxValue, minValue])
      onChange([maxValue, minValue])
    }
  }


  return <div className="flex">
    <Input
      // value={edit ? cacheValue[0] : percentValue(type, cacheValue[0], decimal)}
      value={cacheValue[0]}
      onChange={wapperOnChange.bind(null, 0)}
      onBlur={onBlur}
      {...otherProps} />
    ~
    <Input
      // value={edit ? cacheValue[1] : percentValue(type, cacheValue[1], decimal)}
      value={cacheValue[1]}
      onChange={wapperOnChange.bind(null, 1)}
      onBlur={onBlur}
      {...otherProps} />
  </div>
}


const RangePicker: React.FC<ICommonProps & { format?: string }> = (props) => {
  const { value, onChange, format, ...otherProps } = props
  const [cacheValue, setCacheValue] = React.useState(Array.from({ length: 2 }, (el: any, i: number) => props.value[i] && Moment(props.value[i])))

  const rangePickerConfig = React.useMemo(() => {
    const staticConfigs: any = {
      "YYYY": { type: "rangepicker", picker: "year" },
      "YYYY-MM": { type: "rangepicker", picker: "month" },
      "YYYY-MM-DD HH:mm": { type: "rangepicker", showTime: { format: "HH:mm" } },
      "YYYY-MM-DD HH:mm:ss": { type: "rangepicker", showTime: { format: "HH:mm:ss" } }
    }
    const targetConfig = staticConfigs[format!] || { type: "rangepicker" }
    const newValues = value.map((el) => el && Moment(el).format(format))
    onChange(newValues)
    setCacheValue(newValues.map((el: any) => el && Moment(el)))
    return targetConfig
  }, [format])

  const onInputChange = (dates: any, dateStrings: [string, string]) => {
    setCacheValue(dates)
    onChange(dateStrings)
  }

  return <AntdRangePicker
    {...otherProps}
    {...rangePickerConfig}
    block={true}
    value={cacheValue}
    isDefinedValue={true}
    onCalendarChange={onInputChange}
  />
}

interface IProps {
  type: "number" | "rangepicker"
  onChange: (e: any) => void
  onFocus: (e: any) => void
  onBlur: (e: any) => void
  value: string[]
  [key: string]: any
}

// 自定义区间字段
const RangeSetter: React.FC<IProps> = ({ type, onBlur, onFocus, ...otherProps }) => {
  const [RenderComponent] = React.useMemo(() => {
    return [type === "rangepicker" ? RangePicker : RangeSetterWithInput]
  }, [type])

  return <>
    <RenderComponent
      type={type}
      {...otherProps}
    />
  </>
}

export default RangeSetter
// 校验规则
export const rangeSetterValidateRules = (validateData: string[], rule: any, ctx: any) => {
  const [minValue, maxValue] = validateData || []
  if (!minValue || !maxValue) {
    return "该字段是必填字段"
  } else {
    return ""
  }
}

const typeTitleMap: any = {
  "number": "数值",
  "percent": "百分比",
  "rangepicker": "日期"
}
// 联动规则
export const rangeSetterEeactRangeErrorMsg = (field: any) => {
  const [minValue, maxValue] = field.value || []
  const fieldTitle = typeTitleMap[field.componentProps.type]
  const suffix = field.componentProps.suffix || ""
  let newValue = ""
  if (minValue && !maxValue) {
    newValue = `不能低于${fieldTitle}最小值${minValue}${suffix}`
  } else if (!minValue && maxValue) {
    newValue = `不能超出${fieldTitle}最大值${maxValue}${suffix}`
  } else if (minValue && maxValue) {
    newValue = `请输入${minValue}${suffix}~${maxValue}${suffix}的${fieldTitle}`
  }
  return newValue
}