import { Op } from 'sequelize'
import {Repository} from "../Repository";
import {injectable} from "inversify";

// todo convert this in decorators
@injectable()
export default class TableOptionsProvider {
  private models: any;
  private modelName: any;
  private service: any;
  private modelAttrs: any[];
  private repository: any;

  public setTargetRepositoryName(modelName: string) {
    this.modelName = modelName;
    this.repository = Repository.getModelRepository(modelName);
  }

  mapAttrType(value, k) {
    if (['id', '_id'].includes(k) && !isNaN(value)) {
      return parseInt(value)
    }
    if (['false', 'true'].includes(value)) {
      return (value === 'true')
    }
    return value
  }

  async mapOrAttr(value, k) {
    if (typeof value !== 'string') return this.mapAttrType(value, k)

    const query = value.split(';').map(el => el.replace(/\n/g, '')).filter(el => el!='')
    if (query.length <= 1) return this.mapAttrType(value, k)

    return {
      [Op.or]: await Promise.all(query.map(q => this.mapAttrType(q.trim(), k)))
    }
  }

  async treatRequestQuery(req, options = {removeNotInTable: true}) {
    let where = {}

    // array query
    await Promise.all(Object.keys(req.query)
      .filter(k => typeof req.query[k] === 'object')
      .map(async k => {
        console.log(k)
        if (Array.isArray(req.query[k])) where[k] = { [Op.in]: await Promise.all(req.query[k].map((value) => this.mapAttrType(value, k))) }
        else where[k] = req.query[k]
      }))

    // simple query map
    await Promise.all(Object.keys(req.query)
      .filter(k => typeof req.query[k] !== 'object')
      .map(async (k) => {
        where[k] = await this.mapOrAttr(req.query[k], k)
      }))

    if (options.removeNotInTable == true) {
      // remove table not existing query
      await Promise.all(Object.keys(where)
        .filter(k => !Object.keys(this.modelAttrs).includes(k))
        .map(k => { delete where[k] }))
    }

    // treat like query
    await Promise.all(Object.keys(where)
      .filter(k => typeof where[k] === 'string')
      .filter(k => where[k].includes('%'))
      .map(k => { where[k] = { like: where[k] } }))

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

  async tableOptions(transaction) {
    return []
    // return this.models.TableManager.findAll({
    //   where: {table_name: this.models[this.modelName].tableName},
    //   transaction
    // })
  }
}
