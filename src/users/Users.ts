import type {
	RESTAPIPartialCurrentUserGuild,
} from 'discord-api-types/v10';
import {
	ConnectionVisibility,
	NameplatePalette,
	UserFlags,
	UserPremiumType,
} from 'discord-api-types/v10';

export { ConnectionVisibility, NameplatePalette, UserFlags, UserPremiumType };

/**
 * A partial guild as returned by `GET /users/@me/guilds`.
 *
 * Not the full {@link https://docs.discord.com/developers/resources/guild#guild-object | guild object}:
 * the route returns membership metadata (whether the user owns it, their
 * permissions string, approximate counts) rather than the guild itself.
 *
 * @see {@link https://docs.discord.com/developers/resources/user#get-current-user-guilds}
 */
export type APIPartialCurrentUserGuild = RESTAPIPartialCurrentUserGuild;

/** Options for {@link DiscordRestClient.listCurrentUserGuilds}. */
export type GetCurrentUserGuildsOptions = {
	/** Get guilds before this guild id (descending snowflake pagination). */
	before?: string;
	/** Get guilds after this guild id. */
	after?: string;
	/** Max number of guilds to return (1–200, default 200). */
	limit?: number;
	/**
	 * Only return guilds in this shard (`0` … `max_concurrency - 1`). Required
	 * for apps using large bot sharding; other apps are unaffected. Note this
	 * is **not** the shard id used when connecting to the Gateway.
	 */
	shard?: number;
	/** Include approximate member and presence counts in each guild. */
	withCounts?: boolean;
};

/** Options for {@link DiscordRestClient.editCurrentUser}. All fields are optional. */
export type EditCurrentUserOptions = {
	/**
	 * New username, if changed this may cause the user's discriminator to be
	 * randomized. 2–32 characters; `@`, `#`, `:`, triple backticks, `discord`,
	 * `everyone` and `here` are not allowed.
	 */
	username?: string;
	/** Image data for the new avatar, or `null` to remove the current one. */
	avatar?: string | null;
	/** Image data for the new banner, or `null` to remove the current one. */
	banner?: string | null;
};

/** Options for {@link DiscordRestClient.createGroupDM}. */
export type CreateGroupDMOptions = {
	/**
	 * Access tokens of users that have granted the app the `gdm.join` scope.
	 * Limited to 10 active group DMs per app.
	 */
	accessTokens: readonly string[];
	/** Map of user ids to their respective nicknames inside the group DM. */
	nicks?: Record<string, string>;
};

/** Options for {@link DiscordRestClient.updateApplicationRoleConnection}. */
export type UpdateApplicationRoleConnectionOptions = {
	/** Vanity name of the platform the bot has connected (max 50 characters). */
	platformName?: string;
	/** Username on the platform the bot has connected (max 100 characters). */
	platformUsername?: string;
	/**
	 * Object mapping application role connection metadata keys to their
	 * string-ified value (max 100 characters) for the user.
	 */
	metadata?: Record<string, string | number>;
};
