import "reflect-metadata";
import AnotherService from '../../services/AnotherService'
import {inject, injectable} from "inversify";
import TYPES from "../../types/types";
import {FindAllResponseDto} from "../../controllers/dto/FindAllResponseDto";
import {FindCountAllDto} from "../../services/dto/FindCountAllDto";
import {ControllerType} from "../../controllers/dto/ControllerType";
import {Controller} from "../../decorator/Controller";
import {Get} from "../../decorator/Get";

@Controller('/another')
@injectable()
export default class AnotherController implements ControllerType {
  private anotherService: AnotherService;
  constructor(
      @inject(TYPES.AnotherService) anotherService: AnotherService
  ) {
    console.log('AnotherController.constructor()');
    // console.log(anotherService)
    this.anotherService = anotherService;
    const attrs = require('./AnotherAttr')
  }

  @Get('')
  async findAndCountAll(req, res, next): Promise<FindAllResponseDto> {
    let transaction
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
      if (transaction) await transaction.rollback()
      console.log(e)
      return res.status(400).send(e)
    }
  }
}
