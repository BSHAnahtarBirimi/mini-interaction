import type { APISticker, APIStickerPack } from 'discord-api-types/v10';
import { StickerFormatType, StickerType } from 'discord-api-types/v10';
import type {
  RESTGetStickerPacksResult,
  RESTPostAPIGuildStickerFormDataBody,
  RESTPatchAPIGuildStickerJSONBody,
} from 'discord-api-types/v10';
import type { DiscordMessageFile } from '../core/messages/message-payloads.js';

/** Re-export sticker types so consumers don't need to import `discord-api-types` directly. */
export { StickerFormatType, StickerType };
export type { APISticker, APIStickerItem, APIStickerPack } from 'discord-api-types/v10';
export type { DiscordMessageFile } from '../core/messages/message-payloads.js';

/**
 * Fields {@link DiscordRestClient.createGuildSticker} accepts alongside the uploaded
 * file. `tags` must be a comma-separated list of keywords (max 200 characters); Discord
 * will also accept an emoji name here and use it as the sticker's display tag.
 */
export type CreateGuildStickerOptions = Pick<
  RESTPostAPIGuildStickerFormDataBody,
  'name' | 'description' | 'tags'
>;

/**
 * Fields {@link DiscordRestClient.modifyGuildSticker} accepts. All fields are optional;
 * omit a field to leave it unchanged.
 */
export type ModifyGuildStickerOptions = RESTPatchAPIGuildStickerJSONBody;

/**
 * Shape returned by {@link DiscordRestClient.listStickerPacks}.
 */
export type StickerPacksListResult = RESTGetStickerPacksResult;
