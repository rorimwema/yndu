import { load } from 'std/dotenv/mod.ts';

const fileEnv = await load({ allowEmptyValues: true });

function readSecretFile(path: string, key: string): string {
  try {
    return Deno.readTextFileSync(path).trim();
  } catch (error) {
    throw new Error(
      `Failed to read secret file for ${key} from "${path}": ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export function getEnv(key: string, fallback = ''): string {
  const directEnv = Deno.env.get(key);
  if (directEnv !== undefined) {
    return directEnv;
  }

  const fileKey = `${key}_FILE`;
  const secretFilePath = Deno.env.get(fileKey) ?? fileEnv[fileKey];
  if (secretFilePath) {
    return readSecretFile(secretFilePath, key);
  }

  const dotenvValue = fileEnv[key];
  if (dotenvValue !== undefined) {
    return dotenvValue;
  }

  return fallback;
}
