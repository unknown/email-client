import fs from "fs/promises";
import path from "node:path";
import { authenticate } from "@google-cloud/local-auth";
import { Auth, gmail_v1, google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH, { encoding: "utf-8" });
    const credentials = JSON.parse(content);
    const refreshClient = new Auth.UserRefreshClient();
    refreshClient.fromJSON(credentials);
    return refreshClient;
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client: Auth.OAuth2Client) {
  const content = await fs.readFile(CREDENTIALS_PATH, { encoding: "utf-8" });
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

export async function authorize() {
  let client: Auth.OAuth2Client | null = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

export function createGmailClient(auth: Auth.OAuth2Client) {
  return google.gmail({ version: "v1", auth });
}

export async function listLabels(gmail: gmail_v1.Gmail) {
  const res = await gmail.users.labels.list({
    userId: "me",
  });
  return res.data.labels;
}

export async function listThreads(gmail: gmail_v1.Gmail, labelIds: string[]) {
  const res = await gmail.users.threads.list({
    labelIds,
    userId: "me",
    maxResults: 5,
  });
  return res.data.threads;
}
