import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

@Injectable()
export class PlaylistService {
  http = inject(HttpClient);

  public createPlaylist(headers: any, payload: any) {
    return this.http.post(`/createPlaylist`, payload, { headers });
  }
}
