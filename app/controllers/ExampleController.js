import CommonController from './CommonController'
import ExampleService from '../services/ExampleService'

export default class GroupController extends CommonController {
  constructor() {
    const attrs = require('../models/ExampleAttr')
    super(ExampleService, attrs(), 'Example')
  }
}
