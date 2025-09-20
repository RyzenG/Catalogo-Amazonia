// netlify/functions/auth.js
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const SITE_URL = process.env.SITE_URL || "https://catalogoamazonia.netlify.app";

const json = (body, status = 200) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const successHtml = (token) => `
<!doctype html><html><body>
<script>
(function() {
  function send() {
    const data = { token: "${token}", provider: "github" };
    if (window.opener) {
      window.opener.postMessage("authorization:github:success:" + JSON.stringify(data), "*");
      window.close();
    } else {
      document.body.innerText = "Login correcto. Puedes cerrar esta ventana.";
    }
  }
  send();
})();
</script>
</body></html>
`;

exports.handler = async (event) => {
  const url = new URL(event.rawUrl);
  const path = url.pathname;

  // Paso 1: Redirigir a GitHub
  if (path.endsWith("/api/auth") || path.endsWith("/api/auth/")) {
    const redirectUri = `${SITE_URL}/api/auth/callback`;
    const authorize = new URL("https://github.com/login/oauth/authorize");
    authorize.searchParams.set("client_id", CLIENT_ID);
    authorize.searchParams.set("redirect_uri", redirectUri);
    authorize.searchParams.set("scope", "repo,user");
    return {
      statusCode: 302,
      headers: { Location: authorize.toString() },
    };
  }

  // Paso 2: GitHub devuelve un "code" que se cambia por token
  if (path.endsWith("/api/auth/callback")) {
    const code = url.searchParams.get("code");
    if (!code) return json({ error: "Missing code" }, 400);

    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      }),
    });
    const tokenJson = await tokenRes.json();
    if (!tokenJson.access_token) {
      return json({ error: "Token exchange failed", details: tokenJson }, 400);
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: successHtml(tokenJson.access_token),
    };
  }

  return json({ ok: true });
};
