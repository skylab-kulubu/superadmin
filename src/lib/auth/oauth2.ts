const OAUTH2_AUTH_URL = 'https://e.yildizskylab.com/realms/e-skylab/protocol/openid-connect/auth';
const OAUTH2_TOKEN_URL = 'https://e.yildizskylab.com/realms/e-skylab/protocol/openid-connect/token';
const OAUTH2_LOGOUT_URL = 'https://e.yildizskylab.com/realms/e-skylab/protocol/openid-connect/logout';
const CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH2_CLIENT_ID!;
const CLIENT_SECRET = process.env.OAUTH2_CLIENT_SECRET; // Server-side only
const REDIRECT_URI = process.env.NEXT_PUBLIC_OAUTH2_REDIRECT_URI!;

export function getOAuth2AuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email',
    ...(state && { state }),
  });
  
  return `${OAUTH2_AUTH_URL}?${params.toString()}`;
}

export function getOAuth2LogoutUrl(postLogoutRedirectUri?: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    ...(postLogoutRedirectUri && { post_logout_redirect_uri: postLogoutRedirectUri }),
  });
  
  return `${OAUTH2_LOGOUT_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<{ access_token: string; refresh_token: string }> {
  const bodyParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
  });

  // Eğer client_secret varsa ekle (server-side only)
  if (CLIENT_SECRET) {
    bodyParams.append('client_secret', CLIENT_SECRET);
  }

  const response = await fetch(OAUTH2_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: bodyParams,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token exchange failed:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
      clientId: CLIENT_ID,
      redirectUri: REDIRECT_URI,
      hasClientSecret: !!CLIENT_SECRET,
    });
    throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
  const bodyParams = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
  });

  // Eğer client_secret varsa ekle (server-side only)
  if (CLIENT_SECRET) {
    bodyParams.append('client_secret', CLIENT_SECRET);
  }

  const response = await fetch(OAUTH2_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: bodyParams,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token refresh failed:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken, // Yeni refresh token yoksa eskisini kullan
  };
}

