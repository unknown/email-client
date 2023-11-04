import { gmail_v1 } from "googleapis";
import { decode } from "html-entities";

import { DecodedPayload, EmailMessage, EmailThread } from "./types";

function decodeBase64(base64: string) {
  const text = atob(base64);
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; ++i) {
    bytes[i] = text.charCodeAt(i);
  }
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

function decodeBody(body: string) {
  // transform from other base64 variants
  const transformedBody = body.replaceAll("-", "+").replaceAll("_", "/");
  try {
    return decodeBase64(transformedBody);
  } catch (err) {
    console.error(err);
    return null;
  }
}

function decodeHtmlEntities(str: string) {
  return decode(str);
}

function flattenParts(
  parts: gmail_v1.Schema$MessagePart[] | undefined,
  flattened: gmail_v1.Schema$MessagePart[],
) {
  if (parts === undefined) {
    return;
  }

  for (let i = 0; i < parts.length; ++i) {
    const part = parts[i];
    if (!part) {
      continue;
    }

    if (part.parts) {
      flattenParts(part.parts, flattened);
    } else {
      flattened.push(part);
    }
  }
}

export function decodePayload(payload: gmail_v1.Schema$MessagePart) {
  const decodedPayload: DecodedPayload = { html: null, text: null, headers: {} };
  payload.headers?.forEach(({ name, value }) => {
    if (!name || !value) {
      return;
    }
    decodedPayload.headers[name] = value;
  });

  const flattened: gmail_v1.Schema$MessagePart[] = [];
  flattenParts([payload], flattened);

  const html = flattened.find((part) => part.mimeType === "text/html");
  const text = flattened.find((part) => part.mimeType === "text/plain");
  if (typeof html?.body?.data === "string") {
    const decodedHtml = decodeBody(html.body.data);
    decodedPayload.html = decodedHtml;
  }
  if (typeof text?.body?.data === "string") {
    const decodedText = decodeBody(text.body.data);
    decodedPayload.text = decodedText;
  }

  return decodedPayload;
}

export function decodeEmailMessage(message: gmail_v1.Schema$Message) {
  const { historyId, id, internalDate, labelIds, payload, snippet, threadId } = message;
  const decodedMessage: EmailMessage = {
    historyId: historyId ?? null,
    id: id ?? null,
    internalDate: internalDate ?? null,
    labelIds: labelIds ?? null,
    decodedPayload: payload ? decodePayload(payload) : { html: null, text: null, headers: {} },
    snippet: snippet ? decodeHtmlEntities(snippet) : null,
    threadId: threadId ?? null,
  };
  return decodedMessage;
}

export function decodeEmailThread(thread: gmail_v1.Schema$Thread) {
  const { historyId, id, messages } = thread;
  const decodedThread: EmailThread = {
    historyId: historyId ?? null,
    id: id ?? null,
    messages: messages?.map(decodeEmailMessage) ?? [],
  };
  return decodedThread;
}
