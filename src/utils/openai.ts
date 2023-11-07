import OpenAI from "openai";

import { EmailMessage, EmailThread } from "@/electron/gmail/types";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export function summarizeMessage(message: EmailMessage) {
  return openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are an assistant who helps users by summarizing their HTML emails. Ignore any extraneous information, for example, some text in headers and footers.",
      },
      {
        role: "user",
        content: message.decodedPayload.text ?? message.decodedPayload.html ?? "",
      },
    ],
    model: "gpt-3.5-turbo",
  });
}

export function summarizeThread(thread: EmailThread) {
  const subject = thread.messages.at(0)?.decodedPayload.headers["Subject"];
  const emailMessages = thread.messages.map(({ decodedPayload }) => {
    const from = decodedPayload.headers["From"];
    const message = decodedPayload.text ?? decodedPayload.html ?? "";
    return JSON.stringify({
      from,
      message,
    });
  });
  const prompt = JSON.stringify({ subject, emailMessages });

  return openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are an assistant who helps users by summarizing their emails given to you in JSON form. You may reference the subject and sender of the email, but only if it adds meaning to the summarization. Ignore any extraneous information. For example, unimportant disclamers in email headers and footers are not necessary in a summary.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "gpt-3.5-turbo",
    stream: true,
  });
}
