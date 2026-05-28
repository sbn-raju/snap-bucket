import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],

  format: ["esm", "cjs"],

  sourcemap: true,
  clean: true,
  splitting: false,

  dts: {
    resolve: true,
    compilerOptions: {
      tsconfig: "tsconfig.build.json"
    }
  }
});