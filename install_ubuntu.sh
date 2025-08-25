#!/bin/bash
set -euo pipefail
DUCK_SUBDOMAIN="kgbaghlua"
DUCK_TOKEN="ba9ae512-0547-4928-a205-cbf104514afb"
APP_DIR="/var/www/merged-site"
echo "[1/9] System update..."
sudo apt update -y && sudo apt upgrade -y
echo "[2/9] Install requirements..."
sudo apt install -y apache2 unzip curl gnupg ca-certificates lsb-release
echo "[3/9] Install Node.js 18 and PM2..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
echo "[4/9] Setup DuckDNS cron..."
mkdir -p $HOME/duckdns
cat > $HOME/duckdns/duck.sh <<EOF
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=${DUCK_SUBDOMAIN}&token=${DUCK_TOKEN}&ip=" | curl -k -o $HOME/duckdns/duck.log -K -
EOF
chmod 700 $HOME/duckdns/duck.sh
(crontab -l 2>/dev/null; echo "*/5 * * * * $HOME/duckdns/duck.sh >/dev/null 2>&1") | crontab -
echo "[5/9] Deploy app to $APP_DIR..."
sudo rm -rf "$APP_DIR"
sudo mkdir -p "$APP_DIR"
sudo cp -r . "$APP_DIR"
cd "$APP_DIR"
if [ ! -f ".env" ]; then
  cp .env.example .env
  sed -i "s|JWT_SECRET=.*|JWT_SECRET=$(openssl rand -hex 32)|" .env || true
fi
echo "[6/9] Install Node deps..."
sudo npm install
echo "[7/9] Start with PM2..."
pm2 start src/server.js --name merged-site || pm2 restart merged-site
pm2 save
pm2 startup -u $USER --hp $HOME >/dev/null || true
echo "[8/9] Configure Apache reverse proxy..."
sudo a2enmod proxy proxy_http headers
cat <<APACHECONF | sudo tee /etc/apache2/sites-available/000-default.conf >/dev/null
<VirtualHost *:80>
    ServerName ${DUCK_SUBDOMAIN}.duckdns.org
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:8080/
    ProxyPassReverse / http://127.0.0.1:8080/
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    ErrorLog ${APACHE_LOG_DIR}/merged-site-error.log
    CustomLog ${APACHE_LOG_DIR}/merged-site-access.log combined
</VirtualHost>
APACHECONF
sudo systemctl reload apache2
echo "[9/9] Done!"
echo "Visit: http://${DUCK_SUBDOMAIN}.duckdns.org"
echo "Health: http://${DUCK_SUBDOMAIN}.duckdns.org/api/health"
