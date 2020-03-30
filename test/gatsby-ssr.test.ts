import {
    onRenderBody,
} from "../src/gatsby-ssr";
import { PluginOptions } from '../src/types';


describe("onRenderBody", () => {

    test("expect setHeadComponents to have been called", () => {
        const repositoryName: string = "foo";
        const setHeadComponents: jest.Mock<any, any>= jest.fn();
  
        const options: PluginOptions = {
            repositoryName,
            plugins: [],
            schemas: { page: {} },
        };

        onRenderBody({ setHeadComponents }, options);

        expect(setHeadComponents).toBeCalledTimes(1)
        

    });

    test("expect setHeadComponents not to have been called", () => {
        const repositoryName: string = "foo";
        const setHeadComponents: jest.Mock<any, any>= jest.fn();
  
        const options: PluginOptions = {
            repositoryName,
            plugins: [],
            schemas: { page: {} },
            omitPrismicScript: true,
        };

        onRenderBody({ setHeadComponents }, options);

        expect(setHeadComponents).not.toHaveBeenCalled
        

    });

});