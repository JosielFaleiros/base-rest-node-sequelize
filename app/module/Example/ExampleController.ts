import "reflect-metadata";
import ExampleService from './ExampleService'
import {inject, injectable} from "inversify";
import TYPES from "../../types/types";
import {FindAllResponseDto} from "../../shared/dto/FindAllResponseDto";
import {FindCountAllDto} from "../../shared/dto/FindCountAllDto";
import {ControllerType} from "../../shared/dto/ControllerType";
import {Controller} from "../../shared/decorator/Controller";
import {Get} from "../../shared/decorator/Get";
import {Post} from "../../shared/decorator/Post";
import {Put} from "../../shared/decorator/Put";
import {Delete} from "../../shared/decorator/Delete";
import { Exception } from "../../shared/decorator/Exception";

@injectable()
@Controller('/example')
export default class ExampleController implements ControllerType {
  private exampleService: ExampleService;
  constructor(
      @inject(TYPES.ExampleService) exampleService: ExampleService
  ) {
    console.log('ExampleController.constructor()');
    // console.log(exampleService)
    this.exampleService = exampleService;
    const attrs = require('../../shared/entities/ExampleAttr')
  }

  @Get('')
  async findAndCountAll(req, res): Promise<FindAllResponseDto> {
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
      console.log(e)
      return res.status(400).send(e)
    }
  }

  @Post('')
  async create(req, res) {
    const result = await this.exampleService.create(req.body, req, {});
    return res.status(200).send(result);
  }

  @Put('/queue')
  enqueue() {
    const que = this.exampleService.queueProvider.getQueue('asdf3');

    (new Array(1000)).fill(0).map((el, id) => que.add({id: 3, name: `${id} name`}))
    // que.process(async job => {
    //   console.log('process job ', job.id, job.data);
    //   return
    // })
    return;
  }

  @Put('')
  async update(req, res) {
    const result = await this.exampleService.update(req.body, req);
    return res.status(200).send(result);
  }

  @Delete('/:id')
  @Exception()
  async delete(req, res) {
    const result = await this.exampleService.destroy(req?.params?.id, req.body, req);
    return res.status(200).send({result});
  }
}
