import { test } from "node:test";
import assert from "node:assert/strict";

/**
 * Guards the package entrypoint.
 *
 * `tsc --noEmit` on the library itself cannot catch a broken barrel export —
 * only a consumer importing from the published entrypoint can. This file is
 * that consumer, so a missing or renamed export fails here instead of in
 * someone's app.
 */
import {
	ApplicationIdentityProfileError,
	DiscordRestApiError,
	DiscordRestClient,
	DynamicFieldType,
	InvalidWebhookEventSignatureError,
	WebhookEventEndpoint,
	WebhookEventPayloadType,
	WebhookEventRouter,
	WebhookEventStatus,
	WebhookEventType,
	isDeprecatedVoiceRegion,
	isPublicMediaUrl,
	isWebhookEventPayload,
	selectVoiceRegion,
	verifyWebhookEventRequest,
	type APIVoiceRegion,
	type ApplicationIdentityProfile,
	type DynamicFieldType as DynamicFieldTypeAlias,
	type DynamicProfileField,
	type ModifyCurrentUserVoiceStateOptions,
	type ModifyUserVoiceStateOptions,
	type SendGameStatsOptions,
	type WebhookEventPayloadOf,
	type WebhookEventRequest,
	ConnectionVisibility,
	UserFlags,
	UserPremiumType,
	type APIPartialCurrentUserGuild,
	type CreateGroupDMOptions,
	type EditCurrentUserOptions,
	type GetCurrentUserGuildsOptions,
	type UpdateApplicationRoleConnectionOptions,
	StickerType,
	StickerFormatType,
	type APISticker,
	type APIStickerItem,
	type APIStickerPack,
	type CreateGuildStickerOptions,
	type ModifyGuildStickerOptions,
	type StickerPacksListResult,
	StageInstancePrivacyLevel,
	type APIStageInstance,
	type CreateStageInstanceOptions,
	type ModifyStageInstanceOptions,
	type StageInstanceResult,
	type APISoundboardSound,
	type GuildSoundboardSoundsResult,
	type SendSoundboardSoundOptions,
	type CreateGuildSoundboardSoundOptions,
	type ModifyGuildSoundboardSoundOptions,
} from "./index.js";

test("the package barrel re-exports the Game Stats surface", () => {
	assert.equal(typeof DiscordRestClient, "function");
	assert.equal(typeof DiscordRestApiError, "function");
	assert.equal(typeof ApplicationIdentityProfileError, "function");
	assert.equal(typeof isPublicMediaUrl, "function");
	assert.equal(DynamicFieldType.Media, 3);

	// Types must resolve through the barrel too, not just the values.
	const field: DynamicProfileField = {
		type: DynamicFieldType.Number,
		name: "wins",
		value: 3,
	};
	const kind: DynamicFieldTypeAlias = DynamicFieldType.String;
	const options: SendGameStatsOptions = {
		userId: "1",
		providerIssuedUserId: "2",
		mode: "merge",
	};
	const profile: ApplicationIdentityProfile = { username: "ada" };

	assert.equal(field.type, 2);
	assert.equal(kind, 1);
	assert.equal(options.mode, "merge");
	assert.equal(profile.username, "ada");
});

test("the package barrel re-exports the User surface", () => {
	assert.equal(UserFlags.Staff, 1);
	assert.equal(UserPremiumType.NitroBasic, 3);
	assert.equal(ConnectionVisibility.Everyone, 1);

	// Types must resolve through the barrel too, not just the values.
	const guildsQuery: GetCurrentUserGuildsOptions = { shard: 0, withCounts: true };
	const partialGuild: APIPartialCurrentUserGuild = {
		id: "1",
		name: "Krew",
		icon: null,
		banner: null,
		owner: true,
		permissions: "8",
		features: [],
	};
	const edit: EditCurrentUserOptions = { avatar: null };
	const groupDm: CreateGroupDMOptions = { accessTokens: ["t"] };
	const roleConnection: UpdateApplicationRoleConnectionOptions = { metadata: {} };

	assert.equal(guildsQuery.shard, 0);
	assert.equal(partialGuild.owner, true);
	assert.equal(edit.avatar, null);
	assert.deepEqual(groupDm.accessTokens, ["t"]);
	assert.deepEqual(roleConnection.metadata, {});
});

