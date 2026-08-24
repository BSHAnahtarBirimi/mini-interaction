# Changelog

## Unreleased
### Added
- Discord markdown helpers: `bold`, `italic`, `underline`, `strikethrough`, `inlineCode`, `codeBlock`, `blockQuote`, `multilineBlockQuote`, `spoiler`, `subtext`, `heading`, `bulletList`, `numberedList`, `maskLink`, `timestamp`, `userMention`, `roleMention`, `channelMention`, `slashCommandMention` and `escapeMarkdown`.
- `DiscordRestClient.createThread` for creating threads directly in a channel (forum/standalone threads) alongside the existing message-based `startThread`.
- `DiscordRestClient.editMessage`, `deleteMessage`, `pinMessage`, `unpinMessage`, `crosspostMessage` and `sendWebhookMessage` convenience methods.
- `DiscordSentMessage.edit`, `delete`, `reply` (with `message_reference` support), `pin`, `unpin` and `crosspost` helpers.
- `DiscordWebhook.edit` and `DiscordWebhook.delete` for webhook-sent messages.
- Reply support via `messageReference` on all message send options.
### Fixed
- **Breaking:** Radio/checkbox contracts now match Discord's real components: RadioGroup (type 21), CheckboxGroup (type 22) and Checkbox (type 23). The previous `2001`/`2002` type values were invalid and rejected by the API.
- **Breaking:** `CheckboxBuilder` now builds the single-checkbox component (`custom_id` + `default` only). The former options-array model moved to the new `CheckboxGroupBuilder` (options 2-10, `min_values`/`max_values`).
- `RadioBuilder` now enforces Discord's 2-10 option limit and no longer serialises `disabled`, which is not accepted on modal radio groups. Option emoji was dropped per the component spec.
- Modal select menus (`Modal*SelectMenuBuilder`) no longer serialise `disabled` (not valid in modals) and validate `placeholder` against the 150-character limit; message-side select builders gained the same placeholder check.
- `COMPONENTS_V2_TYPES` detection now only contains real message Components V2 types (Section, TextDisplay, Thumbnail, MediaGallery, File, Separator, Container); modal-only Label/FileUpload/RadioGroup/CheckboxGroup were removed from message V2 detection.
- Sending a Components V2 message with `content`, `embeds` or `sticker_ids` now throws instead of producing an API error.
- `ModalBuilder` accepts top-level TextDisplay components alongside ActionRow and Label.
### Breaking changes
- Reworked interaction architecture around `core/http`, `core/interactions`, `router`, and `compat` modules.
- Builder validation now throws hard `ValidationError` for out-of-spec payloads.
- `ModalBuilder` no longer auto-wraps arbitrary components into action rows.

### Added
- `DiscordRestClient` with retry + rate-limit behavior.
- `InteractionContext` lifecycle helpers for reply/defer/showModal/edit/followUp.
- `InteractionRouter` command/component/modal dispatch.
- `RadioBuilder` + `APIRadioComponent` types.
- `MIGRATION.md` and architecture docs.
