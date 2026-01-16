import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface SocialLink {
  name: string;
  iconClass: string;  // Classe CSS Font Awesome
  url: string;
  color: string;
  description: string;
}

interface FooterLink {
  label: string;
  route?: string;
  url?: string;
  external?: boolean;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <footer class="footer">
      <!-- Main Footer Content -->
      <div class="footer-content">
        <div class="footer-grid">
          <!-- Brand Section -->
          <div class="footer-section brand-section">
            <div class="footer-logo">
              <i class="fas fa-envelope logo-icon"></i>
              <span class="logo-text">EmailTemplates Pro</span>
            </div>
            <p class="brand-description">
              Plateforme professionnelle de création et gestion de modèles d'e-mails. 
              Optimisez votre communication avec nos templates personnalisables.
            </p>
            <div class="social-links">
              <a 
                *ngFor="let social of socialLinks; trackBy: trackBySocial" 
                [href]="social.url" 
                target="_blank" 
                rel="noopener noreferrer nofollow"
                class="social-link"
                [style.--social-color]="social.color"
                [attr.aria-label]="'Suivez-nous sur ' + social.name"
                [title]="social.name + ' - ' + social.description"
              >
                <i [class]="social.iconClass" aria-hidden="true"></i>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="footer-section">
            <h4 class="footer-title">Navigation</h4>
            <ul class="footer-links">
              <li *ngFor="let link of navigationLinks; trackBy: trackByLink">
                @if (link.external && link.url) {
                  <a 
                    [href]="link.url" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="footer-link"
                  >
                    {{ link.label }}
                  </a>
                } @else {
                  <a 
                    [routerLink]="link.route || ''" 
                    class="footer-link"
                    [routerLinkActive]="'active'"
                  >
                    {{ link.label }}
                  </a>
                }
              </li>
            </ul>
          </div>

          <!-- Resources -->
          <div class="footer-section">
            <h4 class="footer-title">Ressources</h4>
            <ul class="footer-links">
              <li *ngFor="let link of resourceLinks; trackBy: trackByLink">
                <a 
                  [routerLink]="link.route" 
                  class="footer-link"
                  [routerLinkActive]="'active'"
                >
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>

          <!-- Legal -->
          <div class="footer-section">
            <h4 class="footer-title">Légal</h4>
            <ul class="footer-links">
              <li *ngFor="let link of legalLinks; trackBy: trackByLink">
                <a 
                  [routerLink]="link.route" 
                  class="footer-link"
                  [routerLinkActive]="'active'"
                >
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Newsletter Section -->
        <div class="newsletter-section">
          <div class="newsletter-content">
            <div class="newsletter-header">
              <h3>
                <i class="fas fa-envelope" style="margin-right: 8px;"></i>
                Restez informé
              </h3>
              <p>Recevez nos dernières actualités, templates gratuits et conseils d'experts</p>
            </div>
            <form 
              class="newsletter-form" 
              (submit)="subscribeNewsletter($event)" 
              #newsletterForm="ngForm"
              novalidate
            >
              <div class="input-group">
                <input 
                  type="email" 
                  placeholder="votre.email@example.com"
                  class="newsletter-input"
                  [(ngModel)]="newsletterEmail"
                  name="email"
                  required
                  email
                  #emailInput="ngModel"
                  [class.invalid]="emailInput.invalid && emailInput.touched"
                  aria-label="Adresse email pour l'inscription à la newsletter"
                  aria-describedby="email-help"
                />
                @if (emailInput.invalid && emailInput.touched) {
                  <div class="error-message" id="email-help">
                    @if (emailInput.errors?.['required']) {
                      L'email est requis
                    } @else if (emailInput.errors?.['email']) {
                      Veuillez entrer une adresse email valide
                    }
                  </div>
                }
              </div>
              <button 
                type="submit" 
                class="newsletter-btn"
                [disabled]="newsletterForm.invalid || isSubmitting"
                [attr.aria-busy]="isSubmitting"
              >
                @if (isSubmitting) {
                  <span class="spinner"></span>
                } @else {
                  <i class="fas fa-paper-plane" style="margin-right: 8px;"></i>
                  S'abonner
                }
              </button>
            </form>
            <p class="privacy-notice">
              <i class="fas fa-shield-alt" style="margin-right: 6px;"></i>
              En vous inscrivant, vous acceptez notre 
              <a routerLink="/privacy" class="privacy-link">politique de confidentialité</a>. 
              Désinscription à tout moment.
            </p>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <div class="copyright">
            <span class="copyright-icon">©</span>
            <span>{{ currentYear }} <strong>EmailTemplates Pro</strong></span>
            <span class="separator">•</span>
            <span>Tunisie <i class="fas fa-flag" style="margin-left: 4px;"></i></span>
            <span class="separator">•</span>
            <span>v{{ appVersion }}</span>
          </div>
          <div class="footer-badges">
            <span class="badge">
              <i class="fas fa-shield-alt" style="margin-right: 4px;"></i>
              Sécurisé
            </span>
            <span class="badge">
              <i class="fas fa-bolt" style="margin-right: 4px;"></i>
              Rapide
            </span>
            <span class="badge">
              <i class="fas fa-code" style="margin-right: 4px;"></i>
              Open Source
            </span>
            <span class="badge">
              <i class="fas fa-mobile-alt" style="margin-right: 4px;"></i>
              Responsive
            </span>
          </div>
        </div>
      </div>

