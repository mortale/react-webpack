import React from "react";
interface IProps {
  prefix?: string;
}
const rootContext = React.createContext<IProps>({});
const formDesignContext = React.createContext<any>({});
export { rootContext, formDesignContext };
