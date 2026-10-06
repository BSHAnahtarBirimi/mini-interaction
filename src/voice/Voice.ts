import type { APIGuildMember } from "discord-api-types/v10";

/**
 * Discord voice: **voice states** — who is connected to which voice or stage
 * channel and whether they may speak — and **voice regions** — the `rtc_region`
 * values a channel can be pinned to.
 *
 * @see {@link https://docs.discord.com/developers/resources/voice}
 *
 * ## What this resource is not
 *
 * These endpoints describe voice **membership**, not audio. The actual voice
 * connection (the voice websocket, UDP, encryption, Opus) is the Gateway's job
 * and is out of scope for an HTTP-interaction library. You get the bookkeeping
 * half: who is in the channel, who is suppressed, who asked to speak, and which
 * region a channel should use.
 *
 * ## The `PATCH` routes are stage-channel-only
 *
 * Both `modifyCurrentUserVoiceState` and `modifyUserVoiceState` are documented as
 * working only for **stage** channels, and only for a user who is **already
 * connected** to `channel_id`. Discord does not enforce which channel *type* you
 * send from the client side, so the failure arrives as a `400` from the API
 * instead of a type error here.
 *
 * ## Suppression has side effects
 *
 * Suppressing a user removes their `request_to_speak_timestamp`. Unsuppressing a
 * **non-bot** user sets it to the current time — bots are exempt, so a bot moving
 * through `suppress: true` → `suppress: false` gets no speak request.
 */

/**
 * A user's voice connection state in a guild.
 *
 * @see {@link https://docs.discord.com/developers/resources/voice#voice-state-object}
 */
export type APIVoiceState = {
	/** The guild this state belongs to. Absent for DM and group-DM calls. */
	guild_id?: string;
	/** The channel the user is connected to, or `null` when they are not connected. */
	channel_id: string | null;
	/** The user this state is for. */
	user_id: string;
	/** The guild member this state is for, when the state is guild-scoped. */
	member?: APIGuildMember;
	/** The voice session id — a random hex string, not a snowflake. */
	session_id: string;
	/** Whether this user is deafened by the server. */
	deaf: boolean;
	/** Whether this user is muted by the server. */
	mute: boolean;
	/** Whether this user is locally deafened. */
	self_deaf: boolean;
	/** Whether this user is locally muted. */
	self_mute: boolean;
	/** Whether this user is streaming with "Go Live". */
	self_stream?: boolean;
	/** Whether this user's camera is enabled. */
	self_video: boolean;
	/** Whether this user's permission to speak is denied. */
	suppress: boolean;
	/**
	 * When the user requested to speak, in ISO8601 — can be a present or future
	 * time. `null` when they have no pending request.
	 */
	request_to_speak_timestamp: string | null;
};

/**
 * A voice region usable as a channel's `rtc_region`.
 *
 * @see {@link https://docs.discord.com/developers/resources/voice#voice-region-object}
 */
export type APIVoiceRegion = {
	/** Unique id for the region. */
	id: string;
	/** Display name of the region. */
	name: string;
	/** `true` for the single region closest to the current user's client. */
	optimal: boolean;
	/**
	 * Whether Discord is retiring this region. Deprecated regions are still
	 * returned and still valid to *read* — just do not switch a channel to one.
	 */
	deprecated: boolean;
	/** Whether this is a custom region, used for events and the like. */
	custom: boolean;
};

/**
 * Whether a region should be avoided when choosing a new `rtc_region`.
 *
 * `deprecated` means "do not switch to these", not "invalid": the region is
 * still listed and existing connections on it keep working.
 */
export function isDeprecatedVoiceRegion(region: Pick<APIVoiceRegion, "deprecated">): boolean {
	return region.deprecated;
}

/**
 * Picks the region a new voice connection should use: the `optimal`
 * non-deprecated region, falling back to the first non-deprecated one.
 *
 * Returns `undefined` when every region is deprecated (or the list is empty), so
 * the caller can leave `rtc_region` unset and let Discord choose.
 *
 * ```ts
 * const region = selectVoiceRegion(await rest.listVoiceRegions());
 * await rest.editChannel(channelId, { rtc_region: region?.id ?? null });
 * ```
 */
export function selectVoiceRegion(
	regions: readonly APIVoiceRegion[],
): APIVoiceRegion | undefined {
	const usable = regions.filter((region) => !isDeprecatedVoiceRegion(region));
	return usable.find((region) => region.optimal) ?? usable[0];
}
