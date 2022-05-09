import * as React from 'react'
// import { uniqueId } from 'lodash'
import { FormDesignProvider, } from '../../components/formily'
//@ts-ignore
import { Layout, } from 'antd'
import { IFormDesignRef } from '../../components/formily/module'
import ContentMain from './content-main'
import './index.less'
import {rootContext,formDesignContext} from './context'
const textSchema = require('./field-json/text.json')
const textareaSchema = require('./field-json/textarea.json')
const dateSchema = require('./field-json/date.json')
const numberSchema = require('./field-json/number.json')
const selectSchema = require('./field-json/select.json')



const templates = [
  { TEXT: textSchema },
  { TEXTAREA: textareaSchema },
  { DATE: dateSchema },
  { NUMBER: numberSchema },
  { SELECT: selectSchema }
]

const dataSource = [{
  name: "文本",
  uniquelySign: "TEXT",
}, {
  name: "文本域",
  uniquelySign: "TEXTAREA",
}, {
  name: "日期",
  uniquelySign: "DATE",
}, {
  name: "数值",
  uniquelySign: "NUMBER",
}, {
  name: "选择",
  uniquelySign: "SELECT",
}]


// const CustomArea = (count: any, { fieldInfo }: any) => {
//   const statusInfo = fieldInfo.statusInfo || {}
//   return <>{`statusInfo>statusType:`}{statusInfo['statusType']}<br />
//     {`statusInfo>readonlyInfo:`}{statusInfo['readonlyInfo']}<br />
//     {`statusInfo>hiddenInfo:`}{statusInfo['hiddenInfo']}
//   </>
// }



// const fakeAttr = { reset: 0 }
const Main: React.FC<any> = () => {
  const formDesignRef = React.useRef<IFormDesignRef>({} as IFormDesignRef)
  //@ts-ignore
  const [formVo, setFormVo] = React.useState([])

  const [curTemplates, setCurTemplates] = React.useState<any[]>([])

  React.useEffect(() => {
    setCurTemplates(templates)
    return () => {
      setCurTemplates([])
    }
  }, [])


  return <>
    <Layout style={{ height: "100%", borderBottom: "1px solid #d9d9d9" }}>
      {/* <Header style={{ background: "#fff", borderBottom: "1px solid #d9d9d9" }}>
      </Header> */}
      <formDesignContext.Provider value={{ formDesignRef }}>
        <FormDesignProvider
          templates={curTemplates}
          style={{ flex: 1, overflow: "hidden" }}
          ref={formDesignRef}
          formVo={formVo}
          // fieldKey="inheritCode"
          // createInnerFieldInfo={createInnerFieldInfo}
          // createCopyFieldInfo={createCopyFieldInfo}
        // fieldFunctionContorl={fieldFunctionContorl}
        // customFieldsRules={customFieldsRules}
        // deleteFieldValidate={deleteFieldValidate}
        // manualContorlSchema={manualContorlSchema}
        // onFormVoChange={onFormVoChange}
        // onFieldChange={onFieldChange}
        // onChangeValidateInSetter={onChangeValidateInSetter}
        // extendMaskLayers={{
        //   SA_STAFF_NO: { name: "工号", iconClass: "icon-file-copy", uniquelySign: "SA_STAFF_NO" }
        // }}
        >
          <ContentMain dataSource={dataSource} />
        </FormDesignProvider>
      </formDesignContext.Provider>
    </Layout>
  </>
}

const contextValue = {
  prefix: 'custom-form'
}

const Page: React.FC = () => {
  return <rootContext.Provider value={contextValue}>
    <Main />
  </rootContext.Provider>
}

export default Page;

// const createInnerFieldInfo = (field: any) => {
//   const inheritCode = uniqueId(`A-${Math.random().toString(36).slice(-8)}-`)
//   return { ...field, inheritCode }
// }

// const createCopyFieldInfo = (copyTemplate: any) => {
//   const inheritCode = uniqueId(`a-${Math.random().toString(36).slice(-8)}-`)
//   return { ...copyTemplate, inheritCode }
// }

  // const fakerUnquiely = (fieldsMap: any) => {
  //   setCount(count + 1)
  // }

  // const changeSetterPaneLayout = () => {
  //   const newLayout = layout.labelCol === 24 ? { span: 24, labelCol: 8, wrapperCol: 16 } : { span: 12 }
  //   setLayout(newLayout)
  // }

  // const validate = () => {
  //   formDesignRef.current.validate().then((validatorResult: any) => {
  //     console.log(validatorResult);
  //   })
  // }




  // const setFormVoHandle = () => {
  //   setFormVo(JSON.parse(sessionStorage.getItem("perFormVo") || "[]"))
  // }

// const customFieldsRules = (f: any, key: any, v: any) => {
//   console.log(f, key, v);
//   // if (key === "statusInfo>editableInfo>customInfo") {
//   //   return v === "123" ? "custom error" : ""
//   // }
//   return ""
// }

// const fieldFunctionContorl = (el: any) => {
//   const obj = {
//     canDrag: true,
//     canDel: true,
//     canCopy: true,
//     visible: !el.hidden
//   }
//   return obj;
// }

// const deleteFieldValidate = (operationField: any) => {
//   return [operationField.id]
// }

// const changeFieldInfo = () => {
//   formDesignRef.current.changeFieldInfo("", { title: "111" })
// }


// const onFormVoChange = (type: string) => {
//   // console.log(type);
// }

// const onFieldChange = (key: any, value: any) => {
//   // console.log(key, value);
// }

// const resetSetterPane = () => {
//   ++fakeAttr.reset
//   formDesignRef.current.resetSetterPane()
// }

// const getSelectField = () => {
//   const result = formDesignRef.current.getSelectField()
//   console.log(result);
// }

// const onChangeValidateInSetter = (...params: any) => {
//   return true
// }
// const getFieldsMap = () => {
//   console.log(formDesignRef.current.getFieldsMap());
// }