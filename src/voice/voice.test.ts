import { test } from "node:test";
import assert from "node:assert/strict";

import {
	isDeprecatedVoiceRegion,
	selectVoiceRegion,
	type APIVoiceRegion,
	type APIVoiceState,
} from "./Voice.js";

function region(id: string, overrides: Partial<APIVoiceRegion> = {}): APIVoiceRegion {
	return {
		id,
		name: id,
		optimal: false,
		deprecated: false,
		custom: false,
		...overrides,
	};
}

test("isDeprecatedVoiceRegion reflects the documented flag", () => {
	assert.equal(isDeprecatedVoiceRegion({ deprecated: true }), true);
	assert.equal(isDeprecatedVoiceRegion({ deprecated: false }), false);
});

test("selectVoiceRegion returns undefined when nothing is usable", () => {
	assert.equal(selectVoiceRegion([]), undefined);
	// A deprecated region is unusable even when Discord marks it optimal.
	assert.equal(
		selectVoiceRegion([region("retired", { deprecated: true, optimal: true })]),
		undefined,
	);
});

test("selectVoiceRegion prefers the optimal region when it is not first", () => {
	const picked = selectVoiceRegion([
		region("eu"),
		region("us", { optimal: true }),
		region("asia"),
	]);

	assert.equal(picked?.id, "us");
});

test("selectVoiceRegion never picks a deprecated region", () => {
	const picked = selectVoiceRegion([
		region("retired", { deprecated: true, optimal: true }),
		region("buenos-aires"),
		region("us", { optimal: true }),
	]);

	assert.equal(picked?.id, "us");
});

test("selectVoiceRegion falls back to the first usable region", () => {
	const picked = selectVoiceRegion([region("eu", { custom: true }), region("us")]);

	assert.equal(picked?.id, "eu");
});

test("the documented voice region example selects cleanly", () => {
	const regions: APIVoiceRegion[] = [
		{ id: "deprecated", name: "Deprecated", optimal: false, deprecated: true, custom: false },
		{ id: "us-west", name: "US West", optimal: true, deprecated: false, custom: false },
		{ id: "custom", name: "Custom", optimal: false, deprecated: false, custom: true },
	];

	assert.equal(selectVoiceRegion(regions)?.id, "us-west");
});

test("the documented voice state example type-checks as APIVoiceState", () => {
	// Shape copied from the Voice Resource docs; `guild_id`, `member` and
	// `self_stream` are absent because this example is not guild-scoped, and the
	// example predates `self_video` — the field table lists it as required.
	const state: APIVoiceState = {
		channel_id: "157733188964188161",
		user_id: "80351110224678912",
		session_id: "90326bd25d71d39b9ef95b299e3872ff",
		deaf: false,
		mute: false,
		self_deaf: false,
		self_mute: true,
		self_video: false,
		suppress: false,
		request_to_speak_timestamp: "2021-03-31T18:45:31.297561+00:00",
	};

	assert.equal(state.channel_id, "157733188964188161");
	assert.equal(state.self_mute, true);
	assert.equal(state.guild_id, undefined);
	assert.equal(state.self_stream, undefined);
});
