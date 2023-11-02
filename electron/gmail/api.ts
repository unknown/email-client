import { gmail_v1 } from "googleapis";

import { getGmailClient } from "./auth";
import { decodeEmailThread } from "./decoder";
import { EmailThread } from "./types";

export async function getThread(id: string) {
  const gmail = await getGmailClient();
  const res = await gmail.users.threads.get({
    id,
    userId: "me",
    format: "full",
  });
  return decodeEmailThread(res.data);
}

export async function modifyThread(
  id: string,
  options: gmail_v1.Schema$ModifyThreadRequest,
): Promise<EmailThread> {
  const gmail = await getGmailClient();
  await gmail.users.threads.modify({
    id,
    userId: "me",
    requestBody: options,
  });
  // TODO: save this
  return getThread(id);
}
