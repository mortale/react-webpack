import * as React from 'react'
import { connect, mapProps, JSXComponent } from '@formily/react'
import { Field as FieldType, registerValidateRules } from '@formily/core'
import { SetterPaneLayoutContext } from '../index'
import BaseFormItem from './form-item'
import { FormGroup, SideLine } from './void-fields'
import RangeSetter, { rangeSetterValidateRules, rangeSetterEeactRangeErrorMsg } from './range-setting'
import Input from 'antd/lib/input'
import Select from 'antd/lib/select'
import InputNumber from 'antd/lib/input-number'
import Radio from '../../../radio'
import Checkbox from 'antd/lib/checkbox'
const { TextArea } = Input

const isObject = (data: any) => Object.prototype.toString.call(data) === "[object Object]";
// statusType change effects
const statusTypeChangeEffect = (statusInfo: any, $self: FieldType, linkageFields: any, alisa: string) => {
  const $form = $self.form
  const cacheField = linkageFields[statusInfo.perStatusType || $self.initialValue] || []
  Object.entries(cacheField).forEach(([key, linkageKeys]: [string, any]) => {
    linkageKeys = Array.isArray(linkageKeys) ? linkageKeys : [linkageKeys]
    statusInfo[key] = linkageKeys.reduce((acc: any, next: string) => {
      const curValue = $form.getValuesIn(next)
      if (isObject(curValue)) {
        acc = acc || {}
        Object.assign(acc, curValue)
      } else {
        acc = curValue
      }
      return acc
    }, undefined)
  })
  statusInfo.perStatusType = $self.value
}
// 默认scope
export const createDefaultScope = (fieldInfo: any) => {
  const statusInfo: any = {}
  return { rangeSetterEeactRangeErrorMsg, statusTypeChangeEffect: statusTypeChangeEffect.bind(null, statusInfo), statusInfo }
}
// 默认注册规则 
registerValidateRules({ rangeSetterValidateRules })

type IStateMapper<Props> = {
  [key in keyof FieldType]?: keyof Props | boolean;
} | ((props: Props, field: any) => Props);

const FormItem = React.memo((props) => {
  const layout = React.useContext(SetterPaneLayoutContext)
  return <BaseFormItem {...layout} {...props} />
})

const WrapperComponent = <T extends JSXComponent>(supInfo: any, InnerComponent: T, ...mapPropsParams: Array<IStateMapper<React.ComponentProps<T>>>) => {

  if (mapPropsParams.length) {
    const func = mapPropsParams[mapPropsParams.length - 1]
    if (typeof func === "function") {
      mapPropsParams[mapPropsParams.length - 1] = (props, field) => {
        const result = supInfo.dealWithCustomData?.(props, field)
        return ({ ...func(result, field), ...result })
      } 
    }
  } else {
    mapPropsParams = [(props, field) => supInfo.dealWithCustomData?.(field.data || {}, props)]
  }
  return connect(InnerComponent, mapProps(...mapPropsParams))
}

export const expandField = (supInfo: any = {}, originData: { [key: string]: React.ComponentType }) => {
  //@ts-ignore
  const WrapperComponentBindSupInfo: <T extends JSXComponent>(InnerComponent: T, ...mapPropsParams: Array<IStateMapper<React.ComponentProps<T>>>) => T = WrapperComponent.bind(null, supInfo)

  if (originData && isObject(originData)) {
    return Object.entries(originData).reduce((acc: any, [key, element]) => {
      acc[key] = WrapperComponentBindSupInfo(element)
      return acc
    }, {})
  }
  return {}
}

const createCommonField = (supInfo: any = {}, formDesignPerfixCls: string) => {
  //@ts-ignore
  const WrapperComponentBindSupInfo: <T extends JSXComponent>(InnerComponent: T, ...mapPropsParams: Array<IStateMapper<React.ComponentProps<T>>>) => T = WrapperComponent.bind(null, supInfo)

  const InputWithFormily = WrapperComponentBindSupInfo(Input)

  const SelectWithFormily = WrapperComponentBindSupInfo(({ id, ...props }) => <div id={id}><Select {...props} /></div>, (props, field): any => {
    const id = formDesignPerfixCls + "-" + field.address.entire
    return { options: field.dataSource, id, getPopupContainer: () => document.getElementById(id) }
  })

  const InputNumberWithFormily = WrapperComponentBindSupInfo(({ correctionNumber, ...props }) => <InputNumber {...props} />, (props: any): any => {
    const correctionNumber = props.correctionNumber
    const baseConfig = { className: 'input-number-handler-wrap-contorl' }
    return correctionNumber ? {
      ...baseConfig,
      formatter: (v: string) => +v - correctionNumber, parser: (v: string) => +v + correctionNumber
    } : baseConfig
  })

  const RadioWithFormily = WrapperComponentBindSupInfo(Radio, (props: any, field): any => props.isCompose && { options: field.dataSource })

  const CheckboxWithFormily = WrapperComponentBindSupInfo(Checkbox, { value: "checked" }, (props: any, field): any => props.isCompose ? {} : { composeOpts: field.dataSource, checkedOpts: props.value })

  const TextAreaWithFormily = WrapperComponentBindSupInfo(TextArea)

  const RangeSetterWithFormily = WrapperComponentBindSupInfo(RangeSetter)

  const FormGroupWithFormily = connect(FormGroup)

  const SideLineWithFormily = connect(SideLine)
  return {
    Input: InputWithFormily,
    TextArea: TextAreaWithFormily,
    Select: SelectWithFormily,
    InputNumber: InputNumberWithFormily,
    Radio: RadioWithFormily,
    Checkbox: CheckboxWithFormily,
    FormGroup: FormGroupWithFormily,
    RangeSetter: RangeSetterWithFormily,
    SideLine: SideLineWithFormily,
    FormItem
  }
}

export default createCommonField