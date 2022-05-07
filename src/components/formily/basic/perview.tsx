import React from 'react'
// import cs from 'classnames'
import { useDragLayer } from 'react-dnd'
import { FormDesignSupInfo } from './common'

const layerStyles: React.CSSProperties = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: -1,
  left: 0,
  top: 0,
  height: "0px",
  visibility: "hidden"
};

function getItemStyles(currentOffset: any, clientOffset: any, { contentHeight, contentWidth }: { contentHeight: number, contentWidth: number }, fieldId: string): any {
  if (!currentOffset || !clientOffset) {
    return {}
  }
  const { x: currentX, y: currentY } = currentOffset;
  const { x: clientX, y: clientY } = clientOffset
  const targetStyle: any = {
    background: "#fff",
    position: "relative",
    left: `${currentX}px`,
    top: `${currentY}px`,
    // height: `${contentHeight}px`,
    // width: `${contentWidth}px`
  }
  if (fieldId) {
    Object.assign(targetStyle, {
      transform: 'translate(-50%, -50%)',
      left: `${clientX}px`,
      top: `${clientY}px`
    })
    // targetStyle.transform = 'translate(-50%, -50%)'
    // targetStyle.left = `${clientX}px`,
    //   targetStyle.top = `${clientY}px`
  }

  return targetStyle
}

const DragPerview: React.FC<any> = ({ formDesignId, fieldsMap, formDesignPerfixCls }) => {
  const { dndMaskLayerTemplates, CoustomPerView } = FormDesignSupInfo[formDesignId] || {}
  const {
    isDragging,
    dragItem,
    currentOffset,//当前dragSource拖动之后的坐标距离页面左上角的偏移
    clientOffset,//当前鼠标的坐标（即在dragSource上点击的位置在拖动之后的坐标）距离页面的左上角的偏移
  } = useDragLayer(monitor => ({
    dragItem: monitor.getItem(),
    currentOffset: monitor.getSourceClientOffset(),
    clientOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging()
  }))
  const [item, customPerviewProps] = React.useMemo(() => {
    if (dragItem?.id) {
      const { type: uniquelySign, title: fieldName } = fieldsMap[dragItem.id]
      const { id: dragId, iconClass } = dndMaskLayerTemplates[uniquelySign] || {}
      const targetData = { ...dragItem, uniquelySign, fieldName, iconClass, }
      return [{ ...targetData, dragId }, targetData]
    } else if (dragItem?.uniquelySign) {
      const { iconClass, id: dragId, name } = dndMaskLayerTemplates[dragItem?.uniquelySign]
      const targetData = { ...dragItem, iconClass, fieldName: name }
      return [{ ...targetData, dragId }, targetData]
    } else {
      return [dragItem, dragItem]
    }
  }, [dragItem, fieldsMap, dndMaskLayerTemplates])

  const [fakeThisAttr] = React.useState({ contentHeight: 40, contentWidth: 0 })

  React.useEffect(() => {
    if (item) {
      const domId = item.dragId || (Object.values(dndMaskLayerTemplates)[0] as any)?.id
      const contentWidth = document.getElementById(domId)?.offsetWidth
      fakeThisAttr.contentWidth = contentWidth || 200
    }
  }, [item])

  const postionStyle = getItemStyles(currentOffset, clientOffset, fakeThisAttr, item?.id)
  // const iconType = item?.iconClass
  return <>
    <div style={isDragging && item?.uniquelySign ? { ...layerStyles, zIndex: 999, visibility: "visible" } : layerStyles}>
      <div style={postionStyle}>
        {CoustomPerView ? <CoustomPerView {...customPerviewProps} /> : <div className={`${formDesignPerfixCls}-drag-perview`} style={{ width: fakeThisAttr.contentWidth, height: fakeThisAttr.contentHeight }}>
          {/* {iconType && <IrsBaseIcon className={`${formDesignPerfixCls}-single-widget-icon`} type={iconType} />} */}
          <div className={`${formDesignPerfixCls}-single-widget-text`}>
            {item?.fieldName}
          </div>
        </div>}
      </div>
    </div>
    <div id={`${formDesignPerfixCls}-faker-perview`} style={{ position: 'fixed', top: "-1000px" }}>&nbsp;</div>
  </>
}

export default DragPerview