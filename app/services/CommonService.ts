import Sequelize from 'sequelize'
import {FindCountAllDto} from "./dto/FindCountAllDto";
import {injectable} from "inversify";
const Op = Sequelize.Op

@injectable()
export default class CommonService {
  modelName;
  models;
  constructor(modelName, models) {
    this.modelName = modelName
    this.models = models
  }

  async find(req, options = {
    where: { id: req.query.id }
  }) {
    return this.models[this.modelName].findOne(options)
  }

  async findAndCountAll(req, options :any = {
    where: req.query.id ? { id: req.query.id } : undefined
  }): Promise<FindCountAllDto> {
    return this.models[this.modelName].findAndCountAll(options)
  }

  async findAll(req, options) {
    // let result = await this.models[this.modelName].findAll({ include: [models.Another]})
    return this.models[this.modelName].findAll({...options, individualHooks: true})
  }

  async create(object, req, options = {}) {
    return this.models[this.modelName].create(object, {...options, individualHooks: true})
  }

  async bulkCreate(objectArr, req, options = {}) {
    return this.models[this.modelName].bulkCreate(objectArr, {...options, individualHooks: true})
  }

  async update(object, req, options: { where?: {id?: number}} ) {
    return this.models[this.modelName].update( object, {
      ...options,
      where: { ...options?.where, id: object.id || options?.where?.id },
      individualHooks: true
    })
  }

  async destroy(id, req, options) {
    return this.models[this.modelName].destroy({ where: {id: id}, ...options, individualHooks: true })
  }
}
