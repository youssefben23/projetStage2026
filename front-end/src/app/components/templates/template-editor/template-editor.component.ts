import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TemplateService } from '../../../services/template.service';
import { EmailTemplate } from '../../../models/template.model';

// Import Monaco Editor
declare const monaco: any;

@Component({
  selector: 'app-template-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="editor-container">
      <!-- Hero Header -->
      <div class="editor-hero">
        <div class="hero-content">
          <div class="hero-badge">
            <i class="fas fa-code"></i>
            <span>{{ isEditMode ? 'Mode Édition' : 'Création' }}</span>
          </div>
          <h1>
            <i class="fas fa-edit"></i>
            {{ isEditMode ? 'Modifier le Template' : 'Nouveau Template' }}
          </h1>
          <p class="hero-subtitle">
           Créez, gérez et organisez vos modèles d'e-mails professionnels en toute simplicité
          </p>
        </div>
        <div class="hero-actions">
          <button class="btn btn-secondary" (click)="validateTemplate()" [disabled]="loading">
            <i class="fas fa-check-circle"></i>
            <span>Valider</span>
          </button>
          <button class="btn btn-primary" (click)="saveTemplate()" [disabled]="loading || !canSave()">
            <i class="fas" [class.fa-save]="!loading" [class.fa-spinner]="loading" [class.fa-spin]="loading"></i>
            <span>{{ loading ? 'Sauvegarde...' : 'Sauvegarder' }}</span>
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div class="messages-container">
        <div class="alert alert-error" *ngIf="error">
          <i class="fas fa-exclamation-triangle"></i>
          <span>{{ error }}</span>
          <button class="alert-close" (click)="error = ''">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="alert alert-success" *ngIf="success">
          <i class="fas fa-check-circle"></i>
          <span>{{ success }}</span>
        </div>
      </div>

      <!-- Main Form -->
      <form (ngSubmit)="saveTemplate()" #templateForm="ngForm" class="editor-form">
        <div class="form-section">
          <div class="form-grid">
            <div class="form-group">
              <label>
                <i class="fas fa-signature"></i>
                Nom du Template *
              </label>
              <input
                type="text"
                [(ngModel)]="nom"
                name="nom"
                required
                class="form-input"
                placeholder="Ex: Newsletter Mensuelle"
              />
            </div>

            <div class="form-group">
              <label>
                <i class="fas fa-envelope"></i>
                Sujet de l'E-mail *
              </label>
              <input
                type="text"
                [(ngModel)]="sujet"
                name="sujet"
                required
                class="form-input"
                placeholder="Ex: Bienvenue sur notre plateforme"
              />
            </div>
          </div>
        </div>

        <!-- Editor Layout -->
        <div class="editor-layout">
          <!-- Monaco Editor Panel -->
          <div class="editor-panel">
            <div class="panel-header">
              <div class="panel-title">
                <i class="fas fa-code"></i>
                <h3>Éditeur HTML/CSS</h3>
              </div>
              <div class="panel-info">
                <span class="info-badge">
                  <i class="fas fa-file-code"></i>
                  {{ editorContent.length }} caractères
                </span>
              </div>
            </div>
            <div #monacoEditorContainer class="monaco-container"></div>
          </div>

          <!-- Preview Panel -->
          <div class="preview-panel">
            <div class="panel-header">
              <div class="panel-title">
                <i class="fas fa-eye"></i>
                <h3>Aperçu en Temps Réel</h3>
              </div>
              <button 
                type="button" 
                class="btn-refresh" 
                (click)="forceRefreshPreview()"
                title="Actualiser l'aperçu">
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
            <iframe 
              #previewFrame
              class="preview-iframe"
              [srcdoc]="previewHtml"
              frameborder="0"
              sandbox="allow-same-origin">
            </iframe>
          </div>
        </div>

        <!-- Validation Results -->
        <div class="validation-card" *ngIf="validationResult">
          <div class="validation-header">
            <i class="fas fa-clipboard-check"></i>
            <h4>Résultat de Validation</h4>
          </div>
          
          <div class="validation-status" [class.valid]="validationResult.is_valid" [class.invalid]="!validationResult.is_valid">
            <i class="fas" [class.fa-check-circle]="validationResult.is_valid" [class.fa-times-circle]="!validationResult.is_valid"></i>
            <span>{{ validationResult.is_valid ? 'Template valide' : 'Template invalide' }}</span>
          </div>

          <div class="validation-messages">
            <div class="validation-errors" *ngIf="validationResult.errors && validationResult.errors.length > 0">
              <h5>
                <i class="fas fa-exclamation-circle"></i>
                Erreurs ({{ validationResult.errors.length }})
              </h5>
              <ul>
                <li *ngFor="let error of validationResult.errors">
                  <i class="fas fa-times"></i>
                  {{ error.message }}
                </li>
              </ul>
            </div>

            <div class="validation-warnings" *ngIf="validationResult.warnings && validationResult.warnings.length > 0">
              <h5>
                <i class="fas fa-exclamation-triangle"></i>
                Avertissements ({{ validationResult.warnings.length }})
              </h5>
              <ul>
                <li *ngFor="let warning of validationResult.warnings">
                  <i class="fas fa-info-circle"></i>
                  {{ warning.message }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
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
      --bg-tertiary: #f1f5f9;
      --border-color: #e2e8f0;
      --border-radius: 8px;
      --border-radius-lg: 12px;
      --border-radius-xl: 16px;
      --shadow-sm: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
      --shadow-md: 0 4px 12px -2px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 10px 25px -5px rgba(0, 0, 0, 0.12);
      --shadow-xl: 0 20px 50px -12px rgba(0, 0, 0, 0.15);
      --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .editor-container {
      min-height: 100vh;
      background: var(--bg-secondary);
      padding-bottom: 60px;
    }

    /* Hero Section */
    .editor-hero {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      padding: 48px 24px;
      margin-bottom: 32px;
      position: relative;
      overflow: hidden;
    }

    .editor-hero::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
      border-radius: 50%;
      animation: float 20s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      33% { transform: translate(30px, -30px) rotate(120deg); }
      66% { transform: translate(-20px, 20px) rotate(240deg); }
    }

    .hero-content {
      max-width: 1800px;
      margin: 0 auto;
      text-align: center;
      position: relative;
      z-index: 1;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      padding: 8px 20px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 20px;
      backdrop-filter: blur(10px);
      animation: slideInUp 0.6s ease;
    }

    .hero-badge i {
      font-size: 16px;
    }

    .editor-hero h1 {
      font-size: 42px;
      font-weight: 800;
      color: white;
      margin-bottom: 12px;
      letter-spacing: -1px;
      animation: slideInUp 0.7s ease;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }

    .editor-hero h1 i {
      font-size: 38px;
    }

    .hero-subtitle {
      font-size: 17px;
      color: rgba(255, 255, 255, 0.95);
      max-width: 600px;
      margin: 0 auto 24px;
      line-height: 1.6;
      animation: slideInUp 0.8s ease;
    }

    .hero-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
      animation: slideInUp 0.9s ease;
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

    /* Messages */
    .messages-container {
      max-width: 1800px;
      margin: 0 auto;
      padding: 0 24px 24px;
    }

    .alert {
      padding: 16px 20px;
      border-radius: var(--border-radius-lg);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
      animation: slideDown 0.3s ease;
      position: relative;
    }

    .alert i:first-child {
      font-size: 20px;
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

    /* Form */
    .editor-form {
      max-width: 1800px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .form-section {
      background: white;
      border-radius: var(--border-radius-lg);
      padding: 32px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

    .form-input {
      width: 100%;
      padding: 12px 16px;
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
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
    }

    /* Editor Layout */
    .editor-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
      height: calc(100vh - 500px);
      min-height: 600px;
    }

    .editor-panel,
    .preview-panel {
      background: white;
      border-radius: var(--border-radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-md);
      border: 2px solid var(--border-color);
      display: flex;
      flex-direction: column;
      transition: var(--transition);
    }

    .editor-panel:hover,
    .preview-panel:hover {
      border-color: var(--primary);
      box-shadow: var(--shadow-lg);
    }

    .panel-header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .panel-title {
      display: flex;
      align-items: center;
      gap: 10px;
      color: white;
    }

    .panel-title i {
      font-size: 20px;
    }

    .panel-title h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: white;
    }

    .panel-info {
      display: flex;
      gap: 12px;
    }

    .info-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.2);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      color: white;
      backdrop-filter: blur(10px);
    }

    .info-badge i {
      font-size: 14px;
    }

    .btn-refresh {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      padding: 8px 12px;
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 14px;
    }

    .btn-refresh:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .btn-refresh i {
      font-size: 16px;
      transition: transform 0.3s ease;
    }

    .btn-refresh:hover i {
      transform: rotate(180deg);
    }

    .monaco-container {
      flex: 1;
      overflow: hidden;
    }

    .preview-iframe {
      flex: 1;
      width: 100%;
      background: white;
      border: none;
    }

    /* Validation Card */
    .validation-card {
      background: white;
      border-radius: var(--border-radius-lg);
      padding: 28px;
      box-shadow: var(--shadow-md);
      border: 2px solid var(--border-color);
      animation: slideInUp 0.5s ease;
    }

    .validation-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid var(--border-color);
    }

    .validation-header i {
      font-size: 24px;
      color: var(--primary);
    }

    .validation-header h4 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .validation-status {
      padding: 16px 20px;
      border-radius: var(--border-radius);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
      font-weight: 700;
    }

    .validation-status i {
      font-size: 24px;
    }

    .validation-status.valid {
      background: rgba(16, 185, 129, 0.1);
      border-left: 4px solid var(--success);
      color: #065f46;
    }

    .validation-status.invalid {
      background: rgba(239, 68, 68, 0.1);
      border-left: 4px solid var(--error);
      color: #991b1b;
    }

    .validation-messages {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .validation-errors,
    .validation-warnings {
      padding: 16px;
      border-radius: var(--border-radius);
    }

    .validation-errors {
      background: rgba(239, 68, 68, 0.05);
      border-left: 3px solid var(--error);
    }

    .validation-warnings {
      background: rgba(245, 158, 11, 0.05);
      border-left: 3px solid var(--warning);
    }

    .validation-errors h5,
    .validation-warnings h5 {
      margin: 0 0 12px 0;
      font-size: 15px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .validation-errors h5 {
      color: var(--error);
    }

    .validation-warnings h5 {
      color: var(--warning);
    }

    .validation-errors ul,
    .validation-warnings ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .validation-errors li,
    .validation-warnings li {
      padding: 8px 0;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 14px;
      color: var(--text-secondary);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .validation-errors li:last-child,
    .validation-warnings li:last-child {
      border-bottom: none;
    }

    .validation-errors li i {
      color: var(--error);
      font-size: 12px;
      margin-top: 3px;
    }

    .validation-warnings li i {
      color: var(--warning);
      font-size: 12px;
      margin-top: 3px;
    }

    /* Buttons */
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: var(--border-radius);
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: inherit;
    }

    .btn i {
      font-size: 16px;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: white;
      box-shadow: var(--shadow-md);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .btn-secondary {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border: 2px solid var(--border-color);
    }

    .btn-secondary:hover:not(:disabled) {
      background: white;
      border-color: var(--primary);
      transform: translateY(-2px);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .fa-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
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

    /* Responsive */
    @media (max-width: 1200px) {
      .editor-layout {
        grid-template-columns: 1fr;
        height: auto;
      }

      .editor-panel,
      .preview-panel {
        min-height: 500px;
      }
    }

    @media (max-width: 768px) {
      .editor-hero {
        padding: 40px 16px;
      }

      .editor-hero h1 {
        font-size: 32px;
        flex-direction: column;
        gap: 12px;
      }

      .hero-subtitle {
        font-size: 15px;
      }

      .form-section {
        padding: 24px 20px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .editor-panel,
      .preview-panel {
        min-height: 400px;
      }

      .validation-card {
        padding: 20px;
      }
    }
  `]
})
export class TemplateEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;
  @ViewChild('monacoEditorContainer', { static: false }) monacoEditorContainer!: ElementRef;

  isEditMode = false;
  templateId: number | null = null;
  nom = '';
  sujet = '';
  
  // ✅ CONTENU COMPLET HTML+CSS (ce qui est affiché dans Monaco)
  editorContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 10px;
      font-family: Arial, sans-serif;
    }
    
    h1 {
      color: white;
      text-align: center;
      margin-bottom: 20px;
    }
    
    p {
      color: white;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Bonjour !</h1>
    <p>Votre contenu HTML ici...</p>
  </div>
</body>
</html>`;
  
  previewHtml = '';
  loading = false;
  error = '';
  success = '';
  validationResult: any = null;

  private monacoEditor: any;
  private updateDebounceTimer: any;

  constructor(
    private templateService: TemplateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.templateId = +params['id'];
        this.loadTemplate();
      } else {
        this.updatePreview();
      }
    });

    this.loadMonacoEditor();
  }

  ngAfterViewInit(): void {
    // L'éditeur sera initialisé après le chargement de Monaco
  }

  ngOnDestroy(): void {
    if (this.monacoEditor) {
      this.monacoEditor.dispose();
    }
  }

  /**
   * ✅ CHARGEMENT DE MONACO EDITOR
   */
  private loadMonacoEditor(): void {
    const script = document.createElement('script');
    script.src = 'assets/monaco-editor/min/vs/loader.js';
    script.onload = () => {
      (window as any).require.config({ 
        paths: { 
          vs: 'assets/monaco-editor/min/vs' 
        } 
      });
      (window as any).require(['vs/editor/editor.main'], () => {
        this.initMonacoEditor();
      });
    };
    document.body.appendChild(script);
  }

  /**
   * ✅ INITIALISATION DE MONACO EDITOR
   */
  private initMonacoEditor(): void {
    if (!this.monacoEditorContainer) {
      setTimeout(() => this.initMonacoEditor(), 100);
      return;
    }

    const editorOptions = {
      value: this.editorContent,
      language: 'html',
      theme: 'vs-dark',
      automaticLayout: true,
      fontSize: 14,
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      minimap: { enabled: true },
      wordWrap: 'on',
      formatOnPaste: true,
      formatOnType: true,
      autoIndent: 'full',
      tabSize: 2,
      folding: true,
      glyphMargin: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
      renderLineHighlight: 'all',
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      snippetSuggestions: 'inline'
    };

    this.monacoEditor = monaco.editor.create(
      this.monacoEditorContainer.nativeElement,
      editorOptions
    );

    this.monacoEditor.onDidChangeModelContent(() => {
      this.editorContent = this.monacoEditor.getValue();
      this.onEditorContentChange();
    });
  }

  /**
   * ✅ CHARGEMENT DU TEMPLATE DEPUIS LE BACKEND
   */
  loadTemplate(): void {
    if (!this.templateId) return;

    this.loading = true;
    this.templateService.getTemplate(this.templateId).subscribe({
      next: (response) => {
        if (response.success && response.template) {
          const template = response.template;
          this.nom = template.nom;
          this.sujet = template.sujet;
          
          // ✅ RECONSTRUCTION DU CONTENU COMPLET
          this.editorContent = this.reconstructFullHtml(
            template.html_content,
            template.css_content || ''
          );
          
          if (this.monacoEditor) {
            this.monacoEditor.setValue(this.editorContent);
          }
          
          this.updatePreview();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du template';
        this.loading = false;
      }
    });
  }

  /**
   * ✅ RECONSTRUCTION DU HTML COMPLET À PARTIR DES DONNÉES DU BACKEND
   * Si html_content contient déjà le CSS intégré, on le retourne tel quel
   * Sinon, on intègre le css_content dans une balise <style>
   */
  private reconstructFullHtml(htmlContent: string, cssContent: string): string {
    // Si le HTML contient déjà des balises <style>, il est déjà complet
    if (htmlContent.includes('<style>') || htmlContent.includes('<style ')) {
      return htmlContent;
    }

    // Si le HTML contient la structure complète
    if (htmlContent.includes('<html') && htmlContent.includes('<head')) {
      // Insérer le CSS avant </head>
      return htmlContent.replace('</head>', `  <style>\n${cssContent}\n  </style>\n</head>`);
    }

    // Si le HTML est juste du contenu body, on crée la structure complète
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
${cssContent}
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;
  }

  /**
   * ✅ EXTRACTION DU CSS DEPUIS LE CONTENU COMPLET
   * Cette méthode extrait uniquement le CSS des balises <style>
   */
  private extractCssFromHtml(htmlContent: string): string {
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let cssContent = '';
    let match;
    
    while ((match = styleRegex.exec(htmlContent)) !== null) {
      cssContent += match[1].trim() + '\n';
    }
    
    return cssContent.trim();
  }

  /**
   * ✅ ÉVÉNEMENT : Changement dans l'éditeur
   */
  onEditorContentChange(): void {
    clearTimeout(this.updateDebounceTimer);
    this.updateDebounceTimer = setTimeout(() => {
      this.updatePreview();
    }, 500);
  }

  /**
   * ✅ MISE À JOUR DE L'APERÇU
   */
  updatePreview(): void {
    this.previewHtml = this.editorContent;
  }

  /**
   * ✅ FORCER LE RAFRAÎCHISSEMENT
   */
  forceRefreshPreview(): void {
    this.updatePreview();
    if (this.previewFrame) {
      const iframe = this.previewFrame.nativeElement;
      iframe.srcdoc = this.previewHtml;
    }
  }

  /**
   * ✅ VALIDATION DU TEMPLATE
   */
  validateTemplate(): void {
    if (this.templateId) {
      this.templateService.validateTemplate(this.templateId).subscribe({
        next: (response) => {
          if (response.success && response.validation) {
            this.validationResult = response.validation;
          }
        },
        error: (err) => {
          this.error = 'Erreur lors de la validation';
        }
      });
    } else {
      const errors: any[] = [];
      const warnings: any[] = [];

      if (!this.editorContent || !this.editorContent.trim()) {
        errors.push({ type: 'html', message: 'Le contenu est requis' });
      }

      if (this.editorContent.includes('<script')) {
        errors.push({ type: 'html', message: 'Les balises <script> sont interdites' });
      }

      if (!this.editorContent.includes('<!DOCTYPE') && !this.editorContent.includes('<html')) {
        warnings.push({ type: 'html', message: 'Structure HTML incomplète détectée' });
      }

      this.validationResult = {
        is_valid: errors.length === 0,
        html_valid: errors.length === 0,
        css_valid: true,
        errors: errors,
        warnings: warnings,
        error_count: errors.length,
        warning_count: warnings.length
      };
    }
  }

  /**
   * ✅ VÉRIFICATION AVANT SAUVEGARDE
   */
  canSave(): boolean {
    return !!(this.nom.trim() && this.sujet.trim() && this.editorContent.trim());
  }

  /**
   * ✅ SAUVEGARDE DU TEMPLATE (CORRIGÉE)
   * On envoie le contenu complet dans html_content
   * Et on extrait le CSS pour css_content (pour compatibilité backend)
   */
  saveTemplate(): void {
    if (!this.canSave()) {
      this.error = 'Veuillez remplir tous les champs requis';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    // ✅ PRÉPARATION DES DONNÉES
    const templateData = {
      nom: this.nom,
      sujet: this.sujet,
      html_content: this.editorContent,  // Contenu complet HTML+CSS
      css_content: this.extractCssFromHtml(this.editorContent)  // CSS extrait
    };

    console.log(' Données à sauvegarder:', templateData);

    if (this.isEditMode && this.templateId) {
      this.templateService.updateTemplate(this.templateId, templateData).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = '✅ Template mis à jour avec succès !';
            setTimeout(() => {
              this.router.navigate(['/templates', this.templateId]);
            }, 1500);
          } else {
            this.error = response.message || 'Erreur lors de la mise à jour';
            this.loading = false;
          }
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors de la mise à jour';
          this.loading = false;
        }
      });
    } else {
      this.templateService.createTemplate(templateData).subscribe({
        next: (response) => {
          if (response.success && response.template) {
            this.success = '✅ Template créé avec succès !';
            this.error = '';
            setTimeout(() => {
              this.router.navigate(['/templates', response.template.id]);
            }, 1500);
          } else {
            this.error = response.message || 'Erreur lors de la création';
            this.success = '';
            this.loading = false;
          }
        },
        error: (err) => {
          console.error(' Erreur création template:', err);
          let errorMessage = 'Erreur lors de la création du template.';
          
          if (err.status === 0) {
            errorMessage = 'Impossible de se connecter au backend. Vérifiez que le serveur Flask est démarré sur http://localhost:5000';
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.message) {
            errorMessage = err.message;
          }
          
          this.error = errorMessage;
          this.success = '';
          this.loading = false;
        }
      });
    }
  }
}