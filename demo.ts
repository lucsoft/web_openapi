import { Routes, generateOpenAPISpec } from "./mod.ts";

Routes.get.add(new URLPattern({ pathname: "/users" }));
Routes.get.add(new URLPattern({ pathname: "/users/:userId/posts/:postId/comments" }));
Routes.get.add(new URLPattern({ pathname: "/users/@me" }));
Routes.get.add(new URLPattern({ pathname: "/users/:userId" }));
Routes.get.add(new URLPattern({ pathname: "/users/:userId/posts/:postId" }));
Routes.get.add(new URLPattern({ pathname: "/users/:userId/posts/:postId/comments/:commentId/reactions" }));
Routes.get.add(new URLPattern({ pathname: "/users/:userId/posts" }));
Routes.get.add(new URLPattern({ pathname: "/users/:userId/posts/:postId/comments/:commentId" }));

Routes.get.add(new URLPattern({ pathname: "/guilds" }));
Routes.get.add(new URLPattern({ pathname: "/guilds/:guildId" }));
Routes.delete.add(new URLPattern({ pathname: "/guilds/:guildId" }));
Routes.get.add(new URLPattern({ pathname: "/guilds/:guildId/channels" }));
Routes.get.add(new URLPattern({ pathname: "/guilds/:guildId/channels/:channelId" }));
Routes.get.add(new URLPattern({ pathname: "/guilds/:guildId/channels/:channelId/messages" }));
Routes.get.add(new URLPattern({ pathname: "/guilds/:guildId/channels/:channelId/messages/:messageId" }));
Routes.get.add(new URLPattern({ pathname: "/guilds/:guildId/channels/:channelId/messages/:messageId/reactions" }));

const response = JSON.stringify(generateOpenAPISpec(), null, 4);

const command = new Deno.Command("deno", {
    args: [ "run","-A", "npm:@redocly/cli", "lint", "/dev/stdin" ],
    stdin: "piped",
    stdout: "inherit"
});

const spawn = command.spawn();

new Response(response).body?.pipeTo(spawn.stdin!);
await spawn.output();

Deno.writeTextFileSync("demo.json", response);
