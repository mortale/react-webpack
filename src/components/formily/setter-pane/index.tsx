import * as React from 'react'
import { createForm, Form, onFormInputChange, registerValidateRules, onFieldInputValueChange, onFormMount, Field } from '@formily/core'
import { createSchemaField, FormProvider } from '@formily/react'
import { observable, reaction } from '@formily/reactive'
import scrollIntoView from 'scroll-into-view-if-needed'
import createCommonField, { expandField, createDefaultScope } from './register-field'
import { FormDesignSupInfo, mapSchema } from '../basic/common'
import { FormDesignDataContext, FormDesignRootContext } from "../basic/context-wrapper"
import './style.less'
import { ISetterPaneInteralProps, ISetterPaneOuterProps } from '../module'

const resetSetterPaneSchema = observable.ref(0)
const resetSetterPaneValue = observable.ref(0)

const validateWithScroll = (form: Form) => {
  form.validate().catch(
    ((j: any) => {
      scrollIntoView(document.getElementById(j[0].address) as HTMLElement, {
        scrollMode: "if-needed",
        block: 'nearest',
        inline: 'nearest',
        behavior: "smooth"
      })
    })
  )
}

const DefaultNoData = () => {
  return <div style={{height:'100%',display:'flex',alignItems:"center",justifyContent:"center"}}>请选择需要设置的组件</div>
}

const useFormCoreData = (selectedFieldId: string, fieldsMap: any, supInfo: any, changeField: any) => {
  const fieldInfo = fieldsMap[selectedFieldId] || {}
  const type = fieldInfo?.type
  const [formCore, setFormCore] = React.useState<[any, Form | null]>([{ type: "object", properties: {} }, null])
  const [cacheCite] = React.useState<any>({ selectedFieldId: null })
  const createSchema = React.useCallback((schemaType, curSupInfo, controlFieldsKey: string[] = []) => {
    if (!cacheCite.selectedFieldId || !fieldsMap[cacheCite.selectedFieldId]) {
      return { type: "object", properties: {} }
    }
    const curFieldInfo = curSupInfo.recoverField(cacheCite.formAction.values)
    return mapSchema(curSupInfo.fieldSetterTemplate[schemaType], (key, item, basePath) => {
      if (item.type || item['x-component']) {
        controlFieldsKey.push(basePath.concat(key).toString())
        const contorlParams = { componentProps: item['x-component-props'], enum: item.enum, visible: item["x-visible"] }
        const result = curSupInfo.manualContorlSchema?.(key, contorlParams, curFieldInfo)
        if (result && result !== contorlParams) {
          if (result.enum && Array.isArray(result.enum)) {
            item.enum = result.enum
          }
          if (result.componentProps) {
            item['x-component-props'] = result.componentProps
          }
          if (typeof result.visible === "boolean") {
            item['x-visible'] = result.visible
          }
        }
      }
    })
  }, [])

  const createFormAction = React.useCallback((initialValues, curSupInfo) => createForm({
    initialValues,
    validateFirst: true,
    effects: () => {
      onFormMount((f) => {
        if (curSupInfo.validateWithScrollSign.value === cacheCite.selectedFieldId) {
          curSupInfo.validateWithScrollSign.value = ""
          validateWithScroll(f)
        }
      })
      onFieldInputValueChange("*", (field) => {
        curSupInfo.onFieldChange(field.props.name, field.value)
      })
      onFormInputChange((f) => {
        changeField(cacheCite.selectedFieldId, f.values)
      })
    },
  }), [changeField])

  React.useEffect(() => {
    if (supInfo) {
      reaction(() => supInfo.resetSetterPaneSchema.value, () => {
        const controlFieldsKey: string[] = []
        const newSchema = createSchema(cacheCite.type, cacheCite.supInfo, controlFieldsKey)
        cacheCite.formAction.setFormState((f: any) => {
          controlFieldsKey.forEach((key) => {
            delete f.fields[key]
          })
          setFormCore([newSchema, cacheCite.formAction])
        })
      }, {
        fireImmediately: false
      })
    }
  }, [supInfo])

  React.useEffect(() => {
    if (supInfo) {
      cacheCite.selectedFieldId = selectedFieldId
      cacheCite.type = type
      cacheCite.supInfo = supInfo
      const newFormAction = createFormAction(fieldInfo, supInfo)
      cacheCite.formAction = newFormAction
      const newSchema = createSchema(type, supInfo)
      setFormCore([newSchema, newFormAction])
    }
  }, [selectedFieldId, type, supInfo])

  return formCore
}

