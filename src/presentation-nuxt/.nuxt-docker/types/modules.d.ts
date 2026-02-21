import { ModuleDependencyMeta, NuxtModule } from '@nuxt/schema';
declare module '@nuxt/schema' {
  interface ModuleDependencies {
    ['auth-utils']?:
      | ModuleDependencyMeta<
        typeof import('nuxt-auth-utils').default extends NuxtModule<infer O> ? O | false
          : Record<string, unknown>
      >
      | false;
    ['@reka-ui/nuxt']?:
      | ModuleDependencyMeta<
        typeof import('reka-ui/nuxt').default extends NuxtModule<infer O> ? O | false
          : Record<string, unknown>
      >
      | false;
    ['@nuxtjs/tailwindcss']?:
      | ModuleDependencyMeta<
        typeof import('@nuxtjs/tailwindcss').default extends NuxtModule<infer O> ? O | false
          : Record<string, unknown>
      >
      | false;
    ['pinia']?:
      | ModuleDependencyMeta<
        typeof import('@pinia/nuxt').default extends NuxtModule<infer O> ? O | false
          : Record<string, unknown>
      >
      | false;
    ['@nuxt/image']?:
      | ModuleDependencyMeta<
        typeof import('@nuxt/image').default extends NuxtModule<infer O> ? O | false
          : Record<string, unknown>
      >
      | false;
    ['@nuxt/devtools']?:
      | ModuleDependencyMeta<
        typeof import('@nuxt/devtools').default extends NuxtModule<infer O> ? O | false
          : Record<string, unknown>
      >
      | false;
  }
  interface NuxtOptions {
    /**
     * Configuration for `nuxt-auth-utils`
     */
    ['auth']: typeof import('nuxt-auth-utils').default extends NuxtModule<infer O, unknown, boolean>
      ? O | false
      : Record<string, any> | false;
    /**
     * Configuration for `reka-ui/nuxt`
     */
    ['reka']: typeof import('reka-ui/nuxt').default extends NuxtModule<infer O, unknown, boolean>
      ? O | false
      : Record<string, any> | false;
    /**
     * Configuration for `@nuxtjs/tailwindcss`
     */
    ['tailwindcss']: typeof import('@nuxtjs/tailwindcss').default extends
      NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false;
    /**
     * Configuration for `@pinia/nuxt`
     */
    ['pinia']: typeof import('@pinia/nuxt').default extends NuxtModule<infer O, unknown, boolean>
      ? O | false
      : Record<string, any> | false;
    /**
     * Configuration for `@nuxt/image`
     */
    ['image']: typeof import('@nuxt/image').default extends NuxtModule<infer O, unknown, boolean>
      ? O | false
      : Record<string, any> | false;
    /**
     * Configuration for `@nuxt/devtools`
     */
    ['devtools']: typeof import('@nuxt/devtools').default extends
      NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false;
  }
  interface NuxtConfig {
    /**
     * Configuration for `nuxt-auth-utils`
     */
    ['auth']?: typeof import('nuxt-auth-utils').default extends
      NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false;
    /**
     * Configuration for `reka-ui/nuxt`
     */
    ['reka']?: typeof import('reka-ui/nuxt').default extends NuxtModule<infer O, unknown, boolean>
      ? Partial<O> | false
      : Record<string, any> | false;
    /**
     * Configuration for `@nuxtjs/tailwindcss`
     */
    ['tailwindcss']?: typeof import('@nuxtjs/tailwindcss').default extends
      NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false;
    /**
     * Configuration for `@pinia/nuxt`
     */
    ['pinia']?: typeof import('@pinia/nuxt').default extends NuxtModule<infer O, unknown, boolean>
      ? Partial<O> | false
      : Record<string, any> | false;
    /**
     * Configuration for `@nuxt/image`
     */
    ['image']?: typeof import('@nuxt/image').default extends NuxtModule<infer O, unknown, boolean>
      ? Partial<O> | false
      : Record<string, any> | false;
    /**
     * Configuration for `@nuxt/devtools`
     */
    ['devtools']?: typeof import('@nuxt/devtools').default extends
      NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false;
    modules?: (
      | undefined
      | null
      | false
      | NuxtModule<any>
      | string
      | [NuxtModule | string, Record<string, any>]
      | ['nuxt-auth-utils', Exclude<NuxtConfig['auth'], boolean>]
      | ['reka-ui/nuxt', Exclude<NuxtConfig['reka'], boolean>]
      | ['@nuxtjs/tailwindcss', Exclude<NuxtConfig['tailwindcss'], boolean>]
      | ['@pinia/nuxt', Exclude<NuxtConfig['pinia'], boolean>]
      | ['@nuxt/image', Exclude<NuxtConfig['image'], boolean>]
      | ['@nuxt/devtools', Exclude<NuxtConfig['devtools'], boolean>]
    )[];
  }
}
declare module 'nuxt/schema' {
  interface ModuleDependencies {
    ['auth-utils']?:
      | ModuleDependencyMeta<
        typeof import('nuxt-auth-utils').default extends NuxtModule<infer O> ? O | false
          : Record<string, unknown>
      >
      | false;
    ['@reka-ui/nuxt']?:
      | ModuleDependencyMeta<
        typeof import('reka-ui/nuxt').default extends NuxtModule<infer O> ? O | false
          : Record<string, unknown>
      >
      | false;
    ['@nuxtjs/tailwindcss']?:
      | ModuleDependencyMeta<
        typeof import('@nuxtjs/tailwindcss').default extends NuxtModule<infer O> ? O | false
          : Record<string, unknown>
      >
      | false;
    ['pinia']?:
      | ModuleDependencyMeta<
        typeof import('@pinia/nuxt').default extends NuxtModule<infer O> ? O | false
          : Record<string, unknown>
      >
      | false;
    ['@nuxt/image']?:
      | ModuleDependencyMeta<
        typeof import('@nuxt/image').default extends NuxtModule<infer O> ? O | false
          : Record<string, unknown>
      >
      | false;
    ['@nuxt/devtools']?:
      | ModuleDependencyMeta<
        typeof import('@nuxt/devtools').default extends NuxtModule<infer O> ? O | false
          : Record<string, unknown>
      >
      | false;
  }
  interface NuxtOptions {
    /**
     * Configuration for `nuxt-auth-utils`
     * @see https://www.npmjs.com/package/nuxt-auth-utils
     */
    ['auth']: typeof import('nuxt-auth-utils').default extends NuxtModule<infer O, unknown, boolean>
      ? O | false
      : Record<string, any> | false;
    /**
     * Configuration for `reka-ui/nuxt`
     * @see https://www.npmjs.com/package/reka-ui/nuxt
     */
    ['reka']: typeof import('reka-ui/nuxt').default extends NuxtModule<infer O, unknown, boolean>
      ? O | false
      : Record<string, any> | false;
    /**
     * Configuration for `@nuxtjs/tailwindcss`
     * @see https://www.npmjs.com/package/@nuxtjs/tailwindcss
     */
    ['tailwindcss']: typeof import('@nuxtjs/tailwindcss').default extends
      NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false;
    /**
     * Configuration for `@pinia/nuxt`
     * @see https://www.npmjs.com/package/@pinia/nuxt
     */
    ['pinia']: typeof import('@pinia/nuxt').default extends NuxtModule<infer O, unknown, boolean>
      ? O | false
      : Record<string, any> | false;
    /**
     * Configuration for `@nuxt/image`
     * @see https://www.npmjs.com/package/@nuxt/image
     */
    ['image']: typeof import('@nuxt/image').default extends NuxtModule<infer O, unknown, boolean>
      ? O | false
      : Record<string, any> | false;
    /**
     * Configuration for `@nuxt/devtools`
     * @see https://www.npmjs.com/package/@nuxt/devtools
     */
    ['devtools']: typeof import('@nuxt/devtools').default extends
      NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false;
  }
  interface NuxtConfig {
    /**
     * Configuration for `nuxt-auth-utils`
     * @see https://www.npmjs.com/package/nuxt-auth-utils
     */
    ['auth']?: typeof import('nuxt-auth-utils').default extends
      NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false;
    /**
     * Configuration for `reka-ui/nuxt`
     * @see https://www.npmjs.com/package/reka-ui/nuxt
     */
    ['reka']?: typeof import('reka-ui/nuxt').default extends NuxtModule<infer O, unknown, boolean>
      ? Partial<O> | false
      : Record<string, any> | false;
    /**
     * Configuration for `@nuxtjs/tailwindcss`
     * @see https://www.npmjs.com/package/@nuxtjs/tailwindcss
     */
    ['tailwindcss']?: typeof import('@nuxtjs/tailwindcss').default extends
      NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false;
    /**
     * Configuration for `@pinia/nuxt`
     * @see https://www.npmjs.com/package/@pinia/nuxt
     */
    ['pinia']?: typeof import('@pinia/nuxt').default extends NuxtModule<infer O, unknown, boolean>
      ? Partial<O> | false
      : Record<string, any> | false;
    /**
     * Configuration for `@nuxt/image`
     * @see https://www.npmjs.com/package/@nuxt/image
     */
    ['image']?: typeof import('@nuxt/image').default extends NuxtModule<infer O, unknown, boolean>
      ? Partial<O> | false
      : Record<string, any> | false;
    /**
     * Configuration for `@nuxt/devtools`
     * @see https://www.npmjs.com/package/@nuxt/devtools
     */
    ['devtools']?: typeof import('@nuxt/devtools').default extends
      NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false;
    modules?: (
      | undefined
      | null
      | false
      | NuxtModule<any>
      | string
      | [NuxtModule | string, Record<string, any>]
      | ['nuxt-auth-utils', Exclude<NuxtConfig['auth'], boolean>]
      | ['reka-ui/nuxt', Exclude<NuxtConfig['reka'], boolean>]
      | ['@nuxtjs/tailwindcss', Exclude<NuxtConfig['tailwindcss'], boolean>]
      | ['@pinia/nuxt', Exclude<NuxtConfig['pinia'], boolean>]
      | ['@nuxt/image', Exclude<NuxtConfig['image'], boolean>]
      | ['@nuxt/devtools', Exclude<NuxtConfig['devtools'], boolean>]
    )[];
  }
}
