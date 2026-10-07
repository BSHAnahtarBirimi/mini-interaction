# 🌌 Mini Interaction

> **Sleek, Modular, and Type-Safe Discord Interactions Framework.**

Mini Interaction is a high-performance framework designed for building Discord HTTP/Webhook-based bots. It provides a modular architecture that separates concerns, making your bot easier to maintain, test, and scale.

---

## ✨ Features

- **🚀 Modular Router**: Easily map commands, components, and modals to handlers.
- **⚡ Core V10 Engine**: Native support for Discord API v10 payloads.
- **🛡️ Type Safety**: Full TypeScript support with rich autocompletion.
- **🧩 Fluent Builders**: Construct complex messages and components with a premium API.
- **🔐 Integrated OAuth**: Simple handlers for Discord OAuth2 flows, plus an `OAuth2Builder` with a typed, documented scope registry.
- **🔗 Linked Channels**: Bind lobbies to guild text channels, relay messages both ways, and mint server invites.
- **🎮 Game Stats Widgets**: Push player stats onto Discord profiles via the Application Identity Profile API.
- **🔊 Voice States & Regions**: Read voice membership, drive stage-channel speak state, and pin a channel's `rtc_region`.
- **👥 Users**: Fetch and edit users, list the current user's guilds, open DMs, read connections, and manage application role connections.
- **🎭 Stickers**: Read stickers, sticker packs and guild stickers, and create, modify, or delete guild stickers with audit reasons.
- **🎙️ Stage Instances**: Go live on Stage channels — create, read, modify, and close Stage instances with audit reasons.
- **📨 Webhook Events**: Typed, signature-verified HTTP events with an ack-correct endpoint.
- **🗃️ Mini Database**: Lightweight, document-based storage integration.

---

## 📦 Installation

```bash
npm install @minesa-org/mini-interaction
```

---

## 🛠️ Quick Start

Mini Interaction uses a modular approach with a dedicated Router and Context.

### 1. Define your Router
```ts
import { InteractionRouter } from '@minesa-org/mini-interaction';

const router = new InteractionRouter();

// Register a slash command
router.onCommand('ping', async (interaction, ctx) => {
  return ctx.reply({ content: '🏓 Pong!' });
});

// Register a component handler
router.onComponent('my_button', async (interaction, ctx) => {
  return ctx.reply({ content: 'Button clicked!', ephemeral: true });
});
```

### 2. Handle Interactions
```ts
import { 
  verifyAndParseInteraction, 
  InteractionContext, 
  DiscordRestClient 
} from '@minesa-org/mini-interaction';

const rest = new DiscordRestClient({ 
  applicationId: process.env.DISCORD_APP_ID, 
  token: process.env.DISCORD_TOKEN 
});

// In your web server (e.g., Next.js, Vercel, Express)
export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get('x-signature-ed25519');
  const timestamp = req.headers.get('x-signature-timestamp');

  // Verify and parse the interaction
  const interaction = await verifyAndParseInteraction({
    body,
    signature,
    timestamp,
    publicKey: process.env.DISCORD_PUBLIC_KEY
  });

  if (interaction.type === 1) return Response.json({ type: 1 });

  const ctx = new InteractionContext({ interaction, rest });
  const response = await router.dispatch(interaction, ctx);

  return Response.json(response ?? ctx.deferReply());
}
```

---

## 🎨 Message Builders

Mini Interaction provides a rich set of builders to create beautiful Discord content.

```ts
import { ModalBuilder, TextInputBuilder, TextInputStyle } from '@minesa-org/mini-interaction';

const modal = new ModalBuilder()
  .setCustomId('feedback_form')
  .setTitle('Send us Feedback')
  .addComponents(
    new TextInputBuilder()
      .setCustomId('feedback_text')
      .setLabel('Your Message')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Tell us what you think...')
  );
```

---

## 📡 Advanced Routing

You can organize your handlers into separate modules for better scalability.

```ts
// components/modals.ts
router.onModal('feedback_submit', async (interaction, ctx) => {
  const feedback = interaction.getTextFieldValue('feedback_text');
  // Process feedback...
  return ctx.reply({ content: 'Thank you for your feedback!' });
});
```

---

## 🛡️ Error Handling

Mini Interaction includes built-in validation to ensure your payloads follow Discord's requirements.

