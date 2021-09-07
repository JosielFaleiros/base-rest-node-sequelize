import CommonService from './CommonService'
import {injectable} from "inversify";

@injectable()
export default class ExampleService extends CommonService {
  constructor() {
    super('Example')
  }
}
