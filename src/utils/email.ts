import linkifyHtml from "linkify-html";

export function convertTextToHtml(text: string) {
  const textWithBr = text.replaceAll("\n", "<br />");
  const textWithLinks = linkifyHtml(textWithBr);
  return textWithLinks;
}

function removeQuotes(str: string | undefined) {
  const regex = /^"(.*)"$/;
  return str?.replace(regex, "$1");
}

export function getNameAndEmail(emailStr: string) {
  const regex = /^(?:(?<name>.*)\s)?\<(?<email>.*)\>$/;
  const groups = emailStr.match(regex)?.groups;

  const name = removeQuotes(groups?.["name"]);
  const email = groups?.["email"];

  return { name, email };
}
