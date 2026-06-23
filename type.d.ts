import { SFSymbol } from "expo-symbols";

declare global {
  interface AppTab {
    name: string;
    title: string;
    symbol: SFSymbol;
  }

  interface TabIconProps {
    focused: boolean;
    symbol: SFSymbol;
  }

  interface InformationOptionProps {
    id: number;
    symbolName: SFSymbol;
    title: string;
  }

  interface GoogleIconProps {
    size?: number;
  }
}

export {};
