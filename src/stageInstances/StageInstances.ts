import type {
  APIStageInstance,
  RESTGetAPIStageInstanceResult,
  RESTPatchAPIStageInstanceJSONBody,
  RESTPostAPIStageInstanceJSONBody,
} from 'discord-api-types/v10';
import { StageInstancePrivacyLevel } from 'discord-api-types/v10';

/**
 * Re-export the privacy-level enum as a **value** so consumers don't need to
 * import `discord-api-types` directly.
 *
 * - `Public = 1` — visible publicly (deprecated along with Stage Discovery).
 * - `GuildOnly = 2` — visible to guild members only (the default).
 */
export { StageInstancePrivacyLevel };
export type { APIStageInstance } from 'discord-api-types/v10';

/**
 * Fields {@link DiscordRestClient.createStageInstance} accepts. `channel_id` is
 * the Stage channel and `topic` is the 1–120 character blurb shown below the
 * channel name.
 *
 * Optional fields:
 * - `privacy_level` defaults to `StageInstancePrivacyLevel.GuildOnly`.
 * - `send_start_notification` pings `@everyone`; the moderator needs
 *   `MENTION_EVERYONE` for it to go out.
 * - `guild_scheduled_event_id` links the instance to a scheduled event.
 *
 * @see {@link https://docs.discord.com/developers/resources/stage-instance#create-stage-instance}
 */
export type CreateStageInstanceOptions = RESTPostAPIStageInstanceJSONBody;

/**
 * Fields {@link DiscordRestClient.modifyStageInstance} accepts. All fields are
 * optional; omit a field to leave it unchanged.
 *
 * @see {@link https://docs.discord.com/developers/resources/stage-instance#modify-stage-instance}
 */
export type ModifyStageInstanceOptions = RESTPatchAPIStageInstanceJSONBody;

/**
 * Shape returned by the create, get, and modify routes — the Stage Instance
 * object itself.
 */
export type StageInstanceResult = RESTGetAPIStageInstanceResult;
