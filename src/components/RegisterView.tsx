import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  LogIn,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RegisterViewProps {
  onSuccess?: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onSuccess }) => {
  const { login, register, error: authError, clearError } = useAuth();

  // Mode: 'register' or 'login'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Register Fields
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [numero, setNumero] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Login Fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Step wizard for mobile registration (< 640px)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setFormErrors({});
    clearError();
    setCurrentStep(1);
  };

  // Register Validations
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!nom.trim()) errs.nom = 'Nom requis';
    if (!prenom.trim()) errs.prenom = 'Prénom requis';
    setFormErrors((prev) => ({ ...prev, ...errs }));
    return !errs.nom && !errs.prenom;
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!numero.trim()) {
      errs.numero = 'Numéro de téléphone requis';
    } else if (numero.trim().length < 6) {
      errs.numero = 'Format de numéro incomplet';
    }

    if (!email.trim()) {
      errs.email = 'Adresse email requise';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Adresse email invalide';
    }

    setFormErrors((prev) => ({ ...prev, ...errs }));
    return !errs.numero && !errs.email;
  };

  const validateStep3 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!password) {
      errs.password = 'Mot de passe requis';
    } else if (password.length < 4) {
      errs.password = 'Minimum 4 caractères';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirmation requise';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setFormErrors((prev) => ({ ...prev, ...errs }));
    return !errs.password && !errs.confirmPassword;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2() || !validateStep3()) return;

    setIsSubmitting(true);
    try {
      await register({
        nom: nom.trim(),
        prenom: prenom.trim(),
        numero: numero.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      // Handled by AuthContext error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!loginIdentifier.trim()) {
      errs.loginIdentifier = 'Email ou téléphone requis';
    }
    if (!loginPassword.trim()) {
      errs.loginPassword = 'Mot de passe requis';
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      await login({
        identifier: loginIdentifier.trim(),
        password: loginPassword.trim(),
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      // Handled by AuthContext error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center px-4 py-8 antialiased relative overflow-hidden"
      style={{ background: 'var(--wf-bg)' }}
    >
      <main className="w-full max-w-[440px] relative z-10">
        {/* Brand Header */}
        <header className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl text-white shadow-sm mb-3"
            style={{ background: 'var(--wf-primary)' }}
          >
            <span className="font-extrabold text-xl tracking-tight">W</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--wf-text)' }}>
            Wealth<span style={{ color: 'var(--wf-primary)' }}>Flow</span>
          </h1>
          <p className="text-xs mt-1 font-medium" style={{ color: 'var(--wf-text-secondary)' }}>
            {authMode === 'login'
              ? 'Accédez à votre espace financier personnel'
              : 'Création de votre compte sécurisé'}
          </p>
        </header>

        {/* Tab Switcher: Connexion / Inscription */}
        <div
          className="flex p-1 rounded-2xl mb-4"
          style={{
            background: 'var(--wf-border-subtle)',
            border: '1px solid var(--wf-border)',
          }}
        >
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'login'
                ? 'shadow-sm bg-white text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
            style={{
              background: authMode === 'login' ? 'var(--wf-surface)' : 'transparent',
              color: authMode === 'login' ? 'var(--wf-text)' : 'var(--wf-text-secondary)',
            }}
          >
            <LogIn size={14} />
            <span>Connexion</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'register'
                ? 'shadow-sm bg-white text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
            style={{
              background: authMode === 'register' ? 'var(--wf-surface)' : 'transparent',
              color: authMode === 'register' ? 'var(--wf-text)' : 'var(--wf-text-secondary)',
            }}
          >
            <UserPlus size={14} />
            <span>Créer un compte</span>
          </button>
        </div>

        {/* Global Error Banner if any */}
        {authError && (
          <div
            className="mb-4 p-3 rounded-xl flex items-center gap-2.5 text-xs font-medium animate-fadeIn"
            style={{
              background: 'var(--wf-danger-soft)',
              color: 'var(--wf-danger)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* ============================================================
            MODE 1 : CONNEXION (LOGIN)
            ============================================================ */}
        {authMode === 'login' ? (
          <div
            className="p-6 sm:p-7"
            style={{
              background: 'var(--wf-surface)',
              border: '1px solid var(--wf-border)',
              borderRadius: '24px',
              boxShadow: 'var(--wf-shadow-soft)',
            }}
          >
            <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
              <div>
                <label className="wf-label text-xs">Email ou Téléphone</label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--wf-text-tertiary)' }}
                  />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => {
                      setLoginIdentifier(e.target.value);
                      if (formErrors.loginIdentifier) {
                        setFormErrors((prev) => ({ ...prev, loginIdentifier: '' }));
                      }
                    }}
                    placeholder="contact@exemple.com ou +225..."
                    className="wf-input pl-9 text-xs"
                    style={{
                      borderColor: formErrors.loginIdentifier ? 'var(--wf-danger)' : undefined,
                    }}
                  />
                </div>
                {formErrors.loginIdentifier && (
                  <p className="text-[11px] mt-1 font-semibold" style={{ color: 'var(--wf-danger)' }}>
                    {formErrors.loginIdentifier}
                  </p>
                )}
              </div>

              <div>
                <label className="wf-label text-xs">Mot de passe</label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--wf-text-tertiary)' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (formErrors.loginPassword) {
                        setFormErrors((prev) => ({ ...prev, loginPassword: '' }));
                      }
                    }}
                    placeholder="Votre mot de passe"
                    className="wf-input pl-9 pr-10 text-xs"
                    style={{
                      borderColor: formErrors.loginPassword ? 'var(--wf-danger)' : undefined,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                    style={{ color: 'var(--wf-text-tertiary)' }}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {formErrors.loginPassword && (
                  <p className="text-[11px] mt-1 font-semibold" style={{ color: 'var(--wf-danger)' }}>
                    {formErrors.loginPassword}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 btn-primary touch-target"
                >
                  {isSubmitting ? (
                    <span>Connexion en cours...</span>
                  ) : (
                    <>
                      <span>Se connecter</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ============================================================
              MODE 2 : INSCRIPTION (REGISTER)
              ============================================================ */
          <div>
            {/* Mobile Step Indicator (< 640px) */}
            <div className="sm:hidden mb-4">
              <div
                className="flex items-center justify-between text-xs font-semibold px-1 mb-2"
                style={{ color: 'var(--wf-text-secondary)' }}
              >
                <span>Étape {currentStep} sur 3</span>
                <span style={{ color: 'var(--wf-primary)' }}>
                  {currentStep === 1 ? 'Identité' : currentStep === 2 ? 'Coordonnées' : 'Sécurité'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      background:
                        step <= currentStep ? 'var(--wf-primary)' : 'var(--wf-border)',
                    }}
                  />
                ))}
              </div>
            </div>

            <div
              className="p-6 sm:p-7"
              style={{
                background: 'var(--wf-surface)',
                border: '1px solid var(--wf-border)',
                borderRadius: '24px',
                boxShadow: 'var(--wf-shadow-soft)',
              }}
            >
              <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
                {/* STEP 1: IDENTITÉ */}
                <div className={`space-y-4 ${currentStep !== 1 ? 'hidden sm:block' : ''}`}>
                  <div
                    className="hidden sm:flex items-center gap-2 pb-1 border-b"
                    style={{ borderColor: 'var(--wf-border)' }}
                  >
                    <User size={15} style={{ color: 'var(--wf-primary)' }} />
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'var(--wf-text-secondary)' }}
                    >
                      1. Identité
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="wf-label text-xs">Nom</label>
                      <div className="relative">
                        <User
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2"
                          style={{ color: 'var(--wf-text-tertiary)' }}
                        />
                        <input
                          type="text"
                          value={nom}
                          onChange={(e) => {
                            setNom(e.target.value);
                            if (formErrors.nom) setFormErrors((prev) => ({ ...prev, nom: '' }));
                          }}
                          placeholder="Diploh"
                          className="wf-input pl-9 text-xs"
                          style={{
                            borderColor: formErrors.nom ? 'var(--wf-danger)' : undefined,
                          }}
                        />
                      </div>
                      {formErrors.nom && (
                        <p className="text-[11px] mt-1 font-semibold" style={{ color: 'var(--wf-danger)' }}>
                          {formErrors.nom}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="wf-label text-xs">Prénom</label>
                      <div className="relative">
                        <User
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2"
                          style={{ color: 'var(--wf-text-tertiary)' }}
                        />
                        <input
                          type="text"
                          value={prenom}
                          onChange={(e) => {
                            setPrenom(e.target.value);
                            if (formErrors.prenom) setFormErrors((prev) => ({ ...prev, prenom: '' }));
                          }}
                          placeholder="Junior"
                          className="wf-input pl-9 text-xs"
                          style={{
                            borderColor: formErrors.prenom ? 'var(--wf-danger)' : undefined,
                          }}
                        />
                      </div>
                      {formErrors.prenom && (
                        <p className="text-[11px] mt-1 font-semibold" style={{ color: 'var(--wf-danger)' }}>
                          {formErrors.prenom}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* STEP 2: COORDONNÉES */}
                <div className={`space-y-4 ${currentStep !== 2 ? 'hidden sm:block' : ''}`}>
                  <div
                    className="hidden sm:flex items-center gap-2 pt-2 pb-1 border-b"
                    style={{ borderColor: 'var(--wf-border)' }}
                  >
                    <Phone size={15} style={{ color: 'var(--wf-primary)' }} />
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'var(--wf-text-secondary)' }}
                    >
                      2. Coordonnées
                    </span>
                  </div>

                  <div>
                    <label className="wf-label text-xs">Numéro de téléphone</label>
                    <div className="relative">
                      <Phone
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--wf-text-tertiary)' }}
                      />
                      <input
                        type="tel"
                        value={numero}
                        onChange={(e) => {
                          setNumero(e.target.value);
                          if (formErrors.numero) setFormErrors((prev) => ({ ...prev, numero: '' }));
                        }}
                        placeholder="+225 07 00 00 00 00"
                        className="wf-input pl-9 text-xs"
                        style={{
                          borderColor: formErrors.numero ? 'var(--wf-danger)' : undefined,
                        }}
                      />
                    </div>
                    {formErrors.numero && (
                      <p className="text-[11px] mt-1 font-semibold" style={{ color: 'var(--wf-danger)' }}>
                        {formErrors.numero}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="wf-label text-xs">Adresse email</label>
                    <div className="relative">
                      <Mail
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--wf-text-tertiary)' }}
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: '' }));
                        }}
                        placeholder="contact@exemple.com"
                        className="wf-input pl-9 text-xs"
                        style={{
                          borderColor: formErrors.email ? 'var(--wf-danger)' : undefined,
                        }}
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-[11px] mt-1 font-semibold" style={{ color: 'var(--wf-danger)' }}>
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* STEP 3: SÉCURITÉ */}
                <div className={`space-y-4 ${currentStep !== 3 ? 'hidden sm:block' : ''}`}>
                  <div
                    className="hidden sm:flex items-center gap-2 pt-2 pb-1 border-b"
                    style={{ borderColor: 'var(--wf-border)' }}
                  >
                    <Lock size={15} style={{ color: 'var(--wf-primary)' }} />
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'var(--wf-text-secondary)' }}
                    >
                      3. Sécurité d'accès
                    </span>
                  </div>

                  <div>
                    <label className="wf-label text-xs">Mot de passe du compte</label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--wf-text-tertiary)' }}
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: '' }));
                        }}
                        placeholder="Au moins 4 caractères"
                        className="wf-input pl-9 pr-10 text-xs"
                        style={{
                          borderColor: formErrors.password ? 'var(--wf-danger)' : undefined,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Masquer' : 'Afficher'}
                        style={{ color: 'var(--wf-text-tertiary)' }}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="text-[11px] mt-1 font-semibold" style={{ color: 'var(--wf-danger)' }}>
                        {formErrors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="wf-label text-xs">Confirmer le mot de passe</label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--wf-text-tertiary)' }}
                      />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (formErrors.confirmPassword) {
                            setFormErrors((prev) => ({ ...prev, confirmPassword: '' }));
                          }
                        }}
                        placeholder="Répéter le mot de passe"
                        className="wf-input pl-9 pr-10 text-xs"
                        style={{
                          borderColor: formErrors.confirmPassword ? 'var(--wf-danger)' : undefined,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 transition-colors"
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? 'Masquer' : 'Afficher'}
                        style={{ color: 'var(--wf-text-tertiary)' }}
                      >
                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="text-[11px] mt-1 font-semibold" style={{ color: 'var(--wf-danger)' }}>
                        {formErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mobile Navigation Buttons (< 640px) */}
                <div className="sm:hidden pt-3 flex gap-2">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3)}
                      className="flex-1 py-3 px-4 rounded-xl text-xs font-bold btn-ghost flex items-center justify-center gap-1.5 touch-target"
                    >
                      <ArrowLeft size={14} />
                      <span>Précédent</span>
                    </button>
                  )}

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (currentStep === 1 && validateStep1()) setCurrentStep(2);
                        else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
                      }}
                      className="flex-1 py-3 px-4 rounded-xl text-xs font-bold btn-primary flex items-center justify-center gap-1.5 touch-target"
                    >
                      <span>Suivant</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 px-4 rounded-xl text-xs font-bold btn-primary flex items-center justify-center gap-1.5 touch-target"
                    >
                      {isSubmitting ? (
                        <span>Création...</span>
                      ) : (
                        <>
                          <CheckCircle2 size={15} />
                          <span>Terminer</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Desktop Submit Button (sm+) */}
                <div className="hidden sm:block pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 btn-primary touch-target"
                  >
                    {isSubmitting ? (
                      <span>Enregistrement du compte...</span>
                    ) : (
                      <>
                        <span>Créer mon compte</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer note */}
        <footer className="mt-6 text-center">
          <p
            className="text-xs flex items-center justify-center gap-1.5"
            style={{ color: 'var(--wf-text-tertiary)' }}
          >
            <ShieldCheck size={14} style={{ color: 'var(--wf-success)' }} />
            <span>Données isolées, chiffrées & persistantes sur serveur cloud</span>
          </p>
        </footer>
      </main>
    </div>
  );
};