      <!-- Floating Back to Top Button -->
      <button 
        class="back-to-top" 
        [class.visible]="showBackToTop"
        (click)="scrollToTop()"
        [attr.aria-label]="'Retour en haut de la page'"
        [attr.aria-hidden]="!showBackToTop"
        [attr.tabindex]="showBackToTop ? 0 : -1"
      >
        <i class="fas fa-chevron-up"></i>
      </button>

      <!-- Success Message -->
      @if (showSuccessMessage) {
        <div 
          class="success-message" 
          role="alert" 
          aria-live="polite"
          (animationend)="onAnimationEnd()"
        >
          <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
          <span>Merci pour votre inscription à notre newsletter !</span>
          <button class="close-btn" (click)="dismissSuccessMessage()" aria-label="Fermer le message">
            <i class="fas fa-times"></i>
          </button>
        </div>
      }
    </footer>
  `,
  styles: [`
    /* Variables CSS */
    :host {
      --primary: #6366f1;
      --primary-dark: #4f46e5;
      --success: #10b981;
      --error: #ef4444;
      --warning: #f59e0b;
      --background: #0f172a;
      --surface: #1e293b;
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --border-radius: 8px;
      --border-radius-lg: 12px;
      --border-radius-full: 9999px;
      --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .footer {
      background: linear-gradient(180deg, #18181b 0%, #09090b 100%);
      color: rgba(255, 255, 255, 0.95);
      position: relative;
      overflow: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.6;
    }

    .footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(99, 102, 241, 0.5) 50%, 
        transparent 100%
      );
      z-index: 1;
    }

