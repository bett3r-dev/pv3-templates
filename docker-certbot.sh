#!/usr/bin/env bash

################################################################################
# Nombre: setup-nginx-cert.sh
# Uso:    ./setup-nginx-cert.sh <dominio>
#
# Descripción:
#  1. Crea el archivo docker-compose.yml con los servicios Nginx y Certbot.
#  2. Crea y embebe el script init-letsencrypt.sh (sin descargar de GitHub).
#  3. Reemplaza el/los dominio(s) en init-letsencrypt.sh.
#  4. Genera data/nginx/app.conf inicial (para validación).
#  5. Sube los contenedores con docker-compose.
#  6. Da permisos de ejecución y ejecuta init-letsencrypt.sh.
#  7. Si la emisión de certificados es exitosa, crea la conf final con SSL y proxy_pass.
#  8. Hace un docker compose down, según las instrucciones.
################################################################################

# --- Función para mostrar uso ---
usage() {
  echo "Uso: $0 <dominio>"
  exit 1
}

# --- Verificar que se haya pasado un dominio ---
if [ -z "$1" ]; then
  usage
fi

DOMINIO="$1"

# --- Verificar que Docker y Docker Compose estén instalados ---
if ! command -v docker &>/dev/null; then
  echo "ERROR: Docker no está instalado o no está en el PATH."
  exit 1
fi

if ! command -v docker compose &>/dev/null; then
  echo "ERROR: Docker Compose (CLI plugin v2) no está instalado o no está en el PATH."
  echo "       Asegúrate de usar 'docker compose' y no 'docker-compose' v1."
  exit 1
fi

# --- 1. Crear docker-compose.yml con Nginx y Certbot ---
echo "Creando docker-compose.yml..."
cat <<EOF > docker-compose.yml
services:
  nginx:
    image: nginx:alpine
    restart: unless-stopped
    volumes:
      - ./data/nginx:/etc/nginx/conf.d
      - ./data/certbot/conf:/etc/letsencrypt
      - ./data/certbot/www:/var/www/certbot
    ports:
      - "80:80"
      - "443:443"
    command: "/bin/sh -c 'while :; do sleep 6h & wait \$\$!; nginx -s reload; done'"

  certbot:
    image: certbot/certbot
    restart: unless-stopped
    volumes:
      - ./data/certbot/conf:/etc/letsencrypt
      - ./data/certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h; done'"
EOF

# --- 2. Crear localmente init-letsencrypt.sh si no existe ---
INIT_SCRIPT="init-letsencrypt.sh"
if [ ! -f "$INIT_SCRIPT" ]; then
  echo "Creando el archivo $INIT_SCRIPT ..."

  # IMPORTANTE:
  # Usamos "cat <<EOF > $INIT_SCRIPT" (sin comillas) para que *se expandan* las
  # variables $DOMINIO aquí al momento de crear el archivo. Por ejemplo, email="cert@$DOMINIO".
  # En cambio, colocamos barras invertidas (\$) en las variables
  # que queremos que el script maneje en tiempo de ejecución.

  cat <<EOF > $INIT_SCRIPT
#!/usr/bin/env bash

# Este script se basa en la versión de:
# https://github.com/wmnnd/nginx-certbot/blob/master/init-letsencrypt.sh
# adaptado para uso con un solo dominio o múltiples dominios.

domains="$DOMINIO"   # Aquí sustituimos automáticamente el dominio
rsa_key_size=4096
data_path="./data/certbot"
email="cert@$DOMINIO"  # Ajusta si deseas un correo distinto
staging=0 # Set to 1 si estás en pruebas (limit de LE)

if [ -d "\$data_path" ]; then
  read -p "Existing data found for \$domains. Continue and replace existing certificate? (y/N) " decision
  if [ "\$decision" != "Y" ] && [ "\$decision" != "y" ]; then
    exit
  fi
fi

