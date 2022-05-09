import React from 'react'
import {
    FormItem,
    Input,
    Select,
    DatePicker,
    NumberPicker
  } from '@formily/antd'

  import { createForm } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'

const SchemaField = createSchemaField({
    components: {
      FormItem,
      Input,
      Select,
      DatePicker,
      NumberPicker
    },
  })
  
  const form = createForm()

  const Form:React.FC<any> = ({schema}) => {
      return <FormProvider form={form}>
      <SchemaField schema={schema} />
    </FormProvider>
  }

  export default Form