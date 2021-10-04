import TYPES from './app/types/types';
import {Container} from 'inversify';
import ExampleService from "./app/module/Example/ExampleService";
import AnotherService from "./app/module/Another/AnotherService";
import {QueueProvider} from "./app/shared/provider/Queue.provider";

const DIContainer = new Container({skipBaseClassChecks: true});

DIContainer.bind<ExampleService>(TYPES.ExampleService ).to(ExampleService).inSingletonScope();
DIContainer.bind<AnotherService>(TYPES.AnotherService ).to(AnotherService).inSingletonScope();
DIContainer.bind<QueueProvider>(TYPES.QueueProvider ).to(QueueProvider).inSingletonScope();
export {DIContainer};
