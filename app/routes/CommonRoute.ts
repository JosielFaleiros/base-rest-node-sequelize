import CommonController from "../controllers/CommonController";
import {DIContainer} from "../../inversify.config";

export default class CommonRoute {
  private controller: CommonController;
  private app: any;
  private entityName: any;
  constructor(ControllerClass, app, entityName) {
    const controller = DIContainer.resolve<CommonController>(ControllerClass);
    console.log('controller ', controller, ControllerClass)
    this.controller=controller;

    // this.controller = new ControllerClass()
    this.app = app
    this.entityName = entityName? entityName.replace('_', '-'): undefined

    this.setupRoutes()
  }

  /**
   * authorization layer?
   * override the methods with the defineds authorization chains
   */
  setupRoutes() {
    // this.app.get(`/${this.entityName}/spreadsheet.xlsx`, this.controller.generateXLSX.bind(this.controller))
    this.app.get(`/${this.entityName}`, this.controller.findAndCountAll.bind(this.controller))
    // this.app.get(`/${this.entityName}/table-options`, this.controller.entityTableOptions.bind(this.controller))
    // this.app.post(`/${this.entityName}`, this.controller.create.bind(this.controller))
    // this.app.put(`/${this.entityName}`, this.controller.update.bind(this.controller))
    // this.app.delete(`/${this.entityName}`, this.controller.destroy.bind(this.controller))

  }
}
