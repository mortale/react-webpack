import React from 'react'
import { cloneDeep, uniqueId } from 'lodash'
import { observable } from '@formily/reactive'
import { IFormDesignContextProps, IFormDesignRootProps, IFormVoOperations, IFormDesignDataProps, IFormDesignOperationsProps, IDataDeliverProps, IFormDesignProps, ICommonProps, IFormDesignRef } from '../module'
import formDesignDataReducer, { defaultState } from './form-design-reducer'
import { createNewFieldHandle, FormDesignSupInfo } from './common'
import * as constants from '../constants'
/* form design style ctx */
const defaultRootContext = { formDesignPerfixCls: "mortale-form-design", formDesignId: "" }

export const FormDesignRootContext = React.createContext<IFormDesignRootProps>(defaultRootContext)

const RootContextWrapper = (InnerComponent: React.ComponentType<IFormDesignRootProps>) => {
  return React.forwardRef<IFormDesignRef, IFormDesignRootProps>((props, ref) => {
    const { formDesignPerfixCls, ...otherProps } = props
    const rootContextValue = React.useMemo(() => {
      const targetData = { ...defaultRootContext }
      if (formDesignPerfixCls) {
        targetData.formDesignPerfixCls = formDesignPerfixCls
      }
      targetData.formDesignId = uniqueId(`${targetData.formDesignPerfixCls}-`)
      return targetData
    }, [formDesignPerfixCls])

    return <FormDesignRootContext.Provider value={rootContextValue}>
      <InnerComponent
        {...otherProps}
        {...rootContextValue}
        ref={ref} />
    </FormDesignRootContext.Provider>
  })
}

/* form design data ctx */
export const FormDesignDataContext = React.createContext<IFormDesignContextProps>(defaultState as any)

const dataContextWrapper = (InnerComponent: React.ComponentType<Omit<IFormDesignDataProps, "templates"> & IDataDeliverProps>) => {
  // 校验是否结束需要滚动到错误位置
  return React.forwardRef<IFormDesignRef, IFormDesignDataProps & { formDesignId: string }>((props, ref) => {
    const { formVo, templates, fieldFunctionContorl, formDesignId, customFieldAttrWithSetting, customFieldsRules, manualContorlSchema, onFormVoChange, onFieldChange, onChangeValidateInSetter, extendMaskLayers, fieldKey = "id", coustomPerview, ...otherProps } = props
    // formDesign 状态
    const [state, dispatch] = React.useReducer(formDesignDataReducer, cloneDeep(defaultState))

     // 修改FormDesign对应formDesignId的静态数据（此类数据改变不需要引起视图的刷新，如果需要需要走其他操作）
     React.useEffect(() => {
      FormDesignSupInfo.changeSupInfo(formDesignId, {
        fieldFunctionContorl,
        customFieldAttrWithSetting,
        customFieldsRules,
        templates,
        manualContorlSchema,
        onFormVoChange,
        onFieldChange,
        CoustomPerView: coustomPerview
      })
  }, [templates, fieldFunctionContorl, customFieldAttrWithSetting, customFieldsRules, manualContorlSchema, onFormVoChange, onFieldChange, coustomPerview])

    React.useEffect(() => {
      Promise.resolve(FormDesignSupInfo.initSupInfo(formDesignId, {
        fieldFunctionContorl,
        customFieldAttrWithSetting,
        templates,
        customFieldsRules,
        validateWithScrollSign: observable.ref(""),
        manualContorlSchema,
        onFormVoChange,
        onFieldChange,
        onChangeValidateInSetter,
        fieldKey,
        CoustomPerView: coustomPerview,
        extendMaskLayers
      })).then(() => {
        dispatch({ type: constants.INIT_FORMDESIGN, formDesignId })
      }).finally(() => {
        // TODO mount
        if (formVo?.length) {
          dispatch({ type: constants.CHANGE_FORMVO, formVo })
        }
      })
      return () => {
        Promise.resolve(FormDesignSupInfo.deleteSupInfo(formDesignId)).then(() => {
          dispatch({ type: constants.CLEAR_FORMDESIGN })
        }).finally(() => {
          // TODO unmount
        })
      }
    }, [])
   
    // 设置formVo
    React.useEffect(() => {
      const supInfo = FormDesignSupInfo[formDesignId]
      if (supInfo) {
        dispatch({ type: constants.CHANGE_FORMVO, formVo })
      }
      if (state.selectedFieldId) {
        if (supInfo?.resetSetterPaneValue) {
          supInfo.resetSetterPaneValue.value = supInfo.resetSetterPaneValue.value + 1
        }
        if (supInfo?.resetSetterPaneSchema) {
          supInfo.resetSetterPaneSchema.value = supInfo.resetSetterPaneSchema.value + 1
        }
      }
    }, [formVo])
    // 修改单个字段的属性
    const changeField = React.useCallback((fieldId:string, newFieldInfo:string, cover:boolean = false) => {
      dispatch({ type: constants.CHANGE_FIELD, fieldId, newFieldInfo, cover })
    }, [])

    const dataContextValue = React.useMemo(() => ({ ...state, changeField }), [state, changeField])

    return <FormDesignDataContext.Provider value={dataContextValue}>
      <InnerComponent {...otherProps}
        formDesignDataDiepatch={dispatch}
        formDesignState={state}
        formDesignId={formDesignId}
        ref={ref} />
    </FormDesignDataContext.Provider>
  })
}

