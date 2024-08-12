import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

@Injectable()
export class UserService {
  http = inject(HttpClient);

  public getUserProfile(headers: any) {
    return this.http.get(`/getUserProfile`, { headers });
  }
}
