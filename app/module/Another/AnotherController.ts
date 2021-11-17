import "reflect-metadata";
import AnotherService from './AnotherService'
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
import {ExtractReqQuery} from "../../shared/decorator/ExtractReqQuery";
const attrs = require('../../shared/entitie/AnotherAttr')

@injectable()
@Controller('/another')
export default class AnotherController implements ControllerType {
  private anotherService: AnotherService;
  constructor(
      @inject(TYPES.AnotherService) anotherService: AnotherService
  ) {
    console.log('AnotherController.constructor()');
    // console.log(anotherService)
    this.anotherService = anotherService;
  }

  @ExtractReqQuery({modelAttrs: attrs()})
  @Get('')
  async findAndCountAll(req, res): Promise<FindAllResponseDto> {
    console.log('req.options ', req.options);

    try {
      // const options = await this.treatRequestQuery(req)
      const options = {};
      // transaction = await this.models.sequelize.transaction()

      let result:FindCountAllDto
      // const tableOptions = await this.tableOptions(transaction)
      const tableOptions = [];
      result = await this.anotherService.findAndCountAll(req, options)
      // await transaction.commit()
      return res.status(200).send({ rows: result?.rows, tableOptions, totalRecords: result?.count, resultCount: result?.rows?.length })
    } catch (e) {
      console.log(e)
      return res.status(400).send(e)
    }
  }

  @Post('')
  async create(req, res) {
    const result = await this.anotherService.create(req.body, req, {});
    return res.status(200).send(result);
  }

  @Put('/queue')
  enqueue(req, res) {
    const que = this.anotherService.queueProvider.getQueue('asdf3');

    (new Array(1000)).fill(0).map((el, id) => que.add({id: 3, name: `${id} name`}))
    // que.process(async job => {
    //   console.log('process job ', job.id, job.data);
    //   return
    // })
    res.status(200).send('ok');
  }

  @Put('')
  async update(req, res) {
    const result = await this.anotherService.update(req.body, req);
    return res.status(200).send(result);
  }

  @Delete('/:id')
  @Exception()
  async delete(req, res) {
    const result = await this.anotherService.destroy(req?.params?.id, req.body, req);
    return res.status(200).send({result});
  }
}
