import React, { useState } from 'react'
import cs from 'classnames'
import { Button, Modal, Tree, Input } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { observable } from '@formily/reactive'
import { Observer } from "@formily/reactive-react"
import { rootContext } from './context'

const unquiedId = Symbol()

const recovedObject = (data: any) => data.reduce((acc: any, [key, value]: any) => {
    if (key) {
        acc[key] = value
    }
    return acc
}, {})

const ParamsSetter: React.FC<any> = React.forwardRef(({ data, prefix, onChange }, ref) => {
    const cacheData = React.useMemo<any[]>(() => Object.entries(data || {}), [data])
    const [listLength, setListLength] = useState({ length: cacheData.length })
    const unquiedKey = React.useMemo(() => data?.value || Math.random().toString(36).slice(-8), [data])

    React.useImperativeHandle(ref, () => ({
        addParams: () => {
            cacheData.push([])
            setListLength({ length: listLength.length + 1 })
        },
        submit: () => recovedObject(cacheData)
    }), [listLength])

    React.useEffect(() => {
        setListLength({ length: cacheData.length })
        return () => {
            onChange(recovedObject(cacheData))
        }
    }, [data])

    const onKeyChange = (i: number, e: any) => {
        cacheData[i][0] = e.target.value
    }

    const onValueChange = (i: number, e: any) => {
        if (cacheData[i][0] === 'label') {
            const index = cacheData.findIndex(([key]) => key === 'label')
            if (i === index) {
                data.label = e.target.value
            }
        }
        cacheData[i][1] = e.target.value
    }

    const deleteClick = (i: number, e: any) => {
        e.stopPropagation()
        cacheData.splice(i, 1)
        setListLength({ length: cacheData.length })
    }

    return !cacheData.length ? <span>请先选择左侧树节点</span> : <div>
        {Array.from(listLength).map((el: any, i: number) => {
            const [key, value] = cacheData[i]
            return <div key={unquiedKey + i} className={`${prefix}-params-setter`}>
                <div>
                    键名：
                    <Input defaultValue={key} onChange={onKeyChange.bind(null, i)} />
                </div>
                <div>
                    键值：
                    <Input defaultValue={value} onChange={onValueChange.bind(null, i)} />
                </div>
                <span onClick={deleteClick.bind(null, i)}>
                    <DeleteOutlined />
                </span>
            </div>
        })}
    </div>
})

const SingleContent: React.FC<any> = (props) => {
    const { title, addBtnText, className, prefix, children, addItem = () => void 0 } = props

    return <div className={cs(`${prefix}-common`, className)}>
        <div className={`${prefix}-common-header`}>
            <span>{title}</span>
            <Button type="text" onClick={addItem}>{addBtnText}</Button>
        </div>
        <div className={`${prefix}-common-content`}>
            {children}
        </div>
    </div>
}

const leftContentProps = {
    title: "可选项节点树",
    addBtnText: <><PlusOutlined />新增节点</>,
}
const rightContentProps = {
    title: "节点属性",
    addBtnText: <><PlusOutlined />增加键值对</>,

}

const DataSourceSetter: React.FC<any> = React.forwardRef(({ originData }, ref) => {
    const { prefix } = React.useContext(rootContext)
    const dataSourcePrefix = `${prefix}-data-source-setter-layout`
    const [treeData, setTreeData] = useState<any>(originData)
    const treeDataMap = React.useMemo<any>(() => originData.reduce((acc: any, next: any) => {
        acc[next[unquiedId]] = next
        return acc
    }, {}), [originData])
    const [selectId, setSelectId] = useState<any>(null)
    const rightRef = React.useRef<any>(null)

    React.useImperativeHandle(ref, () => ({
        submit: () => {
            if (selectId) {
                treeDataMap[selectId] = rightRef.current.submit()
            }
            return Object.values(treeDataMap).map((el: any) => ({ ...el }))
        }
    }), [selectId])


    const leftAddItem = () => {
        const value = `${Math.random().toString(36).slice(-8)}`
        const label = `选项${treeData.length + 1}`
        const newItem = { label, [unquiedId]: value }
        treeDataMap[value] = observable({ label, value })
        setTreeData([...treeData, newItem])
    }

    const onDrop = (info: any) => {
        const { dragNode, dropPosition } = info
        const dragPosition = +dragNode.pos.split("-")[1]
        const dragItem = treeData[dragPosition]
        const newTreeData = treeData.reduce((acc: any, next: any, i: number) => {
            if (i === dragPosition) {
            } else if (i + 1 === dropPosition) {
                acc.push(next, dragItem)
            } else {
                acc.push(next)
            }
            return acc
        }, [])
        if (dropPosition < 0) {
            newTreeData.unshift(dragItem)
        }
        setTreeData(newTreeData)
    }

    const deleteClick = (key: string, e: any) => {
        e.stopPropagation()
        setTreeData(treeData.filter((el: any) => el.key !== key))
        delete treeDataMap[key]
    }

    const titleRender = (nodeData: any) => {
        return <>
            <div className={`flex ${dataSourcePrefix}-tree-node`}>
                <Observer>
                    {() => <span>{treeDataMap[nodeData[unquiedId]]?.label || '默认标题'}</span>}
                </Observer>
                <span onClick={deleteClick.bind(null, nodeData[unquiedId])} className="tree-node-delete-handler"><DeleteOutlined /></span>
            </div>
        </>
    }

    const onSelect = (key: any, e: any) => {
        setSelectId(key[0])
    }

    const rigthAddItem = () => {
        rightRef.current?.addParams()
    }

    const onChange = (newData: any) => {
        if (selectId) {
            treeDataMap[selectId] = observable(newData)
        }
    }

    return <div className={`flex ${dataSourcePrefix}`}>
        <SingleContent
            {...leftContentProps}
            className={`${dataSourcePrefix}-left`}
            prefix={`${dataSourcePrefix}`}
            addItem={leftAddItem}
        >
            <Tree
                fieldNames={{
                    title: 'label',
                    key: unquiedId as any
                }}
                treeData={treeData}
                blockNode={true}
                showLine={{ showLeafIcon: false }}
                draggable
                onDrop={onDrop}
                titleRender={titleRender}
                onSelect={onSelect}
            />
        </SingleContent>
        <SingleContent
            {...rightContentProps}
            className={`${dataSourcePrefix}-right`}
            prefix={`${dataSourcePrefix}`}
            addItem={rigthAddItem}
        >
            <ParamsSetter
                ref={rightRef}
                data={treeDataMap[selectId]}
                prefix={dataSourcePrefix}
                onChange={onChange}
            />
        </SingleContent>
    </div>
})

const ModalContorl: React.FC<any> = (props) => {
    const { text } = props
    const [visible, setVisible] = React.useState(false)
    const originData = React.useMemo(() => (props.value || []).map((el: any) => ({ ...el, [unquiedId]: Math.random().toString(36).slice(-8) })), [props.value])
    const dataSourceRef = React.useRef<any>(null)
    const onClick = (e: any) => {
        e.stopPropagation()
        setVisible(true)
    }
    const onOk = () => {
        const result = dataSourceRef.current.submit()
        props.onChange(result)
        setVisible(false)
    }
    return <>
        <Button onClick={onClick}>{text}</Button>
        <Modal
            visible={visible}
            onCancel={setVisible.bind(null, false)}
            title={text}
            width={800}
            destroyOnClose
            onOk={onOk}
        >
            <DataSourceSetter originData={originData} ref={dataSourceRef} />
        </Modal>
    </>
}

export default ModalContorl