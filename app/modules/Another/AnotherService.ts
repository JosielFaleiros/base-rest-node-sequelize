import CommonService from '../../shared/CommonService'
import {injectable} from "inversify";

@injectable()
export default class AnotherService extends CommonService {
  constructor() {
    super('Another')
  }
}
