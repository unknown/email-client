import DOMPurify from "dompurify";
import { gmail_v1 } from "googleapis";
import { decode } from "html-entities";
import linkifyHtml from "linkify-html";

export function decodeHtmlEntities(str: string) {
  return decode(str);
}

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

function convertTextToHtml(text: string | null) {
  if (text === null) {
    return null;
  }
  const textWithBr = text.replaceAll("\n", "<br />");
  const textWithLinks = linkifyHtml(textWithBr);
  return textWithLinks;
}

export type DecodedPayload = {
  html: string | null;
  text: string | null;
  headers: Record<string, string>;
};

export function decodePayload(payload: gmail_v1.Schema$MessagePart | undefined) {
  const decodedPayload: DecodedPayload = { html: null, text: null, headers: {} };

  if (!payload) {
    return decodedPayload;
  }

  const flattened: gmail_v1.Schema$MessagePart[] = [];
  flattenParts([payload], flattened);

  const html = flattened.find((part) => part.mimeType === "text/html");
  const text = flattened.find((part) => part.mimeType === "text/plain");
  if (typeof html?.body?.data == "string") {
    const dirtyHtml = decodeBody(html.body.data);
    decodedPayload.html = dirtyHtml ? DOMPurify.sanitize(dirtyHtml) : null;
  }
  if (typeof text?.body?.data == "string") {
    const rawHtml = decodeBody(text.body.data);
    decodedPayload.text = convertTextToHtml(rawHtml);
  }

  payload.headers?.map(({ name, value }) => {
    if (!name || !value) {
      return;
    }
    decodedPayload.headers[name] = value;
  });

  return decodedPayload;
}