```ts
import { ValidationError } from '@minesa-org/mini-interaction';

try {
  const builder = new TextInputBuilder().setCustomId(''); // Too short!
  builder.toJSON();
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Validation failed for ${error.component}: ${error.message}`);
  }
}
```

---

## 🔗 Linked Role Metadata

Register application role connection metadata with `mini.registerMetadata(...)`.

```ts
import {
  MiniInteraction,
  RoleConnectionMetadataTypes,
} from '@minesa-org/mini-interaction';

const mini = new MiniInteraction({
  applicationId: process.env.DISCORD_APPLICATION_ID,
});

await mini.registerMetadata(process.env.DISCORD_BOT_TOKEN!, [
  {
    key: 'is_miniapp',
    name: 'Is Mini App?',
    description: 'Is the user an assistant?',
    type: RoleConnectionMetadataTypes.BooleanEqual,
  },
]);
```

Localization maps use `locale -> string` objects for `name_localizations` and `description_localizations`.

```ts
await mini.registerMetadata(process.env.DISCORD_BOT_TOKEN!, [
  {
    key: 'is_miniapp',
    name: 'Is Mini App?',
    description: 'Is the user an assistant?',
    type: RoleConnectionMetadataTypes.BooleanEqual,
    name_localizations: {
      tr: 'Mini Uygulama mi?',
      de: 'Ist Mini-App?',
    },
    description_localizations: {
      tr: 'Kullanici bir assistant mi?',
      de: 'Benutzer ist ein Assistent?',
    },
  },
]);
```

---

## ✍️ Text Formatting

Compose Discord markdown with pure helper functions:

```ts
import {
  bold, italic, heading, codeBlock, spoiler, timestamp,
  userMention, bulletList, maskLink,
} from '@minesa-org/mini-interaction';

const content = [
  heading(`Welcome ${userMention(userId)}!`, 2),
  italic(bold('Enjoy your stay.')),
  bulletList([spoiler('secret tip'), maskLink('Docs', 'https://example.com')]),
  `Event starts ${timestamp(eventDate, 'R')}`,
].join('\n');
```

---

## 🧵 Messaging Helpers

```ts
// Create a thread directly in a channel (e.g. forum posts)
await rest.createThread({ channelId, name: 'Weekly discussion', type: ChannelType.PublicThread });

// Send, then chain follow-up actions
const msg = await rest.sendMessage({ channelId, content: 'Hello!' });
await msg.react('🎉');
await msg.reply('Hi back!');
await msg.pin();
await msg.edit({ content: 'Edited!' });

// Webhook messages
await rest.sendWebhookMessage(webhookId, webhookToken, { content: 'Via webhook' });
```

---

## 🔗 Lobbies & Linked Channels

Link a lobby to a guild text channel so in-game messages show up in Discord and
Discord replies show up in the game. Players can also mint an invite to the
server straight from the lobby.

```ts
import { LobbyMemberFlags } from '@minesa-org/mini-interaction';

// 1. Create the lobby and grant the owner the right to configure the link.
const lobby = await rest.createLobby({
  metadata: { mode: 'raid' },
  members: [{ id: ownerId, flags: LobbyMemberFlags.CanLinkLobby }],
});

// 2. Link a channel. The acting user needs the CanLinkLobby flag, so this
//    call takes their OAuth2 **user** token (scope `sdk.social_layer`), not the
//    bot token.
await rest.linkChannelToLobby(lobby.id, selectedChannelId, userAccessToken);

// 3. Chat both ways.
await rest.sendLobbyMessage(lobby.id, { content: 'gg' }, userAccessToken);
const messages = await rest.getLobbyMessages(lobby.id, userAccessToken, { limit: 50 });

// 4. Unlink, or hand the player an invite to the server.
await rest.unlinkChannelFromLobby(lobby.id, userAccessToken);
const { code } = await rest.createLobbyChannelInviteForSelf(lobby.id, userAccessToken);
```

`linkChannelToLobby`, `unlinkChannelFromLobby`, `sendLobbyMessage`,
`getLobbyMessages`, `createLobbyChannelInviteForSelf` and `createOrJoinLobby`
all send a **Bearer** user token instead of `Authorization: Bot …`, because the
lobby acts on behalf of that user.

Before you ship this, two things are easy to get wrong:

- **Private channels can be linked.** Discord allows any channel the user can
  access, and its read/write permissions are only enforced *in the Discord
  client* — so every lobby member can read and post in a linked `#admins`
  channel from inside the game. In the Social SDK you can gate this with
  `isViewableAndWriteableByAllMembers`;
  the HTTP API does not expose that flag, so ask the user to confirm before
  linking a channel you cannot verify.
