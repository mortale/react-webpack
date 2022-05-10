import React from 'react'
import { Button, Space } from 'antd'

interface IButtonGroupProps {
    dataSource: any
    buttonSize?: 'small' | 'middle' | 'large'
    size?: 'small' | 'middle' | 'large' | number
    onChange?: (sign: string) => any
}
const ButtonGroup: React.FC<IButtonGroupProps> = React.memo(({ onChange, dataSource, size, buttonSize }) => {
    const [selectId, setSelectId] = React.useState(0)
    const onClick = (id: number, sign: string,e:any) => {
        e.stopPropagation()
        setSelectId(id)
        onChange?.(sign)
    }
    return <Space size={size || 0}>
        {
            dataSource.map(({ children, sign, ...props }:any, i:number) => <Button
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
export default ButtonGroup