import { RequestMethod } from "./Controller";
import { RequestMethodDecoratorFactory } from "./HttpMethod";

export const Post = RequestMethodDecoratorFactory(RequestMethod.POST);
