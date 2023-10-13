import { gmail_v1 } from "googleapis";

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

export function decodeMessage(message: gmail_v1.Schema$Message) {
  const { payload } = message;
  if (!payload) {
    return null;
  }

  const flattened: gmail_v1.Schema$MessagePart[] = [];
  flattenParts([payload], flattened);

  const html = flattened.find((part) => part.mimeType === "text/html");
  if (typeof html?.body?.data == "string") {
    return decodeBody(html.body.data);
  }

  const plain = flattened.find((part) => part.mimeType === "text/plain");
  if (typeof plain?.body?.data == "string") {
    return decodeBody(plain.body.data);
  }

  return null;
}
