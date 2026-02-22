import React from "react";
import { clsx } from "clsx";

export interface PageTitleProps {
  className?: string;
  title: string;
}

export function PageTitleText(props: PageTitleProps) {
  return <h1 className={clsx("text-4xl", props.className)}>{props.title}</h1>;
}
