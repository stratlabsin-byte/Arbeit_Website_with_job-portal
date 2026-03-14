"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  fallbackText?: string;
  fallbackBgColor?: string;
}

export default function ImageWithFallback({
  fallbackText,
  fallbackBgColor = "bg-primary-100",
  src,
  alt,
  width,
  height,
  ...props
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    const initials = (fallbackText || alt || "?")
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div
        className={`${fallbackBgColor} rounded-lg flex items-center justify-center text-primary-600 font-semibold`}
        style={{ width: width as number, height: height as number }}
      >
        {initials}
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      width={width}
      height={height}
      onError={() => setHasError(true)}
    />
  );
}
