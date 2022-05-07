import React from 'react'
import { useDrag } from 'react-dnd'
import cs from 'classnames'
// import IrsBaseIcon from '@ant-design/icons'
import { IDragProps } from '../module'
import * as constants from '../constants'
import { FormDesignRootContext } from './context-wrapper'
import { FormDesignSupInfo } from './common'

const DragDiv: React.FC<IDragProps> = React.memo(({ type = constants.BASE, canDrag = true, formDesignPerfixCls, uniquelySign }) => {
    const [, baseDrag, connectDragPreview] = useDrag({
        item: { type, uniquelySign },
        options: {
            dropEffect: "copy"
        },
        canDrag: () => canDrag
    })

    React.useEffect(() => {
        connectDragPreview(document.getElementById(`${formDesignPerfixCls}-faker-perview`))
    }, [formDesignPerfixCls])

    return <><div
        ref={baseDrag}
        className={cs(`${formDesignPerfixCls}-drag-layer`, { [`${formDesignPerfixCls}-drag-disable`]: !canDrag })}
    />
    </>
})

const DragLayout: React.FC<React.PropsWithChildren<IDragProps & { formDesignId: string }>> = React.memo((props) => {
    const { children, type = constants.BASE, uniquelySign, canDrag, title, style, className, formDesignPerfixCls, formDesignId, ...otherProps } = props
    const supInfo = FormDesignSupInfo[formDesignId!]
    const dragId = React.useMemo(() => `${type}_${uniquelySign}`, [type, uniquelySign])
    React.useEffect(() => {
        if (supInfo) {
            supInfo.dndMaskLayerTemplates[uniquelySign] = { id: dragId, uniquelySign, type, name: title, ...otherProps }
        }
    }, [supInfo, dragId])
    return <div className={cs(`${formDesignPerfixCls}-drag-range`, className)} id={dragId} title={title} style={style}>
        <DragDiv type={type} uniquelySign={uniquelySign} canDrag={canDrag} formDesignPerfixCls={formDesignPerfixCls} />
        {children}
    </div>
})

const Drag: React.FC<IDragProps & { info: { name: string, iconClass: string } }> = ({ info, ...dragProps }) => {
    const { formDesignId, formDesignPerfixCls } = React.useContext(FormDesignRootContext)

    return <DragLayout {...info} {...dragProps} title={info.name} formDesignId={formDesignId!} formDesignPerfixCls={formDesignPerfixCls}>
        <div className={`${formDesignPerfixCls}-single-widget-content`}>
            {/* <IrsBaseIcon className={`${formDesignPerfixCls}-single-widget-icon`} type={info.iconClass} /> */}
            <div className={`${formDesignPerfixCls}-single-widget-text`}>
                {info.name}
            </div>
        </div>
    </DragLayout>
}

export const DragLayoutWithContext: React.FC<IDragProps> = (props) => {
    const { formDesignId, formDesignPerfixCls } = React.useContext(FormDesignRootContext)

    return <DragLayout {...props} formDesignId={formDesignId!} formDesignPerfixCls={formDesignPerfixCls} />
}

export default Drag
