export default class CommonRoute {
  constructor(ControllerClass, app, entityName) {
    this.controller = new ControllerClass()
    this.app = app
    this.entityName = entityName? entityName.replace('_', '-'): undefined

    this.setupRoutes()
  }

  /**
   * authorization layer?
   * override the methods with the defineds authorization chains
   */
  setupRoutes() {
    this.app.get(`/${this.entityName}/spreadsheet.xlsx`, this.controller.generateXLSX.bind(this.controller))
    this.app.get(`/${this.entityName}`, this.controller.findAndCountAll.bind(this.controller))
    this.app.get(`/${this.entityName}/table-options`, this.controller.entityTableOptions.bind(this.controller))
    this.app.post(`/${this.entityName}`, this.controller.create.bind(this.controller))
    this.app.put(`/${this.entityName}`, this.controller.update.bind(this.controller))
    this.app.delete(`/${this.entityName}`, this.controller.destroy.bind(this.controller))
  }
}
