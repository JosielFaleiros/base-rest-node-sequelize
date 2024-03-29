import "reflect-metadata";
import ExampleService from './ExampleService'
import {inject, injectable} from "inversify";
import TYPES from "../../types/types";
import {FindAllResponseDto} from "../../shared/dto/FindAllResponseDto";
import {FindCountAllDto} from "../../shared/dto/FindCountAllDto";
import {ControllerType} from "../../shared/dto/ControllerType";
import {Controller} from "../../shared/decorator/Controller";
import {Get} from "../../shared/decorator/Get";

@Controller('/example')
@injectable()
export default class ExampleController  implements ControllerType {
  private exampleService: ExampleService;
  constructor(
      @inject(TYPES.ExampleService) exampleService: ExampleService
  ) {
    console.log('ExampleController.constructor()');
    // console.log(exampleService)
    this.exampleService = exampleService;
    // const attrs = require('../models/ExampleAttr')
    // super(ExampleService, attrs(), 'Example')
  }

  @Get('')
  async findAndCountAll(req, res, next): Promise<FindAllResponseDto> {
    try {
      // todo use decorator for this const options = await this.treatRequestQuery(req)
      const options = {};

      let result:FindCountAllDto
      // todo think about it, maybe as optional per necessity const tableOptions = await this.tableOptions(transaction)
      const tableOptions = [];
      result = await this.exampleService.findAndCountAll(req, options)
      // await transaction.commit()
      return res.status(200).send({ rows: result?.rows, tableOptions, totalRecords: result?.count, resultCount: result?.rows?.length })
    } catch (e) {
      console.log(e)
      return res.status(400).send(e)
    }
  }
}
