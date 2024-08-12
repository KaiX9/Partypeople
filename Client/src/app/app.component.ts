import { Component, OnInit, inject } from '@angular/core';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { AuthorizationService } from './services/authorization-service';
import { UserService } from './services/user-service';
import { PlaylistService } from './services/playlist-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public authorizationSvc = inject(AuthorizationService);
  public userSvc = inject(UserService);
  public playlistSvc = inject(PlaylistService);
  public userAuthorized: boolean = false;
  public headers: any;
  public userProfileData: any;

  ngOnInit(): void {
    const accessToken = sessionStorage.getItem('access_token');
    accessToken ? this.userAuthorized = true : false;
    if (this.userAuthorized) {
      this.headers = { Authorization: `Bearer ${accessToken}` };
      this.getUserProfile();
    }

    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('code');
    if (code) {
      this.authorizationSvc.getAccessToken(code);
      const newUrl = window.location.href.split('?')[0];
      window.history.replaceState({}, document.title, newUrl);
    } else {
      console.warn('Authorization code not found in URL.');
    }
  }

  public getUserProfile() {
    this.userSvc.getUserProfile(this.headers).subscribe({
      next: (user) => {
        console.info('user profile: ', user);
        this.userProfileData = user;
      },
      error: (error) => {
        console.error('Error fetching user profile: ', error);
      },
    });
  }

  public createPlaylist() {
    const user_id = this.userProfileData.id;
    // data for testing only
    const playlist_data = {
      name: 'Testing Playlist',
      description: 'Created From Partypeople',
      public: true,
    };
    const payload = {
      user_id: user_id,
      playlist_data: playlist_data,
    };
    this.playlistSvc.createPlaylist(this.headers, payload).subscribe({
      next: (resp) => {
        console.info('response: ', resp);
      },
      error: (error) => {
        console.error('Error creating playlist: ', error);
      },
    });
  }
}
