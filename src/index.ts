import { authorize, createGmailClient, listLabels, listThreads } from "./utils/gmail";

authorize()
  .then(createGmailClient)
  .then(async (gmail) => {
    await listLabels(gmail);
    await listThreads(gmail, ["INBOX"]);
  })
  .catch(console.error);
