import * as  React from 'react'
import cs from 'classnames'
import memoized from 'memoize-one';
import { useDrag, useDrop } from 'react-dnd'
import { DeleteOutlined, CopyOutlined } from '@ant-design/icons'
import { FieldOperationsContext, FormDesignRootContext } from './context-wrapper'
import * as constants from '../constants'
import { IDropProps } from '../module'

// memo
const funcMemo = memoized((targetFunc: any, ...params: any) => (...otherParams: any) => targetFunc(...params, ...otherParams)
)

enum postions {
    top = "top",
    bottom = "bottom",
    left = "left",
    right = "right",
    none = ""
}

const useDnd = (isDropContent: boolean, { placeField, moveField, selectField, type, accept, canDrag = true, formDesignPerfixCls }: {
    placeField: (dragField: any, dropField: any, noValidate?: boolean) => Promise<string[]>,
    moveField: (dragField: any, dropField: any, noValidate?: boolean) => void,
    selectField: (fieldId: string) => void,
    type: string,
    accept: string | string[]
    canDrag?: boolean,
    formDesignPerfixCls?: string
}, { contentFieldId, fieldId, index, }: any): [React.MutableRefObject<any>, boolean, { show: boolean, sign: postions }] => {

    const [locationMarker, setLocationMarker] = React.useState<{ show: boolean, sign: postions }>({ show: false, sign: postions.none })

    const ref = React.useRef<any>(null)

    const [dragCollectData, connectDrag, connectDragPreview] = useDrag({
        item: { type, id: fieldId, contentFieldId, dragIndex: index },
        canDrag,
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        })
    })

    const getArea = React.useCallback((eventPostions: { [key in "x" | "y"]: number }, contentInfo: DOMRect) => {
        const { top, height, bottom } = contentInfo
        const { y } = eventPostions
        if (y - top < 0 || bottom - y < 0) {
            return
        }
        const newLocationMarker = { show: true, sign: y - top <= height / 2 ? postions.top : postions.bottom }
        if (locationMarker.show !== newLocationMarker.show || locationMarker.sign !== newLocationMarker.sign) {
            setLocationMarker(newLocationMarker)
        }
    }, [locationMarker])

    const [dropCollectData, connectDrop] = useDrop({
        accept,
        drop: (item, monitor) => {
            const dropResult = monitor.getDropResult()
            const isOverCurrent = monitor.isOver({ shallow: false })

            const { id: draggedId } = monitor.getItem()
            if (!dropResult && isOverCurrent) {
                if (!draggedId) { //收集到的dragItem无id说明是新字段
                    const targetIndex = typeof index !== "number" || [postions.top, postions.left].includes(locationMarker.sign) ? index : index + 1
                    placeField({ type, id: fieldId, contentFieldId, dropIndex: targetIndex }, item).then((ids) => {
                        if (ids.length) {
                            selectField(ids[0])
                        }
                    })
                } else { //有id 说明是以生成的字段实例
                    const targetIndex = typeof index !== "number" || [postions.bottom, postions.right].includes(locationMarker.sign) ? index : index - 1
                    moveField?.({ type, id: fieldId, contentFieldId, dropIndex: targetIndex }, item)
                }
            }
        },
        hover: (item: any, monitor: any) => {

            if ((item?.id !== fieldId || isDropContent) && monitor.isOver({ shallow: true }) && ref.current) {
                const clientOffset = monitor.getClientOffset()
                const contentInfo = ref.current.getBoundingClientRect()
                /* 
                1.item?.parId !== parId 非同级不展示标记线
                2. item.id && [item.index, item.index + 1].includes(clientOffset.y - contentInfo.top <= contentInfo.height / 2 ? index : index + 1))
                移动事件结果在同一位置不展示标记线
                */
                if (item.id && [item.index, item.index + 1].includes(clientOffset.y - contentInfo.top <= contentInfo.height / 2 ? index : index + 1)) {
                    return
                }
                getArea(clientOffset, contentInfo)
            }
        },
        //经过可放下区域时触发
        //收集函数  
        collect: (monitor: any) => ({
            isOver: monitor.isOver(),
            isOverCurrent: monitor.isOver({ shallow: true }),
            clientOffset: monitor.getClientOffset()
        })
    })

    React.useEffect(() => {
        if (!isDropContent) {
            connectDrag(ref)
            connectDragPreview(document.getElementById(`${formDesignPerfixCls}-faker-perview`))
        }
        connectDrop(ref)
    }, [ref, isDropContent])

    React.useEffect(() => {
        let timeCount: any
        if (locationMarker.show && !dropCollectData.isOverCurrent) {
            timeCount = setTimeout(() => {
                clearTimeout(timeCount)
                setLocationMarker({ show: false, sign: postions.none })
            }, 32)
        }
        return () => {
            if (timeCount) {
                clearTimeout(timeCount)
            }
        }
    }, [locationMarker, dropCollectData.isOverCurrent])

    return [ref, dragCollectData.isDragging, locationMarker]
}