- **Invites cannot be restricted.** Any member of a linked lobby can generate a
  server invite through `createLobbyChannelInviteForSelf`, regardless of their
  lobby permissions.

Channel linking is also rate limited hard while your app is unapproved: **20
calls per 2 hours per application** (`LOBBY_DEVELOPMENT_RATE_LIMITS`), so a
retry loop in development will exhaust it quickly.

---

## 🎮 Game Stats Widgets

Push player stats — rank, playtime, wins, or your own custom stats — onto a
Discord profile with the Application Identity Profile API. Everything is plain
HTTP with the bot token, so it works in serverless deployments.

```ts
await rest.sendGameStats({
  userId,                  // the player's Discord id
  providerIssuedUserId,    // the player's id in *your* system (not a snowflake)
  username: 'johndoe123',
  primary: {
    season: 'Season 3',
    rank_name: 'Silver',
    playtime_hours: 69.41,
    total_wins: 57,
  },
  dynamic: [{ type: 2, name: 'win_streak', value: 5 }],
});
```

`data` is **fully replaced** on every write, so any stat you omit is deleted.
Pass `mode: 'merge'` to read the stored profile first and keep everything you
did not touch:

```ts
await rest.sendGameStats({ userId, providerIssuedUserId, primary: { rank_name: 'Gold' }, mode: 'merge' });

const profile = await rest.getIdentityProfile(userId, providerIssuedUserId);
```

Requirements:

- The game must be **claimed on Discord** and its widget configured in the
  Developer Portal under **Games → Widget**.
- The player must link their account with the `application_identities.write`
  OAuth2 scope (included automatically in Social SDK scopes).
- Media URLs must be publicly reachable — Discord's unfurler fetches them
  server-side, so `localhost`/LAN URLs render as nothing. `sendGameStats`
  rejects them unless you pass `allowPrivateMediaUrls: true`.

Payloads are validated client-side against Discord's documented limits and
throw an `ApplicationIdentityProfileError` carrying a machine-readable `code`
(`payload_too_large`, `too_many_dynamic_fields`, `string_value_too_long`, …).

---

## 🔊 Voice States & Regions

The Voice Resource is the bookkeeping half of Discord voice: who is connected to
which voice or stage channel, whether they are allowed to speak, and which region
a channel connects through. (The audio itself — the voice websocket, UDP,
encryption — is the Gateway's job and out of scope for an HTTP-interaction
library.)

```ts
import { DiscordRestClient, selectVoiceRegion } from '@minesa-org/mini-interaction';

const rest = new DiscordRestClient({
  token: process.env.DISCORD_TOKEN!,
  applicationId: process.env.DISCORD_APPLICATION_ID!,
});

// Who is this user connected to, and can they speak?
const state = await rest.getUserVoiceState(guildId, userId);
console.log(state.channel_id, state.suppress, state.request_to_speak_timestamp);

await rest.getCurrentUserVoiceState(guildId); // the bot's own state

// Stage channels: grant yourself permission to speak, then take it back.
await rest.modifyCurrentUserVoiceState(guildId, {
  channelId: stageChannelId,
  suppress: false, // unsuppressing *yourself* needs MUTE_MEMBERS
  requestToSpeakTimestamp: null, // null clears a pending request
});

// Suppress another speaker (`MUTE_MEMBERS`, stage channels only).
await rest.modifyUserVoiceState(guildId, speakerId, {
  channelId: stageChannelId,
  suppress: true,
});

// Regions: this skips deprecated regions and prefers the `optimal` one.
const region = selectVoiceRegion(await rest.listVoiceRegions());
await rest.editChannel(stageChannelId, { rtcRegion: region?.id ?? null });
```

Both `PATCH /guilds/{guild.id}/voice-states/...` routes are **stage-channel
only**, and the target user must already be connected to `channel_id`. You can
always suppress *yourself*, but unsuppressing yourself needs `MUTE_MEMBERS`, and
the other-user route needs that permission in both directions. Requesting to
speak needs `REQUEST_TO_SPEAK`, while clearing your own request never does.
Suppressing a user drops their `request_to_speak_timestamp`; unsuppressing a
non-bot user stamps it with the current time, while bots are exempt.

