# Newsroom dashboard

A live status board for the autonomous agents: pipeline stage in flight,
published articles, the watcher's hourly activity, and distribution status. It
reads local files on this Mac, so it runs here (not on the static site) and is
exposed privately through a Cloudflare Tunnel.

## Always-on, local

`scripts/dashboard.mjs` is a zero-dependency Node server. It runs as a launchd
job (`com.cumulant.dashboard`) with `KeepAlive` (restarts if it dies) and
`RunAtLoad` (starts at login), serving `http://localhost:4173` behind HTTP Basic
auth (user `cumulant`).

- **Change the password:** `bash scripts/set-dashboard-password.sh`
- **Logs:** `scripts/dashboard.out.log`, `scripts/dashboard.err.log`
- **Reinstall:** `cp deploy/com.cumulant.dashboard.plist ~/Library/LaunchAgents/`,
  set `DASH_PASSWORD` with `plutil`, then `launchctl load -w`.

## Private subdomain: dashboard.cumulant.org

`cumulant.org` is on Cloudflare, so a Cloudflare Tunnel maps the subdomain to the
local dashboard. The Basic-auth password is the gate (over HTTPS); add Cloudflare
Access for a second factor if you want.

```sh
# 1. Install + sign in (opens a browser to authorize your Cloudflare account)
brew install cloudflared
cloudflared tunnel login

# 2. Create the tunnel and point the subdomain at it
cloudflared tunnel create cumulant-dash
cloudflared tunnel route dns cumulant-dash dashboard.cumulant.org

# 3. Config — note the credentials file UUID that step 2 printed
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml <<'YAML'
tunnel: cumulant-dash
credentials-file: /Users/aryanpatel/.cloudflared/REPLACE-WITH-UUID.json
ingress:
  - hostname: dashboard.cumulant.org
    service: http://localhost:4173
  - service: http_status:404
YAML

# 4. Run it once to test
cloudflared tunnel run cumulant-dash
# -> open https://dashboard.cumulant.org  (prompts for cumulant / your password)

# 5. Keep it always running (installs a launchd service)
sudo cloudflared service install
```

After step 5 the tunnel and the dashboard both survive restarts, so
`https://dashboard.cumulant.org` is always available, password-protected, and not
linked anywhere public.

### Optional: Cloudflare Access (second layer)
In the Cloudflare dashboard: **Zero Trust -> Access -> Applications -> Add a
self-hosted app**, hostname `dashboard.cumulant.org`, and add a policy (email
one-time-pin or allowed emails). That gates the subdomain before traffic ever
reaches the Mac.
