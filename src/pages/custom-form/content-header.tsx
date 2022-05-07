import React from 'react'
import {rootContext} from './context'
import Icon from '../../components/icon'
import { Button, Space } from 'antd'
interface IButtonGroupProps {
    dataSource: any[]
    buttonSize?: 'small' | 'middle' | 'large'
    size?: 'small' | 'middle' | 'large' | number
    onChange?: (sign: string) => any
}
const ButtonGroup: React.FC<IButtonGroupProps> = React.memo(({ onChange, dataSource, size, buttonSize }) => {
    const [selectId, setSelectId] = React.useState(0)
    const onClick = (id: number, sign: string) => {
        setSelectId(id)
        onChange?.(sign)
    }
    return <Space size={size || 0}>
        {
            dataSource.map(({ children, sign, ...props }, i) => <Button
                size={buttonSize}
                key={sign}
                {...props}
                style={i === selectId ? { cursor: "default" } : {}}
                disabled={i === selectId}
                onClick={onClick.bind(null, i, sign)}
            >
                {children}
            </Button>)
        }
    </Space>
})

interface IProps {
    onChange: (sign: string) => void
}

const ContentHeader: React.FC<IProps> = ({ onChange }) => {
    const { prefix } = React.useContext(rootContext)

    return <div className={`flex ${prefix}-content-header`}>
        <ButtonGroup
            buttonSize='small'
            dataSource={[{ children: <Icon type="icon-design" />, sign: 'design' }, { children: <Icon type="icon-json" />, sign: "json" }]}
            onChange={onChange}
        />
    </div>
}

export default ContentHeader