"use client";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "~/lib/features/store";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    console.log("===========StoreProvider===========");
  }, []);
  return <Provider store={store}>{children}</Provider>;
}
