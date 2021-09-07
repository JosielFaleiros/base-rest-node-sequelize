import TYPES from './app/types/types';
import {Container} from 'inversify';
import ExampleService from "./app/services/ExampleService";
import AnotherService from "./app/services/AnotherService";

const DIContainer = new Container({skipBaseClassChecks: true});

DIContainer.bind<ExampleService>(TYPES.ExampleService ).to(ExampleService).inSingletonScope();
DIContainer.bind<ExampleService>(TYPES.AnotherService ).to(AnotherService).inSingletonScope();
export {DIContainer};