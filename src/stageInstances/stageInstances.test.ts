import { test } from "node:test";
import assert from "node:assert/strict";

import {
	StageInstancePrivacyLevel,
	type APIStageInstance,
	type CreateStageInstanceOptions,
	type ModifyStageInstanceOptions,
	type StageInstanceResult,
} from "./StageInstances.js";

test("privacy level enum matches the documented values", () => {
	// PUBLIC is deprecated but still returned by Discord — the docs' own
	// example fixture carries privacy_level 1.
	assert.equal(StageInstancePrivacyLevel.Public, 1);
	assert.equal(StageInstancePrivacyLevel.GuildOnly, 2);
});

test("the documented example stage instance type-checks as APIStageInstance", () => {
	// The example from the Stage Instance Resource docs. This fixture only
	// type-checks — assigning through a function parameter keeps every field
	// name and type honest without inventing assertions Discord doesn't make.
	const example = {
		id: "840647391636226060",
		guild_id: "197038439483310086",
		channel_id: "733488538393510049",
		topic: "Testing Testing, 123",
		privacy_level: 1,
		discoverable_disabled: false,
		guild_scheduled_event_id: "947656305244532806",
	};

	const acceptsInstance = (instance: APIStageInstance): APIStageInstance => instance;
	const instance = acceptsInstance(example);

	assert.equal(instance.id, "840647391636226060");
	assert.equal(instance.guild_id, "197038439483310086");
	assert.equal(instance.channel_id, "733488538393510049");
	assert.equal(instance.topic, "Testing Testing, 123");
	assert.equal(instance.privacy_level, StageInstancePrivacyLevel.Public);
	assert.equal(instance.discoverable_disabled, false);
	assert.equal(instance.guild_scheduled_event_id, "947656305244532806");
});

test("stage instance option types match the documented JSON params", () => {
	// Create: channel_id and topic are required, everything else optional.
	const create: CreateStageInstanceOptions = {
		channel_id: "733488538393510049",
		topic: "Testing Testing, 123",
	};
	assert.equal(create.topic.length >= 1 && create.topic.length <= 120, true);

	const createAll: CreateStageInstanceOptions = {
		channel_id: "733488538393510049",
		topic: "Office Hours",
		privacy_level: StageInstancePrivacyLevel.GuildOnly,
		send_start_notification: true,
		guild_scheduled_event_id: "947656305244532806",
	};
	assert.equal(createAll.send_start_notification, true);

	// Modify: every field optional — an empty body is a no-op.
	const modify: ModifyStageInstanceOptions = {};
	assert.deepEqual(modify, {});

	const modifyAll: ModifyStageInstanceOptions = {
		topic: "New topic",
		privacy_level: StageInstancePrivacyLevel.GuildOnly,
	};
	assert.equal(modifyAll.privacy_level, 2);

	// The create/get/modify routes all return the Stage instance object.
	const result: StageInstanceResult = { ...createAll, ...exampleBody() };
	assert.equal(typeof result.id, "string");
});

function exampleBody() {
	return {
		id: "840647391636226060",
		guild_id: "197038439483310086",
		channel_id: "733488538393510049",
		topic: "Testing Testing, 123",
		privacy_level: StageInstancePrivacyLevel.Public as const,
		discoverable_disabled: false,
	};
}