/* field operations ctx */
export const FieldOperationsContext = React.createContext<IFormVoOperations>({
  placeField: () => Promise.resolve([]),
  moveField: () => { },
  deleteField: () => Promise.resolve(true),
  copyField: () => Promise.resolve([]),
  selectField: () => { }
})

const operationsContextWrapper = (InnerComponent: React.ComponentType<ICommonProps>) => {
  return React.forwardRef<IFormDesignRef, IFormDesignOperationsProps & IDataDeliverProps>((props, ref) => {
    const { formDesignState, formDesignDataDiepatch, placeFieldValidate, createInnerFieldInfo, moveFieldValidate, deleteFieldValidate, copyFieldValidate, createCopyFieldInfo, formDesignId, ...otherProps } = props

    const validateOperation = React.useCallback((noValidate:any, contentInfo:any, operationInfo:any, validateFunc:any) => {
      const supInfo = FormDesignSupInfo[formDesignId]
      const operationField = supInfo.recoverField?.(formDesignState.fieldsMap[operationInfo.id])
      const contentField = supInfo.recoverField?.(formDesignState.fieldsMap[contentInfo.id])
      return Promise.resolve(noValidate || (validateFunc?.({ ...operationField, ...operationInfo }, { ...contentField, ...contentInfo }) ?? true)).then((validateResult) => ({
        validateResult, operationField,
        contentField
      }))
    }, [])

    // 放置事件
    const placeField = React.useCallback(({ type: dropType, ...placeLayerInfo }: any, { type: dragType, ...dragFieldInfo }: any, noValidate: boolean = false) => {
      const supInfo = FormDesignSupInfo[formDesignId]
      // 校验
      return Promise.resolve(validateOperation(noValidate, placeLayerInfo, dragFieldInfo, placeFieldValidate)).then(({ validateResult, operationField, contentField }) => {
        if (validateResult) {
          // 创建新字段内容
          const { splitDownKeys, ...templateField } = cloneDeep(supInfo.fieldInfoTemplate[dragFieldInfo.uniquelySign])
          if (!templateField) {
            console.error(`${dragFieldInfo.uniquelySign}类型字段不存在`);
          }
          return Promise.resolve(createInnerFieldInfo?.(templateField, contentField) || templateField).then((innerField) => {
            const [fields, ids] = createNewFieldHandle(innerField, supInfo);
            formDesignDataDiepatch({ type: constants.PLACE_FIELD, innerField: fields, placeLayerInfo, dragFieldInfo })
            return ids
          })
        } else {
          return []
        }
      })
    }, [placeFieldValidate, createInnerFieldInfo])
    // 移动事件
    const moveField = React.useCallback(({ type: dropType, ...placeLayerInfo }: any, { type: dragType, ...dragFieldInfo }: any, noValidate: boolean = false) => {
      Promise.resolve(validateOperation(noValidate, placeLayerInfo, dragFieldInfo, moveFieldValidate)).then(({ validateResult, operationField, contentField }) => {
        if (validateResult) {
          formDesignDataDiepatch({ type: constants.MOVE_FIELD, placeLayerInfo, dragFieldInfo })
        }
      })
    }, [moveFieldValidate])
    // 删除事件
    const deleteField = React.useCallback((fieldId: string | string[], contentFieldId: string | null, deleteIndex: number | null, e: any, noValidate: boolean = false) => {
      e?.stopPropagation()
      return Promise.resolve(validateOperation(noValidate, { id: contentFieldId }, { id: fieldId }, deleteFieldValidate)).then(({ validateResult, operationField, contentField }) => {
        let dispatchParams: any
        let isBatchDel = false
        if (Array.isArray(validateResult)) {
          if (validateResult?.length) {
            dispatchParams = { fieldId: validateResult }
            isBatchDel = true
          }
        } else if (validateResult) {
          // TODO 内置方法处理需要联动多个字段同时删除的情况
          if (Array.isArray(fieldId) && fieldId?.length) {
            dispatchParams = { deleteIds: fieldId }
            isBatchDel = true
          } else {
            dispatchParams = { fieldId, deleteIndex, contentFieldId }
          }
        }
        return { isBatchDel, dispatchParams }
      }).then(({ isBatchDel, dispatchParams }) => {
        let deleteResult = false
        if (dispatchParams) {
          if (isBatchDel) {
            formDesignDataDiepatch({ type: constants.BATCH_DELETE_FIELD, ...dispatchParams })
          } else {
            formDesignDataDiepatch({ type: constants.DELETE_FIELD, ...dispatchParams })
          }
          deleteResult = true
        }
        return deleteResult
      })
    }, [deleteFieldValidate])
    // 选中事件
    const selectField = React.useCallback((selectId: string, e?: any) => {
      e?.stopPropagation()
      formDesignDataDiepatch({ type: constants.SELECT_FIELD, selectId })
    }, [])
    // 复制事件
    const copyField = React.useCallback((copyFieldId: string, contentFieldId: string | null, innerIndex: number, e: any, noValidate: boolean = false) => {
      e?.stopPropagation()
      const supInfo = FormDesignSupInfo[formDesignId]
      return Promise.resolve(validateOperation(noValidate, { id: contentFieldId }, { id: copyFieldId }, copyFieldValidate)).then(({ validateResult, operationField, contentField }) => {
        if (validateResult) {
          return Promise.resolve(createCopyFieldInfo?.(operationField, contentField) || operationField).then((field) => {
            const [fields, ids] = createNewFieldHandle(field, supInfo);
            formDesignDataDiepatch({
              type: constants.COPY_FIELD,
              contentFieldId,
              innerIndex,
              copyField: fields
            })
            return ids
          })
        } else {
          return []
        }
      })
    }, [validateOperation, copyFieldValidate, createCopyFieldInfo])
    const operationsContextValue = React.useMemo(() => ({ placeField, moveField, deleteField, selectField, copyField }), [])
    return <FieldOperationsContext.Provider value={operationsContextValue}>
      <InnerComponent {...otherProps} ref={ref} />
    </FieldOperationsContext.Provider>
  })
}

type FCType<T> = React.FC<T>
type FCwithCtxType<T> = T extends FCType<infer U> ? U : any
const ContextsWrapper = <T,>(ctxWraps: Array<(InnerComponent: React.ElementType) => React.FC>) => <P extends FCwithCtxType<T>,>(InnerComponent: React.ComponentType<P>) => ctxWraps.reduceRight((acc, ctxWrap) => ctxWrap(acc), InnerComponent)
//@ts-ignore
const FormDesignProviderWrapper = ContextsWrapper<IFormDesignProps>([RootContextWrapper, dataContextWrapper, operationsContextWrapper])

export {
  FormDesignProviderWrapper
}