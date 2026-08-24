import { setTimeout as sleep } from 'node:timers/promises';
import type {
  APIChannel,
  APIMessage,
  APIUser,
  RESTPutAPIApplicationRoleConnectionMetadataJSONBody,
  RESTPutAPIApplicationRoleConnectionMetadataResult,
} from 'discord-api-types/v10';

import { DiscordSentMessage } from '../messages/DiscordSentMessage.js';
import {
  createMessageRequestInit,
  type BaseDiscordMessageOptions,
  type DiscordCreateThreadOptions,
  type DiscordReaction,
  type DiscordSendMessageOptions,
  type DiscordStartThreadOptions,
  type DiscordWebhookSendOptions,
} from '../messages/message-payloads.js';
import { DiscordWebhook } from '../webhooks/DiscordWebhook.js';

import type { DiscordChannelEditOptions } from '../messages/message-payloads.js';

type FetchLike = typeof fetch;

export type DiscordRestClientOptions = {
  token: string;
  applicationId: string;
  apiBaseUrl?: string;
  maxRetries?: number;
  fetchImplementation?: FetchLike;
};

export class DiscordRestClient {
  private readonly fetchImpl: FetchLike;
  private readonly baseUrl: string;
  private readonly maxRetries: number;

  constructor(private readonly options: DiscordRestClientOptions) {
    this.fetchImpl = options.fetchImplementation ?? fetch;
    this.baseUrl = options.apiBaseUrl ?? 'https://discord.com/api/v10';
    this.maxRetries = options.maxRetries ?? 3;
  }

