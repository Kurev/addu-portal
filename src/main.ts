import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';      // ✅ was AppComponent

bootstrapApplication(App).catch(err => console.error(err));