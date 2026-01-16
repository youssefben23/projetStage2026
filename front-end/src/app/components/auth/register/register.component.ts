import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="register-container">
      <!-- Animated Background -->
      <div class="background-animation">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>

      <!-- Register Card -->
      <div class="register-card">
        <!-- Logo Section -->
        <div class="logo-section">
          <div class="logo-icon">
            <i class="fas fa-user-plus"></i>
          </div>
          <h1>Créer un compte</h1>
          <p class="tagline">Rejoignez EmailTemplates Pro et créez vos premiers templates</p>
        </div>

        <!-- Progress Indicator -->
        <div class="progress-indicator">
          <div class="progress-step active">
            <div class="step-circle">
              <i class="fas fa-user"></i>
            </div>
            <span>Informations</span>
          </div>
          <div class="progress-line"></div>
          <div class="progress-step">
            <div class="step-circle">
              <i class="fas fa-check"></i>
            </div>
            <span>Confirmation</span>
          </div>
        </div>

        <!-- Register Form -->
        <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="register-form">
          <!-- Name Fields -->
          <div class="form-row">
            <div class="form-group">
              <label for="prenom">
                <i class="fas fa-user"></i>
                Prénom *
              </label>
              <div class="input-wrapper">
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  [(ngModel)]="prenom"
                  required
                  minlength="2"
                  placeholder="Jean"
                  class="form-input"
                  #prenomInput="ngModel"
                  [class.invalid]="prenomInput.invalid && prenomInput.touched"
                  [class.valid]="prenomInput.valid && prenomInput.touched"
                  autocomplete="given-name"
                />
                <span class="input-status" *ngIf="prenomInput.touched">
                  <i [class]="prenomInput.valid ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                </span>
              </div>
              <div class="field-error" *ngIf="prenomInput.invalid && prenomInput.touched">
                <i class="fas fa-exclamation-circle"></i>
                <span *ngIf="prenomInput.errors?.['required']">Le prénom est requis</span>
                <span *ngIf="prenomInput.errors?.['minlength']">Minimum 2 caractères</span>
              </div>
            </div>

            <div class="form-group">
              <label for="nom">
                <i class="fas fa-user"></i>
                Nom *
              </label>
              <div class="input-wrapper">
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  [(ngModel)]="nom"
                  required
                  minlength="2"
                  placeholder="Dupont"
                  class="form-input"
                  #nomInput="ngModel"
                  [class.invalid]="nomInput.invalid && nomInput.touched"
                  [class.valid]="nomInput.valid && nomInput.touched"
                  autocomplete="family-name"
                />
                <span class="input-status" *ngIf="nomInput.touched">
                  <i [class]="nomInput.valid ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                </span>
              </div>
              <div class="field-error" *ngIf="nomInput.invalid && nomInput.touched">
                <i class="fas fa-exclamation-circle"></i>
                <span *ngIf="nomInput.errors?.['required']">Le nom est requis</span>
                <span *ngIf="nomInput.errors?.['minlength']">Minimum 2 caractères</span>
              </div>
            </div>
          </div>

          <!-- Email Field -->
          <div class="form-group">
            <label for="email">
              <i class="fas fa-envelope"></i>
              Adresse Email *
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
                [class.valid]="emailInput.valid && emailInput.touched"
                autocomplete="email"
              />
              <span class="input-status" *ngIf="emailInput.touched">
                <i [class]="emailInput.valid ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
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
              Mot de passe *
            </label>
            <div class="input-wrapper">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                name="password"
                [(ngModel)]="password"
                required
                minlength="8"
                placeholder="Minimum 8 caractères"
                class="form-input"
                #passwordInput="ngModel"
                [class.invalid]="passwordInput.invalid && passwordInput.touched"
                [class.valid]="passwordInput.valid && passwordInput.touched"
                (input)="checkPasswordStrength()"
                autocomplete="new-password"
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
            
            <!-- Password Strength Indicator -->
            <div class="password-strength" *ngIf="password && passwordInput.touched">
              <div class="strength-bars">
                <div class="strength-bar" [class.active]="passwordStrength >= 1" [class]="getStrengthClass()"></div>
                <div class="strength-bar" [class.active]="passwordStrength >= 2" [class]="getStrengthClass()"></div>
                <div class="strength-bar" [class.active]="passwordStrength >= 3" [class]="getStrengthClass()"></div>
                <div class="strength-bar" [class.active]="passwordStrength >= 4" [class]="getStrengthClass()"></div>
              </div>
              <span class="strength-text" [class]="getStrengthClass()">
                {{ getStrengthText() }}
              </span>
            </div>

            <div class="field-error" *ngIf="passwordInput.invalid && passwordInput.touched">
              <i class="fas fa-exclamation-circle"></i>
              <span *ngIf="passwordInput.errors?.['required']">Le mot de passe est requis</span>
              <span *ngIf="passwordInput.errors?.['minlength']">Minimum 8 caractères requis</span>
            </div>

            <!-- Password Requirements -->
            <div class="password-requirements">
              <div class="requirement" [class.met]="password.length >= 8">
                <i [class]="password.length >= 8 ? 'fas fa-check' : 'fas fa-times'"></i>
                <span>Au moins 8 caractères</span>
              </div>
              <div class="requirement" [class.met]="hasUpperCase()">
                <i [class]="hasUpperCase() ? 'fas fa-check' : 'fas fa-times'"></i>
                <span>Une lettre majuscule</span>
              </div>
              <div class="requirement" [class.met]="hasLowerCase()">
                <i [class]="hasLowerCase() ? 'fas fa-check' : 'fas fa-times'"></i>
                <span>Une lettre minuscule</span>
              </div>
              <div class="requirement" [class.met]="hasNumber()">
                <i [class]="hasNumber() ? 'fas fa-check' : 'fas fa-times'"></i>
                <span>Un chiffre</span>
              </div>
            </div>
          </div>

          <!-- Terms & Conditions -->
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="acceptTerms" name="acceptTerms" required>
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">
                J'accepte les <a routerLink="/terms" target="_blank">conditions d'utilisation</a> 
                et la <a routerLink="/privacy" target="_blank">politique de confidentialité</a>
              </span>
            </label>
          </div>

          <!-- Error Message -->
          <div class="alert alert-error" *ngIf="error">
            <i class="fas fa-exclamation-triangle"></i>
            <span>{{ error }}</span>
            <button type="button" class="alert-close" (click)="error = ''">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Success Message -->
          <div class="alert alert-success" *ngIf="success">
            <i class="fas fa-check-circle"></i>
            <span>{{ success }}</span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn-submit"
            [disabled]="loading || registerForm.invalid || !acceptTerms"
            [class.loading]="loading"
          >
            <span *ngIf="!loading" class="btn-content">
              <i class="fas fa-rocket"></i>
              Créer mon compte
            </span>
            <span *ngIf="loading" class="btn-content">
              <span class="spinner"></span>
              Création en cours...
            </span>
          </button>

          <!-- Divider -->
          <div class="divider">
            <span>ou</span>
          </div>

          <!-- Login Link -->
          <div class="login-section">
            <p>Vous avez déjà un compte ?</p>
            <a routerLink="/login" class="btn-login">
              <i class="fas fa-sign-in-alt"></i>
              Se connecter
            </a>
          </div>
        </form>

        <!-- Security Badge -->
        <div class="security-badge">
          <i class="fas fa-shield-alt"></i>
          <span>Vos données sont protégées et cryptées</span>
        </div>
      </div>

      <!-- Benefits Section -->
      <div class="benefits-section">
        <h2>Pourquoi rejoindre EmailTemplates Pro ?</h2>
        <div class="benefits-grid">
          <div class="benefit-item">
            <div class="benefit-icon">
              <i class="fas fa-infinity"></i>
            </div>
            <h3>Templates illimités</h3>
            <p>Créez autant de templates que vous le souhaitez</p>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">
              <i class="fas fa-clock"></i>
            </div>
            <h3>Historique complet</h3>
            <p>Accédez à toutes vos versions précédentes</p>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">
              <i class="fas fa-cloud"></i>
            </div>
            <h3>Sauvegarde cloud</h3>
            <p>Vos templates sont sauvegardés en toute sécurité</p>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">
              <i class="fas fa-headset"></i>
            </div>
            <h3>Support 24/7</h3>
            <p>Notre équipe est là pour vous aider</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Variables CSS - identiques au login */
    :host {
      --primary: #6366f1;
      --primary-dark: #4f46e5;
      --primary-light: #818cf8;
      --secondary: #8b5cf6;
      --success: #10b981;
      --error: #ef4444;
      --warning: #f59e0b;
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

    /* Container - similaire au login */
    .register-container {
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

    /* Animated Background - identique au login */
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
      width: 400px;
      height: 400px;
      top: -200px;
      right: -150px;
      animation: float 18s ease-in-out infinite;
    }

    .shape-2 {
      width: 250px;
      height: 250px;
      bottom: -125px;
      left: -75px;
      animation: float 23s ease-in-out infinite reverse;
    }

    .shape-3 {
      width: 180px;
      height: 180px;
      top: 40%;
      left: 5%;
      animation: float 28s ease-in-out infinite;
    }

    .shape-4 {
      width: 300px;
      height: 300px;
      bottom: 15%;
      right: 10%;
      animation: float 20s ease-in-out infinite reverse;
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

    /* Register Card */
    .register-card {
      background: white;
      border-radius: var(--border-radius-xl);
      padding: 48px;
      width: 100%;
      max-width: 580px;
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

    /* Logo Section - similaire au login */
    .logo-section {
      text-align: center;
      margin-bottom: 32px;
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
      font-size: 14px;
      font-weight: 500;
    }

    /* Progress Indicator */
    .progress-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 32px;
      padding: 0 20px;
    }

    .progress-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .step-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--bg-secondary);
      border: 2px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-tertiary);
      font-size: 20px;
      transition: var(--transition);
    }

    .progress-step.active .step-circle {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      border-color: var(--primary);
      color: white;
    }

    .progress-step span {
      font-size: 13px;
      color: var(--text-tertiary);
      font-weight: 600;
    }

    .progress-step.active span {
      color: var(--primary);
    }

    .progress-line {
      width: 80px;
      height: 2px;
      background: var(--border-color);
      margin: 0 12px;
      margin-bottom: 24px;
    }

    /* Form */
    .register-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
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

    .form-input.valid {
      border-color: var(--success);
    }

    .input-status {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
    }

    .input-status .fa-check-circle {
      color: var(--success);
    }

    .input-status .fa-times-circle {
      color: var(--error);
    }

    .toggle-password {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      color: var(--text-tertiary);
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

    /* Password Strength */
    .password-strength {
      margin-top: 8px;
    }

    .strength-bars {
      display: flex;
      gap: 4px;
      margin-bottom: 6px;
    }

    .strength-bar {
      flex: 1;
      height: 4px;
      background: var(--border-color);
      border-radius: 2px;
      transition: var(--transition);
    }

    .strength-bar.active.weak {
      background: var(--error);
    }

    .strength-bar.active.medium {
      background: var(--warning);
    }

    .strength-bar.active.strong {
      background: var(--success);
    }

    .strength-text {
      font-size: 12px;
      font-weight: 600;
    }

    .strength-text.weak {
      color: var(--error);
    }

    .strength-text.medium {
      color: var(--warning);
    }

    .strength-text.strong {
      color: var(--success);
    }

    /* Password Requirements */
    .password-requirements {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 8px;
    }

    .requirement {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-tertiary);
      transition: var(--transition);
    }

    .requirement.met {
      color: var(--success);
    }

    .requirement i {
      font-size: 10px;
    }

    .requirement .fa-check {
      color: var(--success);
    }

    .requirement .fa-times {
      color: var(--text-tertiary);
    }

    /* Checkbox - identique au login */
    .checkbox-label {
      display: flex;
      align-items: flex-start;
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
      min-width: 20px;
      border: 2px solid var(--border-color);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
      margin-top: 2px;
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
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .checkbox-text a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
      transition: var(--transition);
    }

    .checkbox-text a:hover {
      color: var(--primary-dark);
      text-decoration: underline;
    }

    /* Alerts - identique au login */
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

    /* Submit Button - identique au login */
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

    /* Divider - identique au login */
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

    /* Login Section - similaire au register section du login */
    .login-section {
      text-align: center;
    }

    .login-section p {
      color: var(--text-secondary);
      font-size: 14px;
      margin-bottom: 12px;
    }

    .btn-login {
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

    .btn-login:hover {
      background: white;
      border-color: var(--primary);
      color: var(--primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .btn-login i {
      font-size: 16px;
    }

    /* Security Badge - identique au login */
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

    /* Benefits Section */
    .benefits-section {
      margin-top: 60px;
      max-width: 1200px;
      width: 100%;
      text-align: center;
      position: relative;
      z-index: 1;
    }

    .benefits-section h2 {
      color: white;
      font-size: 24px;
      margin-bottom: 40px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      font-weight: 700;
    }

    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
    }

    .benefit-item {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--border-radius-lg);
      padding: 24px;
      text-align: center;
      transition: var(--transition);
    }

    .benefit-item:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    .benefit-icon {
      width: 60px;
      height: 60px;
      margin: 0 auto 16px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm);
    }

    .benefit-icon i {
      font-size: 28px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .benefit-item h3 {
      color: white;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .benefit-item p {
      color: rgba(255, 255, 255, 0.8);
      font-size: 13px;
      margin: 0;
      line-height: 1.5;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .register-container {
        padding: 24px 16px;
      }

      .register-card {
        padding: 32px 24px;
      }

      .logo-section h1 {
        font-size: 24px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .password-requirements {
        grid-template-columns: 1fr;
      }

      .benefits-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .benefits-section h2 {
        font-size: 20px;
        margin-bottom: 24px;
      }

      .progress-line {
        width: 40px;
      }
    }

    @media (max-width: 480px) {
      .register-card {
        padding: 24px 20px;
      }

      .logo-icon {
        width: 60px;
        height: 60px;
      }

      .logo-icon i {
        font-size: 30px;
      }

      .step-circle {
        width: 40px;
        height: 40px;
        font-size: 18px;
      }
    }
  `]
})
export class RegisterComponent {
  email = '';
  password = '';
  nom = '';
  prenom = '';
  acceptTerms = false;
  showPassword = false;
  error = '';
  success = '';
  loading = false;
  passwordStrength = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  checkPasswordStrength(): void {
    if (!this.password) {
      this.passwordStrength = 0;
      return;
    }

    let strength = 0;
    
    // Length check
    if (this.password.length >= 8) strength++;
    
    // Upper case check
    if (/[A-Z]/.test(this.password)) strength++;
    
    // Lower case check
    if (/[a-z]/.test(this.password)) strength++;
    
    // Number check
    if (/[0-9]/.test(this.password)) strength++;
    
    // Special character check
    if (/[^A-Za-z0-9]/.test(this.password)) strength++;
    
    this.passwordStrength = Math.min(strength, 4);
  }

  getStrengthClass(): string {
    if (this.passwordStrength <= 1) return 'weak';
    if (this.passwordStrength <= 2) return 'medium';
    return 'strong';
  }

  getStrengthText(): string {
    switch (this.passwordStrength) {
      case 0: return 'Très faible';
      case 1: return 'Faible';
      case 2: return 'Moyen';
      case 3: return 'Fort';
      case 4: return 'Très fort';
      default: return '';
    }
  }

  hasUpperCase(): boolean {
    return /[A-Z]/.test(this.password);
  }

  hasLowerCase(): boolean {
    return /[a-z]/.test(this.password);
  }

  hasNumber(): boolean {
    return /[0-9]/.test(this.password);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.error = '';
    this.success = '';
    this.loading = true;

    this.authService.register({
      email: this.email,
      password: this.password,
      nom: this.nom,
      prenom: this.prenom
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = '✅ Compte créé avec succès ! Redirection...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.error = response.message || 'Erreur d\'inscription';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur d\'inscription. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }
}