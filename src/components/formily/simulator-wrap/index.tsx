import * as React from 'react'
import Row  from 'antd/lib/grid/row'
import Drop from '../basic/drop'
import { FormDesignDataContext, FormDesignRootContext } from '../basic/context-wrapper'
import FieldUIComponent, { expandHandle } from './field-display'
import './style.less'
import { ISimulatorWrapProps } from '../module'

const DefaultNoData = () => {
  return <div style={{display:"flex",height:'100%',justifyContent:"center",alignItems:"center"}}>请从左边拖入一个组件</div>
}

const FieldGroupContent: React.FC<any> = React.memo(({ fieldGroupData, contentFieldId, selectedFieldId }) => {
  const groupLength = fieldGroupData.length - 1
  return <Row>
    {fieldGroupData.map(({ id: fieldId, ...functionContorl }: any, i: number) => {
      if (typeof functionContorl.visible === "boolean" && !functionContorl.visible) {
        return null
      }
      return <Drop
        key={fieldId}
        isFirstField={!i}
        isLastField={i === groupLength}
        index={i}
        contentFieldId={contentFieldId}
        fieldId={fieldId}
        isSelected={selectedFieldId === fieldId}
        {...functionContorl}
      >
        <FieldUIComponent fieldId={fieldId} />
      </Drop>
    })}
  </Row>
})

/** 
 * 字段组渲染
 * @param mode 移动端和web端展示的样式标记
 * @param groupId 当前字段组的id 最外层为null 嵌套层为自身id 
 */
const DropFieldGroup: React.FC<any> = React.memo(({ contentFieldId, fieldGroupData, selectedFieldId, customNoData = null }) => {
  return <Drop
    isDropContent={true}
    contentFieldId={contentFieldId}
  >
    {fieldGroupData?.length ?
      <FieldGroupContent
        contentFieldId={contentFieldId}
        fieldGroupData={fieldGroupData}
        selectedFieldId={selectedFieldId}
      /> : customNoData}
  </Drop>
})

export const DropFieldGroupWithContext: React.FC<any> = ({ contentFieldId, customNoData }) => {
  const { outerFieldPostions, nestedFieldPostions, selectedFieldId } = React.useContext(FormDesignDataContext)
  const fieldGroupData = contentFieldId ? nestedFieldPostions[contentFieldId] : outerFieldPostions
  return <DropFieldGroup
    contentFieldId={contentFieldId}
    selectedFieldId={selectedFieldId}
    fieldGroupData={fieldGroupData}
    customNoData={customNoData}
  />
}

export const SimulatorWrapContext = React.createContext({ mode: "web", SuffixFieldDisplay: (props: any) => <></>, SuffixFieldWidth: 84 })

export const SimulatorWrapLayoutContext = React.createContext({ labelCol: 8, wrapperCol: 16 })

const SimulatorWrap: React.FC<ISimulatorWrapProps> = (props) => {
  const { formDesignPerfixCls } = React.useContext(FormDesignRootContext)
  const SimulatorWrapLayoutContextValue = React.useMemo(() => Object.assign({ labelCol: 8, wrapperCol: 16 }, props.layout), [props.layout])

  const SimulatorWrapContextValue = React.useMemo(() => Object.assign({}, { mode: props.mode || "web", SuffixFieldDisplay: (props.SuffixFieldDisplay as any) || (() => <></>) as React.ComponentType, SuffixFieldWidth: props.SuffixFieldWidth || 84 }), [props.SuffixFieldWidth, props.SuffixFieldDisplay, props.mode])

  React.useEffect(() => {
    expandHandle(props.expendFieldSimulate!)
  }, [props.expendFieldSimulate])

  return <SimulatorWrapContext.Provider value={SimulatorWrapContextValue}>
    <SimulatorWrapLayoutContext.Provider value={SimulatorWrapLayoutContextValue}>
      <div className={`${formDesignPerfixCls}-simulator-content`}>
        <DropFieldGroupWithContext
          contentFieldId={null}
          customNoData={props.noData || <DefaultNoData />}
        />
      </div>
    </SimulatorWrapLayoutContext.Provider>
  </SimulatorWrapContext.Provider>
}

export default SimulatorWrap