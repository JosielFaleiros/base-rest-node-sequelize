import "reflect-metadata";
import CommonController from './CommonController'
import ExampleService from '../services/ExampleService'
import {inject, injectable} from "inversify";
import TYPES from "../types/types";
import {FindAllResponseDto} from "./dto/FindAllResponseDto";
import {FindCountAllDto} from "../services/dto/FindCountAllDto";

@injectable()
export default class ExampleController {
  private exampleService: ExampleService;
  constructor(
      @inject(TYPES.ExampleService) exampleService: ExampleService
  ) {
    console.log(exampleService)
    this.exampleService = exampleService;
    // const attrs = require('../models/ExampleAttr')
    // super(ExampleService, attrs(), 'Example')
  }

  async findAndCountAll(req, res, next): Promise<FindAllResponseDto> {
    let transaction
    try {
      // const options = await this.treatRequestQuery(req)
      const options = {};
      // transaction = await this.models.sequelize.transaction()

      let result:FindCountAllDto
      // const tableOptions = await this.tableOptions(transaction)
      const tableOptions = [];
      result = await this.exampleService.findAndCountAll(req, options)
      // await transaction.commit()
      return res.status(200).send({ rows: result?.rows, tableOptions, totalRecords: result?.count, resultCount: result?.rows?.length })
    } catch (e) {
      if (transaction) await transaction.rollback()
      console.log(e)
      return res.status(400).send(e)
    }
  }
}
