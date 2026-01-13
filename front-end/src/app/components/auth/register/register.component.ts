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
      <div class="register-card">
        <h2>Inscription</h2>
        <p class="subtitle">Créez votre compte pour commencer</p>
        
        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="form-group">
            <label>Prénom</label>
            <input
              type="text"
              class="form-control"
              [(ngModel)]="prenom"
              name="prenom"
              placeholder="Entrez votre prénom"
              required
              #prenomInput="ngModel"
            />
            <div class="error-message" *ngIf="prenomInput.invalid && prenomInput.touched">
              Prénom requis
            </div>
          </div>

          <div class="form-group">
            <label>Nom</label>
            <input
              type="text"
              class="form-control"
              [(ngModel)]="nom"
              name="nom"
              placeholder="Entrez votre nom"
              required
              #nomInput="ngModel"
            />
            <div class="error-message" *ngIf="nomInput.invalid && nomInput.touched">
              Nom requis
            </div>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              class="form-control"
              [(ngModel)]="email"
              name="email"
              placeholder="exemple@email.com"
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
              class="form-control"
              [(ngModel)]="password"
              name="password"
              placeholder="Minimum 8 caractères"
              required
              minlength="8"
              #passwordInput="ngModel"
            />
            <div class="error-message" *ngIf="passwordInput.invalid && passwordInput.touched">
              Mot de passe requis (minimum 8 caractères)
            </div>
          </div>

          <div class="error-message" *ngIf="error">{{ error }}</div>
          <div class="success-message" *ngIf="success">{{ success }}</div>

          <button 
            type="submit" 
            class="btn btn-primary btn-block" 
            [disabled]="loading || registerForm.invalid"
          >
            <span *ngIf="!loading">S'inscrire</span>
            <span *ngIf="loading">Inscription...</span>
          </button>

          <p class="login-link">
            Déjà un compte ? <a routerLink="/login">Se connecter</a>
          </p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .subtitle {
      text-align: center;
      color: var(--text-secondary);
      margin-top: -16px;
      margin-bottom: 32px;
      font-size: 15px;
    }
  `]
})
export class RegisterComponent {
  email = '';
  password = '';
  nom = '';
  prenom = '';
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

    this.authService.register({
      email: this.email,
      password: this.password,
      nom: this.nom,
      prenom: this.prenom
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = 'Inscription réussie ! Redirection...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.error = response.message || 'Erreur d\'inscription';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur d\'inscription';
        this.loading = false;
      }
    });
  }
}