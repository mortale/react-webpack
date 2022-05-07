import * as React from 'react'
// import cs from 'classnames'
// import { Ihr3ConfigConsumer } from 'ihr360-web-ui3/packages/config-provider'
import Col  from 'antd/lib/grid/col'
import BaseFormItem from './form-item.js'
import './style.js'
class FormItem extends React.Component<any, any> {
  constructor(props: any) {
    super(props)
  }
  render() {
    const { span, labelCol, wrapperCol, className, ...otherProps } = this.props
    return <Col span={span || 24}>
      {/* <Ihr3ConfigConsumer> */}
        {/* {(context: any) => { */}
          <BaseFormItem
            antPrefixCls={"ant"}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            colon={labelCol !== 24}
            labelAlign={labelCol !== 24 ? "right" : "left"}
            // className={cs(`${context.antPrefixCls || "ant4"}-row ${context.ihrPrefixCls || "ihr3"}-row`, className)}
            className={className}
            {...otherProps} />
        {/* }} */}
      {/* </Ihr3ConfigConsumer> */}
    </Col>
  }
}

export default FormItem