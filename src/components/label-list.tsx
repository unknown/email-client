import { gmail_v1 } from "googleapis";

type LabelListProps = {
  labels: gmail_v1.Schema$Label[] | null;
  onLabelClick: (labelId: string) => void;
};

export function LabelList({ labels, onLabelClick }: LabelListProps) {
  return (
    <div>
      {labels?.map((label, i) => (
        <div key={label.id ?? i} onClick={() => onLabelClick(label.id ?? "")}>
          {label.name}
        </div>
      ))}
    </div>
  );
}
