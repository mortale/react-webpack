import {
  IFieldVoInfo,
  IFormDesignContextProps,
  IPostionInfoProps,
} from "../module";
import { createForm, FormPath } from "@formily/core";
import { Schema, SchemaKey } from "@formily/react";
import { observable } from "@formily/reactive";
import { Parser } from "@formily/path/esm/parser";
// 内部使用属性key 数据还原时清除
const exteaAttrs = ["parId", "splitDownKeys"];
const cloneParams = (data: any) =>
  data === undefined || data === null || typeof data !== "object"
    ? data
    : JSON.parse(JSON.stringify(data));
const isObject = (data: any) =>
  Object.prototype.toString.call(data) === "[object Object]";
// 字段路径查找方法
export const getFieldPath = (
  currentFieldId: string,
  fieldsMap: { [key: string]: any }
) => {
  if (!currentFieldId) {
    return [];
  }
  const parIds: string[] = [currentFieldId];
  let currentLayer = fieldsMap[parIds[parIds.length - 1]];
  while (currentLayer.parId) {
    parIds.push(currentLayer.parId);
    currentLayer = fieldsMap[parIds[parIds.length - 1]];
  }
  return parIds;
};
/**
 * 字段还原
 */
const recoverField = function <T extends IFieldVoInfo>(
  this: any,
  originField: T
): T | null {
  const targetData: any = {};
  if (!originField || !isObject(originField)) {
    return null;
  }
  const curTemplate = this.fieldInfoTemplate[originField.type];
  if (!curTemplate) {
    console.error(`${originField.type} template is not found`);
  }
  const splitDownKeys = Array.from(curTemplate?.splitDownKeys || []);
  for (const key in originField) {
    if (
      !exteaAttrs.includes(key) &&
      Object.prototype.hasOwnProperty.call(originField, key)
    ) {
      const element =
        originField[key] === "" ? null : cloneParams(originField[key]);
      const keys = key.replace(/(\"|\')/g, "").split(">");
      const realKey = keys.pop();
      if (keys.length >= 1) {
        if (keys.every((el) => splitDownKeys.includes(el))) {
          const operationData = keys.reduce((acc, next) => {
            if (!acc[next]) {
              acc[next] = {};
            }
            return acc[next];
          }, targetData);
          operationData[realKey!] = element;
        }
      } else {
        targetData[key] = element;
      }
    }
  }
  return targetData;
};

/**
 * 单个字段值拆分转化
 * @params fieldInfo 单个字段的各个属性值集合
 */
const transformField = function <T extends IFieldVoInfo>(
  this: any,
  fieldInfo: T,
  parId: string | null
): T | null {
  const targetData: any = {};
  if (!fieldInfo || !isObject(fieldInfo)) {
    return null;
  }
  if (parId !== undefined) {
    targetData.parId = parId;
  }
  const curTemplate = this.fieldInfoTemplate[fieldInfo.type];
  if (!curTemplate) {
    console.error(`${fieldInfo.type} template is not found`);
  }
  const splitDownKeys = Array.from(curTemplate?.splitDownKeys || []);
  const iterativeObject = (data: any = {}, perKey: string = "") => {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const newKey = perKey ? perKey + ">" + key : key;
        const element = data[key];
        if (splitDownKeys.includes(key) && isObject(element)) {
          iterativeObject(element, newKey);
        } else {
          targetData[newKey] = cloneParams(element);
        }
      }
    }
  };
  iterativeObject(fieldInfo);
  return targetData;
};
/* 对传入的formVo做数据包装以便渲染 */
const transformFormVo = function (
  this: any,
  formVo: IFieldVoInfo[],
  supInfo: any
): Omit<
  IFormDesignContextProps,
  "fieldsInfo" | "changeField" | "formDesignId" | "selectedFieldId"