test("the package barrel re-exports the Voice surface", () => {
	assert.equal(typeof selectVoiceRegion, "function");
	assert.equal(typeof isDeprecatedVoiceRegion, "function");

	// Types must resolve through the barrel too, not just the values.
	const regions: APIVoiceRegion[] = [
		{ id: "retired", name: "Retired", optimal: false, deprecated: true, custom: false },
		{ id: "eu", name: "EU Central", optimal: false, deprecated: false, custom: false },
	];
	const current: ModifyCurrentUserVoiceStateOptions = { requestToSpeakTimestamp: null };
	const other: ModifyUserVoiceStateOptions = { suppress: true };

	assert.equal(selectVoiceRegion(regions)?.id, "eu");
	assert.equal(isDeprecatedVoiceRegion(regions[0]), true);
	assert.equal(current.requestToSpeakTimestamp, null);
	assert.equal(other.suppress, true);
});

test("the package barrel re-exports the Webhook Events surface", () => {
	assert.equal(typeof WebhookEventRouter, "function");
	assert.equal(typeof WebhookEventEndpoint, "function");
	assert.equal(typeof verifyWebhookEventRequest, "function");
	assert.equal(typeof InvalidWebhookEventSignatureError, "function");
	assert.equal(typeof isWebhookEventPayload, "function");
	assert.equal(WebhookEventPayloadType.Ping, 0);
	assert.equal(WebhookEventType.ApplicationDeauthorized, "APPLICATION_DEAUTHORIZED");
	assert.equal(WebhookEventStatus.Enabled, 2);

	// The per-event payload type must narrow through the barrel as well.
	const payload: WebhookEventPayloadOf<"APPLICATION_AUTHORIZED"> = {
		version: 1,
		application_id: "app-1",
		type: WebhookEventPayloadType.Event,
		event: {
			type: WebhookEventType.ApplicationAuthorized,
			timestamp: "2026-09-18T00:00:00.000000",
			data: {
			user: {
				id: "u1",
				username: "ada",
				discriminator: "0",
				global_name: null,
				avatar: null,
			},
			scopes: ["identify"],
		},
		},
	};
	const request: WebhookEventRequest = payload;

	assert.equal(request.application_id, "app-1");
});

test("the package barrel re-exports the Sticker Resource surface", () => {
	assert.equal(StickerType.Standard, 1);
	assert.equal(StickerType.Guild, 2);
	assert.equal(StickerFormatType.Lottie, 3);

	// The documented example must narrow through the barrel as well.
	const sticker: APISticker = {
		id: "749054660769218631",
		name: "Wave",
		tags: "wumpus, hello, wave",
		type: StickerType.Standard,
		format_type: StickerFormatType.Lottie,
		description: "Wumpus waves hello",
		pack_id: "847199849233514549",
		sort_value: 12,
	};
	assert.equal(sticker.format_type, 3);

	const item: APIStickerItem = {
		id: sticker.id,
		name: sticker.name,
		format_type: sticker.format_type,
	};
	assert.equal(item.name, "Wave");

	const pack: APIStickerPack = {
		id: "847199849233514549",
		stickers: [sticker],
		name: "Wumpus Beyond",
		sku_id: "847199849233514547",
		description: "Say hello to Wumpus!",
	};
	assert.equal(pack.stickers.length, 1);

	const create: CreateGuildStickerOptions = {
		name: "Wave",
		description: "",
		tags: "wave",
	};
	const modify: ModifyGuildStickerOptions = { description: null };
	const packs: StickerPacksListResult = { sticker_packs: [pack] };
	assert.equal(create.name.length >= 2, true);
	assert.equal(modify.description, null);
	assert.equal(packs.sticker_packs[0].sku_id, "847199849233514547");

	// The eight sticker routes exist on the client.
	for (const method of [
		"fetchSticker",
		"listStickerPacks",
		"fetchStickerPack",
		"listGuildStickers",
		"fetchGuildSticker",
		"createGuildSticker",
		"modifyGuildSticker",
		"deleteGuildSticker",
	]) {
		assert.equal(typeof (DiscordRestClient.prototype as unknown as Record<string, unknown>)[method], "function", method);
	}
});

