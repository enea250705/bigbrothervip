# Cloudflare Configuration for Ad Domains

## Automatic Configuration (via _headers file)
The `_headers` file has been configured to allow all ad domains. This should work automatically on Cloudflare Pages.

## Manual Cloudflare Dashboard Configuration

If you need to configure manually in Cloudflare Dashboard:

### 1. Page Rules (Optional - for better ad performance)
1. Go to Cloudflare Dashboard → Rules → Page Rules
2. Create a new rule for your domain: `bigbrothervipalbania.stream/*`
3. Settings to add:
   - **Disable Security**: Off (keep security on)
   - **Cache Level**: Standard
   - **Browser Integrity Check**: Off (may interfere with ads)

### 2. Firewall Rules (Allow Ad Domains)
1. Go to Cloudflare Dashboard → Security → WAF → Tools
2. Create firewall rules to ALLOW these domains:
   - `quge5.com`
   - `al5sm.com`
   - `3nbf4.com`
   - `nap5k.com`
   - `gizokraijaw.net`

### 3. Security Settings
1. Go to Cloudflare Dashboard → Security → Settings
2. **Security Level**: Medium (not High, as it may block ads)
3. **Challenge Passage**: 30 minutes
4. **Browser Integrity Check**: Off (recommended for ads)

### 4. SSL/TLS Settings
1. Go to Cloudflare Dashboard → SSL/TLS
2. **SSL/TLS encryption mode**: Full (strict)
3. **Always Use HTTPS**: On
4. **Minimum TLS Version**: 1.2

### 5. Network Settings
1. Go to Cloudflare Dashboard → Network
2. **WebSockets**: On
3. **Pseudo IPv4**: Off
4. **IP Geolocation**: On

### 6. Speed Settings (Optional)
1. Go to Cloudflare Dashboard → Speed
2. **Auto Minify**: Off (may break ad scripts)
3. **Rocket Loader**: Off (may interfere with ads)
4. **Mirage**: Off (may break ad scripts)

### 7. Caching Settings
1. Go to Cloudflare Dashboard → Caching → Configuration
2. **Caching Level**: Standard
3. **Browser Cache TTL**: 4 hours
4. **Always Online**: On

## Content Security Policy (CSP) - If Needed

If ads still don't work, you may need to add a meta tag in HTML:

```html
<meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:; font-src * data:; connect-src *; frame-src *; object-src *; media-src *; worker-src *; child-src *; frame-ancestors *;">
```

**Note**: This is very permissive and should only be used if absolutely necessary.

## Testing Ad Domains

To test if ad domains are accessible:

1. Open browser console (F12)
2. Check Network tab for blocked requests
3. Look for CORS errors or 403/404 errors
4. Test each ad domain manually:
   - `https://quge5.com/88/tag.min.js`
   - `https://al5sm.com/tag.min.js`
   - `https://3nbf4.com/act/files/tag.min.js`
   - `https://nap5k.com/tag.min.js`
   - `https://gizokraijaw.net/vignette.min.js`

## Troubleshooting

### If ads still don't work:

1. **Check Cloudflare Firewall Logs**
   - Go to Security → Events
   - Look for blocked requests from ad domains
   - Whitelist if needed

2. **Disable Cloudflare Bot Fight Mode**
   - Go to Security → Bots
   - Bot Fight Mode: Off (may block ad scripts)

3. **Check Rate Limiting**
   - Go to Security → WAF → Rate limiting rules
   - Make sure ad domains aren't rate limited

4. **Verify Zone Settings**
   - Go to Overview → Zone Settings
   - Ensure "Under Attack Mode" is OFF
   - Check that "Development Mode" is OFF (unless testing)

## Important Notes

- The `_headers` file should automatically configure most settings
- Cloudflare Pages automatically applies `_headers` file
- Some settings require Cloudflare Pro plan or higher
- Always test after making changes
- Keep security settings balanced (not too strict, not too loose)