Both `PATCH` calls answer **`204 No Content`** and resolve `void` — the new state
arrives over the Gateway as a `VOICE_STATE_UPDATE` event, not in the response.

---

## 👥 Users

Users are Discord's base entity. This library models the full user object
(including `collectibles`, `avatar_decoration_data` and `primary_guild`) and
covers the whole User Resource: reads, account edits, the current user's guild
list, DMs, connections, and application role connections.

```ts
import { DiscordRestClient } from '@minesa-org/mini-interaction';

const rest = new DiscordRestClient({
  token: process.env.DISCORD_TOKEN!,
  applicationId: process.env.DISCORD_APPLICATION_ID!,
});

// Reads: the bot's own account, any user by id, and your membership view.
const me = await rest.fetchCurrentUser();
const user = await rest.fetchUser('80351110224678912');
const member = await rest.fetchCurrentUserGuildMember(guildId);

// Account settings (bot accounts edit the bot's profile).
await rest.editCurrentUser({ username: 'Nelly', banner: null });

// The current user's guilds — 200 by default, which is the maximum for
// non-bot users, so no pagination is needed for normal apps.
const guilds = await rest.listCurrentUserGuilds({ withCounts: true });

// Leave a guild the current user is in.
await rest.leaveGuild(guildId);

// DMs: prefer starting these from a user action — opening many DMs quickly
// can get the app rate limited or blocked.
const dm = await rest.createDM(userId);
const groupDm = await rest.createGroupDM({ accessTokens, nicks });

// Connections and application role connections (OAuth2-token routes).
const connections = await rest.listCurrentUserConnections();
await rest.updateApplicationRoleConnection({
  platformName: 'GitHub',
  platformUsername: 'nelly',
  metadata: { commits: '42' },
});
const connection = await rest.fetchApplicationRoleConnection();
await rest.deleteApplicationRoleConnection();
```

Notes:

- **Usernames** are 2–32 characters; `@`, `#`, `:`, triple backticks, `discord`,
  `everyone` and `here` are not allowed. Changing `username` may randomize the
  user's discriminator.
- **Large bot sharding**: `listCurrentUserGuilds({ shard })` is required for
  sharded bots (`0` … `max_concurrency - 1` from the session start limit), and
  that shard id is *not* the Gateway shard id.
- **Role connections** default to the client's configured application id and
  can target another application id explicitly; they need an OAuth2 token with
  the `role_connections.write` scope when acting for a user. The connections
  and guild-member routes act on `@me` only.

---

## 🎭 Stickers

Stickers are the small images that can be sent in messages. The full Sticker
Resource is covered: reading stickers and packs, listing a guild's stickers,
and the guild-sticker write endpoints.

```ts
import { DiscordRestClient, StickerType, StickerFormatType } from '@minesa-org/mini-interaction';

const rest = new DiscordRestClient({
  token: process.env.DISCORD_TOKEN!,
  applicationId: process.env.DISCORD_APPLICATION_ID!,
});

// Reads: any sticker by id, the standard packs, and one pack.
const sticker = await rest.fetchSticker('749054660769218631');
const packs = await rest.listStickerPacks(); // { sticker_packs: [...] }
const pack = await rest.fetchStickerPack(packs.sticker_packs[0].id);

// Guild stickers — the `user` field appears with CREATE_GUILD_EXPRESSIONS
// or MANAGE_GUILD_EXPRESSIONS.
const guildStickers = await rest.listGuildStickers(guildId);
const mine = await rest.fetchGuildSticker(guildId, guildStickers[0].id);

// Create: multipart upload (PNG, APNG, GIF, or Lottie JSON — max 512 KiB).
const created = await rest.createGuildSticker(
  guildId,
  { name: 'Wave', description: 'Wumpus waves hello', tags: 'wumpus, hello, wave' },
  { name: 'wave.png', data: pngBytes, contentType: 'image/png' },
  'optional audit reason',
);

// Modify (all fields optional) and delete (204 No Content).
await rest.modifyGuildSticker(guildId, created.id, { description: null }, 'cleanup');
await rest.deleteGuildSticker(guildId, created.id);
```

