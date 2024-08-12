import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

@Injectable()
export class AuthorizationService {
  http = inject(HttpClient);

  async initialize(): Promise<void> {
    try {
      const codeVerifier: string = this.generateRandomString(64);
      const hashed = await this.sha256(codeVerifier);
      const codeChallenge = this.base64encode(hashed);
      this.requestUserAuthorization(codeVerifier, codeChallenge);
    } catch (error) {
      console.error('Error while initializing: ', error);
    }
  }

  private generateRandomString(length: number): string {
    const possibleChars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(values)
      .map((x) => possibleChars[x % possibleChars.length])
      .join('');
  }

  async sha256(plain: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return crypto.subtle.digest('SHA-256', data);
  }

  private base64encode(input: ArrayBuffer): string {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    return base64;
  }

  private requestUserAuthorization(codeVerifier: string, codeChallenge: any) {
    const clientId = 'c04c803868f34cfe94533d8d15bfa292';
    const redirectUri = 'http://localhost:4200';

    const scope =
      'user-read-private user-read-email playlist-modify-public playlist-modify-private';
    const authUrl = new URL('https://accounts.spotify.com/authorize');

    window.sessionStorage.setItem('code_verifier', codeVerifier);

    const params = {
      response_type: 'code',
      client_id: clientId,
      scope,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
  }

  async getAccessToken(code: any): Promise<void> {
    const codeVerifier = sessionStorage.getItem('code_verifier') as string;
    const url = 'https://accounts.spotify.com/api/token';
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: 'c04c803868f34cfe94533d8d15bfa292',
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'http://localhost:4200',
        code_verifier: codeVerifier,
      }),
    };

    try {
      const response = await fetch(url, payload);
      const data = await response.json();
      if (data.access_token != undefined) {
        sessionStorage.setItem('access_token', data.access_token);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error while fetching access token: ', error);
    }
  }
}
