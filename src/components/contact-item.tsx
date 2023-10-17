import { getNameAndEmail } from "@/utils/email";

type ContactItemProps = {
  label?: string;
  contact: string;
};

export function ContactItem({ label, contact }: ContactItemProps) {
  const { name, email } = getNameAndEmail(contact);
  const nameText = name ?? contact;

  if (!label) {
    return (
      <p className="font-bold" title={email}>
        {nameText}
      </p>
    );
  }
  return (
    <p>
      {label}{" "}
      <span className="text-tx-2" title={email}>
        {nameText}
      </span>
    </p>
  );
}
