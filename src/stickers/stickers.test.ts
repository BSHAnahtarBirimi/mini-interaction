import { test } from "node:test";
import assert from "node:assert/strict";

import {
	StickerFormatType,
	StickerType,
	type APISticker,
	type APIStickerItem,
	type APIStickerPack,
	type CreateGuildStickerOptions,
	type ModifyGuildStickerOptions,
	type StickerPacksListResult,
} from "./Stickers.js";

test("sticker enums match the documented values", () => {
	assert.equal(StickerType.Standard, 1);
	assert.equal(StickerType.Guild, 2);

	assert.equal(StickerFormatType.PNG, 1);
	assert.equal(StickerFormatType.APNG, 2);
	assert.equal(StickerFormatType.Lottie, 3);
	assert.equal(StickerFormatType.GIF, 4);
});

test("the documented example sticker type-checks as APISticker", () => {
	// The example from the Sticker Resource docs. This fixture only type-checks —
	// assigning it through a function parameter keeps every field name and type
	// honest without inventing assertions Discord doesn't make.
	const example = {
		id: "749054660769218631",
		name: "Wave",
		tags: "wumpus, hello, sup, hi, oi, heyo, heya, yo, greetings, greet, welcome, wave, 👋, 👋🏻, 👋🏿, goodbye, bye, see ya, later, laterz, cya",
		type: 1,
		format_type: 3,
		description: "Wumpus waves hello",
		pack_id: "847199849233514549",
		sort_value: 12,
	};

	const acceptsSticker = (sticker: APISticker): APISticker => sticker;
	const sticker = acceptsSticker(example);

	assert.equal(sticker.id, "749054660769218631");
	assert.equal(sticker.type, StickerType.Standard);
	assert.equal(sticker.format_type, StickerFormatType.Lottie);
	assert.equal(sticker.sort_value, 12);
});

test("the documented example sticker pack type-checks as APIStickerPack", () => {
	const example = {
		id: "847199849233514549",
		stickers: [],
		name: "Wumpus Beyond",
		sku_id: "847199849233514547",
		cover_sticker_id: "749053689419006003",
		description: "Say hello to Wumpus!",
		banner_asset_id: "761773777976819732",
	};

	const acceptsPack = (pack: APIStickerPack): APIStickerPack => pack;
	const pack = acceptsPack(example);

	assert.equal(pack.id, "847199849233514549");
	assert.equal(pack.stickers.length, 0);
	assert.equal(pack.cover_sticker_id, "749053689419006003");
	assert.equal(pack.banner_asset_id, "761773777976819732");
});

test("a sticker item is the renderable subset of a sticker", () => {
	const item: APIStickerItem = {
		id: "749054660769218631",
		name: "Wave",
		format_type: StickerFormatType.Lottie,
	};

	assert.equal(item.format_type, 3);
	// The item shape carries only id/name/format_type — no tags or pack id.
	const keys = Object.keys(item).sort();
	assert.deepEqual(keys, ["format_type", "id", "name"]);
});

test("sticker option types match the documented params", () => {
	// Create: all four form params required (description may be empty string).
	const create: CreateGuildStickerOptions = {
		name: "Wave",
		description: "Wumpus waves hello",
		tags: "wumpus, hello, wave",
	};
	assert.equal(create.name.length >= 2 && create.name.length <= 30, true);

	// Modify: every field optional.
	const modify: ModifyGuildStickerOptions = {};
	assert.deepEqual(modify, {});

	const modifyAll: ModifyGuildStickerOptions = {
		name: "Wave",
		description: null,
		tags: "wumpus, hello, wave",
	};
	assert.equal(modifyAll.description, null);

	// List packs: the documented `{ sticker_packs }` response shape.
	const packs: StickerPacksListResult = { sticker_packs: [] };
	assert.deepEqual(packs.sticker_packs, []);
});
