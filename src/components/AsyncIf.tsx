import { ReactNode } from "react";

type Props = {
  condition: () => Promise<boolean>;
  children: ReactNode;
  loadingFallback?: ReactNode;
  otherwise?: ReactNode;
};

export default async function AsyncIf({
  children,
  condition,
  loadingFallback,
  otherwise,
}: Props) {
  return (await condition()) ? children : otherwise;
}
