import {FindAllResponseDto} from "../dto/FindAllResponseDto";

const modelsFn = require('../Repository')
import { Op } from 'sequelize'
import fs from 'fs'
import { ControllerType } from '../dto/ControllerType'
import {FindCountAllDto} from "../dto/FindCountAllDto";

// todo convert this in decorators
export default class CommonController implements ControllerType {
  private models: any;
  private modelName: any;
  private service: any;
  private modelAttrs: any[];
  constructor(ServiceClass, modelAttrs, modelName, optFn = () => {}) {
  // constructor() {
    this.models = modelsFn()
    this.modelName = modelName
    if (ServiceClass && modelName) {
      this.service = new ServiceClass(modelName, this.models, optFn())
    }
    this.modelAttrs = modelAttrs || []
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

  async extractWhere(req) {
    const { where } = await this.treatRequestQuery(req)
    return where
  }

  async findAllOwn(req, res, next) {
    let transaction
    try {
      const options = await this.treatRequestQuery(req)
      transaction = await this.models.sequelize.transaction()

      let result: FindAllResponseDto;
      const tableOptions = await this.tableOptions(transaction)
      result = await this.service.findAllOwn(req, {transaction, ...options})
      await transaction.commit()
      return res.status(200).send({ rows: result.rows, tableOptions, totalRecords: result.count })
    } catch (e) {
      if (transaction) await transaction.rollback()
      console.log(e)
      return res.status(400).send(e)
    }
  }

  async tableOptions(transaction) {
    return []
    // return this.models.TableManager.findAll({
    //   where: {table_name: this.models[this.modelName].tableName},
    //   transaction
    // })
  }

  async entityTableOptions(req, res, next) {
    let transaction
    try {
      let result = []
      const tableOptions = await this.tableOptions(undefined)
      // await transaction.commit()
      return res.status(200).send({ tableOptions })
    } catch (e) {
      if (transaction) await transaction.rollback()
      console.log(e)
      return res.status(400).send(e)
    }
  }

  async generateXLSX(req, res, next) {
    const options = await this.treatRequestQuery(req)
    let result
    const tableOptions = await this.tableOptions(undefined)

    result = await this.service.findAndCountAll(req, options)
    res.status(200).json({url: result})
  }

  isThere(fullfile, filepath) {
    return fs.existsSync(require('path').join(__dirname, '../..' + filepath, fullfile))
  }

  async findAndCountAll(req, res, next) {
    let transaction
    try {
      const options = await this.treatRequestQuery(req)
      // transaction = await this.models.sequelize.transaction()

      let result: FindCountAllDto;
      const tableOptions = await this.tableOptions(transaction)
      result = await this.service.findAndCountAll(req, {transaction, ...options})
      // await transaction.commit()
      return res.status(200).send({ rows: result.rows, tableOptions, totalRecords: result.count, resultCount: result.rows.length })
    } catch (e) {
      if (transaction) await transaction.rollback()
      console.log(e)
      return res.status(400).send(e)
    }
  }

  async create(req, res, next) {
    let transaction
    try {
      transaction = await this.models.sequelize.transaction()
      let result = await this.service.create(req.body, req, { transaction })
      if (result && typeof result.toJSON == 'function') result = result.toJSON()

      if (result.validation) await transaction.rollback()
      else await transaction.commit()
      return res.status(200).send({ ...result, success: result.validation? false: true, message: result.message? result.message: result.validation? 'Erro ao cadastrar!': 'Sucesso ao cadastrar!' })
    } catch (e) {
      console.log(e)
      if (transaction) await transaction.rollback()
      return res.status(500).send(e.message)
    }
  }

  async update(req, res, next) {
    let transaction
    try {
      transaction = await this.models.sequelize.transaction()
      let result = await this.service.update(req.body, req, {transaction})
      await transaction.commit()
      if (result.message) return res.status(200).send({ ...result, success: result.result[0] == 1})
      return res.status(200).send({ ...result, result, success: result[0] == 1, message: result[0] == 1? 'Sucesso ao editar!': 'Erro ao editar!' })
    } catch (e) {
      console.log(e)
      if (transaction) await transaction.rollback()
      return res.status(500).send(e.message)
    }
  }

  async destroy(req, res, next) {
    let transaction
    try {
      transaction = await this.models.sequelize.transaction()
      let result = await this.service.destroy(req.query.id, req)
      await transaction.commit()
      return res.status(200).send(result)
    } catch (e) {
      console.log(e)
      if (transaction) await transaction.rollback()
      return res.status(500).send(e.message)
    }
  }
}
