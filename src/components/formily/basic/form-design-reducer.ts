import { cloneDeep, findLastIndex } from "lodash";
import { getFieldPath, FormDesignSupInfo } from "./common";
import * as constants from "../constants";
import { IChangeTypeProps, IFormDesignDataReduceProps, IPostionInfoProps } from "../module";

const deleteObjectParams = (originData: { [key: string]: any }, key: string) => {
  originData[key] = undefined;
};

export const defaultState: IFormDesignDataReduceProps = {
  formDesignId: "",
  outerFieldPostions: [],
  nestedFieldPostions: {},
  fieldsMap: {},
  selectedFieldId: null,
};

/* place */

// 处理放置
const dealWithPlace = ({ innerField, placeLayerInfo, dragFieldInfo }: any, state: any, supInfo: any) => {
  const { contentFieldId, dropIndex } = placeLayerInfo;
  const operationData = contentFieldId
    ? state.nestedFieldPostions[contentFieldId] ||
      ((state.nestedFieldPostions[contentFieldId] = []), state.nestedFieldPostions[contentFieldId])
    : state.outerFieldPostions;
  const targetIndex = dropIndex || findLastIndex(operationData, (el: any) => el.visible) + 1;
  const result = supInfo.transformFormVo?.(innerField);

  operationData.splice(targetIndex, 0, ...result.outerFieldPostions);
  contentFieldId
    ? (state.nestedFieldPostions[contentFieldId] = [...operationData])
    : (state.outerFieldPostions = [...operationData]);

  Object.assign(state.fieldsMap, result.fieldsMap);

  Object.assign(state.nestedFieldPostions, result.nestedFieldPostions);
};

