import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { PlaylistService } from './services/playlist-service';
import { AuthorizationService } from './services/authorization-service';
import { UserService } from './services/user-service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
  ],
  providers: [
    AuthorizationService,
    PlaylistService,
    UserService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
