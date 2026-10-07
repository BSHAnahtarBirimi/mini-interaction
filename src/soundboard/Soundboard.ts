import type { APISoundboardSound, RESTGetAPIGuildSoundboardSoundsResult, RESTPostAPIGuildSoundboardSoundJSONBody, RESTPatchAPIGuildSoundboardSoundJSONBody } from 'discord-api-types/v10';

/** Soundboard sound object from the Discord docs. */
export type { APISoundboardSound } from 'discord-api-types/v10';

/**
 * Shape returned by {@link DiscordRestClient.listGuildSoundboardSounds}.
 *
 * The guild sounds endpoint wraps its array in `{ items }`.
 */
export type GuildSoundboardSoundsResult = RESTGetAPIGuildSoundboardSoundsResult;

/**
 * Fields {@link DiscordRestClient.sendSoundboardSound} accepts.
 *
 * `source_guild_id` is required only when playing a sound from a different server.
 */
export type SendSoundboardSoundOptions = {
  sound_id: string;
  source_guild_id?: string;
};

/**
 * Fields {@link DiscordRestClient.createGuildSoundboardSound} accepts.
 *
 * `sound` is a base64 data URI (MP3 or Ogg). Max file size 512 KiB and max
 * duration 5.2 seconds. Volume defaults to `1` when omitted.
 */
export type CreateGuildSoundboardSoundOptions = RESTPostAPIGuildSoundboardSoundJSONBody;

/**
 * Fields {@link DiscordRestClient.modifyGuildSoundboardSound} accepts. All fields
 * are optional; omit a field to leave it unchanged. All optional fields accept
 * `null` to clear the corresponding value.
 */
export type ModifyGuildSoundboardSoundOptions = RESTPatchAPIGuildSoundboardSoundJSONBody;