/* copy */
const dealWithCopy = ({ contentFieldId, copyField, innerIndex }: any, state: any, supInfo: any) => {
  // 执行创建新字段的统一操作
  const result = supInfo.transformFormVo?.(copyField);

  const operationData = contentFieldId ? state.nestedFieldPostions[contentFieldId] : state.outerFieldPostions;

  operationData.splice(innerIndex + 1, 0, ...result.outerFieldPostions);
  contentFieldId
    ? (state.nestedFieldPostions[contentFieldId] = [...operationData])
    : (state.outerFieldPostions = [...operationData]);

  Object.assign(state.nestedFieldPostions, result.nestedFieldPostions);

  Object.assign(state.fieldsMap, result.fieldsMap);
};
/* move */
const dealWithMoveOperationData = (
  opreationData: any[],
  innerField: { index?: number; id: string } = { id: "" },
  removeField: { index?: number } = {}
): any => {
  const { index: innerIndex, id: innerFieldId } = innerField;
  const { index: removeIndex } = removeField;
  const initAcc: any[] = [];
  const innerFieldInfo = opreationData.filter((el: any) => el.id === innerFieldId)[0];
  // 操作数组是空数组 或者 判定落点在头部
  if (!opreationData.length || innerIndex === -1) {
    initAcc.push(innerFieldInfo);
  }
  const result = opreationData.reduce((acc: any[], next: any, i: number) => {
    if (i !== removeIndex) {
      acc.push(next);
    }
    if (i === innerIndex && innerFieldInfo) {
      acc.push(innerFieldInfo);
    }
    return acc;
  }, initAcc);
  // 判定落点在可见数组的最后
  if (innerFieldInfo && innerIndex === undefined) {
    const targetIndex = findLastIndex(result, (el: any) => el.visible) + 1;
    result.splice(targetIndex, 0, innerFieldInfo);
  }
  return result;
};
const dealWithMove = (
  { placeLayerInfo, dragFieldInfo }: any,
  { nestedContainerFieldPostions, outerFieldPostions }: any
) => {
  const { id: dragId, contentFieldId: dragContentFieldId, dragIndex } = dragFieldInfo;
  const { contentFieldId: dropContentFieldId, dropIndex } = placeLayerInfo;
  let addOperationData = dropContentFieldId ? nestedContainerFieldPostions[dropContentFieldId] : outerFieldPostions;
  let removeOperationData = dragContentFieldId ? nestedContainerFieldPostions[dragContentFieldId] : outerFieldPostions;
  let changeParams: any[] = [];
  if (addOperationData === removeOperationData) {
    //操作同一个字段组
    addOperationData = dealWithMoveOperationData(
      addOperationData,
      { index: dropIndex, id: dragId },
      { index: dragIndex }
    );
    changeParams = [addOperationData];
  } else {
    //操作不同的字段组
    //添加操作
    addOperationData = dealWithMoveOperationData(addOperationData, {
      index: dropIndex || addOperationData.length - 1,
      id: dragId,
    });
    //移除操作
    removeOperationData = dealWithMoveOperationData(removeOperationData, undefined, {
      index: dragIndex,
    });
    changeParams = [addOperationData, removeOperationData];
  }
  switch (changeParams.length) {
    case 1:
      dropContentFieldId
        ? (nestedContainerFieldPostions[dropContentFieldId] = changeParams[0])
        : (outerFieldPostions = changeParams[0]);
      return { nestedContainerFieldPostions, outerFieldPostions };
    case 2:
      dropContentFieldId
        ? (nestedContainerFieldPostions[dropContentFieldId] = changeParams[0])
        : (outerFieldPostions = changeParams[0]);
      dragContentFieldId
        ? (nestedContainerFieldPostions[dragContentFieldId] = changeParams[1])
        : (outerFieldPostions = changeParams[1]);
      return { nestedContainerFieldPostions, outerFieldPostions };
    default:
      return null;
  }
};
/* delete */
const dealWithDelete = ({ fieldId, contentFieldId }: any, state: any) => {
  const operationData = (contentFieldId ? state.nestedFieldPostions[contentFieldId] : state.outerFieldPostions).filter(
    (el: IPostionInfoProps) => el.id !== fieldId
  );
  contentFieldId
    ? (state.nestedFieldPostions[contentFieldId] = [...operationData])
    : (state.outerFieldPostions = [...operationData]);
  if (state.nestedFieldPostions[fieldId]) {
    deleteObjectParams(state.nestedFieldPostions, fieldId);
  }
  const parIds = getFieldPath(state.selectedFieldId, state.fieldsMap);
  const deleteFieldPostions = parIds.indexOf(fieldId);

  if (deleteFieldPostions >= 0) {
    state.selectedFieldId = parIds[deleteFieldPostions + 1] || null;
  }

  deleteObjectParams(state.fieldsMap, fieldId);
};
/* batch delete*/
const dealWithBatchDelete = ({ fieldId }: any, state: any) => {
  const { nestedFieldPostions, fieldsMap } = state;
  let outerFieldPostions = state.outerFieldPostions;
  let selectedFieldId = state.selectedFieldId;
  const selectFieldParIds = getFieldPath(state.selectedFieldId, state.fieldsMap);
  let finalPosition = -1;
  if (Array.isArray(fieldId)) {
    fieldId.forEach((id) => {
      const element = fieldsMap[id];
      if (element) {
        if (element.parId) {
          nestedFieldPostions[element.parId] = nestedFieldPostions[element.parId].filter((el: any) => el.id !== id);
          if (nestedFieldPostions[id]) {
            deleteObjectParams(nestedFieldPostions, id);
          }
        } else {
          outerFieldPostions = outerFieldPostions.filter((el: any) => el.id !== id);
        }
        deleteObjectParams(fieldsMap, id);
        const deleteFieldPostion = selectFieldParIds.indexOf(id);
        finalPosition = Math.max(deleteFieldPostion, finalPosition);
      }
    });
    if (finalPosition >= 0) {
      selectedFieldId = selectFieldParIds[finalPosition + 1] || null;
    }
  }
  return { nestedFieldPostions, outerFieldPostions, fieldsMap, selectedFieldId };
};
/* change */
const dealWithChange = ({ fieldId, newFieldInfo = {}, cover }: any, state: any, supInfo: any) => {
  fieldId = fieldId || state.selectedFieldId;
  const changeField = state.fieldsMap[fieldId];
  state.fieldsMap[fieldId] = cover
    ? { ...newFieldInfo, parId: changeField.parId }
    : Object.assign({ parId: changeField.parId }, changeField, cloneDeep(newFieldInfo));
};
/* clear */
const clearFieldsMap = (fieldsMap: any) => {
  for (const key in fieldsMap) {
    if (Object.prototype.hasOwnProperty.call(fieldsMap, key)) {
      fieldsMap[key] = undefined;
    }
  }
};
const FormDesignReducer = (
  state: any = cloneDeep(defaultState),
  { type, formDesignId, ...otherProps }: any
): IFormDesignDataReduceProps => {
  const supInfo = FormDesignSupInfo[state.formDesignId] || {};
  switch (type) {
    /* 初始化阶段 */
    case constants.INIT_FORMDESIGN:
      return { ...state, formDesignId };
    /* 修改formVo */
    case constants.CHANGE_FORMVO:
      const { fieldsMap: newFieldsMap, ...newState } = supInfo.transformFormVo?.(otherProps.formVo || []) || {};
      clearFieldsMap(state.fieldsMap);
      Object.assign(state.fieldsMap, newFieldsMap || {});
      return { ...state, ...newState };
    /* 添加新字段 */
    case constants.PLACE_FIELD:
      dealWithPlace(otherProps, state, supInfo);
      supInfo.onFormVoChange?.(IChangeTypeProps.add, otherProps.innerField);
      return { ...state };
    /* 复制一个新字段 */
    case constants.COPY_FIELD:
      dealWithCopy(otherProps, state, supInfo);
      supInfo.onFormVoChange?.(IChangeTypeProps.copy, otherProps.copyField);
      return { ...state };
    /* 移动字段 重新排序 */
    case constants.MOVE_FIELD:
      const moveResult = dealWithMove(otherProps, state);
      if (moveResult) {
        const { placeLayerInfo, dragFieldInfo } = otherProps;
        const moveField = state.fieldsMap[dragFieldInfo.id];
        moveField.parId = placeLayerInfo.contentFieldId;
        supInfo.onFormVoChange?.(IChangeTypeProps.move, moveField);
        return { ...state, ...moveResult };
      } else {
        return state;
      }
    /* 删除一个字段 */
    case constants.DELETE_FIELD:
      dealWithDelete(otherProps, state);
      supInfo.onFormVoChange?.(IChangeTypeProps.delete, otherProps.fieldId);
      return { ...state };
    /* 删除多个字段 */
    case constants.BATCH_DELETE_FIELD:
      const batchDelState = dealWithBatchDelete(otherProps, state);
      supInfo.onFormVoChange?.(IChangeTypeProps.delete, otherProps.deleteIds);
      return { ...state, ...batchDelState };
    /* 选中一个字段 */
    case constants.SELECT_FIELD:
      supInfo.onFormVoChange?.(IChangeTypeProps.select, otherProps.selectId);
      return { ...state, selectedFieldId: otherProps.selectId };
    /* 修改选中字段的属性 */
    case constants.CHANGE_FIELD:
      dealWithChange(otherProps, state, supInfo);
      return { ...state };
    /* 数据恢复初始化阶段 */
    case constants.CLEAR_FORMDESIGN:
      return cloneDeep(defaultState);
    default:
      return state;
  }
};
 
export default FormDesignReducer;
