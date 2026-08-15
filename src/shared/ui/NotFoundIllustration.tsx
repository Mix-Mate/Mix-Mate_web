import Image from "next/image";
import notFoundIllustration from "../assets/not-found-illustration.svg";

interface NotFoundIllustrationProps {
  className?: string;
  title?: string;
}

export default function NotFoundIllustration({
  title = "캐릭터 일러스트",
  className,
}: NotFoundIllustrationProps) {
  return (
    <Image
      src={notFoundIllustration}
      alt={title}
      width={264}
      height={231}
      className={className}
      unoptimized
    />
  );
}