Notes:

- **Types & formats**: `StickerType.Standard = 1` / `StickerType.Guild = 2`;
  `StickerFormatType` is `PNG = 1`, `APNG = 2`, `Lottie = 3`, `GIF = 4`. The
  `APISticker`, `APIStickerItem` and `APIStickerPack` shapes match the docs.
- **Upload limits**: animated stickers are capped at 5 seconds and 320×320;
  Lottie stickers require the `VERIFIED` and/or `PARTNERED` guild feature.
  Every guild has five free sticker slots, plus more per Boost level.
- **Audit reasons**: create, modify and delete accept an `X-Audit-Log-Reason`
  as the trailing argument. Create needs `CREATE_GUILD_EXPRESSIONS`; modify
  and delete need `MANAGE_GUILD_EXPRESSIONS` (or `CREATE_GUILD_EXPRESSIONS`
  for stickers you uploaded yourself).

---

## 🎙️ Stage Instances

A Stage Instance holds the state of a **live** Stage channel: while one exists,
the channel is live; when it's gone, the channel is not. Create, read, modify,
and close them with the full Stage Instance Resource.

```ts
import { DiscordRestClient, StageInstancePrivacyLevel } from '@minesa-org/mini-interaction';

const rest = new DiscordRestClient({
  token: process.env.DISCORD_TOKEN!,
  applicationId: process.env.DISCORD_APPLICATION_ID!,
});

// Create — channel_id and topic (1–120 chars) are required.
const instance = await rest.createStageInstance(
  {
    channel_id: '733488538393510049',
    topic: 'Testing Testing, 123',
    privacy_level: StageInstancePrivacyLevel.GuildOnly, // default
    send_start_notification: true, // pings @everyone (needs MENTION_EVERYONE)
  },
  'weekly town hall', // optional X-Audit-Log-Reason
);

// Read it back by the Stage channel's id.
const live = await rest.fetchStageInstance(instance.channel_id);

// Modify — all fields optional.
await rest.modifyStageInstance(live.channel_id, { topic: 'New topic' }, 'renamed');

// Delete resolves 204 No Content. Stage instances also auto-close after a
// few minutes with no speakers.
await rest.deleteStageInstance(live.channel_id, 'wrap up');
```

Notes:

- **Privacy level**: `StageInstancePrivacyLevel.Public = 1` (deprecated) and
  `StageInstancePrivacyLevel.GuildOnly = 2` — the default. Guild-only means
  only guild members see the instance.
- **Moderators**: creating, modifying, and deleting require the user to be a
  moderator of the Stage channel — all of `MANAGE_CHANNELS`, `MUTE_MEMBERS`,
  and `MOVE_MEMBERS`.
- **Audit reasons**: create, modify, and delete accept an
  `X-Audit-Log-Reason` as the trailing argument.
- **Scheduled events**: pass `guild_scheduled_event_id` when creating to tie
  the instance to a guild scheduled event.

---

## 📨 Webhook Events

Webhook Events are one-way HTTP events Discord posts to your app when something
happens — an app being authorized or deauthorized, entitlements changing, lobby
messages, game direct messages. Unlike interactions they are **not realtime and
not ordered**, and Discord retries failures, so keep handlers idempotent.

Add your URL in the app's Developer Portal under **Webhooks → Endpoint URL**,
then wire up an endpoint:

```ts
import {
  WebhookEventEndpoint,
  WebhookEventRouter,
  WebhookEventType,
} from '@minesa-org/mini-interaction';

const router = new WebhookEventRouter()
  .on(WebhookEventType.ApplicationAuthorized, (payload) => {
    // payload.event.data is typed from the event name
    console.log('authorized', payload.event.data?.user.id);
  })
  .on(WebhookEventType.ApplicationDeauthorized, (payload) => {
    // Social SDK: the only out-of-game signal that a link was revoked.
    return unlinkAccount(payload.event.data!.user.id);
  })
  .onAny((payload) => console.log('unhandled event', payload.event.type))
  .onError((error) => console.error('webhook event failed', error));

const endpoint = new WebhookEventEndpoint({
  publicKey: process.env.DISCORD_PUBLIC_KEY!,
  router,
});

// Fetch-API runtimes: Cloudflare Workers, Bun, Deno, Vercel Edge
export async function POST(request: Request) {
  return endpoint.handleFetch(request);
}
```

