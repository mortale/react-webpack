import FormilyField from './formily-field'
const transformSchema = (originData: any[],manualContorlField:(field:FormilyField)=>FormilyField =(f)=>f) => {
    const properties = originData.reduce((acc, originInfo) => {
        try {
            const { id, ...props } = originInfo
            let formilyField = new FormilyField(props)
            formilyField = manualContorlField(formilyField)
            acc[id] = formilyField
        } catch (err) {
            console.error(err)
        }
        return acc
    }, {})
    return { type: 'object', properties }
}

export default transformSchema