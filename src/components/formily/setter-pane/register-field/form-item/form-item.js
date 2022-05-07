/* eslint-disable */
var __assign = (this && this.__assign) || function () {
  __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
      }
      return t;
  };
  return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
      }
  return t;
};
var __read = (this && this.__read) || function (o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  }
  catch (error) { e = { error: error }; }
  finally {
      try {
          if (r && !r.done && (m = i["return"])) m.call(i);
      }
      finally { if (e) throw e.error; }
  }
  return ar;
};
import React, { useLayoutEffect, useRef, useState } from 'react';
import cls from 'classnames';
import { usePrefixCls, pickDataProps } from './__builtins__';
import { isVoidField } from '@formily/core';
import { connect, mapProps } from '@formily/react';
import { useFormLayout, FormLayoutShallowContext } from './form-layout';
// import { useGridSpan } from '../form-grid';
import  Tooltip from 'antd/lib/tooltip';
import Popover from 'antd/lib/popover'
import { QuestionCircleOutlined, CloseCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, } from '@ant-design/icons';
var useFormItemLayout = function (props) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
    var layout = useFormLayout();
    return __assign(__assign({}, props), { layout: (_b = (_a = props.layout) !== null && _a !== void 0 ? _a : layout.layout) !== null && _b !== void 0 ? _b : 'horizontal', colon: (_c = props.colon) !== null && _c !== void 0 ? _c : layout.colon, labelAlign: layout.layout === 'vertical'
            ? (_e = (_d = props.labelAlign) !== null && _d !== void 0 ? _d : layout.labelAlign) !== null && _e !== void 0 ? _e : 'left' : (_g = (_f = props.labelAlign) !== null && _f !== void 0 ? _f : layout.labelAlign) !== null && _g !== void 0 ? _g : 'right', labelWrap: (_h = props.labelWrap) !== null && _h !== void 0 ? _h : layout.labelWrap, labelWidth: (_j = props.labelWidth) !== null && _j !== void 0 ? _j : layout.labelWidth, wrapperWidth: (_k = props.wrapperWidth) !== null && _k !== void 0 ? _k : layout.wrapperWidth, labelCol: (_l = props.labelCol) !== null && _l !== void 0 ? _l : layout.labelCol, wrapperCol: (_m = props.wrapperCol) !== null && _m !== void 0 ? _m : layout.wrapperCol, wrapperAlign: (_o = props.wrapperAlign) !== null && _o !== void 0 ? _o : layout.wrapperAlign, wrapperWrap: (_p = props.wrapperWrap) !== null && _p !== void 0 ? _p : layout.wrapperWrap, fullness: (_q = props.fullness) !== null && _q !== void 0 ? _q : layout.fullness, size: (_r = props.size) !== null && _r !== void 0 ? _r : layout.size, inset: (_s = props.inset) !== null && _s !== void 0 ? _s : layout.inset, asterisk: props.asterisk, bordered: (_t = props.bordered) !== null && _t !== void 0 ? _t : layout.bordered, feedbackIcon: props.feedbackIcon, feedbackLayout: (_v = (_u = props.feedbackLayout) !== null && _u !== void 0 ? _u : layout.feedbackLayout) !== null && _v !== void 0 ? _v : 'loose', tooltipLayout: (_x = (_w = props.tooltipLayout) !== null && _w !== void 0 ? _w : layout.tooltipLayout) !== null && _x !== void 0 ? _x : 'icon', tooltipIcon: (_z = (_y = props.tooltipIcon) !== null && _y !== void 0 ? _y : layout.tooltipIcon) !== null && _z !== void 0 ? _z : (React.createElement(QuestionCircleOutlined, null)) });
};
function useOverflow() {
    var _a = __read(useState(false), 2), overflow = _a[0], setOverflow = _a[1];
    var containerRef = useRef();
    var contentRef = useRef();
    useLayoutEffect(function () {
        /* 2022-01-02 去掉对label宽度的计算展示方式控制 */
        if (containerRef.current && contentRef.current) {
            var contentWidth = contentRef.current.getBoundingClientRect().width;
            var containerWidth = containerRef.current.getBoundingClientRect().width;
            if (contentWidth && containerWidth && containerWidth < contentWidth) {
                // if (!overflow) 
                    // setOverflow(true);
            }
            else {
                if (overflow)
                    setOverflow(false);
            }
        }
    }, []);
    return {
        overflow: overflow,
        containerRef: containerRef,
        contentRef: contentRef,
    };
}
var ICON_MAP = {
    error: React.createElement(CloseCircleOutlined, null),
    success: React.createElement(CheckCircleOutlined, null),
    warning: React.createElement(ExclamationCircleOutlined, null),
};
export var BaseItem = function ({id,...props}) {
    var _a, _b, _c, _d, _e;
    var children = props.children, others = __rest(props, ["children"]);
    var _f = __read(useState(false), 2), active = _f[0], setActice = _f[1];
    var formLayout = useFormItemLayout(others);
    // var gridSpan = useGridSpan(props.gridSpan);
    var _g = useOverflow(), containerRef = _g.containerRef, contentRef = _g.contentRef, overflow = _g.overflow;
    var label = formLayout.label, style = formLayout.style, layout = formLayout.layout, _h = formLayout.colon, colon = _h === void 0 ? true : _h, addonBefore = formLayout.addonBefore, addonAfter = formLayout.addonAfter, asterisk = formLayout.asterisk, feedbackStatus = formLayout.feedbackStatus, extra = formLayout.extra, feedbackText = formLayout.feedbackText, fullness = formLayout.fullness, feedbackLayout = formLayout.feedbackLayout, feedbackIcon = formLayout.feedbackIcon, inset = formLayout.inset, _j = formLayout.bordered, bordered = _j === void 0 ? true : _j, labelWidth = formLayout.labelWidth, wrapperWidth = formLayout.wrapperWidth, labelCol = formLayout.labelCol, wrapperCol = formLayout.wrapperCol, labelAlign = formLayout.labelAlign, _k = formLayout.wrapperAlign, wrapperAlign = _k === void 0 ? 'left' : _k, size = formLayout.size, labelWrap = formLayout.labelWrap, wrapperWrap = formLayout.wrapperWrap, tooltipLayout = formLayout.tooltipLayout, tooltip = formLayout.tooltip, tooltipIcon = formLayout.tooltipIcon;
    // 2021-12-30 设置空格符占位标题在布局上的调整
    label = labelCol ===24 && /^\s+$/.test(label) ?null:label
    
    var labelStyle = __assign({}, formLayout.labelStyle);
    var wrapperStyle = __assign({}, formLayout.wrapperStyle);
    // 固定宽度
    var enableCol = false;
    if (labelWidth || wrapperWidth) {
        if (labelWidth) {
            labelStyle.width = labelWidth === 'auto' ? undefined : labelWidth;
            labelStyle.maxWidth = labelWidth === 'auto' ? undefined : labelWidth;
        }
        if (wrapperWidth) {
            wrapperStyle.width = wrapperWidth === 'auto' ? undefined : wrapperWidth;
            wrapperStyle.maxWidth = wrapperWidth === 'auto' ? undefined : wrapperWidth;
        }
        // 栅格模式
    }
    if (labelCol || wrapperCol) {
        if (!labelStyle.width && !wrapperStyle.width) {
            enableCol = true;
        }
    }
    var prefixCls = usePrefixCls('formily-item', props);
    var formatChildren = feedbackLayout === 'popover' ? (React.createElement(Popover, { autoAdjustOverflow: true, placement: "top", content: React.createElement("div", { className: cls((_a = {},
                _a[prefixCls + "-" + feedbackStatus + "-help"] = !!feedbackStatus,
                _a[prefixCls + "-help"] = true,
                _a)) },
            ICON_MAP[feedbackStatus],
            " ",
            feedbackText), visible: !!feedbackText }, children)) : (children);
    var gridStyles = {};
    // if (gridSpan) {
    //     gridStyles.gridColumnStart = "span " + gridSpan;
    // }
    var getOverflowTooltip = function () {
        if (overflow) {
            return (React.createElement("div", null,
                React.createElement("div", null, label),
                React.createElement("div", null, tooltip)));
        }
        return tooltip;
    };
    var renderLabelText = function () {
        var labelChildren = (React.createElement("div", { className: cls(prefixCls + "-label-content"), ref: containerRef },
            asterisk && (React.createElement("span", { className: cls(prefixCls + "-asterisk") }, '*')),
            React.createElement("label", { ref: contentRef }, label)));
        if ((tooltipLayout === 'text' && tooltip) || overflow) {
            return (React.createElement(Tooltip, { placement: "top", align: { offset: [0, 10] }, title: getOverflowTooltip() }, labelChildren));
        }
        return labelChildren;
    };
    var renderTooltipIcon = function () {
        if (tooltip && tooltipLayout === 'icon' && !overflow) {
            return (React.createElement("span", { className: cls(prefixCls + "-label-tooltip-icon") },
                React.createElement(Tooltip, { placement: "top", align: { offset: [0, 2] }, title: tooltip }, tooltipIcon)));
        }
    };
    var renderLabel = function () {
        var _a;
        if (!label)
            return null;
        return (React.createElement("div", { className: cls((_a = {},
                _a[prefixCls + "-label"] = true,
                _a[prefixCls + "-label-tooltip"] = (tooltip && tooltipLayout === 'text') || overflow,
                _a[prefixCls + "-item-col-" + labelCol] = enableCol && !!labelCol,
                _a)), style: labelStyle },
            renderLabelText(),
            renderTooltipIcon(),
            label !== ' ' && (React.createElement("span", { className: cls(prefixCls + "-colon") }, colon ? ':' : ''))));
    };

    return (React.createElement("div", __assign({}, pickDataProps(props), { style: __assign(__assign({}, style), gridStyles), className: cls((_b = {},
            _b["" + prefixCls] = true,
            _b[prefixCls + "-layout-" + layout] = true,
            _b[prefixCls + "-" + feedbackStatus] = !!feedbackStatus,
            _b[prefixCls + "-feedback-has-text"] = !!feedbackText,
            _b[prefixCls + "-size-" + size] = !!size,
            _b[prefixCls + "-feedback-layout-" + feedbackLayout] = !!feedbackLayout,
            _b[prefixCls + "-fullness"] = !!fullness || !!inset || !!feedbackIcon,
            _b[prefixCls + "-inset"] = !!inset,
            _b[prefixCls + "-active"] = active,
            _b[prefixCls + "-inset-active"] = !!inset && active,
            _b[prefixCls + "-label-align-" + labelAlign] = true,
            _b[prefixCls + "-control-align-" + wrapperAlign] = true,
            _b[prefixCls + "-label-wrap"] = !!labelWrap,
            _b[prefixCls + "-control-wrap"] = !!wrapperWrap,
            _b[prefixCls + "-bordered-none"] = bordered === false || !!inset || !!feedbackIcon,
            _b[props.className] = !!props.className,
            _b)), onFocus: function () {
            if (feedbackIcon || inset) {
                setActice(true);
            }
        }, onBlur: function () {
            if (feedbackIcon || inset) {
                setActice(false);
            }
        }, /* 向下传递id */
        id:id
    }),
        renderLabel(),
        React.createElement("div", { className: cls((_c = {},
                _c[prefixCls + "-control"] = true,
                _c[prefixCls + "-item-col-" + wrapperCol] = enableCol && !!wrapperCol && label,
                _c)) },
            React.createElement("div", { className: cls(prefixCls + "-control-content") },
                addonBefore && (React.createElement("div", { className: cls(prefixCls + "-addon-before") }, addonBefore)),
                React.createElement("div", { style: wrapperStyle, className: cls((_d = {},
                        _d[prefixCls + "-control-content-component"] = true,
                        _d[prefixCls + "-control-content-component-has-feedback-icon"] = !!feedbackIcon,
                        _d)) },
                    React.createElement(FormLayoutShallowContext.Provider, { value: undefined }, formatChildren),
                    feedbackIcon && (React.createElement("div", { className: cls(prefixCls + "-feedback-icon") }, feedbackIcon))),
                addonAfter && (React.createElement("div", { className: cls(prefixCls + "-addon-after") }, addonAfter))),
            !!feedbackText &&
                feedbackLayout !== 'popover' &&
                feedbackLayout !== 'none' && (React.createElement("div", { className: cls((_e = {},
                    _e[prefixCls + "-" + feedbackStatus + "-help"] = !!feedbackStatus,
                    _e[prefixCls + "-help"] = true,
                    _e[prefixCls + "-help-enter"] = true,
                    _e[prefixCls + "-help-enter-active"] = true,
                    _e)) }, feedbackText)),
            extra && React.createElement("div", { className: cls(prefixCls + "-extra") }, extra))));
};
// 适配
export var FormItem = connect(BaseItem, mapProps({ validateStatus: true, title: 'label', required: true }, function (props, field) {
    if (isVoidField(field))
        return {
            extra: props.extra || field.description,
        };
    if (!field)
        return props;
    var takeMessage = function () {
        var split = function (messages) {
            return messages.reduce(function (buf, text, index) {
                if (!text)
                    return buf;
                return index < messages.length - 1
                    ? buf.concat([text, ', '])
                    : buf.concat([text]);
            }, []);
        };
        if (field.validating)
            return;
        if (props.feedbackText)
            return props.feedbackText;
        if (field.selfErrors.length)
            return split(field.selfErrors);
        if (field.selfWarnings.length)
            return split(field.selfWarnings);
        if (field.selfSuccesses.length)
            return split(field.selfSuccesses);
    };
    return {
        feedbackText: takeMessage(),
        extra: props.extra || field.description,
    };
}, function (props, field) {
    var _a;
    if (isVoidField(field))
        return props;
    if (!field)
        return props;
    return {
        feedbackStatus: field.validateStatus === 'validating'
            ? 'pending'
            : ((_a = field.decorator[1]) === null || _a === void 0 ? void 0 : _a.feedbackStatus) || field.validateStatus,
    };
}, function (props, field) {
    if (isVoidField(field))
        return props;
    if (!field)
        return props;
    var asterisk = false;
    if (field.required && field.pattern !== 'readPretty') {
        asterisk = true;
    }
    if ('asterisk' in props) {
        asterisk = props.asterisk;
    }
    return {
        asterisk: asterisk,
    };
},function(props,field){ // 改动1 传入id字段
    const target = {}
    if(field){
        target.id = field.address.entire
    }
    return target
}));
FormItem.BaseItem = BaseItem;
export default FormItem;