> {
  const {
    fieldFunctionContorl,
    transformField: curTransformField,
    fieldKey,
  } = this;
  let outerFieldPostions: IPostionInfoProps[] = [];
  const nestedFieldPostions: { [key: string]: IPostionInfoProps[] } = {};
  const fieldsMap: { [key: string]: IFieldVoInfo } = {};
  const iterativeMethods = (
    interativeData: IFieldVoInfo[],
    parId: string | null = null
  ) =>
    interativeData?.map((el: IFieldVoInfo) => {
      const uniqueId = "" + el[fieldKey];
      const { canDrag, canDel, canCopy, visible } =
        fieldFunctionContorl?.(el) || {};
      const currentFunctionCode = {
        id: uniqueId,
        canDrag: canDrag ?? true,
        canDel: canDel ?? true,
        canCopy: canCopy ?? true,
        visible: visible ?? true,
      };
      fieldsMap[uniqueId] = currentFunctionCode.visible
        ? curTransformField(el, parId)
        : { ...el, parId };
      if (el.items) {
        nestedFieldPostions[uniqueId] = iterativeMethods(
          el.items || [],
          uniqueId
        );
      }
      return currentFunctionCode;
    });
  outerFieldPostions = iterativeMethods(formVo);
  return {
    outerFieldPostions,
    nestedFieldPostions,
    fieldsMap,
  };
};

const getKeyFormParser = (originData: any) => {
  originData = Array.isArray(originData) ? originData : [originData];
  return originData.reduce((acc: any, next: any) => {
    if (next.type === "Identifier") {
      acc.push(next.value);
    } else if (next.type === "DestructorExpression") {
      if (next.value?.type === "ArrayPattern") {
        acc.push(...getKeyFormParser(next.value.elements));
      } else {
        console.warn("parserType", next.type);
        console.warn("afterType", next.value.type);
      }
    } else {
      console.warn("otherType", next.type);
    }
    return acc;
  }, []);
};