const SetterPane: React.FC<ISetterPaneInteralProps> = React.memo(({ createSchemaFieldParams, selectedFieldId, fieldType, fieldsMap, NoData = DefaultNoData, changeField, formDesignId }) => {
  const fieldInfo = fieldsMap[selectedFieldId] || {}

  const supInfo = FormDesignSupInfo[formDesignId]

  const [fakeThisAttr] = React.useState<{ form: any, selectedFieldId: string }>({ form: {}, selectedFieldId })

  const [schema, formAction] = useFormCoreData(selectedFieldId, fieldsMap, supInfo, changeField)

  const FieldSchemaField = React.useMemo(() => {
    Object.assign(createSchemaFieldParams.scope, createDefaultScope(fieldInfo))
    createSchemaFieldParams.scope.$published = fieldInfo.published || false
    return createSchemaField(createSchemaFieldParams)
  }, [createSchemaFieldParams, schema])


  React.useEffect(() => {
    fakeThisAttr.form = formAction
    fakeThisAttr.selectedFieldId = selectedFieldId
  }, [formAction])

  React.useEffect(() => {
    if (supInfo) {
      reaction(() => supInfo.validateWithScrollSign.value, (newValue) => {
        if (newValue === fakeThisAttr.selectedFieldId) {
          supInfo.validateWithScrollSign.value = ""
          validateWithScroll(fakeThisAttr.form)
        }
      })
      // value need change
      reaction(() => supInfo.resetSetterPaneValue.value, (newValue, oldValue) => {
        if (fakeThisAttr.form?.id) {
          fakeThisAttr.form.setValues(fieldsMap[fakeThisAttr.selectedFieldId], "overwrite")
        }
      }, {
        fireImmediately: false
      })
    }

  }, [supInfo])

  return <>
    {fieldType && formAction ?
      <FormProvider form={formAction}>
        <FieldSchemaField schema={schema} />
      </FormProvider>
      : <NoData />}
  </>
}, (pp, np) => {
  return pp.selectedFieldId === np.selectedFieldId && pp.fieldType === np.fieldType && pp.changeField === np.changeField && pp.createSchemaFieldParams === np.createSchemaFieldParams
})

export const SetterPaneLayoutContext = React.createContext({
  labelCol: 8,
  wrapperCol: 16,
  span: 24
})

const SetterPaneWithContext: React.FC<ISetterPaneOuterProps> = (props) => {
  const { expandFields = {}, layout = {}, scope, ...otherProps } = props
  const { formDesignPerfixCls } = React.useContext(FormDesignRootContext)
  const { selectedFieldId, fieldsMap, formDesignId, changeField } = React.useContext(FormDesignDataContext)

  const supInfo = FormDesignSupInfo[formDesignId]

  const createSchemaFieldParams = React.useMemo(() => {
    const options = {
      components: { ...createCommonField(supInfo,formDesignPerfixCls!), ...expandField(supInfo, expandFields) },
      scope: {
        typeEffect(field: Field) {
          const { value } = field
          const { title, description, inheritCode, tips, isNew, id, parId } = field.form.values || {}
          const base = typeof isNew === 'boolean' ? { isNew } : {}
          const { splitDownKeys, ...template } = (supInfo.fieldInfoTemplate || {})[value]
          const newValue = { ...base, ...template, title, description, inheritCode, tips, id, parId }
          changeField("", newValue, true)
        },
        customScope: scope
      }
    }
    // 缓存到supInfo
    FormDesignSupInfo.changeSupInfo(formDesignId, { createSchemaFieldParams: options, resetSetterPaneSchema, resetSetterPaneValue })
    return options
  }, [expandFields, scope, supInfo])

  React.useEffect(() => {
    // 注册自定义检验规则
    registerValidateRules({
      customFieldsRules: (v, r, c) => {
        const curfieldInfo = supInfo.recoverField?.(c.form.values);
        return supInfo.customFieldsRules?.(curfieldInfo, c?.props?.name, v)
      }
    })
  }, [supInfo])

  const SetterPaneLayoutContextValue = React.useMemo(() => Object.assign({
    labelCol: 8,
    wrapperCol: 16,
    span: 24
  }, layout), [layout])

  const fieldType = fieldsMap[selectedFieldId || ""]?.type

  return <SetterPaneLayoutContext.Provider value={SetterPaneLayoutContextValue}>
    <SetterPane
      {...otherProps}
      formDesignId={formDesignId}
      selectedFieldId={selectedFieldId || ""}
      fieldsMap={fieldsMap}
      fieldType={fieldType}
      createSchemaFieldParams={createSchemaFieldParams}
      changeField={changeField}
    />
  </SetterPaneLayoutContext.Provider>
}
export default SetterPaneWithContext