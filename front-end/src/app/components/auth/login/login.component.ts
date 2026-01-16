import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-container">
      <!-- Animated Background -->
      <div class="background-animation">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>

      <!-- Login Card -->
      <div class="login-card">
        <!-- Logo Section -->
        <div class="logo-section">
          <div class="logo-icon">
            <i class="fas fa-envelope"></i>
          </div>
          <h1>EmailTemplates Pro</h1>
          <p class="tagline">Connectez-vous à votre espace professionnel</p>
        </div>

        <!-- Login Form -->
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="login-form">
          <!-- Email Field -->
          <div class="form-group">
            <label for="email">
              <i class="fas fa-envelope"></i>
              Adresse Email
            </label>
            <div class="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="email"
                required
                email
                placeholder="votre.email@example.com"
                class="form-input"
                #emailInput="ngModel"
                [class.invalid]="emailInput.invalid && emailInput.touched"
                autocomplete="email"
              />
              <span class="input-icon">
                <i class="fas fa-at"></i>
              </span>
            </div>
            <div class="field-error" *ngIf="emailInput.invalid && emailInput.touched">
              <i class="fas fa-exclamation-circle"></i>
              <span *ngIf="emailInput.errors?.['required']">L'email est requis</span>
              <span *ngIf="emailInput.errors?.['email']">Format d'email invalide</span>
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password">
              <i class="fas fa-lock"></i>
              Mot de passe
            </label>
            <div class="input-wrapper">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                name="password"
                [(ngModel)]="password"
                required
                placeholder="••••••••"
                class="form-input"
                #passwordInput="ngModel"
                [class.invalid]="passwordInput.invalid && passwordInput.touched"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="toggle-password"
                (click)="togglePassword()"
                [attr.aria-label]="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              >
                <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="field-error" *ngIf="passwordInput.invalid && passwordInput.touched">
              <i class="fas fa-exclamation-circle"></i>
              <span>Le mot de passe est requis</span>
            </div>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe">
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">Se souvenir de moi</span>
            </label>
            <a routerLink="/forgot-password" class="forgot-link">
              Mot de passe oublié ?
            </a>
          </div>

          <!-- Error Message -->
          <div class="alert alert-error" *ngIf="error" @slideDown>
            <i class="fas fa-exclamation-triangle"></i>
            <span>{{ error }}</span>
            <button type="button" class="alert-close" (click)="error = ''">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Success Message -->
          <div class="alert alert-success" *ngIf="success" @slideDown>
            <i class="fas fa-check-circle"></i>
            <span>{{ success }}</span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn-submit"
            [disabled]="loading || loginForm.invalid"
            [class.loading]="loading"
          >
            <span *ngIf="!loading" class="btn-content">
              <i class="fas fa-sign-in-alt"></i>
              Se connecter
            </span>
            <span *ngIf="loading" class="btn-content">
              <span class="spinner"></span>
              Connexion en cours...
            </span>
          </button>

          <!-- Divider -->
          <div class="divider">
            <span>ou</span>
          </div>

          <!-- Register Link -->
          <div class="register-section">
            <p>Vous n'avez pas encore de compte ?</p>
            <a routerLink="/register" class="btn-register">
              <i class="fas fa-user-plus"></i>
              Créer un compte
            </a>
          </div>
        </form>

        <!-- Security Badge -->
        <div class="security-badge">
          <i class="fas fa-shield-alt"></i>
          <span>Connexion sécurisée SSL/TLS</span>
        </div>
      </div>

      <!-- Features Section -->
      <div class="features-section">
        <div class="feature-item">
          <div class="feature-icon">
            <i class="fas fa-bolt"></i>
          </div>
          <h3>Rapide</h3>
          <p>Création instantanée de templates</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">
            <i class="fas fa-shield-alt"></i>
          </div>
          <h3>Sécurisé</h3>
          <p>Protection de vos données</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">
            <i class="fas fa-palette"></i>
          </div>
          <h3>Personnalisable</h3>
          <p>Templates sur mesure</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Variables CSS */
    :host {
      --primary: #6366f1;
      --primary-dark: #4f46e5;
      --primary-light: #818cf8;
      --secondary: #8b5cf6;
      --success: #10b981;
      --error: #ef4444;
      --text-primary: #1e293b;
      --text-secondary: #64748b;
      --text-tertiary: #94a3b8;
      --bg-primary: #ffffff;
      --bg-secondary: #f8fafc;
      --border-color: #e2e8f0;
      --border-radius: 8px;
      --border-radius-lg: 12px;
      --border-radius-xl: 16px;
      --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    /* Container */
    .login-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      overflow: hidden;
    }

    /* Animated Background */
    .background-animation {
      position: absolute;
      inset: 0;
      overflow: hidden;
      z-index: 0;
    }

    .shape {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    .shape-1 {
      width: 300px;
      height: 300px;
      top: -150px;
      right: -100px;
      animation: float 20s ease-in-out infinite;
    }

    .shape-2 {
      width: 200px;
      height: 200px;
      bottom: -100px;
      left: -50px;
      animation: float 25s ease-in-out infinite reverse;
    }

    .shape-3 {
      width: 150px;
      height: 150px;
      top: 50%;
      left: 10%;
      animation: float 30s ease-in-out infinite;
    }

    .shape-4 {
      width: 250px;
      height: 250px;
      bottom: 20%;
      right: 15%;
      animation: float 22s ease-in-out infinite reverse;
    }

    @keyframes float {
      0%, 100% {
        transform: translate(0, 0) rotate(0deg);
      }
      33% {
        transform: translate(30px, -30px) rotate(120deg);
      }
      66% {
        transform: translate(-20px, 20px) rotate(240deg);
      }
    }

    /* Login Card */
    .login-card {
      background: white;
      border-radius: var(--border-radius-xl);
      padding: 48px;
      width: 100%;
      max-width: 480px;
      box-shadow: var(--shadow-xl);
      position: relative;
      z-index: 1;
      animation: slideInUp 0.6s ease;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Logo Section */
    .logo-section {
      text-align: center;
      margin-bottom: 40px;
    }

    .logo-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-lg);
      animation: pulse 2s ease-in-out infinite;
    }

    .logo-icon i {
      font-size: 40px;
      color: white;
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: var(--shadow-lg);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 15px 30px -5px rgba(99, 102, 241, 0.4);
      }
    }

    .logo-section h1 {
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }

    .tagline {
      color: var(--text-secondary);
      font-size: 15px;
      font-weight: 500;
    }

    /* Form */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-group label i {
      color: var(--primary);
      font-size: 16px;
    }

    .input-wrapper {
      position: relative;
    }

    .form-input {
      width: 100%;
      padding: 14px 48px 14px 16px;
      border: 2px solid var(--border-color);
      border-radius: var(--border-radius);
      font-size: 15px;
      font-family: inherit;
      transition: var(--transition);
      background: var(--bg-primary);
      color: var(--text-primary);
    }

    .form-input:hover {
      border-color: var(--primary-light);
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }

    .form-input.invalid {
      border-color: var(--error);
    }

    .form-input.invalid:focus {
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
    }

    .input-icon,
    .toggle-password {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-tertiary);
    }

    .toggle-password {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: var(--transition);
    }

    .toggle-password:hover {
      color: var(--primary);
      background: rgba(99, 102, 241, 0.1);
    }

    .field-error {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--error);
      font-size: 13px;
      font-weight: 500;
    }

    .field-error i {
      font-size: 14px;
    }

    /* Form Options */
    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: -8px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }

    .checkbox-label input[type="checkbox"] {
      display: none;
    }

    .checkbox-custom {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border-color);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
      position: relative;
    }

    .checkbox-label input[type="checkbox"]:checked + .checkbox-custom {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      border-color: var(--primary);
    }

    .checkbox-label input[type="checkbox"]:checked + .checkbox-custom::after {
      content: '✓';
      color: white;
      font-size: 14px;
      font-weight: bold;
    }

    .checkbox-text {
      font-size: 14px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .forgot-link {
      font-size: 14px;
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
      transition: var(--transition);
    }

    .forgot-link:hover {
      color: var(--primary-dark);
      text-decoration: underline;
    }

    /* Alerts */
    .alert {
      padding: 14px 16px;
      border-radius: var(--border-radius);
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
      font-size: 14px;
      position: relative;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .alert i:first-child {
      font-size: 18px;
      flex-shrink: 0;
    }

    .alert span {
      flex: 1;
    }

    .alert-error {
      background: rgba(239, 68, 68, 0.1);
      border-left: 4px solid var(--error);
      color: #991b1b;
    }

    .alert-success {
      background: rgba(16, 185, 129, 0.1);
      border-left: 4px solid var(--success);
      color: #065f46;
    }

    .alert-close {
      background: transparent;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: var(--transition);
      opacity: 0.7;
    }

    .alert-close:hover {
      background: rgba(0, 0, 0, 0.1);
      opacity: 1;
    }

    /* Submit Button */
    .btn-submit {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: var(--transition);
      box-shadow: var(--shadow-md);
      font-family: inherit;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-xl);
    }

    .btn-submit:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .btn-content i {
      font-size: 18px;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Divider */
    .divider {
      position: relative;
      text-align: center;
      margin: 8px 0;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--border-color);
    }

    .divider span {
      position: relative;
      background: white;
      padding: 0 16px;
      color: var(--text-tertiary);
      font-size: 13px;
      font-weight: 600;
    }

    /* Register Section */
    .register-section {
      text-align: center;
    }

    .register-section p {
      color: var(--text-secondary);
      font-size: 14px;
      margin-bottom: 12px;
    }

    .btn-register {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 2px solid var(--border-color);
      border-radius: var(--border-radius);
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      transition: var(--transition);
    }

    .btn-register:hover {
      background: white;
      border-color: var(--primary);
      color: var(--primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .btn-register i {
      font-size: 16px;
    }

    /* Security Badge */
    .security-badge {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: var(--text-tertiary);
      font-size: 13px;
      font-weight: 500;
    }

    .security-badge i {
      color: var(--success);
      font-size: 16px;
    }

    /* Features Section */
    .features-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 40px;
      max-width: 900px;
      position: relative;
      z-index: 1;
    }

    .feature-item {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--border-radius-lg);
      padding: 24px;
      text-align: center;
      transition: var(--transition);
      animation: slideInUp 0.8s ease;
    }

    .feature-item:nth-child(2) {
      animation-delay: 0.1s;
    }

    .feature-item:nth-child(3) {
      animation-delay: 0.2s;
    }

    .feature-item:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-4px);
    }

    .feature-icon {
      width: 60px;
      height: 60px;
      margin: 0 auto 16px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-md);
    }

    .feature-icon i {
      font-size: 28px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .feature-item h3 {
      color: white;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .feature-item p {
      color: rgba(255, 255, 255, 0.8);
      font-size: 13px;
      margin: 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .login-container {
        padding: 24px 16px;
      }

      .login-card {
        padding: 32px 24px;
      }

      .logo-section h1 {
        font-size: 24px;
      }

      .features-section {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .form-options {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 24px 20px;
      }

      .logo-icon {
        width: 60px;
        height: 60px;
      }

      .logo-icon i {
        font-size: 30px;
      }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  error = '';
  success = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.error = '';
    this.success = '';
    this.loading = true;

    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = '✅ Connexion réussie ! Redirection...';
          setTimeout(() => {
            this.router.navigate(['/templates']);
          }, 1500);
        } else {
          this.error = response.message || 'Erreur de connexion';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur de connexion. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }
}