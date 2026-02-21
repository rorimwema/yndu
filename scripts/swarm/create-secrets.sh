#!/usr/bin/env sh
set -eu

STACK_PREFIX="${STACK_PREFIX:-yndu}"
SECRETS_DIR="${SECRETS_DIR:-secrets/prod}"

create_or_replace_secret() {
  secret_name="$1"
  secret_file="$2"

  if [ ! -f "$secret_file" ]; then
    echo "Missing secret file: $secret_file" >&2
    exit 1
  fi

  if docker secret inspect "$secret_name" >/dev/null 2>&1; then
    echo "Secret already exists, skipping: $secret_name"
  else
    docker secret create "$secret_name" "$secret_file" >/dev/null
    echo "Created: $secret_name"
  fi
}

create_or_replace_secret "${STACK_PREFIX}_postgres_password" "${SECRETS_DIR}/postgres_password.txt"
create_or_replace_secret "${STACK_PREFIX}_database_password" "${SECRETS_DIR}/database_password.txt"
create_or_replace_secret "${STACK_PREFIX}_redis_password" "${SECRETS_DIR}/redis_password.txt"
create_or_replace_secret "${STACK_PREFIX}_jwt_secret" "${SECRETS_DIR}/jwt_secret.txt"
create_or_replace_secret "${STACK_PREFIX}_hashpay_api_key" "${SECRETS_DIR}/hashpay_api_key.txt"
create_or_replace_secret "${STACK_PREFIX}_hashpay_account_id" "${SECRETS_DIR}/hashpay_account_id.txt"
create_or_replace_secret "${STACK_PREFIX}_nuxt_session_password" "${SECRETS_DIR}/nuxt_session_password.txt"

echo "Done."