const ContentDrop = React.forwardRef<any, any>(({ children, contentFieldId, formDesignPerfixCls }, ref) => {
    return <div className={`${formDesignPerfixCls}-drop-content`} style={{ zIndex: contentFieldId ? 11 : 1 }} ref={ref}>
        {children}
    </div>
})

const FieldDragWithDrop = React.forwardRef<any, any>(({ children, contentFieldId, fieldId, isSelected, deleteField, selectField, copyField, canDel, canCopy, isDragging, isFirstField, isLastField, locationMarker, formDesignPerfixCls }, ref) => {

    const hoverClassName = `${formDesignPerfixCls}-form-item-hover`
    const MouseOver = (e: any) => {
        e.stopPropagation()
            ; (ref as any).current?.children[0].classList.add(hoverClassName)
    }
    const MouseOut = (e: any) => {
        e.stopPropagation()
            ; (ref as any).current?.children[0].classList.remove(hoverClassName)
    }
    const wrapperDeleteField = React.useCallback((e: any) => deleteField(e), [deleteField])
    const wrappercopyField = React.useCallback((e: any) => copyField(e), [copyField])

    return <div
        id={fieldId}
        ref={ref}
        className={`${formDesignPerfixCls}-field-dnd-wrapper`}
    >
        <div
            className={cs({
                [`${formDesignPerfixCls}-field-active`]: isSelected,
                [`${formDesignPerfixCls}-first-field`]: isFirstField,
                [`${formDesignPerfixCls}-last-field`]: isLastField,
                [`${formDesignPerfixCls}-field-dragging`]: isDragging,
                [`${formDesignPerfixCls}-location-${locationMarker.sign}-marker`]: locationMarker.show && locationMarker.sign,
            })}
            onClick={selectField}
            onMouseOver={MouseOver}
            onMouseOut={MouseOut}
        >
            <div className={`${formDesignPerfixCls}-field-border`}>
                <div className={`${formDesignPerfixCls}-field-operation-area`} >
                    <span>
                        {canCopy && <CopyOutlined onClick={wrappercopyField as any} />}
                    </span>
                    <span>
                        {canDel && <DeleteOutlined onClick={wrapperDeleteField as any} />}
                    </span>
                </div>
                {children}
            </div>
        </div>
    </div>
})

const Drop: React.FC<React.PropsWithChildren<IDropProps>> = ({ isDropContent = false, accept = constants.BASE, type = constants.BASE, children, fieldId, index, contentFieldId, ...props }) => {

    const { formDesignPerfixCls } = React.useContext(FormDesignRootContext)

    const { placeField, moveField, selectField, deleteField, copyField } = React.useContext(FieldOperationsContext)

    const newSelectField = funcMemo(selectField, fieldId)

    const newDeleteField = funcMemo(deleteField, fieldId, contentFieldId, index)

    const newCopyField = funcMemo(copyField, fieldId, contentFieldId, index)

    const [ref, isDragging, locationMarker] = useDnd(isDropContent, { placeField, moveField, selectField, type, accept, canDrag: props.canDrag, formDesignPerfixCls }, {
        contentFieldId,
        fieldId,
        index
    })

    const TargetComponent = React.useMemo(() => isDropContent ? ContentDrop : FieldDragWithDrop, [isDropContent])

    return <TargetComponent
        ref={ref}
        {...props}
        formDesignPerfixCls={formDesignPerfixCls}
        fieldId={fieldId}
        contentFieldId={contentFieldId}
        selectField={newSelectField}
        deleteField={newDeleteField}
        copyField={newCopyField}
        isDragging={isDragging}
        locationMarker={locationMarker}
    >
        {children}
    </TargetComponent>
}

export default Drop
