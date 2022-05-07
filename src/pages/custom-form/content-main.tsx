import React from 'react'
import { Layout, Input, Select } from 'antd'
import { Drag, SimulatorWrap, SetterPane } from '../../components/formily'
import { rootContext, formDesignContext } from './context'
import ContentHeader from './content-header'
const { Content, Sider } = Layout
const { TextArea } = Input
const expandFields = {
    CustomDataSourceSetter: Input,
    AssociateDataSourceSetter: () => "AssociateDataSourceSetter",
    NonEditableInfoSetter: (props: any) => <Select options={[{ key: "1", value: "1" }, { key: "2", value: "2" }]} {...props} />,
}
interface IDragGroupProps {
    dataSource: Array<{ name: string, uniquelySign: string }>
}

const DragGroup: React.FC<IDragGroupProps> = ({ dataSource }) => {
    return <div style={{ display: "flex", flexDirection: "column", padding: "8px 16px" }}>
        {dataSource.map((el: any) => {
            return <Drag key={el.uniquelySign} uniquelySign={el.uniquelySign} info={el} style={{ marginBottom: "8px" }} />
        })}
    </div>
}


const reducer = (state: any, actions: any) => {
    switch (actions.type) {
        case 'json':
            return { ...state, showSetterPane: false, showSimulatorWrap: false, json: actions.json }
        case 'design':
            return { ...state, showSetterPane: true, showSimulatorWrap: true }
        default:
            return state
    }
}

const defaultState = {
    showSimulatorWrap: true,
    showSetterPane: true,
    json: {}
}

const ContentMain: React.FC<IDragGroupProps> = ({ dataSource }) => {
    const { formDesignRef } = React.useContext(formDesignContext)
    const { prefix } = React.useContext(rootContext)
    const [{ showSetterPane, showSimulatorWrap, json }, dispatch] = React.useReducer(reducer, { ...defaultState })

    const onChange = React.useCallback((sign) => {
        const task = sign === 'json' ? formDesignRef.current.submit() : Promise.resolve()
        task.then((result: any) => {
            dispatch({ type: sign, [sign]: result })
        })
    }, [])

    return <Layout style={{ height: "100%" }}>
        <Sider theme="light" width={300}>
            <DragGroup dataSource={dataSource} />
        </Sider>
        <Content className={`flex ${prefix}-content-main`}   >
            <ContentHeader onChange={onChange} />
            <div className={`${prefix}-operation-content`}>
                {showSimulatorWrap && <SimulatorWrap />}
                {!showSimulatorWrap && <div className={`${prefix}-json-show`}>
                    <TextArea
                        className={`${prefix}-json-show-main`}
                        value={JSON.stringify(json, undefined, '\t')}
                        bordered={false}
                        autoSize={true}
                    />
                </div>}
            </div>
        </Content>
        {showSetterPane && <Sider theme="light" width={360} style={{ padding: "8px 16px", height: "100%", overflow: "overlay" }} >
            <SetterPane
                expandFields={expandFields}
            />
        </Sider>}
    </Layout>
}
export default ContentMain