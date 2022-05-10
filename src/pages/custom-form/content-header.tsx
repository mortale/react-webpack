import React from 'react'
import { rootContext } from './context'
import Icon from '../../components/icon'
import ButtonGroup from '../../components/button-group'
interface IProps {
    onChange: (sign: string) => void
}

const dataSource = [{ children: <Icon type="icon-design" />, sign: 'design' },
{ children: <Icon type="icon-json" />, sign: "json" },
{ children: <Icon type="icon-yunhang" />, sign: 'run' }]

const ContentHeader: React.FC<IProps> = ({ onChange }) => {
    const { prefix } = React.useContext(rootContext)

    return <div className={`flex ${prefix}-content-header`}>
        <ButtonGroup
            buttonSize='small'
            dataSource={dataSource}
            onChange={onChange}
        />
    </div>
}

export default ContentHeader