const splitTemplates = (templates: any) => {
  const fieldInfoTemplate: any = {};
  const fieldSetterTemplate: any = {};
  if (templates) {
    templates.forEach((item: any) => {
      for (const key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          const schemaTemplate = item[key];
          if (schemaTemplate) {
            fieldInfoTemplate[key] = {
              splitDownKeys: new Set(),
              ...(schemaTemplate.initialValue || {}),
            };
            fieldSetterTemplate[key] = schemaTemplate;
            const newSchema = mapSchema(
              schemaTemplate,
              (fieldkey, element: Schema & { initialValue?: any }) => {
                const parser = new Parser(fieldkey as string).parse();
                const hasInitialValue =
                  element.initialValue !== undefined &&
                  element.initialValue !== null;
                getKeyFormParser(parser).forEach(
                  (parserResult: string, i: number) => {
                    const keys = parserResult
                      .replace(/(\"|\')/g, "")
                      .split(">");
                    if (keys.length > 1) {
                      keys.pop();
                      keys.forEach((el) =>
                        fieldInfoTemplate[key].splitDownKeys.add(el)
                      );
                    }
                    if (
                      hasInitialValue &&
                      (!element.type ||
                        ["void", "array", "object"].includes(element.type!))
                    ) {
                      if (Array.isArray(element.initialValue)) {
                        fieldInfoTemplate[key][parserResult] =
                          element.initialValue[i];
                      } else {
                        fieldInfoTemplate[key][parserResult] =
                          element.initialValue;
                      }
                    }
                  }
                );
                delete element.initialValue;
              }
            );
            fieldSetterTemplate[key] = newSchema.toJSON();
          }
        }
      }
    });
  }
  return { fieldInfoTemplate, fieldSetterTemplate };
};

const dealWithCustomData = function (this: any, props: any, field: any) {
  let { contorlTrigger } = field.data || {};
  if (contorlTrigger) {
    contorlTrigger = Array.isArray(contorlTrigger)
      ? contorlTrigger
      : [contorlTrigger];
    contorlTrigger.forEach((triggerKey: string) => {
      const oldFunc = props[triggerKey];
      props[triggerKey] = (...params: any[]) => {
        Promise.resolve(
          this[`${triggerKey}ValidateInSetter`]?.(
            field.props.name,
            params[0],
            this.recoverField(field.form.values)
          ) ?? true
        ).then((validateResult) => {
          if (validateResult) {
            oldFunc(...params);
          }
        });
      };
    });
  }
  return { ...props };
};

export const mapSchema = (
  schema: any,
  callback?: (
    key: SchemaKey,
    item: Schema,
    basePath: FormPath,
    perCBResult: any
  ) => any
) => {
  schema = new Schema(Object.assign({ type: "object" }, schema));
  const Schemaiterator = (
    currentSchema: Schema,
    basePath = new FormPath(""),
    perCBResult = {}
  ) => {
    currentSchema.mapProperties((item, key, index) => {
      const address = basePath.concat(key);
      if (key === undefined || key === null) {
        Schemaiterator(item, basePath);
      } else {
        // 回调操作
        const result = callback?.(key, item, basePath, perCBResult);
        if (item.type && ["object", "void"].includes(item.type)) {
          Schemaiterator(item, address, result);
        }
      }
    });
  };
  Schemaiterator(schema);
  return schema;
};
// 单个字段数据层面提交并校验
export const singleFieldValidate = (
  fieldInfo: any,
  schema: any,
  supInfo: any
) => {
  const { createSchemaFieldParams: options } = supInfo;
  schema = new Schema(schema);
  const form = createForm({ initialValues: fieldInfo, validateFirst: true });
  mapSchema(schema, (key, item, basePath) => {
    const fieldProps = item.toFieldProps(options);
    const createParams = Object.assign({}, fieldProps, { name: key, basePath });
    let field;
    if (item.type === "object") {
      field = form.createObjectField(createParams);
    } else if (item.type === "array") {
      field = form.createArrayField(createParams);
    } else if (item.type === "void") {
      field = form.createVoidField(createParams);
    } else {
      field = form.createField(createParams);
    }
    if (field) {
      if (field.display === "none") {
        form.deleteValuesIn(key);
        field.destroy();
      }
    }
  });
  form.onMount();
  return form.submit().finally(() => {
    form.onUnmount();
  });
};

export const getFieldsMap = (state: any, recoverFieldFunc: any) => {
  const { outerFieldPostions, nestedFieldPostions, fieldsMap } = state;
  const iterativeOperation = (operationArr: any[]) =>
    operationArr.reduce((acc, { id, visible }) => {
      let element = fieldsMap[id];
      if (visible) {
        element = recoverFieldFunc(element);
        if (nestedFieldPostions[id]) {
          element.items = iterativeOperation(nestedFieldPostions[id]);
        }
        acc.push(element);
      }
      return acc;
    }, []);
  return iterativeOperation(outerFieldPostions);
};

export const validate = (
  state: any,
  supInfo: any,
  returnSuccess: boolean = false
) => {
  const { fieldsMap, outerFieldPostions, nestedContainerFieldPostions } = state;
  const { fieldSetterTemplate } = supInfo;
  const result = Object.entries(fieldsMap).reduce(
    (acc: any[], [key, fieldInfo]: any) => {
      if (!fieldInfo) {
        return acc;
      } else {
        const parId = fieldInfo?.parId;
        const { visible } = (
          parId ? nestedContainerFieldPostions[parId] : outerFieldPostions
        ).filter((el: any) => el.id === key)[0];
        const schema = fieldSetterTemplate[fieldInfo.type] ?? null;
        if (!visible) {
          acc.push([key, fieldInfo]);
        } else if (schema) {
          acc.push(
            singleFieldValidate(fieldInfo, schema, supInfo).then(
              (r) => [key, r],
              (j) => {
                throw [key, j];
              }
            )
          );
        } else {
          acc.push(
            Promise.reject([
              key,
              [
                {
                  code: "schemaError",
                  messages: fieldInfo.type
                    ? `${key}字段类型为不存在`
                    : `${key}的类型为${fieldInfo.type}的schema缺失`,
                },
              ],
            ])
          );
        }
      }
      return acc;
    },
    []
  );
  return Promise.allSettled(result).then((validateData) => {
    const validateResult = validateData.reduce(
      (acc: { error: any[]; success: any }, { status, value, reason }: any) => {
        if (status === "rejected") {
          acc.error.push({ [reason[0]]: reason[1] });
        } else {
          acc.success[value[0]] = value[1];
        }
        return acc;
      },
      { error: [], success: {} }
    );
    if (validateResult.error.length) {
      throw validateResult.error;
    } else if (returnSuccess) {
      return validateResult.success;
    }
  });
};

export const submit = (state: any, supInfo: any) =>
  validate(state, supInfo, true).then((fieldsMap: any) => {
    const { outerFieldPostions, nestedFieldPostions } = state;
    const iterativeOperation = (operationArr: any[]) =>
      operationArr.reduce((acc, { id, visible }) => {
        const element = visible
          ? supInfo.recoverField(fieldsMap[id])
          : fieldsMap[id];
        if (nestedFieldPostions[id]) {
          element.items = iterativeOperation(nestedFieldPostions[id]);
        }
        acc.push(element);
        return acc;
      }, []);
    return iterativeOperation(outerFieldPostions);
  });

// 前置操作添加唯一id
export const createNewFieldHandle = (innerField: any, supInfo: any) => {
  const { fieldInfoTemplate, fieldKey } = supInfo;
  const ids: string[] = [];
  const fields = (Array.isArray(innerField) ? innerField : [innerField]).map(
    (element: any) => {
      const { items, ...otherProps } = element;
      const id =
        element[fieldKey] ?? Math.random().toString(36).slice(-8) + +new Date();
      const { title } = fieldInfoTemplate[otherProps.type] || {};
      // 创建的时候清除 title id
      const targetData: any = {
        ...otherProps,
        id,
        [fieldKey]: id,
        title,
      };
      if (items && Array.isArray(items)) {
        targetData.items = createNewFieldHandle(items, fieldInfoTemplate);
      }
      ids.push(id);
      return targetData;
    }
  );
  return [fields, ids];
};


export class FormDesignSupInfo {
  static [key:string]:any
  static initSupInfo(formDesignId: string, supInfo: any = {}) {
    const {
      fieldFunctionContorl,
      templates,
      extendMaskLayers,
      ...otherSupInfo
    } = supInfo;
    console.log('initSupInfo',templates)
    const templateData = splitTemplates(templates);
    this[formDesignId] = {
      mounted: true,
      fieldFunctionContorl,
      ...otherSupInfo,
      ...templateData,
      dndMaskLayerTemplates: observable(extendMaskLayers || {}),
      extendMaskLayers,
    };
    Object.assign(this[formDesignId], {
      transformField: transformField.bind(this[formDesignId]),
      recoverField: recoverField.bind(this[formDesignId]),
      transformFormVo: transformFormVo.bind(this[formDesignId]),
      dealWithCustomData: dealWithCustomData.bind(this[formDesignId]),
    });
  }
  static changeSupInfo(formDesignId: string, newSupInfo: any = {}) {
    if (this[formDesignId]) {
      const { mounted, unMounted, ...otherData } = this[formDesignId];
      // this[formDesignId].cache = (this[formDesignId].cache || []).concat(cloneDeep(otherData));
      const newData = FormDesignSupInfo.diffChange(otherData, newSupInfo);
      Object.assign(this[formDesignId], newData);
    }
  }

  static deleteSupInfo(formDesignId: string) {
    if (this[formDesignId]) {
      Object.assign(this[formDesignId], { unMounted: true });
    }
  }

  static diffChange(perData: any, newData: any) {
    const { templates, splitDownKeys, dndMaskLayerTemplates, ...otherProps } =
      newData;
    const targetData: any = otherProps;
    if (templates && perData.templates !== templates) {
    console.log('diffChange',templates)
      Object.assign(targetData, splitTemplates(templates));
    }
    return targetData;
  }
}
