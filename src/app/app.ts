import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent {
  // ── View state ──────────────────────────────────────────
  view: 'login' | 'forgot' | 'dashboard' = 'login';

  // ── Dashboard tab state ──────────────────────────────────
  dashTab: 'profile' | 'impact' | 'projects' | 'donations' = 'profile';

  // ── Login fields ─────────────────────────────────────────
  loginId = '';
  loginPassword = '';
  showPassword = false;

  // ── Forgot-password fields ────────────────────────────────
  forgotTab: 'email' | 'id' = 'email';
  forgotEmail = '';
  forgotStudentId = '';

  // ── Methods ──────────────────────────────────────────────
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    // Static demo: any credentials proceed to dashboard
    this.view = 'dashboard';
    this.dashTab = 'profile';
  }

  goToForgot(): void {
    this.view = 'forgot';
  }

  backToLogin(): void {
    this.view = 'login';
  }

  onContinue(): void {
    // Static demo: show a simple alert then go back
    alert('A reset link has been sent! (Static demo)');
    this.view = 'login';
  }

  onLogout(): void {
    this.view = 'login';
    this.loginId = '';
    this.loginPassword = '';
  }
}