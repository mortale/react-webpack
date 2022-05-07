import * as React from 'react'
import Row from 'antd/lib/row'
import { FormDesignRootContext } from '../../basic/context-wrapper'

interface IProps {
  title: string
  supContent: React.ComponentType
}

export const FormGroup: React.FC<IProps> = ({ title, supContent: SupContent = () => null, children }) => {
  const { formDesignPerfixCls } = React.useContext(FormDesignRootContext)
  return <>
    <div className={`${formDesignPerfixCls}-form-group-title`}>
      {title}
      <SupContent />
    </div>
    <Row>
      {children}
    </Row>
  </>
}

export const SideLine: React.FC = () => {
  const { formDesignPerfixCls } = React.useContext(FormDesignRootContext)
  return <div className={`${formDesignPerfixCls}-side-line`} />
}
