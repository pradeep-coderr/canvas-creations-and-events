import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

const ratios = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  tall: "aspect-[2/3]",
  landscape: "aspect-[3/2]",
  wide: "aspect-video",
} as const;

type ImageFrameProps = Omit<
  ImageProps,
  "fill" | "width" | "height" | "className" | "sizes"
> & {
  ratio?: keyof typeof ratios;
  rounded?: boolean;
  /** Slow, slight zoom when the frame is hovered. */
  zoomOnHover?: boolean;
  /** Required: the frame is fluid, so the browser needs rendered widths. */
  sizes: string;
  className?: string;
  /** For editorial cropping, e.g. `object-top` or `object-[50%_30%]`. */
  imageClassName?: string;
};

/**
 * Responsive, cropped image. Photography is shown as-is: no tint, overlay or
 * filter by default.
 */
export function ImageFrame({
  ratio = "portrait",
  rounded = false,
  zoomOnHover = false,
  className,
  imageClassName,
  alt,
  ...props
}: ImageFrameProps) {
  return (
    <div
      className={cn(
        "group/frame relative overflow-hidden bg-muted",
        ratios[ratio],
        rounded && "rounded-lg",
        className,
      )}
    >
      <Image
        fill
        alt={alt}
        className={cn(
          "object-cover",
          zoomOnHover &&
            "transition-transform duration-1000 ease-elegant motion-safe:group-hover/frame:scale-[1.04]",
          imageClassName,
        )}
        {...props}
      />
    </div>
  );
}