  async request<T>(
    path: string,
    init: RequestInit & { authenticated?: boolean } = {},
  ): Promise<T> {
    let lastError: unknown;
    const { authenticated = true, ...requestInit } = init;
    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      let response: Response;
      try {
        response = await this.fetchImpl(`${this.baseUrl}${path}`, {
          ...requestInit,
          headers: {
            ...(authenticated ? { Authorization: `Bot ${this.options.token}` } : {}),
            ...getDefaultContentTypeHeader(requestInit.body),
            ...(requestInit.headers ?? {}),
          },
        });
      } catch (error) {
        lastError = this.createRequestError(path, requestInit.method, error);
        if (attempt < this.maxRetries) {
          await sleep(150 * (attempt + 1));
          continue;
        }
        break;
      }

      if (response.status === 429) {
        if (attempt < this.maxRetries) {
          const retryAfter = Number(response.headers.get('retry-after') ?? '1');
          await sleep(Math.ceil(retryAfter * 1000));
          continue;
        }

        lastError = new Error(
          `[DiscordRestClient] ${requestInit.method ?? 'GET'} ${path} failed: 429`,
        );
        break;
      }

      if (response.ok) {
        if (response.status === 204) return undefined as T;
        const responseText = await response.text();
        if (!responseText) return undefined as T;
        return JSON.parse(responseText) as T;
      }

      if (response.status >= 500 && attempt < this.maxRetries) {
        await sleep(150 * (attempt + 1));
        continue;
      }

      const errorBody = await response.text();
      lastError = new Error(
        `[DiscordRestClient] ${requestInit.method ?? 'GET'} ${path} failed: ${response.status}${errorBody ? ` ${errorBody}` : ''}`,
      );
      break;
    }
    throw lastError instanceof Error ? lastError : new Error('[DiscordRestClient] unknown request failure');
  }

  private createRequestError(path: string, method: string | undefined, error: unknown): Error {
    const message =
      error instanceof Error ? error.message : String(error);

    return new Error(
      `[DiscordRestClient] ${method ?? 'GET'} ${path} failed: ${message}`,
      { cause: error instanceof Error ? error : undefined },
    );
  }

  createFollowup(interactionToken: string, body: unknown): Promise<unknown> {
    return this.request(`/webhooks/${this.options.applicationId}/${interactionToken}`, {
      method: 'POST',
      body: JSON.stringify(body),
      authenticated: false,
    });
  }

  editOriginal(interactionToken: string, body: unknown): Promise<unknown> {
    return this.request(`/webhooks/${this.options.applicationId}/${interactionToken}/messages/@original`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      authenticated: false,
    });
  }

  /** Deletes the original interaction response. */
  async deleteOriginal(interactionToken: string): Promise<void> {
    await this.request(`/webhooks/${this.options.applicationId}/${interactionToken}/messages/@original`, {
      method: 'DELETE',
      authenticated: false,
    });
  }

  /** Deletes a follow-up message previously sent for this interaction. */
  async deleteFollowup(interactionToken: string, messageId: string): Promise<void> {
    await this.request(
      `/webhooks/${this.options.applicationId}/${interactionToken}/messages/${messageId}`,
      { method: 'DELETE', authenticated: false },
    );
  }

  async createFollowupMessage(
    interactionToken: string,
    options: BaseDiscordMessageOptions,
  ): Promise<DiscordSentMessage> {
    const requestInit = createMessageRequestInit(options);
    const message = await this.request<APIMessage>(
      `/webhooks/${this.options.applicationId}/${interactionToken}`,
      {
        method: 'POST',
        ...requestInit,
        authenticated: false,
      },
    );

    return new DiscordSentMessage(this, message);
  }

  async editOriginalMessage(
    interactionToken: string,
    options: BaseDiscordMessageOptions,
  ): Promise<DiscordSentMessage> {
    const requestInit = createMessageRequestInit(options);
    const message = await this.request<APIMessage>(
      `/webhooks/${this.options.applicationId}/${interactionToken}/messages/@original`,
      {
        method: 'PATCH',
        ...requestInit,
        authenticated: false,
      },
    );

    return new DiscordSentMessage(this, message);
  }

  async sendMessage(options: DiscordSendMessageOptions): Promise<DiscordSentMessage> {
    const { channelId, ...messageOptions } = options;
    const requestInit = createMessageRequestInit(messageOptions);
    const message = await this.request<APIMessage>(`/channels/${channelId}/messages`, {
      method: 'POST',
      ...requestInit,
    });

    return new DiscordSentMessage(this, message);
  }

  send(options: DiscordSendMessageOptions): Promise<DiscordSentMessage> {
    return this.sendMessage(options);
  }

  async startThread(options: DiscordStartThreadOptions): Promise<APIChannel> {
    const { channelId, messageId, reason, ...body } = options;

    return this.request<APIChannel>(`/channels/${channelId}/messages/${messageId}/threads`, {
      method: 'POST',
      body: JSON.stringify({
        auto_archive_duration: body.autoArchiveDuration,
        rate_limit_per_user: body.rateLimitPerUser,
        name: body.name,
      }),
      headers: reason ? { 'X-Audit-Log-Reason': reason } : undefined,
    });
  }

  /**
   * Creates a thread directly in a channel (no source message), e.g. for
   * forum channels or standalone public/private threads.
   */
  async createThread(options: DiscordCreateThreadOptions): Promise<APIChannel> {
    const { channelId, reason, autoArchiveDuration, rateLimitPerUser, type, invitable, name } = options;

    return this.request<APIChannel>(`/channels/${channelId}/threads`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        ...(autoArchiveDuration !== undefined ? { auto_archive_duration: autoArchiveDuration } : {}),
        ...(rateLimitPerUser !== undefined ? { rate_limit_per_user: rateLimitPerUser } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(invitable !== undefined ? { invitable } : {}),
      }),
      headers: reason ? { 'X-Audit-Log-Reason': reason } : undefined,
    });
  }

  async editMessage(
    channelId: string,
    messageId: string,
    options: BaseDiscordMessageOptions,
  ): Promise<DiscordSentMessage> {
    const requestInit = createMessageRequestInit(options);
    const message = await this.request<APIMessage>(`/channels/${channelId}/messages/${messageId}`, {
      method: 'PATCH',
      ...requestInit,
    });

    return new DiscordSentMessage(this, message);
  }

  async deleteMessage(channelId: string, messageId: string, reason?: string): Promise<void> {
    await this.request(`/channels/${channelId}/messages/${messageId}`, {
      method: 'DELETE',
      headers: reason ? { 'X-Audit-Log-Reason': reason } : undefined,
    });
  }

  async pinMessage(channelId: string, messageId: string, reason?: string): Promise<void> {
    await this.request(`/channels/${channelId}/pins/${messageId}`, {
      method: 'PUT',
      headers: reason ? { 'X-Audit-Log-Reason': reason } : undefined,
    });
  }

  async unpinMessage(channelId: string, messageId: string, reason?: string): Promise<void> {
    await this.request(`/channels/${channelId}/pins/${messageId}`, {
      method: 'DELETE',
      headers: reason ? { 'X-Audit-Log-Reason': reason } : undefined,
    });
  }

  async crosspostMessage(channelId: string, messageId: string): Promise<APIMessage> {
    return this.request<APIMessage>(`/channels/${channelId}/messages/${messageId}/crosspost`, {
      method: 'POST',
    });
  }

  /** Sends a message through an existing webhook without instantiating {@link DiscordWebhook}. */
  async sendWebhookMessage(
    webhookId: string,
    webhookToken: string,
    options: DiscordWebhookSendOptions,
  ): Promise<DiscordSentMessage> {
    return this.webhook(webhookId, webhookToken).send(options);
  }

  // ---- Message reads & bulk operations (v0.7) ----

  async fetchMessage(channelId: string, messageId: string): Promise<DiscordSentMessage> {
    const message = await this.request<APIMessage>(`/channels/${channelId}/messages/${messageId}`);
    return new DiscordSentMessage(this, message);
  }

  /** Lists channel messages; at most one of before/after/around per call. */
  async fetchMessages(
    channelId: string,
    options: { limit?: number; before?: string; after?: string; around?: string } = {},
  ): Promise<APIMessage[]> {
    const { limit, before, after, around } = options;
    const params = new URLSearchParams();
    if (limit !== undefined) params.set('limit', String(limit));
    if (before) params.set('before', before);
    if (after) params.set('after', after);
    if (around) params.set('around', around);

    const query = params.size > 0 ? `?${params.toString()}` : '';
    return this.request<APIMessage[]>(`/channels/${channelId}/messages${query}`);
  }

  /** Bulk-deletes 2–100 messages (all must be younger than 14 days). */
  async bulkDeleteMessages(channelId: string, messageIds: readonly string[], reason?: string): Promise<void> {
    if (messageIds.length < 2 || messageIds.length > 100) {
      throw new Error('[DiscordRestClient] bulk delete accepts between 2 and 100 messages');
    }

    await this.request(`/channels/${channelId}/messages/bulk-delete`, {
      method: 'POST',
      body: JSON.stringify({ messages: [...messageIds] }),
      headers: reason ? { 'X-Audit-Log-Reason': reason } : undefined,
    });
  }

  // ---- Typing & reactions (v0.7) ----

  async triggerTyping(channelId: string): Promise<void> {
    await this.request(`/channels/${channelId}/typing`, { method: 'POST' });
  }

  /** Lists the users who reacted with the given emoji (paginated). */
  async fetchReactors(
    channelId: string,
    messageId: string,
    reaction: DiscordReaction,
    options: { limit?: number; after?: string; type?: number } = {},
  ): Promise<APIUser[]> {
    const { limit, after, type } = options;
    const params = new URLSearchParams();
    if (limit !== undefined) params.set('limit', String(limit));
    if (after) params.set('after', after);
    if (type !== undefined) params.set('type', String(type));

    const query = params.size > 0 ? `?${params.toString()}` : '';
    return this.request<APIUser>(
      `/channels/${channelId}/messages/${messageId}/reactions/${encodeDiscordReaction(reaction)}${query}`,
    ).then((result) => result as unknown as APIUser[]);
  }

  async removeOwnReaction(channelId: string, messageId: string, reaction: DiscordReaction): Promise<void> {
    await this.request(
      `/channels/${channelId}/messages/${messageId}/reactions/${encodeDiscordReaction(reaction)}/@me`,
      { method: 'DELETE' },
    );
  }

  async removeUserReaction(
    channelId: string,
    messageId: string,
    userId: string,
    reaction: DiscordReaction,
    reason?: string,
  ): Promise<void> {
    await this.request(
      `/channels/${channelId}/messages/${messageId}/reactions/${encodeDiscordReaction(reaction)}/${userId}`,
      { method: 'DELETE', headers: reason ? { 'X-Audit-Log-Reason': reason } : undefined },
    );
  }

  async removeAllReactions(channelId: string, messageId: string, reason?: string): Promise<void> {
    await this.request(`/channels/${channelId}/messages/${messageId}/reactions`, {
      method: 'DELETE',
      headers: reason ? { 'X-Audit-Log-Reason': reason } : undefined,
    });
  }

  async removeAllReactionsForEmoji(
    channelId: string,
    messageId: string,
    reaction: DiscordReaction,
    reason?: string,
  ): Promise<void> {
    await this.request(`/channels/${channelId}/messages/${messageId}/reactions/${encodeDiscordReaction(reaction)}`, {
      method: 'DELETE',
      headers: reason ? { 'X-Audit-Log-Reason': reason } : undefined,
    });
  }

  // ---- Channels (v0.7) ----

  async fetchChannel(channelId: string): Promise<APIChannel> {
    return this.request<APIChannel>(`/channels/${channelId}`);
  }

  /** Edits channel fields; thread-only options are sent only when provided. */
  async editChannel(
    channelId: string,
    options: DiscordChannelEditOptions,
    reason?: string,
  ): Promise<APIChannel> {
    return this.request<APIChannel>(`/channels/${channelId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...(options.name !== undefined ? { name: options.name } : {}),
        ...(options.topic !== undefined ? { topic: options.topic } : {}),
        ...(options.nsfw !== undefined ? { nsfw: options.nsfw } : {}),
        ...(options.rateLimitPerUser !== undefined
          ? { rate_limit_per_user: options.rateLimitPerUser }
          : {}),
        ...(options.archived !== undefined ? { archived: options.archived } : {}),
        ...(options.locked !== undefined ? { locked: options.locked } : {}),
        ...(options.autoArchiveDuration !== undefined
          ? { auto_archive_duration: options.autoArchiveDuration }
          : {}),
      }),
      headers: reason ? { 'X-Audit-Log-Reason': reason } : undefined,
    });
  }

  async deleteChannel(channelId: string, reason?: string): Promise<void> {
    await this.request(`/channels/${channelId}`, {
      method: 'DELETE',
      headers: reason ? { 'X-Audit-Log-Reason': reason } : undefined,
    });
  }

  /** Follows an announcement channel into the target channel. */
  async followAnnouncementChannel(
    sourceChannelId: string,
    targetChannelId: string,
    reason?: string,
  ): Promise<void> {
    await this.request(`/channels/${sourceChannelId}/followers`, {
      method: 'POST',
      body: JSON.stringify({ webhook_channel_id: targetChannelId }),
      headers: reason ? { 'X-Audit-Log-Reason': reason } : undefined,
    });
  }

  // ---- Polls (v0.7) ----

  /** Immediately ends a poll the app authored. */
  async endPoll(channelId: string, messageId: string): Promise<APIMessage> {
    return this.request<APIMessage>(`/channels/${channelId}/polls/${messageId}/expire`, {
      method: 'POST',
    });
  }

  /** Lists users who voted for a poll answer (up to 100 per call). */
  async fetchPollAnswerVoters(
    channelId: string,
    messageId: string,
    answerId: number,
  ): Promise<APIUser[]> {
    return this.request<APIUser[]>(
      `/channels/${channelId}/polls/${messageId}/answers/${answerId}/voters`,
    );
  }

  addReaction(
    channelId: string,
    messageId: string,
    reaction: DiscordReaction,
  ): Promise<void> {
    return this.request<void>(
      `/channels/${channelId}/messages/${messageId}/reactions/${encodeDiscordReaction(reaction)}/@me`,
      {
        method: 'PUT',
      },
    );
  }

  webhook(id: string, token: string): DiscordWebhook {
    return new DiscordWebhook(this, id, token);
  }

  putApplicationRoleConnectionMetadata(
    body: RESTPutAPIApplicationRoleConnectionMetadataJSONBody,
  ): Promise<RESTPutAPIApplicationRoleConnectionMetadataResult> {
    return this.request(`/applications/${this.options.applicationId}/role-connections/metadata`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }
}

function getDefaultContentTypeHeader(body: RequestInit['body']): HeadersInit {
  return body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
}

function encodeDiscordReaction(reaction: DiscordReaction): string {
  if (typeof reaction !== 'string') {
    return encodeURIComponent(reaction.id ? `${reaction.name}:${reaction.id}` : reaction.name);
  }

  const trimmed = reaction.trim();

  const customEmojiMatch = trimmed.match(/^<a?:([^:>]+):(\d+)>$/);
  if (customEmojiMatch) {
    const [, name, id] = customEmojiMatch;
    return encodeURIComponent(`${name}:${id}`);
  }

  if (/^[^:\s]+:\d+$/.test(trimmed)) {
    return encodeURIComponent(trimmed);
  }

  return encodeURIComponent(trimmed);
}