# Descarga parámetros TLS recomendados (si no existen)
if [ ! -e "\$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "\$data_path/conf/ssl-dhparams.pem" ]; then
  echo "### Downloading recommended TLS parameters ..."
  mkdir -p "\$data_path/conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "\$data_path/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "\$data_path/conf/ssl-dhparams.pem"
  echo
fi

echo "### Creating dummy certificate for \$domains ..."
path="/etc/letsencrypt/live/\$domains"
mkdir -p "\$data_path/conf/live/\$domains"
docker compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:\$rsa_key_size -days 1\
    -keyout '\$path/privkey.pem' \
    -out '\$path/fullchain.pem' \
    -subj '/CN=localhost'" certbot
echo

echo "### Starting nginx ..."
docker compose up --force-recreate -d nginx
echo

echo "### Deleting dummy certificate for \$domains ..."
docker compose run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/\$domains && \
  rm -Rf /etc/letsencrypt/archive/\$domains && \
  rm -Rf /etc/letsencrypt/renewal/\$domains.conf" certbot
echo

echo "### Requesting Let's Encrypt certificate for \$domains ..."
# Si deseas soportar varios dominios, puedes separarlos por espacio en \$domains.
# Por ejemplo: "example.com www.example.com".
domain_args=""
for domain in \$domains; do
  domain_args="\$domain_args -d \$domain"
done

# Elige email
case "\$email" in
  "") email_arg="--register-unsafely-without-email" ;;
  *) email_arg="--email \$email" ;;
esac

# Modo staging
if [ "\$staging" != "0" ]; then
  staging_arg="--staging"
else
  staging_arg=""
fi

# Solicitar el certificado
docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    \$staging_arg \
    \$email_arg \
    \$domain_args \
    --rsa-key-size \$rsa_key_size \
    --agree-tos \
    --force-renewal" certbot
echo

echo "### Reloading nginx ..."
docker compose exec nginx nginx -s reload

EOF
fi

# --- 3. Crear data/nginx/app.conf para validación de Let's Encrypt ---
echo "Creando data/nginx/app.conf para validación..."
mkdir -p data/nginx data/certbot/conf data/certbot/www

cat <<EOF > data/nginx/app.conf
server {
    listen 80;
    server_name $DOMINIO;
    server_tokens off;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}
EOF

# --- 4. docker compose up -d ---
echo "Levantando contenedores con docker compose up -d..."
docker compose up -d

# --- 5. chmod +x init-letsencrypt.sh ---
echo "Otorgando permisos de ejecución a $INIT_SCRIPT ..."
chmod +x "$INIT_SCRIPT"

# --- 6. Ejecutar init-letsencrypt.sh para solicitar/renovar certificados ---
echo "Ejecutando ./$INIT_SCRIPT..."
./"$INIT_SCRIPT"

# --- Verificar si los certificados han sido creados correctamente ---
if [ -d "data/certbot/conf/live/$DOMINIO" ]; then
  echo "Certificados creados correctamente para $DOMINIO."
  echo "Actualizando app.conf para habilitar SSL y proxy_pass..."

  # --- 7. Cambiar data/nginx/app.conf por la configuración final SSL ---
  cat <<EOF > data/nginx/app.conf
upstream app {
    server app:1984;
}

server {
    listen 80;
    server_name $DOMINIO;
    server_tokens off;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    location / {
        proxy_pass http://app;
    }
}

server {
    listen 443 ssl;
    server_name $DOMINIO;
    server_tokens off;

    ssl_certificate /etc/letsencrypt/live/$DOMINIO/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMINIO/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass  http://app;
        proxy_set_header    Host                \$http_host;
        proxy_set_header    X-Real-IP           \$remote_addr;
        proxy_set_header    X-Forwarded-For     \$proxy_add_x_forwarded_for;
    }
}
EOF

else
  echo "ERROR: No se encontró la carpeta con los certificados en data/certbot/conf/live/$DOMINIO."
  echo "       Revisa los logs de init-letsencrypt.sh para ver qué ocurrió."
  echo "       El archivo data/nginx/app.conf no fue modificado."
fi

# --- 8. docker compose down ---
echo "Cerrando contenedores con docker compose down..."
docker compose down

echo ""
echo "================================================================================"
echo "Proceso finalizado. Revisa si necesitas volver a levantar los contenedores con:"
echo "   docker compose up -d"
echo "================================================================================"
