import {FindCountAllDto} from "./dto/FindCountAllDto";
import {injectable} from "inversify";
import {Repository} from "../models";

@injectable()
export default class CommonService {
  private modelName: string;
  private repository;

  constructor(modelName) {
    this.repository = Repository.getModelRepository(modelName);

    console.log(`CommonService<${modelName}>.constructor()`);
    this.modelName = modelName
  }

  async find(req, options = {
    where: { id: req.query.id }
  }) {
    return this.repository.findOne(options)
  }

  async findAndCountAll(req, options :any = {
    where: req.query.id ? { id: req.query.id } : undefined
  }): Promise<FindCountAllDto> {
    return this.repository.findAndCountAll(options)
  }

  async findAll(req, options) {
    // let result = await this.repository.findAll({ include: [models.Another]})
    return this.repository.findAll({...options, individualHooks: true})
  }

  async create(object, req, options = {}) {
    return this.repository.create(object, {...options, individualHooks: true})
  }

  async bulkCreate(objectArr, req, options = {}) {
    return this.repository.bulkCreate(objectArr, {...options, individualHooks: true})
  }

  async update(object, req, options: { where?: {id?: number}} ) {
    return this.repository.update( object, {
      ...options,
      where: { ...options?.where, id: object.id || options?.where?.id },
      individualHooks: true
    })
  }

  async destroy(id, req, options) {
    return this.repository.destroy({ where: {id: id}, ...options, individualHooks: true })
  }
}
