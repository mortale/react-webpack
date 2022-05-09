// 使用
const fieldsMap: any = {
  TEXT: { type: "string", "x-decorator": "FormItem", "x-component": "Input" },
  TEXTAREA: { type: "string", "x-decorator": "FormItem", "x-component": "Input.TextArea" },
  DATE: { type: "string", "x-decorator": "FormItem", "x-component": "DatePicker" },
  NUMBER: { type: "string", "x-decorator": "FormItem", "x-component": "NumberPicker" },
  SELECT: {  type: "string","x-decorator": "FormItem", "x-component": "Select" },
};

const validatorMap:any = {
  DATE: (
    minDate: string = "1980-01-01",
    maxDate: string = "9999-01-01",
    minDateErrorMsg: string = "请大于最小值",
    maxDateErrorMsg: string = "请小于最大值"
  ) => {
    return (v: any) => {
      if (!v) {
        return "";
      } else if (+new Date(v) >= +new Date(maxDate)) {
        return maxDateErrorMsg;
      } else if (+new Date(v) <= +new Date(minDate)) {
        return minDateErrorMsg;
      }
    };
  },
};

const dealWithStatusInfo = (statusInfo: any) => {
  const { statusType } = statusInfo;
  switch (statusType) {
    case "EDITABLE":
      return { editable: true };
    case "READONLY":
      return { editable: false };
    case "HIDDEN":
      return { visible: false };
  }
};

const dealWithValueRule = (valueRule: any,supInfo:any = {}) => {
    const {type} = supInfo
    const speicalHandle = ['DATE'].includes(type)
  return Object.entries(valueRule).reduce(
    (acc: any, [key, value]) => {
      if (["minLength", "maxLength", "minimum", "maximum"].includes(key)) {
        acc[key] = Number(value);
      } else if (key === "required" && value) {
          acc["x-validator"].push({required:value,message:valueRule.requiredErrorMsg})
      }else if(key === 'range' && value && speicalHandle){
        acc['x-validator'].push(validatorMap[type](valueRule.minDate,valueRule.maxDate))
      }
      return acc;
    },
    { "x-validator": [] }
  );
};

class BaseField {
  static initData = (props: any) => {
    const { type, description, title, statusInfo, valueRule, ...otherProps } =
      props;
    if (!fieldsMap[type]) {
      throw new Error(`${type} 类型不存在`);
    }
    const status = dealWithStatusInfo(statusInfo);
    const rules = dealWithValueRule(valueRule,{type});
    return Object.assign(
      { title, description },
      fieldsMap[type],
      { status },
      rules,
      { "x-component-props": otherProps }
    );
  };
}

class FormilyField extends BaseField {
  constructor(props: any) {
    super();
    const targetData = FormilyField.initData(props);
    Object.assign(this, targetData);
  }
}
 


export default FormilyField