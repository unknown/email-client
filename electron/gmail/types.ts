export type EmailMessage = {
  historyId: string | null;
  id: string | null;
  internalDate: string | null;
  labelIds: string[] | null;
  decodedPayload: DecodedPayload;
  snippet: string | null;
  threadId: string | null;
};

export type EmailThread = {
  historyId: string | null;
  id: string | null;
  messages: EmailMessage[];
};

export type DecodedPayload = {
  html: string | null;
  text: string | null;
  headers: Record<string, string | null>;
};
