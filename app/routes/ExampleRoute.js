import ExampleController from '../controllers/ExampleController'
import CommonRoute from './CommonRoute'

export default class ExampleRoute extends CommonRoute {
  constructor(app) {
    super(ExampleController, app, 'example')
  }
}
