import ChipField, { type ChipFieldProps } from "@/shared/ui/ChipField";

export default function ProfileChipField<TValue extends string>(
  props: ChipFieldProps<TValue>,
) {
  return <ChipField {...props} />;
}
