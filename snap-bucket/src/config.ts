import { SDKConfig } from "./types";

let config: SDKConfig | null = null;

export const init = (sdkConfig: SDKConfig) => {
  config = sdkConfig;
};

export const getConfig = (): SDKConfig => {
  if (!config) {
    throw new Error(
      "SDK not initialized. Call init() first."
    );
  }

  return config;
};