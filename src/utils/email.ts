function removeQuotes(str: string | undefined) {
  const regex = /^"(.*)"$/;
  return str?.replace(regex, "$1");
}

export function getNameAndEmail(emailStr: string) {
  const regex = /^(?<name>.*)\s\<(?<email>.*)\>$/;
  const groups = emailStr.match(regex)?.groups;
  const name = removeQuotes(groups?.["name"]);
  const email = groups?.["email"];
  return { name, email };
}
