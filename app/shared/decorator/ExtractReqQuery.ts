import {Op} from "sequelize";

export const ExtractReqQuery = (options: {modelAttrs: Object}): MethodDecorator => {
    const {modelAttrs} = options;
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        let originalMethod = descriptor.value;
        //wrapping the original method
        descriptor.value = async function (req, res) {
            try {
                console.log("wrapped function: before invoking " + propertyKey);
                const options = await treatRequestQuery(req, modelAttrs);
                let result = await originalMethod.apply(this, [{...req, options}, res]);
                console.log("wrapped function: after invoking " + propertyKey);
                return result;
            } catch (e) {
                console.log('ExtractReqQuery error in decorator ', e);
                throw new Error('ExtractReqQuery error');
            }
        }
    }
}

const mapOrAttr = async (value, k) => {
    if (typeof value !== 'string') return mapAttrType(value, k)

    const query = value.split(';').map(el => el.replace(/\n/g, '')).filter(el => el!='')
    if (query.length <= 1) return mapAttrType(value, k)

    return {
        [Op.or]: await Promise.all(query.map(q => mapAttrType(q.trim(), k)))
    }
}

const mapAttrType = (value, k) => {
    if (['id', '_id'].includes(k) && !isNaN(value)) {
        return parseInt(value)
    }
    if (['false', 'true'].includes(value)) {
        return (value === 'true')
    }
    return value
}

const treatRequestQuery = async (req, modelAttrs = {}, options = {removeNotInTable: true}) => {
    let where = {}

    // array query
    await Promise.all(Object.keys(req.query)
        .filter(k => typeof req.query[k] === 'object')
        .map(async k => {
            console.log(k)
            if (Array.isArray(req.query[k])) where[k] = { [Op.in]: await Promise.all(req.query[k].map((value) => mapAttrType(value, k))) }
            else where[k] = req.query[k]
        }))

    // simple query map
    await Promise.all(Object.keys(req.query)
        .filter(k => typeof req.query[k] !== 'object')
        .map(async (k) => {
            where[k] = await mapOrAttr(req.query[k], k)
        }))

    if (options.removeNotInTable == true) {
        // remove table not existing query
        await Promise.all(Object.keys(where)
            .filter(k => !Object.keys(modelAttrs).includes(k))
            .map(k => { delete where[k] }))
    }

    // treat like query
    await Promise.all(Object.keys(where)
        .filter(k => typeof where[k] === 'string')
        .filter(k => where[k].includes('%'))
        .map(k => { where[k] = { like: where[k] } }))

    const isArrAndNotEmpty = (where, k) => {
        try {
            return Array.isArray(JSON.parse(where[k])) && JSON.parse(where[k]).length > 0
        } catch (e) {
            return false
        }
    }
    const isArrAndIsEmpty = (where, k) => {
        try {
            return Array.isArray(JSON.parse(where[k])) && JSON.parse(where[k]).length <= 0
        } catch (e) {
            return false
        }
    }

    // treat op or query
    await Promise.all(Object.keys(where)
        .filter(k => isArrAndNotEmpty(where, k))
        .map(k => { where[k] = { [Op.or]: JSON.parse(where[k]).reduce((acc, cv) => ([...acc, {[Op.eq]: `${cv}`}]), []) } }))

    await Promise.all(Object.keys(where)
        .filter(k => isArrAndIsEmpty(where, k))
        .map(k => { delete where[k] }))

    // treat ordering
    let order = []
    if (Array.isArray(req.query['sort-field'])) {
        order = [
            ...req.query['sort-field']
                .map((field, i) => ([req.query['sort-field'][i], req.query['sort-type'][i]]) )
        ]
    }

    // treat pagination
    let limit, perPage, page, offset
    if (req.query.perPage) perPage = Number(req.query.perPage)
    if (req.query.page) page = Number(req.query.page) -1
    if (req.query.page) {
        offset = page * perPage
        limit = perPage
    }
    return {where, limit, offset, order}
}
