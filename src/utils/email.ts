export function getNameAndEmail(emailStr: string) {
  const regex = /^(?<name>.*)\s\<(?<email>.*)\>$/;
  const groups = emailStr.match(regex)?.groups;
  return {
    name: groups?.["name"],
    email: groups?.["email"],
  };
}
