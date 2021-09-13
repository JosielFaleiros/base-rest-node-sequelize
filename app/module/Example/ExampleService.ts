import CommonService from '../../shared/CommonService'
import {injectable} from "inversify";

@injectable()
export default class ExampleService extends CommonService {
  constructor() {
    super('Example')
  }
}
