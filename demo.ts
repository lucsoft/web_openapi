import { Components, Routes, generateOpenAPISpec } from "./mod.ts";

Components.set("User", {
    type: "object",
    properties: {
        id: { type: "string" },
        name: { type: "string" },
        email: { type: "string" },
        age: { type: "number" },
    }
})

const add = (method: keyof typeof Routes, ...paths: string[]) => paths.forEach(pathname => Routes[ method ].add(new URLPattern({ pathname })));

add("get",
    "/users",
    "/users/@me",
    "/users/:userId",
    "/users/:userId/posts",
    "/users/:userId/posts/:postId",
    "/users/:userId/posts/:postId/comments",
    "/users/:userId/posts/:postId/comments/:commentId",
    "/users/:userId/posts/:postId/comments/:commentId/reactions",
    "/guilds",
    "/guilds/:guildId",
    "/guilds/:guildId/channels",
    "/guilds/:guildId/channels/:channelId",
    "/guilds/:guildId/channels/:channelId/messages",
    "/guilds/:guildId/channels/:channelId/messages/:messageId",
    "/guilds/:guildId/channels/:channelId/messages/:messageId/reactions",
);
add("post", "/guilds/:guildId/channels/:channelId/messages");
add("put", "/users/:userId");
add("patch", "/users/@me");
add("head", "/users/:userId");
add("delete", "/guilds/:guildId");

Deno.writeTextFileSync("demo.json", JSON.stringify(generateOpenAPISpec({ title: "Demo API" }), null, 4));

await new Deno.Command("deno", { args: [ "run", "-A", "npm:@redocly/cli", "lint", "--extends=minimal", "demo.json" ] }).spawn().status;
