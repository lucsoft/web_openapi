// deno-lint-ignore-file no-import-prefix
import { toPascalCase } from "jsr:@std/text@1.0.19";
import type { OpenAPI3, PathItemObject, OperationObject, ServerObject, SchemaObject } from "npm:openapi-typescript@7.13.0";

export const Metadata = new Map<URLPattern, OperationObject>();

export const Components = new Map<string, SchemaObject>();

export const Routes = {
    get: new Set<URLPattern>(),
    put: new Set<URLPattern>(),
    post: new Set<URLPattern>(),
    delete: new Set<URLPattern>(),
    patch: new Set<URLPattern>(),
    head: new Set<URLPattern>(),
}

export function generateOpenAPISpec(options: { title?: string, version?: string, servers?: ServerObject[] } = {}) {
    const paths = new Map<string, PathItemObject>();

    for (const [ method, patterns ] of Object.entries(Routes) as [ keyof typeof Routes, Set<URLPattern> ][]) {
        for (const pattern of patterns) {
            const item = paths.get(pattern.pathname) ?? {};
            item[ method ] ??= {
                operationId: `${method}${pathToString(pattern.pathname)}`,
                ...Metadata.get(pattern)
            };
            paths.set(pattern.pathname, item);
        }
    }

    return {
        openapi: "3.1.0",
        servers: options.servers,
        components: {
            schemas: Object.fromEntries(Components),
            securitySchemes: { bearerAuth: { type: "http", scheme: "bearer" } }
        },
        info: {
            title: options.title ?? "Example API",
            version: options.version ?? "1.0.0"
        },
        paths: Object.fromEntries([ ...paths ]
            .toSorted(([ a ], [ b ]) => a < b ? -1 : a > b ? 1 : 0)
            .map(([ path, item ]) => [ path.replaceAll(/\/:([^/]*)/g, "/{$1}"), item ]))
    } satisfies OpenAPI3;
}

function pathToString(path: string) {
    const segments = path.split("/").filter(Boolean);

    return segments
        .slice(segments.findLastIndex(it => it.startsWith("@")) + 1)
        .toReversed()
        .map(name => toPascalCase(name.startsWith(":") ? name.replace(/Id$/, "") : name))
        .join("By");
}
