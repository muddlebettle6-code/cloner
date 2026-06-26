# Autonomous social distribution

When the newsroom publishes an article, it now also:

1. **Generates a social pack** (`scripts/social-pack.py`) — platform-tailored copy
   for Reddit, LinkedIn, X/Twitter, Instagram, and Facebook, saved as
   `social.json` next to the article build. This needs no accounts.
2. **Auto-posts** (`scripts/social-post.py`) to every platform that has
   credentials set. Platforms without credentials are **skipped cleanly**, so the
   pipeline is safe before anything is connected — it just produces the copy.

As you connect each account below, that platform turns on automatically. Posts
are accurate to the article (no hype, no fabricated numbers), with the link.

## Where credentials live

The daily job reads its environment from the launchd plist
`~/Library/LaunchAgents/com.cumulant.fieldnote.daily.plist`. Add each variable
there so the unattended runs can post. For one variable:

```sh
plutil -replace EnvironmentVariables.LINKEDIN_ACCESS_TOKEN -string "PASTE" \
  ~/Library/LaunchAgents/com.cumulant.fieldnote.daily.plist
# then reload:
launchctl unload ~/Library/LaunchAgents/com.cumulant.fieldnote.daily.plist
launchctl load -w ~/Library/LaunchAgents/com.cumulant.fieldnote.daily.plist
```

To test a platform immediately, `export` the vars in a shell and run
`python3 scripts/social-post.py <path-to-social.json>`.

## Connect each platform

### LinkedIn (recommended first — best fit for research)
- Create an app at developer.linkedin.com, add the **Share on LinkedIn** /
  **Community Management** product (Page posting needs the latter; it requires
  approval).
- Get an OAuth access token with `w_member_social` (personal) or
  `w_organization_social` (Page).
- Set: `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_AUTHOR`
  (`urn:li:person:XXXX` or `urn:li:organization:XXXX`).

### X / Twitter
- Create a project + app at developer.x.com (a paid tier is required to post).
- Generate **OAuth 1.0a** user keys (read+write).
- Set: `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET`.
- Posts as a thread (one tweet per line of the pack's `x` array).

### Reddit
- Create a **script** app at reddit.com/prefs/apps.
- Set: `REDDIT_CLIENT_ID`, `REDDIT_SECRET`, `REDDIT_USERNAME`, `REDDIT_PASSWORD`.
- Note: Reddit is strict about self-promotion. It posts the link to the first
  relevant subreddit the pack suggests; keep volume low and prefer subs where the
  content genuinely fits, or it will get filtered or the account actioned.

### Facebook Page
- Create a Meta app (developers.facebook.com), add a Page, get a **Page access
  token** with `pages_manage_posts` (needs app review for production).
- Set: `FB_PAGE_ID`, `FB_PAGE_TOKEN`.

### Instagram (business/creator account)
- Connect the IG account to the FB Page; use the Meta app with
  `instagram_content_publish`.
- Set: `IG_USER_ID`, `IG_TOKEN`.
- Instagram requires an **image or video** (it cannot post text only). It posts
  once `social.json` carries an `imageUrl` — see the image-card step on the
  roadmap below.

## Roadmap

- **Image cards** — render a branded card per article (headline + key stat + a
  chart) at 1080x1080 and 1080x1920, host it, and set `imageUrl` so Instagram and
  richer Facebook posts light up.
- **Reels** — short video (animated cards + optional voiceover), published to
  Instagram and Facebook via the same Content Publishing API.
