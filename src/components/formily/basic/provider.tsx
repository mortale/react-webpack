import * as React from 'react'
import cs from 'classnames'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend';
import { validate, submit, getFieldsMap, FormDesignSupInfo } from './common'
import { FormDesignProviderWrapper, FormDesignDataContext, FieldOperationsContext, FormDesignRootContext } from './context-wrapper'
import DragPerview from './perview'
import * as constants from '../constants'
import './index.less'
import { IFormDesignProps } from '../module';


const FormDesignProvider: React.FC<IFormDesignProps> = React.forwardRef((props, ref) => {
  const rootState = React.useContext(FormDesignRootContext)
  const dataState = React.useContext(FormDesignDataContext)
  const operationFuncs = React.useContext(FieldOperationsContext)
  const canRender = React.useMemo(() => FormDesignSupInfo[dataState.formDesignId]?.mounted, [dataState.formDesignId])
  React.useImperativeHandle(ref, () => {
    const supInfo = FormDesignSupInfo[dataState.formDesignId] || {}
    const { recoverField, resetSetterPaneSchema, resetSetterPaneValue } = supInfo
    /** 
     * add field 
     */
    const addField = (uniquelySign: string, depandFieldId: string | null = dataState.selectedFieldId, noValidate: boolean = true) => {
      const dragFieldInfo = { type: constants.BASE, uniquelySign }
      const depandField = dataState.fieldsMap[depandFieldId || ""]
      let placeLayerInfo: any = {
        contentFieldId: null,
        dropIndex: null,
        id: "",
        type: "BASE"
      }
      if (depandField) {
        const contentFieldId = depandField.parId
        const operationContent = contentFieldId ? (dataState.nestedFieldPostions[contentFieldId] || []) : dataState.outerFieldPostions
        let dropIndex = operationContent.findIndex((el: any) => el.id === depandFieldId)
        dropIndex = dropIndex > -1 ? dropIndex + 1 : operationContent.length
        placeLayerInfo = {
          contentFieldId,
          dropIndex,
          id: depandFieldId,
          type: "BASE"
        }
      }
      return operationFuncs.placeField(placeLayerInfo, dragFieldInfo, noValidate)
    }
    /**
     * delete fields 
     */
    const deleteField = (deleteFieldId: string | string[], noValidate: boolean = true) => {
      const params: [string | string[], string | null, number | null] = [deleteFieldId, null, null]
      if (typeof deleteFieldId === "string") {
        const contentFieldId = dataState.fieldsMap[deleteFieldId]?.parId || null
        // const operationContent = contentFieldId ? (state.nestedFieldPostions[contentFieldId] || []) : state.outerFieldPostions
        // let deleteIndex = operationContent.findIndex((el: any) => el.id === deleteFieldId)
        // deleteIndex = deleteIndex > -1 ? deleteIndex + 1 : operationContent.length
        params[1] = contentFieldId
        // params[2] = deleteIndex
      }
      return operationFuncs.deleteField(...params, null, noValidate)
    }
    // 获取当前选中字段id
    const getSelectFieldId = () => dataState.selectedFieldId

    const resetSetterPane = () => {
      resetSetterPaneValue.value = resetSetterPaneValue.value + 1
      resetSetterPaneSchema.value = resetSetterPaneSchema.value + 1
    }

    const changeFieldInfo = (fieldId: string, newField: any, cover?: boolean) => {
      if (fieldId) {
        const { outerFieldPostions, nestedFieldPostions, fieldsMap } = dataState
        const parId = fieldsMap[fieldId]?.parId
        const { visible } = (parId ? nestedFieldPostions[parId] : outerFieldPostions).filter((el: any) => el.id === fieldId)[0] || {}
        newField = visible ? supInfo.transformField(newField) : newField
      }
      dataState.changeField(fieldId, newField, cover || false)
      if (!fieldId || fieldId === dataState.selectedFieldId) {
        resetSetterPaneValue.value = resetSetterPaneValue.value + 1
      }
    }

    const getSelectField = () => recoverField(dataState.fieldsMap[dataState.selectedFieldId || ""])

    const scrollToErrorParams = (rejectPromise: any) => {
      let firstErrorFlieldId = ""
      return rejectPromise.catch((j: any[]) => {
        const [[key]]: Array<[string, any]> = Object.entries(j[0])
        firstErrorFlieldId = key
        throw j
      }).finally(() => {
        if (firstErrorFlieldId) {
          operationFuncs.selectField?.(firstErrorFlieldId)
          supInfo.validateWithScrollSign.value = firstErrorFlieldId
        }
      })
    }

    return {
      validate: () => scrollToErrorParams(validate(dataState, supInfo)),
      submit: () => scrollToErrorParams(submit(dataState, supInfo)),
      getFieldsMap: getFieldsMap.bind(null, dataState, recoverField),
      setSelectFieldId: operationFuncs.selectField,
      getSelectFieldId,
      getSelectField,
      deleteField,
      addField,
      changeFieldInfo,
      resetSetterPane
    }
  }, [dataState, operationFuncs])

  return <DndProvider backend={HTML5Backend}>
    <div className={cs(rootState.formDesignPerfixCls, props.className)} style={props.style}>
      {canRender && props.children}
    </div>
    <DragPerview
      formDesignPerfixCls={rootState.formDesignPerfixCls}
      formDesignId={dataState.formDesignId}
      fieldsMap={dataState.fieldsMap}
    />
  </DndProvider>
})

export default FormDesignProviderWrapper(React.memo(FormDesignProvider))