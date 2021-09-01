import CommonService from './CommonService'
import {injectable} from "inversify";
import models from '../models';

@injectable()
export default class ExampleService extends CommonService {
  constructor() {
    super('Example', models())
  }
}
