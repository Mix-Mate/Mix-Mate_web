import type { ProfileVisibility } from "../types/profile.types";
import ProfileChipField from "./ProfileChipField";

interface ProfileVisibilityFieldProps {
  value: ProfileVisibility;
  onChange: (value: ProfileVisibility) => void;
}

const visibilityOptions: { label: string; value: ProfileVisibility }[] = [
  { label: "전체 공개", value: "PUBLIC" },
  { label: "비공개", value: "PRIVATE" },
];

export default function ProfileVisibilityField({
  value,
  onChange,
}: ProfileVisibilityFieldProps) {
  return (
    <ProfileChipField
      label="프로필 공개 여부"
      value={value}
      options={visibilityOptions}
      required
      onChange={onChange}
    />
  );
}
