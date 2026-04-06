import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const cwd = process.cwd();
const configPath = resolve(cwd, "wrangler.toml");
const templatePath = resolve(cwd, "wrangler.toml.template");
let createdTempConfig = false;

if (!existsSync(configPath)) {
    if (!existsSync(templatePath)) {
        console.error("Missing wrangler config: neither wrangler.toml nor wrangler.toml.template exists.");
        process.exit(1);
    }
    copyFileSync(templatePath, configPath);
    createdTempConfig = true;
}

const wranglerBinary = process.platform === "win32" ? "wrangler.cmd" : "wrangler";

try {
    const result = spawnSync(
        wranglerBinary,
        ["deploy", "--dry-run", "--outdir", "dist", "--minify", "--config", configPath],
        {
            cwd,
            stdio: "inherit",
        }
    );

    if (typeof result.status === "number") {
        process.exit(result.status);
    }
    process.exit(1);
} finally {
    if (createdTempConfig) {
        rmSync(configPath, { force: true });
    }
}
