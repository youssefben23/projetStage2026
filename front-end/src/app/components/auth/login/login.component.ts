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
      <div class="login-card">
        <h2>Connexion</h2>
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              #emailInput="ngModel"
            />
            <div class="error-message" *ngIf="emailInput.invalid && emailInput.touched">
              Email requis
            </div>
          </div>

          <div class="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              #passwordInput="ngModel"
            />
            <div class="error-message" *ngIf="passwordInput.invalid && passwordInput.touched">
              Mot de passe requis
            </div>
          </div>

          <div class="error-message" *ngIf="error">{{ error }}</div>
          <div class="success-message" *ngIf="success">{{ success }}</div>

          <button type="submit" class="btn btn-primary" [disabled]="loading || loginForm.invalid">
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>

          <p class="register-link">
            Pas encore de compte ? <a routerLink="/register">S'inscrire</a>
          </p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 200px);
      padding: 24px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .login-card {
      background: white;
      padding: 48px;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-xl);
      width: 100%;
      max-width: 450px;
      position: relative;
      overflow: hidden;
    }

    .login-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
    }

    .login-card h2 {
      margin-bottom: 32px;
      text-align: center;
      color: var(--text-primary);
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .register-link {
      text-align: center;
      margin-top: 24px;
      color: var(--text-secondary);
      font-size: 14px;
    }

    .register-link a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 600;
      transition: var(--transition);
    }

    .register-link a:hover {
      color: var(--primary-dark);
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  success = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

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
          this.success = 'Connexion réussie !';
          setTimeout(() => {
            this.router.navigate(['/templates']);
          }, 1000);
        } else {
          this.error = response.message || 'Erreur de connexion';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur de connexion';
        this.loading = false;
      }
    });
  }
}
