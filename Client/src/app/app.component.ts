import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { SpotifyApi } from '@spotify/web-api-ts-sdk';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  private http = inject(HttpClient);
  public userAuthorized: boolean = false;
  public userProfileData: any;

  ngOnInit(): void {
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('code');
    if (code) {
      this.getAccessToken(code);
      const newUrl = window.location.href.split('?')[0];
      window.history.replaceState({}, document.title, newUrl);
    } else {
      console.warn('Authorization code not found in URL.');
    }

    const checkExistingAccessToken = sessionStorage.getItem('access_token');
    checkExistingAccessToken ? this.userAuthorized = true : false;
    if (this.userAuthorized) {
      this.getUserProfile();
    }
  }

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

    const scope = 'user-read-private user-read-email';
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
      }
    } catch (error) {
      console.error('Error while fetching access token: ', error);
    }
  }

  public getUserProfile() {
    const accessToken = sessionStorage.getItem('access_token');
    if (accessToken) {
      const headers = { Authorization: `Bearer ${accessToken}` };

      this.http.get(`/getUserProfile`, { headers }).subscribe({
        next: (user) => {
          console.info('user profile: ', user);
          this.userProfileData = user;
        },
        error: (error) => {
          console.error('Error fetching user profile: ', error);
        }
      });
    } else {
      console.warn('Access token not found in local storage');
    }
  }
}
