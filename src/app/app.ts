import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',        // ✅ was app.component.html
  styleUrls: ['./app.css']          // ✅ was app.component.css
})
export class App {                  // ✅ was AppComponent
  view: 'login' | 'forgot' = 'login';
  loginId = '';
  loginPassword = '';
  showPassword = false;
  forgotTab: 'email' | 'id' = 'email';
  forgotEmail = '';
  forgotStudentId = '';

  togglePassword() { this.showPassword = !this.showPassword; }
  goToForgot() { this.view = 'forgot'; }
  backToLogin() { this.view = 'login'; }
  onLogin() { alert(`Logging in as: ${this.loginId}`); }
  onContinue() {
    const val = this.forgotTab === 'email' ? this.forgotEmail : this.forgotStudentId;
    alert(`Reset link sent to: ${val}`);
  }
}