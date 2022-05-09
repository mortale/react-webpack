import React from 'react'
import { Layout, Input, Select } from 'antd'
import { Drag, SimulatorWrap, SetterPane } from '../../components/formily'
import { rootContext, formDesignContext } from './context'
import ContentHeader from './content-header'
import transformSchema from '../../components/formily-example/schema'
import Form from '../../components/formily-example'
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

const FormContent: React.FC<any> = ({ json }) => {
    const schema = React.useMemo(() => transformSchema(json), [json])
    return <div style={{width:800,margin:"0 auto"}}>
        <Form schema={schema} />
    </div> 
}

const manualContorlField = (formilyField: any) => {
    const dealWith = (value: any): any => {
        if (Array.isArray(value)) {
            return value.map(dealWith)
        } else if (typeof value === 'object') {
            const targetData: any = {}
            for (var key in value) {
                targetData[key] = dealWith(value[key])
            }
            return targetData
        } else if (typeof value === 'function') {
            return value.toString()
        } else {
            return value
        }
    }

    for (var key in formilyField) {
        formilyField[key] = dealWith(formilyField[key])
    }
    return formilyField
}
interface IDisplayJsonProps {
    prefix: string
    json: any[]
}

const DisplayJson: React.FC<IDisplayJsonProps> = ({ prefix, json }) => {
    const [data, setData] = React.useState<any>(json)

    const onChange = React.useCallback((key: string) => {
        if (key === "origin") {
            setData(json)
        } else {
            const schema = transformSchema(json, manualContorlField)
            setData(schema)
        }
    }, [])

    return <div className={`${prefix}-json-show`}>
        <Select
            style={{ width: 200 }}
            defaultValue='origin'
            options={[{ label: "原始数据", value: "origin" }, { label: "schema格式", value: "schema" }]}
            onChange={onChange}
        />
        <TextArea
            className={`${prefix}-json-show-main`}
            value={JSON.stringify(data, undefined, '\t')}
            bordered={false}
            autoSize={true}
        />
    </div>
}


const reducer = (state: any, actions: any) => {
    switch (actions.type) {
        case 'design':
            return { ...state, selectId: actions.type }
        case 'json':
            return { ...state, selectId: actions.type, json: actions.json }
        case "run":
            return { ...state, selectId: actions.type, json: actions.json }
        default:
            return state
    }
}

const defaultState = {
    selectId: "design",
    json: {}
}

const ContentMain: React.FC<IDragGroupProps> = ({ dataSource }) => {
    const { formDesignRef } = React.useContext(formDesignContext)
    const { prefix } = React.useContext(rootContext)
    const [{ selectId, json }, dispatch] = React.useReducer(reducer, { ...defaultState })

    const onChange = React.useCallback((sign) => {
        const task = ['json', 'run'].includes(sign) ? formDesignRef.current.submit().then((json: any) => ({ json })) : Promise.resolve()
        task.then((result: any) => {
            dispatch({ type: sign, ...result })
        })
    }, [])

    return <Layout style={{ height: "100%" }}>
        <Sider theme="light" width={300}>
            <DragGroup dataSource={dataSource} />
        </Sider>
        <Content className={`flex ${prefix}-content-main`}   >
            <ContentHeader onChange={onChange} />
            <div className={`${prefix}-operation-content`}>
                {selectId === 'design' && <SimulatorWrap />}
                {selectId === 'json' && <DisplayJson prefix={prefix!} json={json} />}
                {selectId === 'run' && <FormContent prefix={prefix!} json={json} />}
            </div>
        </Content>
        {selectId === 'design' && <Sider theme="light" width={360} style={{ padding: "8px 16px", height: "100%", overflow: "overlay" }} >
            <SetterPane
                expandFields={expandFields}
            />
        </Sider>}
    </Layout>
}
export default ContentMain