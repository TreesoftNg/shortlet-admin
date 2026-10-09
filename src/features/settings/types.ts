/** Row from GET /cc/tenant-settings — catalog key with effective value. */
export type TenantSettingItem = {
  key: string;
  category: string;
  label: string;
  description: string | null;
  valueType: 'boolean' | 'string';
  value: boolean | string;
  defaultValue: boolean | string;
};

/** Response data from GET/PUT /cc/tenant-settings. */
export type TenantSettingsResponse = {
  settings: TenantSettingItem[];
  updatedAt: string | null;
};