test("the package barrel re-exports the Stage Instance surface", () => {
	// Privacy level is a runtime value enum — verify it survives the barrel.
	assert.equal(StageInstancePrivacyLevel.Public, 1);
	assert.equal(StageInstancePrivacyLevel.GuildOnly, 2);

	const create: CreateStageInstanceOptions = {
		channel_id: "733488538393510049",
		topic: "Testing Testing, 123",
	};
	const modify: ModifyStageInstanceOptions = { privacy_level: 2 };
	assert.equal(create.topic.length <= 120, true);
	assert.equal(modify.privacy_level, StageInstancePrivacyLevel.GuildOnly);

	const instance: APIStageInstance = {
		id: "840647391636226060",
		guild_id: "197038439483310086",
		channel_id: "733488538393510049",
		topic: "Testing Testing, 123",
		privacy_level: StageInstancePrivacyLevel.GuildOnly,
		discoverable_disabled: false,
	};
	const result: StageInstanceResult = instance;
	assert.equal(result.id, "840647391636226060");

	// The four stage instance routes exist on the client.
	for (const method of [
		"createStageInstance",
		"fetchStageInstance",
		"modifyStageInstance",
		"deleteStageInstance",
	]) {
		assert.equal(typeof (DiscordRestClient.prototype as unknown as Record<string, unknown>)[method], "function", method);
	}
});

test("the package barrel re-exports the Soundboard surface", () => {
	// The default sound example from the docs type-checks as APISoundboardSound.
	const defaultSound: APISoundboardSound = {
		name: "quack",
		sound_id: "1",
		volume: 1.0,
		emoji_id: null,
		emoji_name: "🦆",
		available: true,
	};
	assert.equal(defaultSound.emoji_name, "🦆");

	// The guild sound example from the docs.
	const guildSound: APISoundboardSound = {
		name: "Yay",
		sound_id: "1106714396018884649",
		volume: 1,
		emoji_id: "989193655938064464",
		emoji_name: null,
		guild_id: "613425648685547541",
		available: true,
	};
	assert.equal(guildSound.emoji_id, "989193655938064464");

	// Guild list result wraps `items`.
	const list: GuildSoundboardSoundsResult = { items: [defaultSound] };
	assert.equal(list.items.length, 1);

	// Send uses sound_id (+ optional source_guild_id).
	const send: SendSoundboardSoundOptions = { sound_id: "1", source_guild_id: "g2" };
	assert.equal(send.source_guild_id, "g2");

	// Create plus modify option types accept the base64 data uri and nullable fields.
	const create: CreateGuildSoundboardSoundOptions = {
		name: "Yay",
		sound: "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAQAAACQA",
		volume: 0.5,
		emoji_id: "989193655938064464",
	};
	const modify: ModifyGuildSoundboardSoundOptions = { volume: null, emoji_name: "🎉" };
	assert.equal(modify.volume, null);

	// The seven soundboard routes exist on the client.
	for (const method of [
		"sendSoundboardSound",
		"fetchDefaultSoundboardSounds",
		"listGuildSoundboardSounds",
		"fetchGuildSoundboardSound",
		"createGuildSoundboardSound",
		"modifyGuildSoundboardSound",
		"deleteGuildSoundboardSound",
	]) {
		assert.equal(typeof (DiscordRestClient.prototype as unknown as Record<string, unknown>)[method], "function", method);
	}
});
