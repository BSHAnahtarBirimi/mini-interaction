import { test } from "node:test";
import assert from "node:assert/strict";

import {
	ConnectionVisibility,
	NameplatePalette,
	UserFlags,
	UserPremiumType,
	type APIPartialCurrentUserGuild,
	type CreateGroupDMOptions,
	type EditCurrentUserOptions,
	type GetCurrentUserGuildsOptions,
	type UpdateApplicationRoleConnectionOptions,
} from "./Users.js";
import { GuildFeature } from "discord-api-types/v10";

test("user enums match the documented values", () => {
	assert.equal(UserFlags.Staff, 1 << 0);
	assert.equal(UserFlags.Partner, 1 << 1);
	assert.equal(UserFlags.Hypesquad, 1 << 2);
	assert.equal(UserFlags.PremiumEarlySupporter, 1 << 9);
	assert.equal(UserFlags.TeamPseudoUser, 1 << 10);
	assert.equal(UserFlags.VerifiedBot, 1 << 16);
	assert.equal(UserFlags.VerifiedDeveloper, 1 << 17);
	assert.equal(UserFlags.CertifiedModerator, 1 << 18);
	assert.equal(UserFlags.BotHTTPInteractions, 1 << 19);

	assert.equal(UserPremiumType.None, 0);
	assert.equal(UserPremiumType.NitroClassic, 1);
	assert.equal(UserPremiumType.Nitro, 2);
	assert.equal(UserPremiumType.NitroBasic, 3);

	assert.equal(ConnectionVisibility.None, 0);
	assert.equal(ConnectionVisibility.Everyone, 1);
});

test("the documented example user type-checks as APIUser", () => {
	// The example from the User Resource docs. This fixture only type-checks —
	// assigning it to APIUser through a function parameter keeps every field
	// name and type honest without inventing assertions Discord doesn't make.
	const example = {
		id: "80351110224678912",
		username: "Nelly",
		global_name: null,
		discriminator: "1337",
		avatar: "8342729096ea3675442027381ff50dfe",
		verified: true,
		email: "nelly@discord.com",
		flags: 64,
		banner: "06c16474723fe537c283b8efa61a30c8",
		accent_color: 16711680,
		premium_type: 0,
		public_flags: 64,
		avatar_decoration_data: {
			sku_id: "1144058844004233369",
			asset: "a_fed43ab12698df65902ba06727e20c0e",
		},			collectibles: {
				nameplate: {
					sku_id: "2247558840304243311",
					asset: "nameplates/nameplates/twilight/",
					label: "",
					palette: NameplatePalette.Cobalt,
				},
			},
		primary_guild: {
			identity_guild_id: "1234647491267808778",
			identity_enabled: true,
			tag: "DISC",
			badge: "7d1734ae5a615e82bc7a4033b98fade8",
		},
	};

	const asUser = (user: import("discord-api-types/v10").APIUser) => user;
	assert.equal(asUser(example).id, "80351110224678912");
});

test("the documented partial guild example type-checks", () => {
	const example: APIPartialCurrentUserGuild = {
		id: "80351110224678912",
		name: "1337 Krew",
		icon: "8342729096ea3675442027381ff50dfe",
		banner: "bb42bdc37653b7cf58c4c8cc622e76cb",
		owner: true,
		permissions: "36953089",
		features: [
			GuildFeature.Community,
			GuildFeature.News,
			GuildFeature.AnimatedIcon,
			GuildFeature.InviteSplash,
			GuildFeature.Banner,
			GuildFeature.RoleIcons,
		],
		approximate_member_count: 3268,
		approximate_presence_count: 784,
	};

	assert.equal(example.owner, true);
});

test("user option types expose the documented fields", () => {
	const guildsQuery: GetCurrentUserGuildsOptions = {
		before: "1",
		after: "2",
		limit: 200,
		shard: 0,
		withCounts: true,
	};
	const edit: EditCurrentUserOptions = { username: "Nelly", avatar: null, banner: null };
	const groupDm: CreateGroupDMOptions = {
		accessTokens: ["token-a", "token-b"],
		nicks: { "80351110224678912": "Nelly" },
	};
	const roleConnection: UpdateApplicationRoleConnectionOptions = {
		platformName: "GitHub",
		platformUsername: "nelly",
		metadata: { commits: 42 },
	};

	assert.equal(guildsQuery.shard, 0);
	assert.equal(edit.avatar, null);
	assert.equal(groupDm.nicks?.["80351110224678912"], "Nelly");
	assert.equal(roleConnection.metadata?.commits, 42);
});
