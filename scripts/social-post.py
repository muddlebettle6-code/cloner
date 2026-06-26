#!/usr/bin/env python3
"""Auto-post a generated social pack to every connected platform.

Reads social.json (from social-pack.py) and posts to each platform that has
credentials in the environment. Platforms with no credentials are skipped
cleanly, so this is safe to run before any account is connected: it simply
reports what it would post. As you connect accounts (see docs/SOCIAL.md), each
one flips on automatically.

Credentials (all optional; a platform with missing vars is skipped):
  X / Twitter   X_API_KEY X_API_SECRET X_ACCESS_TOKEN X_ACCESS_SECRET
  LinkedIn      LINKEDIN_ACCESS_TOKEN LINKEDIN_AUTHOR (urn:li:organization:ID or urn:li:person:ID)
  Reddit        REDDIT_CLIENT_ID REDDIT_SECRET REDDIT_USERNAME REDDIT_PASSWORD
  Facebook      FB_PAGE_ID FB_PAGE_TOKEN
  Instagram     IG_USER_ID IG_TOKEN   (needs an image; uses pack.imageUrl when present)

Usage: python3 scripts/social-post.py <social.json>
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path


def _post(url: str, *, data=None, headers=None, method="POST"):
    body = None
    if isinstance(data, (dict, list)) and headers and "json" in headers.get("Content-Type", ""):
        body = json.dumps(data).encode()
    elif isinstance(data, dict):
        body = urllib.parse.urlencode(data).encode()
    elif isinstance(data, (bytes, str)):
        body = data.encode() if isinstance(data, str) else data
    req = urllib.request.Request(url, data=body, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return True, json.loads(r.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        return False, f"HTTP {e.code}: {e.read().decode()[:200]}"
    except Exception as e:  # noqa: BLE001
        return False, str(e)[:200]


def _have(*names: str) -> bool:
    return all(os.environ.get(n) for n in names)


# --------------------------------------------------------------------------- #


def post_linkedin(pack: dict):
    if not _have("LINKEDIN_ACCESS_TOKEN", "LINKEDIN_AUTHOR"):
        return "skipped (not connected)"
    text = pack.get("linkedin") or pack.get("facebook") or ""
    payload = {
        "author": os.environ["LINKEDIN_AUTHOR"],
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": text},
                "shareMediaCategory": "ARTICLE",
                "media": [{"status": "READY", "originalUrl": pack.get("url", "")}],
            }
        },
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
    }
    ok, res = _post(
        "https://api.linkedin.com/v2/ugcPosts",
        data=payload,
        headers={"Authorization": f"Bearer {os.environ['LINKEDIN_ACCESS_TOKEN']}",
                 "Content-Type": "application/json", "X-Restli-Protocol-Version": "2.0.0"},
    )
    return "posted" if ok else f"error: {res}"


def post_facebook(pack: dict):
    if not _have("FB_PAGE_ID", "FB_PAGE_TOKEN"):
        return "skipped (not connected)"
    ok, res = _post(
        f"https://graph.facebook.com/v21.0/{os.environ['FB_PAGE_ID']}/feed",
        data={"message": pack.get("facebook", ""), "link": pack.get("url", ""),
              "access_token": os.environ["FB_PAGE_TOKEN"]},
    )
    return "posted" if ok else f"error: {res}"


def post_reddit(pack: dict):
    if not _have("REDDIT_CLIENT_ID", "REDDIT_SECRET", "REDDIT_USERNAME", "REDDIT_PASSWORD"):
        return "skipped (not connected)"
    r = pack.get("reddit", {})
    subs = r.get("subreddits") or []
    if not subs:
        return "skipped (no subreddit)"
    auth = base64.b64encode(f"{os.environ['REDDIT_CLIENT_ID']}:{os.environ['REDDIT_SECRET']}".encode()).decode()
    ua = "cumulant-newsroom/1.0"
    ok, tok = _post(
        "https://www.reddit.com/api/v1/access_token",
        data={"grant_type": "password", "username": os.environ["REDDIT_USERNAME"], "password": os.environ["REDDIT_PASSWORD"]},
        headers={"Authorization": f"Basic {auth}", "User-Agent": ua},
    )
    if not ok or not isinstance(tok, dict) or "access_token" not in tok:
        return f"error: auth {tok}"
    # Post a self/link post to the first relevant subreddit (conservative: one sub).
    ok, res = _post(
        "https://oauth.reddit.com/api/submit",
        data={"sr": subs[0], "kind": "link", "title": r.get("title", "")[:300], "url": pack.get("url", ""),
              "resubmit": "true", "sendreplies": "true"},
        headers={"Authorization": f"bearer {tok['access_token']}", "User-Agent": ua},
    )
    return f"posted to r/{subs[0]}" if ok else f"error: {res}"


def post_x(pack: dict):
    if not _have("X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_SECRET"):
        return "skipped (not connected)"
    thread = pack.get("x") or []
    if isinstance(thread, str):
        thread = [thread]
    if not thread:
        return "skipped (no thread)"

    def oauth1_post(url, json_body):
        oauth = {
            "oauth_consumer_key": os.environ["X_API_KEY"],
            "oauth_nonce": secrets.token_hex(16),
            "oauth_signature_method": "HMAC-SHA1",
            "oauth_timestamp": str(int(time.time())),
            "oauth_token": os.environ["X_ACCESS_TOKEN"],
            "oauth_version": "1.0",
        }
        # Signature base string uses only oauth params (JSON body is not form-encoded).
        param_str = "&".join(f"{urllib.parse.quote(k, '')}={urllib.parse.quote(v, '')}" for k, v in sorted(oauth.items()))
        base = "&".join(["POST", urllib.parse.quote(url, ""), urllib.parse.quote(param_str, "")])
        key = f"{urllib.parse.quote(os.environ['X_API_SECRET'], '')}&{urllib.parse.quote(os.environ['X_ACCESS_SECRET'], '')}"
        sig = base64.b64encode(hmac.new(key.encode(), base.encode(), hashlib.sha1).digest()).decode()
        oauth["oauth_signature"] = sig
        header = "OAuth " + ", ".join(f'{urllib.parse.quote(k, "")}="{urllib.parse.quote(v, "")}"' for k, v in oauth.items())
        return _post(url, data=json_body, headers={"Authorization": header, "Content-Type": "application/json"})

    last_id, posted = None, 0
    for tweet in thread:
        body = {"text": tweet}
        if last_id:
            body["reply"] = {"in_reply_to_tweet_id": last_id}
        ok, res = oauth1_post("https://api.twitter.com/2/tweets", body)
        if not ok:
            return f"error after {posted}: {res}"
        last_id = (res.get("data") or {}).get("id") if isinstance(res, dict) else None
        posted += 1
    return f"posted thread ({posted} tweets)"


def post_instagram(pack: dict):
    if not _have("IG_USER_ID", "IG_TOKEN"):
        return "skipped (not connected)"
    image = pack.get("imageUrl")
    if not image:
        return "skipped (needs an image card)"
    cap = pack.get("instagram", {})
    caption = (cap.get("caption", "") if isinstance(cap, dict) else str(cap))
    tags = " ".join(f"#{t}" for t in (cap.get("hashtags", []) if isinstance(cap, dict) else []))
    ok, res = _post(
        f"https://graph.facebook.com/v21.0/{os.environ['IG_USER_ID']}/media",
        data={"image_url": image, "caption": f"{caption}\n\n{tags}".strip(), "access_token": os.environ["IG_TOKEN"]},
    )
    if not ok or not isinstance(res, dict) or "id" not in res:
        return f"error: {res}"
    ok, res = _post(
        f"https://graph.facebook.com/v21.0/{os.environ['IG_USER_ID']}/media_publish",
        data={"creation_id": res["id"], "access_token": os.environ["IG_TOKEN"]},
    )
    return "posted" if ok else f"error: {res}"


PLATFORMS = {
    "linkedin": post_linkedin,
    "x": post_x,
    "reddit": post_reddit,
    "facebook": post_facebook,
    "instagram": post_instagram,
}


def main() -> None:
    if len(sys.argv) < 2:
        print("usage: social-post.py <social.json>", file=sys.stderr)
        sys.exit(1)
    pack = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    results = {}
    for name, fn in PLATFORMS.items():
        try:
            results[name] = fn(pack)
        except Exception as e:  # noqa: BLE001 - one platform's failure must not block others
            results[name] = f"error: {str(e)[:160]}"
        print(f"  {name:10s} {results[name]}")
    Path(sys.argv[1]).with_name("social-results.json").write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
