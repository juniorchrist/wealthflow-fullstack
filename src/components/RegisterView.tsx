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
} from 'lucide-react';
import { UserProfile } from '../types';

interface RegisterViewProps {
  onRegister: (user: UserProfile) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onRegister }) => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [numero, setNumero] = useState('');
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [confirmMdp, setConfirmMdp] = useState('');

  // Mobile 3-step wizard state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [showMdp, setShowMdp] = useState(false);
  const [showConfirmMdp, setShowConfirmMdp] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMdpChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    setMdp(cleaned);
    if (val !== cleaned) {
      setErrors((prev) => ({ ...prev, mdp: 'Uniquement des chiffres (0-9).' }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.mdp;
        return next;
      });
    }
  };

  const handleConfirmMdpChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    setConfirmMdp(cleaned);
    if (val !== cleaned) {
      setErrors((prev) => ({ ...prev, confirmMdp: 'Uniquement des chiffres (0-9).' }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.confirmMdp;
        return next;
      });
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!nom.trim()) newErrors.nom = 'Nom requis';
    if (!prenom.trim()) newErrors.prenom = 'Prénom requis';
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return !newErrors.nom && !newErrors.prenom;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!numero.trim()) {
      newErrors.numero = 'Numéro de téléphone requis';
    } else if (numero.trim().length < 6) {
      newErrors.numero = 'Format de numéro incomplet';
    }

    if (!email.trim()) {
      newErrors.email = 'Adresse email requise';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Adresse email invalide';
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return !newErrors.numero && !newErrors.email;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!mdp) {
      newErrors.mdp = 'Code requis';
    } else if (!/^\d+$/.test(mdp)) {
      newErrors.mdp = 'Chiffres uniquement';
    } else if (mdp.length < 4) {
      newErrors.mdp = 'Minimum 4 chiffres';
    }

    if (!confirmMdp) {
      newErrors.confirmMdp = 'Confirmation requise';
    } else if (mdp !== confirmMdp) {
      newErrors.confirmMdp = 'Les mots de passe ne correspondent pas';
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return !newErrors.mdp && !newErrors.confirmMdp;
  };

  const validateAll = (): boolean => {
    return validateStep1() && validateStep2() && validateStep3();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    setIsSubmitting(true);

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      nom: nom.trim(),
      prenom: prenom.trim(),
      numero: numero.trim(),
      email: email.trim().toLowerCase(),
      mdp: mdp.trim(),
      registeredAt: Date.now(),
    };

    setTimeout(() => {
      onRegister(newUser);
      setIsSubmitting(false);
    }, 400);
  };

  const handleNextMobile = () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    }
  };

  const handlePrevMobile = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
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
            Création de votre compte sécurisé
          </p>
        </header>

        {/* Mobile Step Indicator (< 640px) */}
        <div className="sm:hidden mb-4">
          <div className="flex items-center justify-between text-xs font-semibold px-1 mb-2" style={{ color: 'var(--wf-text-secondary)' }}>
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

        {/* Card Form */}
        <div
          className="p-6 sm:p-7"
          style={{
            background: 'var(--wf-surface)',
            border: '1px solid var(--wf-border)',
            borderRadius: '24px',
            boxShadow: 'var(--wf-shadow-soft)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* ============================================================
                STEP 1 : IDENTITÉ (Visible on step 1 on mobile, always on desktop)
                ============================================================ */}
            <div className={`space-y-4 ${currentStep !== 1 ? 'hidden sm:block' : ''}`}>
              <div className="hidden sm:flex items-center gap-2 pb-1 border-b" style={{ borderColor: 'var(--wf-border)' }}>
                <User size={15} style={{ color: 'var(--wf-primary)' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--wf-text-secondary)' }}>
                  1. Identité
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="wf-label text-xs">Nom</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--wf-text-tertiary)' }} />
                    <input
                      type="text"
                      value={nom}
                      onChange={(e) => {
                        setNom(e.target.value);
                        if (errors.nom) setErrors((prev) => ({ ...prev, nom: '' }));
                      }}
                      placeholder="Diploh"
                      className="wf-input pl-9 text-xs"
                      style={{
                        borderColor: errors.nom ? 'var(--wf-danger)' : undefined,
                      }}
                    />
                  </div>
                  {errors.nom && (
                    <p className="text-[11px] mt-1 font-semibold" style={{ color: 'var(--wf-danger)' }}>{errors.nom}</p>
                  )}
                </div>

                <div>
                  <label className="wf-label text-xs">Prénom</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--wf-text-tertiary)' }} />
                    <input
                      type="text"
                      value={prenom}
                      onChange={(e) => {
                        setPrenom(e.target.value);
                        if (errors.prenom) setErrors((prev) => ({ ...prev, prenom: '' }));
                      }}
                      placeholder="Junior"
                      className="wf-input pl-9 text-xs"
                      style={{
                        borderColor: errors.prenom ? 'var(--wf-danger)' : undefined,
                      }}
                    />
                  </div>
                  {errors.prenom && (
                    <p className="text-[11px] mt-1 font-semibold" style={{ color: 'var(--wf-danger)' }}>{errors.prenom}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ============================================================
                STEP 2 : COORDONNÉES (Visible on step 2 on mobile, always on desktop)
                ============================================================ */}
            <div className={`space-y-4 ${currentStep !== 2 ? 'hidden sm:block' : ''}`}>
              <div className="hidden sm:flex items-center gap-2 pt-2 pb-1 border-b" style={{ borderColor: 'var(--wf-border)' }}>
                <Phone size={15} style={{ color: 'var(--wf-primary)' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--wf-text-secondary)' }}>
                  2. Coordonnées
                </span>
              </div>

              <div>
                <label className="wf-label text-xs">Numéro de téléphone</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--wf-text-tertiary)' }} />
                  <input
                    type="tel"
                    value={numero}
                    onChange={(e) => {
                      setNumero(e.target.value);
                      if (errors.numero) setErrors((prev) => ({ ...prev, numero: '' }));
                    }}
                    placeholder="+225 07 00 00 00 00"
                    className="wf-input pl-9 text-xs"
                    style={{
                      borderColor: errors.numero ? 'var(--wf-danger)' : undefined,
                    }}
                  />
                </div>
                {errors.numero && (
                  <p className="text-[11px] mt-1 font-semibold" style={{ color: 'var(--wf-danger)' }}>{errors.numero}</p>
                )}
              </div>

              <div>
                <label className="wf-label text-xs">Adresse email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--wf-text-tertiary)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    placeholder="contact@exemple.com"
                    className="wf-input pl-9 text-xs"
                    style={{
                      borderColor: errors.email ? 'var(--wf-danger)' : undefined,
                    }}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] mt-1 font-semibold" style={{ color: 'var(--wf-danger)' }}>{errors.email}</p>
                )}
              </div>
            </div>

            {/* ============================================================
                STEP 3 : SÉCURITÉ (Visible on step 3 on mobile, always on desktop)
                ============================================================ */}
            <div className={`space-y-4 ${currentStep !== 3 ? 'hidden sm:block' : ''}`}>
              <div className="hidden sm:flex items-center gap-2 pt-2 pb-1 border-b" style={{ borderColor: 'var(--wf-border)' }}>
                <Lock size={15} style={{ color: 'var(--wf-primary)' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--wf-text-secondary)' }}>
                  3. Sécurité d'accès
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="wf-label text-xs mb-0">Code PIN numérique</label>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--wf-text-tertiary)' }}>
                    4 à 8 chiffres
                  </span>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--wf-text-tertiary)' }} />
                  <input
                    type={showMdp ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={mdp}
                    onChange={(e) => handleMdpChange(e.target.value)}
                    placeholder="Ex: 849201"
                    maxLength={12}
                    className="wf-input pl-9 pr-10 text-xs font-mono font-bold tracking-widest text-center"
                    style={{
                      borderColor: errors.mdp ? 'var(--wf-danger)' : undefined,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowMdp(!showMdp)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 transition-colors"
                    tabIndex={-1}
                    aria-label={showMdp ? 'Masquer' : 'Afficher'}
                    style={{ color: 'var(--wf-text-tertiary)' }}
                  >
                    {showMdp ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.mdp && (
                  <p className="text-[11px] mt-1 font-semibold" style={{ color: 'var(--wf-danger)' }}>{errors.mdp}</p>
                )}
              </div>

              <div>
                <label className="wf-label text-xs">Confirmer le code PIN</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--wf-text-tertiary)' }} />
                  <input
                    type={showConfirmMdp ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={confirmMdp}
                    onChange={(e) => handleConfirmMdpChange(e.target.value)}
                    placeholder="Répéter le code"
                    maxLength={12}
                    className="wf-input pl-9 pr-10 text-xs font-mono font-bold tracking-widest text-center"
                    style={{
                      borderColor: errors.confirmMdp ? 'var(--wf-danger)' : undefined,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmMdp(!showConfirmMdp)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirmMdp ? 'Masquer' : 'Afficher'}
                    style={{ color: 'var(--wf-text-tertiary)' }}
                  >
                    {showConfirmMdp ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.confirmMdp && (
                  <p className="text-[11px] mt-1 font-semibold" style={{ color: 'var(--wf-danger)' }}>{errors.confirmMdp}</p>
                )}
              </div>
            </div>

            {/* Mobile Navigation Buttons (< 640px) */}
            <div className="sm:hidden pt-3 flex gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevMobile}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold btn-ghost flex items-center justify-center gap-1.5 touch-target"
                >
                  <ArrowLeft size={14} />
                  <span>Précédent</span>
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextMobile}
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

        {/* Footer note */}
        <footer className="mt-6 text-center">
          <p className="text-xs flex items-center justify-center gap-1.5" style={{ color: 'var(--wf-text-tertiary)' }}>
            <ShieldCheck size={14} style={{ color: 'var(--wf-success)' }} />
            <span>Stockage local chiffré & sécurisé</span>
          </p>
        </footer>
      </main>
    </div>
  );
};