import { OpenAPI3, PathItemObject, OperationObject, LicenseObject, ServerObject, SchemaObject } from "npm:openapi-typescript@6.7.5";
import { sortBy } from "https://deno.land/std@0.221.0/collections/mod.ts";
import { pascalCase } from "https://deno.land/x/case@2.2.0/mod.ts";

export const Metadata = new Map<URLPattern, OperationObject>();

export const Components = new Map<string, SchemaObject>();

export const Routes = {
    get: new Set<URLPattern>(),
    put: new Set<URLPattern>(),
    post: new Set<URLPattern>(),
    delete: new Set<URLPattern>(),
    patch: new Set<URLPattern>(),
}

export function getPathSorted() {
    const list = Object.values(Routes)
        .map(it => Array.from(it.values()))
        .flat();

    const sorted = sortBy(list, it => it.pathname);

    return sorted;
}

export function getUniquePaths() {
    const list = getPathSorted();

    const unique = new Set(list.map(it => it.pathname));

    return Array.from(unique.values());
}

export enum License {
    MIT,
    Apache2,
}

export const LicenseMap = {
    [ License.MIT ]: {
        identifier: "MIT",
        name: "MIT License",
        url: "https://opensource.org/licenses/MIT"
    },
    [ License.Apache2 ]: {
        identifier: "Apache-2.0",
        name: "Apache License 2.0",
        url: "https://www.apache.org/licenses/LICENSE-2.0"
    }
}

export function generateOpenAPISpec(options: { title?: string, version?: string, license?: License | LicenseObject, servers?: Partial<ServerObject>[] } = {}) {
    return <OpenAPI3>{
        openapi: "3.1.0",
        servers: [
            ...(options.servers ?? [ {} ]).map(item => ({
                url: "https://example.one/api",
                description: "Example server",
                variables: {},
                ...item
            }))
        ],
        components: {
            schemas: Object.fromEntries(Components),
            securitySchemes: {
                "jwtAuth": { 
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        info: {
            title: options?.title ?? "Example API",
            version: options?.version ?? "1.0.0",
            license: typeof options.license === "number" ? LicenseMap[ options.license ] : options.license
        },
        paths: Object.fromEntries(getUniquePaths()
            .map(path => {
                const obj: PathItemObject = {};
                const pattern = new URLPattern({ pathname: path });
                const getPattern = hasInSet(Routes.get, pattern);
                const putPattern = hasInSet(Routes.put, pattern);
                const postPattern = hasInSet(Routes.post, pattern);
                const deletePattern = hasInSet(Routes.delete, pattern);
                const patchPattern = hasInSet(Routes.patch, pattern);

                if (getPattern) {
                    obj.get = {
                        operationId: "get" + pathToString(path),
                        responses: {},
                        security: [],
                        ...Metadata.get(getPattern)
                    };
                }

                if (putPattern) {
                    obj.put = {
                        operationId: "put" + pathToString(path),
                        responses: {},
                        security: [],
                        ...Metadata.get(putPattern)
                    };
                }

                if (postPattern) {
                    obj.post = {
                        operationId: "post" + pathToString(path),
                        responses: {},
                        security: [],
                        ...Metadata.get(postPattern)
                    };
                }

                if (deletePattern) {
                    obj.delete = {
                        operationId: "delete" + pathToString(path),
                        responses: {},
                        security: [],
                        ...Metadata.get(deletePattern)
                    };
                }

                if (patchPattern) {
                    obj.patch = {
                        operationId: "patch" + pathToString(path),
                        responses: {},
                        security: [],
                        ...Metadata.get(patchPattern)
                    };
                }

                return [ path, obj ];
            })
        )
    };
}

function pathToString(path: string) {
    return path
        .split("/")
        .filter(x => x) // remove empty strings
        .reverse()
        .filter((_, index, arr) => arr.some(x => x.startsWith("@")) ? index <= arr.findIndex(x => x.startsWith("@")) : true)
        .map(name => name.startsWith(":") ? name.replace("Id", "") : name)
        .map(name => pascalCase(name))
        .join("By");
}

function hasInSet(set: Set<URLPattern>, url: URLPattern) {
    for (const item of set) {
        if (item.pathname === url.pathname) {
            return item;
        }
    }

    return undefined;
}