    .footer::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(255, 255, 255, 0.1) 50%, 
        transparent 100%
      );
    }

    /* Main Content */
    .footer-content {
      max-width: 1280px;
      margin: 0 auto;
      padding: 64px 24px 40px;
      position: relative;
      z-index: 1;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1.5fr repeat(3, 1fr);
      gap: 48px;
      margin-bottom: 48px;
    }

    /* Brand Section */
    .footer-section {
      display: flex;
      flex-direction: column;
    }

    .brand-section {
      gap: 20px;
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 4px;
    }

    .logo-icon {
      font-size: 32px;
      color: #6366f1;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3));
    }

    .logo-text {
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(135deg, #ffffff 0%, #a78bfa 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
    }

    .brand-description {
      color: rgba(255, 255, 255, 0.75);
      font-size: 15px;
      line-height: 1.7;
      max-width: 380px;
      margin: 8px 0;
    }

    /* Social Links */
    .social-links {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 16px;
    }

    .social-link {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--border-radius);
      text-decoration: none;
      transition: var(--transition);
      position: relative;
      overflow: hidden;
      color: white;
    }

    .social-link::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--social-color);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .social-link:hover {
      border-color: var(--social-color);
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }

    .social-link:hover::before {
      opacity: 0.2;
    }

    .social-link i {
      font-size: 18px;
      position: relative;
      z-index: 1;
      transition: transform 0.3s ease;
    }

    .social-link:hover i {
      transform: scale(1.15);
      color: white;
    }

    /* Footer Links */
    .footer-title {
      font-size: 16px;
      font-weight: 700;
      color: white;
      margin-bottom: 20px;
      letter-spacing: 0.5px;
      position: relative;
      padding-bottom: 10px;
      display: inline-block;
    }

    .footer-title::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 32px;
      height: 3px;
      background: linear-gradient(90deg, var(--primary), transparent);
      border-radius: 2px;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .footer-links li {
      margin: 0;
    }

    .footer-link {
      color: rgba(255, 255, 255, 0.75);
      text-decoration: none;
      font-size: 14px;
      transition: var(--transition);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      position: relative;
      padding: 6px 0;
    }

    .footer-link:hover {
      color: white;
      transform: translateX(6px);
    }

    .footer-link::before {
      content: '›';
      opacity: 0;
      transform: translateX(-10px);
      transition: var(--transition);
      position: absolute;
      left: -20px;
      color: var(--primary);
      font-weight: bold;
    }

    .footer-link:hover::before {
      opacity: 1;
      transform: translateX(0);
    }

    .footer-link.active {
      color: var(--primary);
      font-weight: 600;
    }

    /* Newsletter Section */
    .newsletter-section {
      background: linear-gradient(135deg, 
        rgba(99, 102, 241, 0.15) 0%, 
        rgba(139, 92, 246, 0.15) 100%
      );
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: var(--border-radius-lg);
      padding: 40px;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }

    .newsletter-section::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 30% 30%, 
        rgba(99, 102, 241, 0.1) 0%, 
        transparent 50%
      );
      animation: float 20s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      33% { transform: translate(30px, -30px) rotate(120deg); }
      66% { transform: translate(-20px, 20px) rotate(240deg); }
    }

    .newsletter-content {
      position: relative;
      z-index: 1;
    }

    .newsletter-header h3 {
      font-size: 24px;
      font-weight: 700;
      color: white;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
    }

    .newsletter-header p {
      color: rgba(255, 255, 255, 0.75);
      font-size: 15px;
      margin-bottom: 24px;
    }

    .newsletter-form {
      display: flex;
      gap: 16px;
      max-width: 500px;
      margin-bottom: 20px;
    }

    .input-group {
      flex: 1;
      position: relative;
    }

    .newsletter-input {
      width: 100%;
      padding: 14px 20px;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--border-radius);
      color: white;
      font-size: 15px;
      transition: var(--transition);
      font-family: inherit;
    }

    .newsletter-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .newsletter-input:focus {
      outline: none;
      background: rgba(255, 255, 255, 0.15);
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
    }

    .newsletter-input.invalid {
      border-color: var(--error);
    }

    .newsletter-input.invalid:focus {
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
    }

    .error-message {
      color: var(--error);
      font-size: 13px;
      margin-top: 6px;
      position: absolute;
      bottom: -22px;
      left: 0;
      font-weight: 500;
    }

    .newsletter-btn {
      padding: 14px 32px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: var(--transition);
      white-space: nowrap;
      min-width: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: inherit;
    }

    .newsletter-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
    }

    .newsletter-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .newsletter-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }

    .spinner {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .privacy-notice {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.6);
      margin-top: 16px;
      display: flex;
      align-items: flex-start;
      gap: 6px;
    }

    .privacy-link {
      color: var(--primary);
      text-decoration: none;
      font-weight: 500;
      transition: var(--transition);
    }

    .privacy-link:hover {
      color: white;
      text-decoration: underline;
    }

    /* Bottom Bar */
    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: 24px 0;
      background: rgba(0, 0, 0, 0.2);
    }

    .footer-bottom-content {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .copyright {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      flex-wrap: wrap;
    }

    .copyright-icon {
      font-size: 16px;
      opacity: 0.8;
    }

    .separator {
      opacity: 0.5;
      margin: 0 4px;
    }

    .copyright strong {
      color: white;
      font-weight: 700;
    }

    .footer-badges {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .badge {
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: var(--border-radius-full);
      font-size: 13px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      white-space: nowrap;
      display: flex;
      align-items: center;
      transition: var(--transition);
    }

    .badge:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    /* Back to Top Button */
    .back-to-top {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 52px;
      height: 52px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 18px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
      transition: var(--transition);
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px) scale(0.9);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    .back-to-top.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }

    .back-to-top:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 8px 30px rgba(99, 102, 241, 0.6);
    }

    .back-to-top:active {
      transform: translateY(-2px) scale(1.02);
    }

    /* Success Message */
    .success-message {
      position: fixed;
      bottom: 100px;
      right: 30px;
      background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
      color: white;
      padding: 16px 24px;
      border-radius: var(--border-radius);
      box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
      z-index: 1000;
      display: flex;
      align-items: center;
      animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      max-width: 350px;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .success-message i {
      font-size: 18px;
      flex-shrink: 0;
    }

    .success-message span {
      flex: 1;
      margin: 0 12px;
      font-weight: 500;
    }

    .close-btn {
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      flex-shrink: 0;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .footer-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 40px;
      }

      .brand-section {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 768px) {
      .footer-content {
        padding: 48px 20px 32px;
      }

      .footer-grid {
        grid-template-columns: 1fr;
        gap: 32px;
      }

      .newsletter-section {
        padding: 32px 24px;
      }

      .newsletter-form {
        flex-direction: column;
      }

      .newsletter-btn {
        width: 100%;
        min-width: 0;
      }

      .footer-bottom-content {
        flex-direction: column;
        text-align: center;
        gap: 16px;
      }

      .copyright {
        justify-content: center;
        text-align: center;
      }

      .footer-badges {
        justify-content: center;
      }

      .back-to-top {
        bottom: 20px;
        right: 20px;
        width: 48px;
        height: 48px;
        font-size: 16px;
      }

      .success-message {
        bottom: 80px;
        right: 20px;
        left: 20px;
        max-width: none;
      }
    }

    @media (max-width: 480px) {
      .footer-content {
        padding: 40px 16px 24px;
      }

      .newsletter-section {
        padding: 24px 20px;
      }

      .social-links {
        justify-content: center;
      }

      .brand-description {
        text-align: center;
      }

      .footer-logo {
        justify-content: center;
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .footer {
        background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
      }
    }

    /* Print styles */
    @media print {
      .footer {
        background: white !important;
        color: black !important;
      }
      
      .back-to-top,
      .newsletter-form,
      .social-links {
        display: none !important;
      }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `]
})
export class FooterComponent implements OnInit, OnDestroy {
  // Configuration
  currentYear = new Date().getFullYear();
  appVersion = '1.0.0';
  newsletterEmail = '';
  isSubmitting = false;
  showSuccessMessage = false;
  showBackToTop = false;
  
  private scrollListener?: () => void;
  private successMessageTimer?: any;

  // Social Links avec classes CSS Font Awesome
  socialLinks: SocialLink[] = [
    {
      name: 'LinkedIn',
      iconClass: 'fab fa-linkedin-in',
      url: 'https://www.linkedin.com/company/emailtemplates-pro',
      color: '#0077B5',
      description: 'Suivez-nous sur LinkedIn'
    },
    {
      name: 'GitHub',
      iconClass: 'fab fa-github',
      url: 'https://github.com/emailtemplates-pro',
      color: '#333333',
      description: 'Code source ouvert'
    },
    {
      name: 'Twitter',
      iconClass: 'fab fa-twitter',
      url: 'https://twitter.com/emailtemplatespro',
      color: '#1DA1F2',
      description: 'Actualités et astuces'
    },
    {
      name: 'Facebook',
      iconClass: 'fab fa-facebook-f',
      url: 'https://facebook.com/emailtemplatespro',
      color: '#1877F2',
      description: 'Communauté Facebook'
    },
    {
      name: 'Instagram',
      iconClass: 'fab fa-instagram',
      url: 'https://instagram.com/emailtemplatespro',
      color: '#E4405F',
      description: 'Designs et inspirations'
    },
    {
      name: 'YouTube',
      iconClass: 'fab fa-youtube',
      url: 'https://youtube.com/@emailtemplatespro',
      color: '#FF0000',
      description: 'Tutoriels vidéos'
    },
    {
      name: 'WhatsApp',
      iconClass: 'fab fa-whatsapp',
      url: 'https://wa.me/21612345678',
      color: '#25D366',
      description: 'Contact rapide'
    },
    {
      name: 'Telegram',
      iconClass: 'fab fa-telegram',
      url: 'https://t.me/emailtemplatespro',
      color: '#0088CC',
      description: 'Groupe Telegram'
    }
  ];

  navigationLinks: FooterLink[] = [
    { label: 'Accueil', route: '/' },
    { label: 'Templates', route: '/templates' },
    { label: 'Créer un Template', route: '/templates/new' },
    { label: 'Galerie', route: '/gallery' },
    { label: 'Tarifs', route: '/pricing' },
    { label: 'Contact', route: '/contact' }
  ];

  resourceLinks: FooterLink[] = [
    { label: 'Documentation', route: '/docs' },
    { label: 'API', route: '/api' },
    { label: 'Tutoriels', route: '/tutorials' },
    { label: 'Blog', route: '/blog' },
    { label: 'Forum', route: '/forum' },
    { label: 'FAQ', route: '/faq' }
  ];

  legalLinks: FooterLink[] = [
    { label: 'Conditions d\'utilisation', route: '/terms' },
    { label: 'Politique de confidentialité', route: '/privacy' },
    { label: 'Mentions légales', route: '/legal' },
    { label: 'CGV', route: '/cgv' },
    { label: 'Cookies', route: '/cookies' }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupScrollListener();
      this.checkScrollPosition();
    }
  }

  ngOnDestroy(): void {
    if (this.scrollListener && isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.scrollListener);
    }
    
    if (this.successMessageTimer) {
      clearTimeout(this.successMessageTimer);
    }
  }

  private setupScrollListener(): void {
    this.scrollListener = () => {
      this.checkScrollPosition();
    };
    
    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  private checkScrollPosition(): void {
    this.showBackToTop = window.pageYOffset > 300;
  }

  async subscribeNewsletter(event: Event): Promise<void> {
    event.preventDefault();
    
    if (!this.newsletterEmail || !this.isValidEmail(this.newsletterEmail)) {
      return;
    }

    this.isSubmitting = true;

    try {
      // Simuler une requête API (2 secondes)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Enregistrer dans localStorage pour simulation
      if (isPlatformBrowser(this.platformId)) {
        const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
        subscribers.push({
          email: this.newsletterEmail,
          date: new Date().toISOString(),
          source: 'footer'
        });
        localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
      }
      
      this.showSuccessMessage = true;
      this.newsletterEmail = '';
      
      // Auto-hide après 8 secondes
      this.successMessageTimer = setTimeout(() => {
        this.showSuccessMessage = false;
      }, 8000);

    } catch (error) {
      console.error('Erreur newsletter:', error);
      this.showError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      this.isSubmitting = false;
    }
  }

  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  dismissSuccessMessage(): void {
    this.showSuccessMessage = false;
    if (this.successMessageTimer) {
      clearTimeout(this.successMessageTimer);
    }
  }

  onAnimationEnd(): void {
    // Gestion des fins d'animation si nécessaire
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private showError(message: string): void {
    // Vous pouvez implémenter un système de notifications ici
    console.error(message);
  }

  // TrackBy functions pour la performance
  trackBySocial(index: number, social: SocialLink): string {
    return social.name;
  }

  trackByLink(index: number, link: FooterLink): string {
    return link.label;
  }
}