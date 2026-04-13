import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';  // ← change this
import { appConfig } from './app/app.config';         // ← add this

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));