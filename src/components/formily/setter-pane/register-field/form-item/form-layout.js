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

import { createContext, useContext } from 'react';
export var FormLayoutDeepContext = createContext(null);
export var FormLayoutShallowContext = createContext(null);
export var useFormDeepLayout = function () { return useContext(FormLayoutDeepContext); };
export var useFormShallowLayout = function () { return useContext(FormLayoutShallowContext); };
export var useFormLayout = function () { return (__assign(__assign({}, useFormDeepLayout()), useFormShallowLayout())); };