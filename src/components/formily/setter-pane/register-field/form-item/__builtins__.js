/* eslint:disable */
export var usePrefixCls = function (tag, props) {
  const antPrefixCls = props === null || props === void 0 ? "ant" : props.antPrefixCls;
  const customizePrefixCls = props === null || props === void 0 ? void 0 : props.prefixCls;
  if (customizePrefixCls) return customizePrefixCls;
  return tag ? (antPrefixCls + "-").concat(tag) : antPrefixCls;
};

export var pickDataProps = function (props) {
  if (props === void 0) {
    props = {};
  }
  return Object.keys(props).reduce(function (buf, key) {
    if (key.includes("data-")) {
      buf[key] = props[key];
    }
    return buf;
  }, {});
};
