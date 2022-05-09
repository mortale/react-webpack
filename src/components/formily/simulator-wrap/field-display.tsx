import * as React from 'react'
import cs from 'classnames'
import { reaction } from '@formily/reactive'
import Input from 'antd/lib/input'
import DatePicker from 'antd/lib/date-picker'
import FormItem from '../setter-pane/register-field/form-item'
import InputNumber from 'antd/lib/input-number'
import Select from 'antd/lib/select'
// import IrsBaseIcon from 'ihr360-web-ui3/packages/base/irs-base-icon'
import { SimulatorWrapContext, SimulatorWrapLayoutContext } from './index'
import { FormDesignDataContext, FormDesignRootContext } from '../basic/context-wrapper'
import { FormDesignSupInfo } from '../basic/common'

const { TextArea } = Input

interface IFieldMarkProps {
  formDesignPerfixCls: string
  mode: string
  supInfo: any
  type: string
}

const FieldMark = React.memo<IFieldMarkProps>(({ formDesignPerfixCls, supInfo, mode, type }) => {
  const { dndMaskLayerTemplates } = supInfo
  const [markLayerInfo, setMarkLayerInfo] = React.useState<any>(dndMaskLayerTemplates[type])
  React.useEffect(() => {
    reaction(() => {
      if (!markLayerInfo) {
        setMarkLayerInfo(dndMaskLayerTemplates[type])
      }
    })
  }, [])
  return <div className={`${formDesignPerfixCls}-field-mark`}>
    {/* {markLayerInfo ? <><IrsBaseIcon type={markLayerInfo.iconClass} />{markLayerInfo.name}</> : null} */}
  </div>
})

const transformProps = (InnerComponents: React.ElementType) => {
  return React.memo(({ fieldInfo }: any) => {
    const { labelCol, wrapperCol } = React.useContext(SimulatorWrapLayoutContext)
    const { mode, SuffixFieldDisplay, SuffixFieldWidth } = React.useContext(SimulatorWrapContext)
    const { formDesignPerfixCls, formDesignId } = React.useContext(FormDesignRootContext)
    const supInfo = FormDesignSupInfo[formDesignId!]
    return <>
      <FieldMark
        formDesignPerfixCls={formDesignPerfixCls!}
        supInfo={supInfo}
        mode={mode}
        type={fieldInfo.type}
      />
      <div style={{ flex: `0 0 ${SuffixFieldWidth}px` }} className={`${formDesignPerfixCls}-field-custom-area`}>
        <SuffixFieldDisplay
          fieldInfo={supInfo.recoverField(fieldInfo)}
          mode={mode}
        />
      </div>
      <FormItem
        labelCol={labelCol}
        wrapperCol={wrapperCol}
        label={fieldInfo.title || " "}
        asterisk={fieldInfo["statusInfo>statusType"] === "EDITABLE" && fieldInfo.required}
        extra={fieldInfo.description}
        wrapperStyle={{ pointerEvents: "none" }}
        style={{ marginBottom: "0" }}
        mode={mode}
      >
        <InnerComponents
          fieldInfo={fieldInfo}
          placeholder={fieldInfo.placeholder}
          disabled={fieldInfo["statusInfo>statusType"] !== "EDITABLE"}
          style={fieldInfo.style || {}}
          className={cs(`${formDesignPerfixCls}-${fieldInfo.type?.replace("_", "-")?.toLocaleLowerCase?.() || 'unknow'}-field`, fieldInfo.className)}
          mode={mode}
        />
      </FormItem>
    </>
  })
}

const TEXT: React.FC<any> = transformProps(({ fieldInfo, ...props }) => <Input {...props} />)

const TEXTAREA: React.FC<any> = transformProps(({ fieldInfo, ...props }) => <TextArea width="100%"  {...props} />)

const DATE: React.FC<any> = transformProps((props) => {
  return <DatePicker width="100%" block={true} {...props} />
})

const NUMBER: React.FC<any> = transformProps(({ fieldInfo, ...props }) => {
  const className = cs('input-number-handler-wrap-contorl', props.className)
  return <InputNumber  {...props} className={className} />
})


const RADIO: React.FC<any> = transformProps(({ fieldInfo, ...props }) => <Select {...props} />)

const UIComponents: any = { TEXT, TEXTAREA, DATE, NUMBER,  RADIO }

const FieldUIComponent: React.FC<{ fieldId: string }> = ({ fieldId }) => {
  const { fieldsMap } = React.useContext(FormDesignDataContext)
  const fieldInfo = fieldsMap[fieldId]
  const FieldDisplay = React.useMemo(() => UIComponents[fieldInfo.type], [fieldInfo.type])
  return <FieldDisplay
    fieldInfo={fieldInfo}
  />
}
const isObject = (data: any) => Object.prototype.toString.call(data) === "[object Object]";
// 扩充字段模拟展示状态
export const expandHandle = (expandFieldsDisplay: { [key: string]: React.ComponentType }) => {
  if (isObject(expandFieldsDisplay)) {
    Object.entries(expandFieldsDisplay).forEach(([key, UIComponent]) => {
      UIComponents[key] = transformProps(UIComponent)
    })
  }
}

export default FieldUIComponent

