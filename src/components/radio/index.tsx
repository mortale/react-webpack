import React from 'react'
import Radio from 'antd/lib/radio'
const RadioGroup = Radio.Group

interface Iprops {
    isCompose?: boolean
    checkText?: string
    options: string[] | number[] | Array<{ label: string, value: string, disabled?: boolean }>
}

const RadioCombination: React.FC<Iprops> = (props) => {
    const { isCompose, checkText, children, options, ...otherProps } = props
    return isCompose ?
        <RadioGroup options={options} {...otherProps} />
        : <Radio {...otherProps}>
            {checkText || children}
        </Radio>
}

export default RadioCombination