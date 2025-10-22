[
  {
    "table_name": "account_memberships",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "account_memberships",
    "ordinal_position": 2,
    "column_name": "account_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "account_memberships",
    "ordinal_position": 3,
    "column_name": "profile_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "account_memberships",
    "ordinal_position": 4,
    "column_name": "role_slug",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "account_memberships",
    "ordinal_position": 5,
    "column_name": "assigned_by",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "account_memberships",
    "ordinal_position": 6,
    "column_name": "assigned_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "account_memberships",
    "ordinal_position": 7,
    "column_name": "is_active",
    "data_type": "boolean",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "true"
  },
  {
    "table_name": "attachments",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "attachments",
    "ordinal_position": 2,
    "column_name": "entity",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "attachments",
    "ordinal_position": 3,
    "column_name": "entity_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "attachments",
    "ordinal_position": 4,
    "column_name": "filename",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "attachments",
    "ordinal_position": 5,
    "column_name": "path",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "attachments",
    "ordinal_position": 6,
    "column_name": "url",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "attachments",
    "ordinal_position": 7,
    "column_name": "archived",
    "data_type": "boolean",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "false"
  },
  {
    "table_name": "attachments",
    "ordinal_position": 8,
    "column_name": "uploaded_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "attachments",
    "ordinal_position": 9,
    "column_name": "uploaded_by",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "attachments",
    "ordinal_position": 10,
    "column_name": "metadata",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "attachments",
    "ordinal_position": 11,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "attachments",
    "ordinal_position": 12,
    "column_name": "description",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "audit_log",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "bigint",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "nextval('audit_log_id_seq'::regclass)"
  },
  {
    "table_name": "audit_log",
    "ordinal_position": 2,
    "column_name": "table_name",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "audit_log",
    "ordinal_position": 3,
    "column_name": "record_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "audit_log",
    "ordinal_position": 4,
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "audit_log",
    "ordinal_position": 5,
    "column_name": "timestamp",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "audit_log",
    "ordinal_position": 6,
    "column_name": "old_values",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "audit_log",
    "ordinal_position": 7,
    "column_name": "new_values",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "bank_codes",
    "ordinal_position": 1,
    "column_name": "code",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "bank_codes",
    "ordinal_position": 2,
    "column_name": "name",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "bank_codes_import",
    "ordinal_position": 1,
    "column_name": "code",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "bank_codes_import",
    "ordinal_position": 2,
    "column_name": "name",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "banks",
    "ordinal_position": 1,
    "column_name": "code",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "banks",
    "ordinal_position": 2,
    "column_name": "name",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "entity_history",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "entity_history",
    "ordinal_position": 2,
    "column_name": "entity_type",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "entity_history",
    "ordinal_position": 3,
    "column_name": "entity_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "entity_history",
    "ordinal_position": 4,
    "column_name": "field",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "entity_history",
    "ordinal_position": 5,
    "column_name": "old_value",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "entity_history",
    "ordinal_position": 6,
    "column_name": "new_value",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "entity_history",
    "ordinal_position": 7,
    "column_name": "changed_by",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "entity_history",
    "ordinal_position": 8,
    "column_name": "changed_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "payment_accounts",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "payment_accounts",
    "ordinal_position": 2,
    "column_name": "profile_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "payment_accounts",
    "ordinal_position": 3,
    "column_name": "label",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "payment_accounts",
    "ordinal_position": 4,
    "column_name": "bank_name",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "payment_accounts",
    "ordinal_position": 5,
    "column_name": "account_number",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "payment_accounts",
    "ordinal_position": 6,
    "column_name": "iban",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "payment_accounts",
    "ordinal_position": 7,
    "column_name": "bic",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "payment_accounts",
    "ordinal_position": 8,
    "column_name": "currency",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "'CZK'::text"
  },
  {
    "table_name": "payment_accounts",
    "ordinal_position": 9,
    "column_name": "is_primary",
    "data_type": "boolean",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_name": "payment_accounts",
    "ordinal_position": 10,
    "column_name": "archived",
    "data_type": "boolean",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_name": "payment_accounts",
    "ordinal_position": 11,
    "column_name": "logo_path",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "payment_accounts",
    "ordinal_position": 12,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "payment_accounts",
    "ordinal_position": 13,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "payment_accounts",
    "ordinal_position": 14,
    "column_name": "bank_code",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 2,
    "column_name": "email",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 3,
    "column_name": "role",
    "data_type": "USER-DEFINED",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "'user'::user_role"
  },
  {
    "table_name": "profiles",
    "ordinal_position": 4,
    "column_name": "display_name",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 5,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "profiles",
    "ordinal_position": 6,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "profiles",
    "ordinal_position": 7,
    "column_name": "settings",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "'{}'::jsonb"
  },
  {
    "table_name": "profiles",
    "ordinal_position": 8,
    "column_name": "phone",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 9,
    "column_name": "note",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 10,
    "column_name": "archived",
    "data_type": "boolean",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_name": "profiles",
    "ordinal_position": 11,
    "column_name": "avatar_url",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 12,
    "column_name": "permissions",
    "data_type": "ARRAY",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 13,
    "column_name": "last_login",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 14,
    "column_name": "type",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 15,
    "column_name": "mesto",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 16,
    "column_name": "active",
    "data_type": "boolean",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "true"
  },
  {
    "table_name": "profiles",
    "ordinal_position": 17,
    "column_name": "street",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 18,
    "column_name": "house_number",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 19,
    "column_name": "city",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 20,
    "column_name": "zip",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 21,
    "column_name": "birth_number",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 22,
    "column_name": "updated_by",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 23,
    "column_name": "first_name",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 24,
    "column_name": "last_name",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 25,
    "column_name": "username",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 26,
    "column_name": "company_name",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 27,
    "column_name": "tax_id",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 28,
    "column_name": "bank_account",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 29,
    "column_name": "logo_path",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 30,
    "column_name": "preferred_2fa",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "ordinal_position": 31,
    "column_name": "twofa_enabled",
    "data_type": "boolean",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_name": "profiles",
    "ordinal_position": 32,
    "column_name": "preferred_payment_account_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles_history",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "profiles_history",
    "ordinal_position": 2,
    "column_name": "profile_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "profiles_history",
    "ordinal_position": 3,
    "column_name": "field",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "profiles_history",
    "ordinal_position": 4,
    "column_name": "old_value",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles_history",
    "ordinal_position": 5,
    "column_name": "new_value",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles_history",
    "ordinal_position": 6,
    "column_name": "changed_by",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles_history",
    "ordinal_position": 7,
    "column_name": "changed_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "properties",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "properties",
    "ordinal_position": 2,
    "column_name": "typ",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties",
    "ordinal_position": 3,
    "column_name": "nazev",
    "data_type": "character varying",
    "character_maximum_length": 255,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "properties",
    "ordinal_position": 4,
    "column_name": "pocet_jednotek",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "0"
  },
  {
    "table_name": "properties",
    "ordinal_position": 5,
    "column_name": "pronajimatel_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties",
    "ordinal_position": 6,
    "column_name": "spravce",
    "data_type": "character varying",
    "character_maximum_length": 255,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties",
    "ordinal_position": 7,
    "column_name": "ulice",
    "data_type": "character varying",
    "character_maximum_length": 255,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties",
    "ordinal_position": 8,
    "column_name": "cislo_popisne",
    "data_type": "character varying",
    "character_maximum_length": 20,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties",
    "ordinal_position": 9,
    "column_name": "mesto",
    "data_type": "character varying",
    "character_maximum_length": 255,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties",
    "ordinal_position": 10,
    "column_name": "psc",
    "data_type": "character varying",
    "character_maximum_length": 10,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties",
    "ordinal_position": 11,
    "column_name": "stat",
    "data_type": "character varying",
    "character_maximum_length": 100,
    "is_nullable": "NO",
    "column_default": "'Česká republika'::character varying"
  },
  {
    "table_name": "properties",
    "ordinal_position": 12,
    "column_name": "pocet_nadzemních_podlazi",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties",
    "ordinal_position": 13,
    "column_name": "pocet_podzemních_podlazi",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties",
    "ordinal_position": 14,
    "column_name": "rok_vystavby",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties",
    "ordinal_position": 15,
    "column_name": "rok_rekonstrukce",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties",
    "ordinal_position": 16,
    "column_name": "vybaveni",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "'[]'::jsonb"
  },
  {
    "table_name": "properties",
    "ordinal_position": 17,
    "column_name": "poznamka",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties",
    "ordinal_position": 18,
    "column_name": "archived",
    "data_type": "boolean",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "false"
  },
  {
    "table_name": "properties",
    "ordinal_position": 19,
    "column_name": "archived_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties",
    "ordinal_position": 20,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "properties",
    "ordinal_position": 21,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 2,
    "column_name": "typ",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 3,
    "column_name": "nazev",
    "data_type": "character varying",
    "character_maximum_length": 255,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 4,
    "column_name": "pocet_jednotek",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 5,
    "column_name": "pronajimatel_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 6,
    "column_name": "spravce",
    "data_type": "character varying",
    "character_maximum_length": 255,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 7,
    "column_name": "ulice",
    "data_type": "character varying",
    "character_maximum_length": 255,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 8,
    "column_name": "cislo_popisne",
    "data_type": "character varying",
    "character_maximum_length": 20,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 9,
    "column_name": "mesto",
    "data_type": "character varying",
    "character_maximum_length": 255,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 10,
    "column_name": "psc",
    "data_type": "character varying",
    "character_maximum_length": 10,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 11,
    "column_name": "stat",
    "data_type": "character varying",
    "character_maximum_length": 100,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 12,
    "column_name": "pocet_nadzemních_podlazi",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 13,
    "column_name": "pocet_podzemních_podlazi",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 14,
    "column_name": "rok_vystavby",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 15,
    "column_name": "rok_rekonstrukce",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 16,
    "column_name": "vybaveni",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 17,
    "column_name": "poznamka",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 18,
    "column_name": "archived",
    "data_type": "boolean",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 19,
    "column_name": "archived_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 20,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 21,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 22,
    "column_name": "total_units",
    "data_type": "bigint",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 23,
    "column_name": "free_units",
    "data_type": "bigint",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "properties_with_stats",
    "ordinal_position": 24,
    "column_name": "occupied_units",
    "data_type": "bigint",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "property_types",
    "ordinal_position": 1,
    "column_name": "slug",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "property_types",
    "ordinal_position": 2,
    "column_name": "label",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "property_types",
    "ordinal_position": 3,
    "column_name": "color",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "'#f59e0b'::text"
  },
  {
    "table_name": "property_types",
    "ordinal_position": 4,
    "column_name": "icon",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "property_types",
    "ordinal_position": 5,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "roles",
    "ordinal_position": 1,
    "column_name": "slug",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "roles",
    "ordinal_position": 2,
    "column_name": "label",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "roles",
    "ordinal_position": 3,
    "column_name": "color",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "roles",
    "ordinal_position": 4,
    "column_name": "is_system",
    "data_type": "boolean",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "false"
  },
  {
    "table_name": "roles",
    "ordinal_position": 5,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "schema_overview",
    "ordinal_position": 1,
    "column_name": "table_name",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "schema_overview",
    "ordinal_position": 2,
    "column_name": "columns",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "schema_overview",
    "ordinal_position": 3,
    "column_name": "row_count",
    "data_type": "bigint",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "schema_overview",
    "ordinal_position": 4,
    "column_name": "sample_rows",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "subjects",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "subjects",
    "ordinal_position": 2,
    "column_name": "typ_subjektu",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "subjects",
    "ordinal_position": 3,
    "column_name": "role",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "'pronajimatel'::text"
  },
  {
    "table_name": "subjects",
    "ordinal_position": 4,
    "column_name": "display_name",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "subjects",
    "ordinal_position": 5,
    "column_name": "primary_email",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "subjects",
    "ordinal_position": 6,
    "column_name": "primary_phone",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "subjects",
    "ordinal_position": 7,
    "column_name": "country",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "subjects",
    "ordinal_position": 8,
    "column_name": "city",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "subjects",
    "ordinal_position": 9,
    "column_name": "zip",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "subjects",
    "ordinal_position": 10,
    "column_name": "street",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "subjects",
    "ordinal_position": 11,
    "column_name": "cislo_popisne",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "subjects",
    "ordinal_position": 12,
    "column_name": "ico",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "subjects",
    "ordinal_position": 13,
    "column_name": "dic",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "subjects",
    "ordinal_position": 14,
    "column_name": "zastupce_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "subjects",
    "ordinal_position": 15,
    "column_name": "zastupuje_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "subjects",
    "ordinal_position": 16,
    "column_name": "data",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "'{}'::jsonb"
  },
  {
    "table_name": "subjects",
    "ordinal_position": 17,
    "column_name": "owner_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "subjects",
    "ordinal_position": 18,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "subjects",
    "ordinal_position": 19,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "subjects_history",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "subjects_history",
    "ordinal_position": 2,
    "column_name": "subject_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "subjects_history",
    "ordinal_position": 3,
    "column_name": "field",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "subjects_history",
    "ordinal_position": 4,
    "column_name": "old_value",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "subjects_history",
    "ordinal_position": 5,
    "column_name": "new_value",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "subjects_history",
    "ordinal_position": 6,
    "column_name": "changed_by",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "subjects_history",
    "ordinal_position": 7,
    "column_name": "changed_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "unit_types",
    "ordinal_position": 1,
    "column_name": "slug",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "unit_types",
    "ordinal_position": 2,
    "column_name": "label",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "unit_types",
    "ordinal_position": 3,
    "column_name": "color",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "'#f59e0b'::text"
  },
  {
    "table_name": "unit_types",
    "ordinal_position": 4,
    "column_name": "icon",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "unit_types",
    "ordinal_position": 5,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "units",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "units",
    "ordinal_position": 2,
    "column_name": "nemovitost_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "units",
    "ordinal_position": 3,
    "column_name": "oznaceni",
    "data_type": "character varying",
    "character_maximum_length": 50,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "units",
    "ordinal_position": 4,
    "column_name": "typ",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "units",
    "ordinal_position": 5,
    "column_name": "podlazi",
    "data_type": "character varying",
    "character_maximum_length": 20,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "units",
    "ordinal_position": 6,
    "column_name": "plocha",
    "data_type": "numeric",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "units",
    "ordinal_position": 7,
    "column_name": "dispozice",
    "data_type": "character varying",
    "character_maximum_length": 20,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "units",
    "ordinal_position": 8,
    "column_name": "pocet_mistnosti",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "units",
    "ordinal_position": 9,
    "column_name": "stav",
    "data_type": "character varying",
    "character_maximum_length": 20,
    "is_nullable": "NO",
    "column_default": "'volna'::character varying"
  },
  {
    "table_name": "units",
    "ordinal_position": 10,
    "column_name": "najemce_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "units",
    "ordinal_position": 11,
    "column_name": "najemce",
    "data_type": "character varying",
    "character_maximum_length": 255,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "units",
    "ordinal_position": 12,
    "column_name": "mesicni_najem",
    "data_type": "numeric",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "units",
    "ordinal_position": 13,
    "column_name": "datum_zacatku_najmu",
    "data_type": "date",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "units",
    "ordinal_position": 14,
    "column_name": "datum_konce_najmu",
    "data_type": "date",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "units",
    "ordinal_position": 15,
    "column_name": "poznamka",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "units",
    "ordinal_position": 16,
    "column_name": "archived",
    "data_type": "boolean",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "false"
  },
  {
    "table_name": "units",
    "ordinal_position": 17,
    "column_name": "archived_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "units",
    "ordinal_position": 18,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "units",
    "ordinal_position": 19,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "user_permissions",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "bigint",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "nextval('user_permissions_id_seq'::regclass)"
  },
  {
    "table_name": "user_permissions",
    "ordinal_position": 2,
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "user_permissions",
    "ordinal_position": 3,
    "column_name": "permission",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "user_permissions",
    "ordinal_position": 4,
    "column_name": "granted_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "user_subjects",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "user_subjects",
    "ordinal_position": 2,
    "column_name": "profile_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "user_subjects",
    "ordinal_position": 3,
    "column_name": "subject_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "user_subjects",
    "ordinal_position": 4,
    "column_name": "role_in_subject",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "user_subjects",
    "ordinal_position": 5,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()"
  }
]
