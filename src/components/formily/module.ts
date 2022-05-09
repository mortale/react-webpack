import React, { CSSProperties } from "react";
export interface IFunctionProps {
  canDrag?: boolean;
  canDel?: boolean;
  canCopy?: boolean;
  visible?: boolean;
}

export interface IPostionInfoProps extends IFunctionProps {
  id: string;
}
export interface IFormDesignContextProps {
  outerFieldPostions: IPostionInfoProps[];
  nestedFieldPostions: { [key: string]: IPostionInfoProps[] };
  fieldsMap: { [key: string]: any };
  selectedFieldId: string | null;
  formDesignId: string;
  SuffixFieldDisplay?: React.ComponentType;
  mode?: string;
  changeField: (fieldId: string, newField: any, cover?: boolean) => void;
}

//可被drag的内容展示props
export interface IDragBtnProps {
  type: string;
  canDrag?: boolean;
  name: string;
  iconClass: string;
  showToCustomer?: boolean; //是否展示给用户看
}
//基础字段的模板属性
export interface IFieldVoInfo {
  id?: string;
  type: string;
  title?: string;
  placeholder?: string;
  required?: boolean;
  [key: string]: any;
}
export interface IFormVoOperations {
  placeField: (placeLayerInfo: IFieldVoInfo, dragFieldInfo: IFieldVoInfo, noValidate?: boolean) => Promise<string[]>;
  moveField: (placeLayerInfo: IFieldVoInfo, dragFieldInfo: IFieldVoInfo, noValidate?: boolean) => void;
  deleteField: (
    fieldId: string | string[],
    contentFieldId: string | null,
    deleteIndex: number | null,
    e: any,
    noValidate?: boolean
  ) => Promise<boolean>;
  copyField: (
    fieldId: string,
    contentFieldId: null | string,
    innerIndex: number,
    e: any,
    noValidate: boolean
  ) => Promise<string[]>;
  selectField: (fieldId: string, e?: any) => void;
}

//drag容器的props
export interface IDragProps {
  type?: string;
  canDrag?: boolean;
  uniquelySign: string | number;
  title?: string;
  className?: string;
  style?: CSSProperties;
  formDesignPerfixCls?: string;
}

export interface IDropProps extends IFunctionProps {
  fieldType?: string;
  isDropContent: boolean;
  type?: string;
  contentFieldId?: string;
  fieldId?: string;
  isSelected?: boolean;
  hasDelete?: boolean;
  index?: number;
  fieldName?: string;
  nestedLevel?: number;
  isFirstField?: boolean;
  isLastField?: boolean;
  accept?: string | string[];
}

export type IFormDesignDataReduceProps = Omit<IFormDesignContextProps, "changeField">;

export interface ICommonProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  ref?: React.Ref<IFormDesignRef>;
}
export interface IFormDesignRootProps extends ICommonProps {
  formDesignId?: string;
  formDesignPerfixCls?: string;
}

export enum IChangeTypeProps {
  add = "add",
  move = "move",
  delete = "delete",
  copy = "copy",
  select = "select",
}
export interface IFormDesignDataProps extends ICommonProps {
  templates: { [key: string]: any };
  formVo?: IFieldVoInfo[];
  fieldFunctionContorl?: (fieldInfo: IFieldVoInfo) => IFunctionProps;
  customFieldAttrWithSetting?: <T>(key: string, attrs: T) => T;
  customFieldsRules?: (fieldInfo: IFieldVoInfo, key: string, value: any) => Promise<string> | string;
  manualContorlSchema?: <T extends { componentProps?: any; enum?: any[]; visible?: boolean }>(
    schemaKey: string,
    contorlField: T,
    fieldInfo: any
  ) => T;
  onFormVoChange?: (changeType: IChangeTypeProps, fields?: string | string[] | IFieldVoInfo) => void;
  onFieldChange?: (key: string, value: any) => void;
  fieldKey?: string;
  onChangeValidateInSetter?: (key: string, value: any, fieldInfo: any) => Promise<boolean> | boolean;
  coustomPerview?: React.ComponentType<{ item: { uniquelySign?: string; [k: string]: any } }>;
  extendMaskLayers?: { [key: string]: { uniquelySign: string; name: string; iconClass: string; [key: string]: any } };
}

export interface IDataDeliverProps {
  formDesignDataDiepatch: React.Dispatch<any>;
  formDesignState: IFormDesignDataReduceProps;
  formDesignId: string;
}

export interface IFormDesignOperationsProps extends ICommonProps {
  placeFieldValidate?: (dragFieldInfo: any, placeLayerInfo: any) => boolean;
  createInnerFieldInfo?: (templateField: IFieldVoInfo, contentField: IFieldVoInfo) => any[] | any | void;
  moveFieldValidate?: (dragFieldInfo: any, placeLayerInfo: any) => boolean;
  deleteFieldValidate?: (operationField: any, contentField: any) => string[] | boolean | Promise<string[] | boolean>;
  copyFieldValidate?: (operationField: any, contentField: any) => boolean;
  createCopyFieldInfo?: (copyTemplateField: IFieldVoInfo, contentField: IFieldVoInfo) => any | void;
}

export type IFormDesignProps = IFormDesignRootProps & IFormDesignDataProps & IFormDesignOperationsProps;

export interface IFormDesignRef {
  validate: () => Promise<void>;
  submit: () => Promise<IFieldVoInfo[]>;
  getFieldsMap: () => IFieldVoInfo[];
  setSelectFieldId: (id: string) => void;
  getSelectFieldId: () => string | null;
  deleteField: (deleteFieldId: string | string[], noValidate?: boolean) => Promise<boolean>;
  addField: (uniquelySign: string, depandFieldId?: string | null, noValidate?: boolean) => Promise<string[]>;
  changeFieldInfo: (fieldId: string, newField: any, cover?: boolean) => void;
  resetSetterPane: () => void;
  getSelectField: () => IFieldVoInfo;
}

export interface ISimulatorWrapProps {
  layout?: { labelCol?: number; wrapperCol?: number };
  mode?: "web" | string;
  SuffixFieldWidth?: number;
  SuffixFieldDisplay?: React.ComponentType | ((props:any)=>JSX.Element);
  expendFieldSimulate?: {
    [key: string]: React.ComponentType;
  };
  noData?: React.ReactElement|React.ComponentType;
}

export interface ISetterPaneOuterProps {
  expandFields?: { [key: string]: any };
  layout?: { labelCol: number; wrapperCol: number; span: number };
  scope?: { [key: string]: any };
  NoData?: React.ComponentType;
  [key: string]: any;
}
export interface ISetterPaneInteralProps extends Omit<ISetterPaneOuterProps, "expandFields" | "layout" | "scope"> {
  formDesignId: string;
  selectedFieldId: string;
  createSchemaFieldParams: any;
  fieldType: string;
  fieldsMap: { [key: string]: any };
  changeField: (fieldId: string, newField: any, cover: boolean) => void;
}
