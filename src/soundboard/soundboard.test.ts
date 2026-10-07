import { test } from "node:test";
import assert from "node:assert/strict";

import {
	type APISoundboardSound,
	type GuildSoundboardSoundsResult,
	type SendSoundboardSoundOptions,
	type CreateGuildSoundboardSoundOptions,
	type ModifyGuildSoundboardSoundOptions,
} from "./Soundboard.js";

test("the documented default soundboard sound type-checks as APISoundboardSound", () => {
	// Example from the Soundboard docs: default sound (no guild_id, no emoji_id).
	const example = {
		name: "quack",
		sound_id: "1",
		volume: 1.0,
		emoji_id: null,
		emoji_name: "🦆",
		available: true,
	};

	const accepts = (sound: APISoundboardSound): APISoundboardSound => sound;
	const sound = accepts(example);

	assert.equal(sound.name, "quack");
	assert.equal(sound.sound_id, "1");
	assert.equal(sound.volume, 1.0);
	assert.equal(sound.emoji_id, null);
	assert.equal(sound.emoji_name, "🦆");
	assert.equal(sound.available, true);
});

test("the documented guild soundboard sound type-checks as APISoundboardSound", () => {
	// Example from the Soundboard docs: guild sound (with guild_id and emoji_id).
	const example = {
		name: "Yay",
		sound_id: "1106714396018884649",
		volume: 1,
		emoji_id: "989193655938064464",
		emoji_name: null,
		guild_id: "613425648685547541",
		available: true,
	};

	const accepts = (sound: APISoundboardSound): APISoundboardSound => sound;
	const sound = accepts(example);

	assert.equal(sound.name, "Yay");
	assert.equal(sound.sound_id, "1106714396018884649");
	assert.equal(sound.volume, 1);
	assert.equal(sound.emoji_id, "989193655938064464");
	assert.equal(sound.emoji_name, null);
	assert.equal(sound.guild_id, "613425648685547541");
	assert.equal(sound.available, true);
});

test("guild soundboard sounds result wraps the items array", () => {
	const result: GuildSoundboardSoundsResult = {
		items: [
			{ name: "quack", sound_id: "1", volume: 1.0, emoji_id: null, emoji_name: "🦆", available: true },
		],
	};

	assert.equal(result.items.length, 1);
	assert.equal(result.items[0].name, "quack");
});

test("soundboard option types match the documented JSON params", () => {
	// Send: sound_id required; source_guild_id only when playing cross-server.
	const send: SendSoundboardSoundOptions = {
		sound_id: "1",
	};
	assert.equal(send.sound_id, "1");

	const sendCross: SendSoundboardSoundOptions = {
		sound_id: "1",
		source_guild_id: "613425648685547541",
	};
	assert.equal(sendCross.source_guild_id, "613425648685547541");

	// Create: name (2-32) and base64 data URI sound required; others optional.
	const create: CreateGuildSoundboardSoundOptions = {
		name: "Yay",
		sound: "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAQAAACQA",
	};
	assert.equal(create.name.length >= 2 && create.name.length <= 32, true);

	const createAll: CreateGuildSoundboardSoundOptions = {
		name: "Yay",
		sound: "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAQAAACQA",
		volume: 0.75,
		emoji_id: "989193655938064464",
		emoji_name: "🎉",
	};
	assert.equal(createAll.volume, 0.75);
	assert.equal(createAll.emoji_id, "989193655938064464");
	assert.equal(createAll.emoji_name, "🎉");

	// Modify: every field optional, and nullable fields may be nulled out.
	const modify: ModifyGuildSoundboardSoundOptions = {};
	assert.deepEqual(modify, {});

	const modifyAll: ModifyGuildSoundboardSoundOptions = {
		name: "Updated",
		volume: null,
		emoji_id: null,
		emoji_name: "🎉",
	};
	assert.equal(modifyAll.name, "Updated");
	assert.equal(modifyAll.volume, null);
	assert.equal(modifyAll.emoji_id, null);
	assert.equal(modifyAll.emoji_name, "🎉");
});