Subscribing works from code too — the same thing the portal's **Webhooks** page
does — with `editCurrentApplication`, and `getCurrentApplication` reads the
current URL, status and subscribed types back:

```ts
import { WebhookEventStatus, WebhookEventType } from '@minesa-org/mini-interaction';

await rest.editCurrentApplication({
  eventWebhooksUrl: 'https://example.com/discord/webhook-events',
  eventWebhooksStatus: WebhookEventStatus.Enabled,
  eventWebhooksTypes: [
    WebhookEventType.ApplicationAuthorized,
    WebhookEventType.ApplicationDeauthorized,
  ],
});
```

Discord verifies the URL with a signed `PING` before saving it, and flips
`event_webhooks_status` to `DisabledByDiscord` — dropping the URL — if your
endpoint fails its routine signature checks, so read the status back before
assuming deliveries are live.

`handleFetch` answers with a bodiless **`204`**, **`401`** when the Ed25519
signature is missing or invalid, **`400`** for an unparseable body, and **`500`**
when a handler throws. Discord signs every delivery — including the `PING` it
sends when you save the URL — and routinely probes endpoints with deliberately
invalid signatures, so verification always runs before your handlers.

Handlers run **before** the ack. To push heavier work past it, pass `waitUntil`:

```ts
const endpoint = new WebhookEventEndpoint({
  publicKey: process.env.DISCORD_PUBLIC_KEY!,
  router,
  waitUntil: (promise) => vercelWaitUntil(promise), // ctx.waitUntil on Workers
});
```

Either way, keep the response inside Discord's **3 second** budget: it retries
with exponential backoff for up to 10 minutes, and stops sending events if you
fail too often. On non-Fetch servers,
`endpoint.handle({ body, signature, timestamp })` returns just
`{ status, body }` for you to apply yourself.

---

## 🔐 OAuth2

`OAuth2Builder` builds authorization URLs and talks to the token, revocation and
`@me` endpoints with typed responses.

```ts
import { OAuth2Builder, OAuth2Scope, OAuth2ScopePresets } from '@minesa-org/mini-interaction';

const oauth = new OAuth2Builder({
  clientId: process.env.DISCORD_CLIENT_ID!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  redirectUri: 'https://example.com/api/discord-oauth-callback',
}).addScopes(...OAuth2ScopePresets.SignIn);

const { url, state } = oauth.build();       // redirect the user here, store `state`
const tokens = await oauth.exchangeCode(code); // then: refresh, revoke, getAuthorizationInfo
```

Presets cover the flows you actually build: `Minimal`, `SignIn`,
`SignInWithGuilds`, `Bot`, `Webhook`, `RoleConnection`, plus the Social SDK's
`SocialPresence` and — for lobbies and **Linked Channels** —
`SocialCommunication` (`openid sdk.social_layer`).

Scopes are a typed registry, and every one carries copy you can render on a
consent screen instead of asking for capabilities blind:

```ts
OAuth2Scope.GuildsJoin;             // "guilds.join"
OAuth2ScopeDescriptions[OAuth2Scope.GuildsJoin];
// "Add you to a server."

OAuth2ScopeMetadata[OAuth2Scope.GuildsJoin];
// { description: "…", category: "identity", restricted: false }

requiresOAuth2ScopeApproval(OAuth2ScopePresets.SocialCommunication); // true — needs an access request
```

Use `oauth.describeScopes()` to get the requested scopes grouped by category, or
`OAuth2ScopeCategories` for the full catalogue.

Mistakes Discord would reject are caught before the user sees anything:
`role_connections.write` with the implicit grant, a missing `redirect_uri`, an
empty scope list, or a team-owned app asking for more than `identify` and
`applications.commands.update` on client credentials. Those throw
`OAuth2BuilderError` with a machine-readable `code`; anything the API itself
rejects throws `OAuth2RequestError` with `status`, `error` and
`errorDescription`.

A few behaviours worth knowing: revocation is **authorization-wide** — revoking
either token kills every token from that authorization — and users can decline
individual scopes, so read back what you actually got with
`getAuthorizationInfo(accessToken)` rather than assuming the request was granted
in full.

---

## 📜 License

MIT © [Minesa](https://github.com/minesa-org)
