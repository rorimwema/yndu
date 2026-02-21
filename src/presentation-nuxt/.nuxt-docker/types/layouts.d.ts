import admin from '/app/app/layouts/admin.vue';
import auth from '/app/app/layouts/auth.vue';
import _default from '/app/app/layouts/default.vue';
import type { ComputedRef, MaybeRef } from 'vue';
declare module 'nuxt/app' {
  interface NuxtLayouts {
    'admin': InstanceType<typeof admin>['$props'];
    'auth': InstanceType<typeof auth>['$props'];
    'default': InstanceType<typeof _default>['$props'];
  }
  export type LayoutKey = keyof NuxtLayouts extends never ? string : keyof NuxtLayouts;
  interface PageMeta {
    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false>;
  }
}
