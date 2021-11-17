import {FindCountAllDto} from "./dto/FindCountAllDto";
import {Repository} from "./Repository";

export default class CommonService {
  private modelName: string;
  protected repository;
  protected sequelize: any;

  constructor(modelName) {
    this.repository = Repository.getModelRepository(modelName);
    this.sequelize = Repository.getSequelize();

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

  async update(object, options: { where?: {id?: number}} ) {
      const result = await this.repository.update( object, {
        ...options,
        where: { ...options?.where, id: object.id || options?.where?.id },
        individualHooks: true
      })
      return result;
  }

  async destroy(id, req, options) {
    return this.repository.destroy({ where: {id}, ...options, individualHooks: true })
  }
}
