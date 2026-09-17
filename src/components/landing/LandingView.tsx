import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bell,
  ChevronDown,
  Fingerprint,
  KeyRound,
  List,
  Lock,
  Mail,
  Menu,
  Phone,
  PiggyBank,
  Plus,
  Shield,
  ShieldCheck,
  Target,
  Wallet,
  X,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useWealth } from '../../context/WealthContext';
import { AdminLoginModal } from '../admin/AdminLoginModal';
import { LegalView } from '../legal/LegalView';

export const LandingView: React.FC = () => {
  const { setIsAuthModalOpen, setAuthModalMode } = useWealth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminLockHovered, setAdminLockHovered] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'terms' | 'privacy' | 'faq'>('terms');
  const [supportEmail, setSupportEmail] = useState('support@wealthflow.app');

  useEffect(() => {
    import('../../services/api').then(({ api }) => {
      api.system.getSettings().then((res) => {
        if (res.success && res.data?.supportEmail) {
          setSupportEmail(res.data.supportEmail);
        }
      }).catch(() => {});
    });
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const features = [
    {
      icon: Wallet,
      title: 'Suivez vos finances',
      description: 'Visualisez vos revenus, dépenses et solde disponible en un coup d\'œil. Tout votre argent, centralisé.',
    },
    {
      icon: Target,
      title: 'Gérez vos budgets',
      description: 'Définissez des plafonds par catégorie. Suivez votre consommation en temps réel et évitez les dépassements.',
    },
    {
      icon: PiggyBank,
      title: 'Construisez votre épargne',
      description: 'Créez des tirelires digitales avec un suivi visuel par cases. Chaque case cochée vous rapproche de votre objectif.',
    },
    {
      icon: BarChart3,
      title: 'Comprenez vos habitudes',
      description: 'Des analyses claires qui répondent à vos questions : où va votre argent ? Comment évoluent vos flux ?',
    },
    {
      icon: Shield,
      title: 'Protégez votre espace',
      description: 'Code PIN, verrouillage instantané, chiffrement local. Vos données financières restent entre vos mains.',
    },
    {
      icon: Bell,
      title: 'Recevez des alertes',
      description: 'Notifications intelligentes sur vos jalons d\'épargne, vos dépassements de budget et vos conseils personnalisés.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Créez votre espace',
      description: 'Inscrivez-vous gratuitement en quelques secondes. Aucune carte bancaire requise.',
      icon: Plus,
    },
    {
      number: '02',
      title: 'Ajoutez vos opérations',
      description: 'Enregistrez vos revenus et dépenses. Mobile Money, banque, espèces — tout est supporté.',
      icon: List,
    },
    {
      number: '03',
      title: 'Comprenez et améliorez',
      description: 'WealthFlow analyse vos flux et vous propose des recommandations concrètes pour mieux gérer.',
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#18181B] antialiased">

      {/* ===== NAVIGATION ===== */}
      <nav className="sticky top-0 z-50 w-full border-b border-[#E8E8E8] bg-white/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <BrandLogo size="sm" showBadge={false} withDarkContainer={false} useOfficialLogo={true} />
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-xs font-semibold text-[#6F6F73] transition-colors">
                Fonctionnalités
              </a>
              <a href="#how-it-works" className="text-xs font-semibold text-[#6F6F73] transition-colors">
                Comment ça marche
              </a>
              <a href="#security" className="text-xs font-semibold text-[#6F6F73] transition-colors">
                Sécurité
              </a>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-2.5">
              <button
                onClick={() => handleOpenAuth('login')}
                className="px-4 py-2 text-xs font-bold text-[#18181B] rounded-lg transition-colors cursor-pointer"
              >
                Se connecter
              </button>
              <button
                onClick={() => handleOpenAuth('register')}
                className="px-4 py-2 bg-[#FF5330] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer active:scale-95"
              >
                Commencer gratuitement
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E8E8E8] bg-white animate-in fade-in duration-150">
            <div className="px-4 py-4 space-y-1">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-semibold text-[#18181B] rounded-lg transition-colors"
              >
                Fonctionnalités
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-semibold text-[#18181B] rounded-lg transition-colors"
              >
                Comment ça marche
              </a>
              <a
                href="#security"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-semibold text-[#18181B] rounded-lg transition-colors"
              >
                Sécurité
              </a>
              <button
                onClick={() => { setMobileMenuOpen(false); setContactModalOpen(true); }}
                className="block w-full text-left px-3 py-2.5 text-sm font-semibold text-[#18181B] rounded-lg transition-colors cursor-pointer"
              >
                Confidentialité &amp; Contact
              </button>
              <div className="pt-3 border-t border-[#F0F0F0] space-y-2">
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="w-full py-2.5 text-sm font-bold text-[#18181B] border border-[#E8E8E8] rounded-xl transition-colors cursor-pointer"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => handleOpenAuth('register')}
                  className="w-full py-2.5 text-sm font-bold text-white bg-[#FF5330] rounded-xl transition-colors cursor-pointer"
                >
                  Commencer gratuitement
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF5330]/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FF5330]/3 rounded-full blur-3xl -ml-40 -mb-40 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-12 sm:pb-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5330]/8 border border-[#FF5330]/15 text-[11px] font-bold text-[#FF5330]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Gestion financière sécurisée</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-black text-[#18181B] tracking-tight leading-[1.1]">
              Prenez le contrôle
              <br />
              <span className="text-[#FF5330]">de votre argent.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-[#6F6F73] leading-relaxed max-w-xl mx-auto">
              WealthFlow vous permet de suivre vos revenus, gérer vos budgets,
              construire votre épargne et comprendre vos habitudes financières —
              tout en un seul endroit.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleOpenAuth('register')}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#FF5330] text-white font-bold text-sm rounded-xl transition-all cursor-pointer active:scale-95 shadow-[0_4px_14px_rgba(255,83,48,0.3)]"
              >
                Commencer gratuitement
              </button>
              <button
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-white border border-[#E8E8E8] text-[#18181B] font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Découvrir WealthFlow</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* App Mockup — compact preview cards */}
          <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
            {/* Dashboard Preview Card */}
            <div className="rounded-2xl sm:rounded-3xl bg-[#18181B] border border-[#27272A] p-4 sm:p-6 shadow-2xl">
              {/* Top bar */}
              <div className="flex items-center justify-between mb-4">
                <BrandLogo size="sm" showBadge={false} withDarkContainer={false} useOfficialLogo={true} />
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF5330] to-[#FF8A65] flex items-center justify-center">
                    <span className="text-[9px] font-black text-white">WF</span>
                  </div>
                </div>
              </div>

              {/* Balance */}
              <div className="mb-4">
                <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">Solde disponible</p>
                <p className="text-xl sm:text-2xl font-black text-white num-tabular">2 450 000 FCFA</p>
              </div>

              {/* Mini stat row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[9px] text-white/50 font-semibold">Entrées</p>
                  <p className="text-xs font-bold text-[#10B981] num-tabular">+1 200 000</p>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[9px] text-white/50 font-semibold">Dépenses</p>
                  <p className="text-xs font-bold text-[#EF4444] num-tabular">-750 000</p>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[9px] text-white/50 font-semibold">Épargne</p>
                  <p className="text-xs font-bold text-[#FF5330] num-tabular">450 000</p>
                </div>
              </div>

              {/* Mini budget bar */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-[10px] text-white/60 mb-1.5">
                  <span>Budget mensuel</span>
                  <span className="font-bold text-[#FF5330]">68% utilisé</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF5330] rounded-full" style={{ width: '68%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-16 sm:py-20 bg-[#F7F7F7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-[11px] font-bold text-[#FF5330] uppercase tracking-wider">Fonctionnalités</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#18181B] tracking-tight">
              Tout ce qu'il faut pour
              <br />
              gérer votre argent.
            </h2>
            <p className="text-sm sm:text-base text-[#6F6F73]">
              WealthFlow combine suivi budgétaire, épargne visuelle et analyses financières dans une interface pensée pour vous.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E8E8] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FF5330]/8 flex items-center justify-center mb-4 group-transition-colors">
                    <Icon className="w-5 h-5 text-[#FF5330]" strokeWidth={2} />
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#18181B] mb-1.5">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-[#6F6F73] leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-[11px] font-bold text-[#FF5330] uppercase tracking-wider">Comment ça marche</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#18181B] tracking-tight">
              Trois étapes pour commencer.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FF5330]/8">
                    <Icon className="w-5 h-5 text-[#FF5330]" strokeWidth={2} />
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-[#A1A1AA] tracking-widest">{step.number}</span>
                    <h3 className="font-extrabold text-base sm:text-lg text-[#18181B] mt-1">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-[#6F6F73] leading-relaxed mt-2 max-w-xs mx-auto">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== SECURITY ===== */}
      <section id="security" className="py-16 sm:py-20 bg-[#18181B]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
            {/* Left: Content */}
            <div className="space-y-6">
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-[#FF5330] uppercase tracking-wider">Sécurité</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                  Vos données restent entre vos mains.
                </h2>
                <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                  WealthFlow prend la sécurité au sérieux. Chiffrement local, code PIN et verrouillage instantané protègent vos informations financières.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    icon: Lock,
                    title: 'Verrouillage rapide',
                    desc: 'Un clic sur le cadenas verrouille instantanément l\'application.',
                  },
                  {
                    icon: KeyRound,
                    title: 'Code PIN personnalisé',
                    desc: 'Protégez l\'accès à votre espace avec un code PIN à 4 chiffres.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Données chiffrées',
                    desc: 'Vos informations sont stockées localement avec chiffrement AES-256.',
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-9 h-9 rounded-lg bg-[#FF5330]/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#FF5330]" strokeWidth={2} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{item.title}</h4>
                        <p className="text-xs text-white/50 leading-relaxed mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative flex justify-center">
              <div className="w-full max-w-sm rounded-3xl bg-[#121214] border border-white/10 p-6 space-y-5">
                {/* Lock screen mockup */}
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#121214] border border-[#27272A] flex items-center justify-center mx-auto p-2">
                    <BrandLogo size="sm" showBadge={false} withDarkContainer={false} useOfficialLogo={true} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Bonjour, Junior</p>
                    <p className="text-xs text-white/50">Application verrouillée</p>
                  </div>
                </div>

                {/* PIN dots */}
                <div className="flex items-center justify-center gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${i < 3 ? 'bg-[#FF5330]' : 'bg-white/20 border border-white/30'}`}
                    />
                  ))}
                </div>

                {/* Keypad mockup */}
                <div className="grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                    <div key={d} className="h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 text-sm font-bold">
                      {d}
                    </div>
                  ))}
                  <div className="h-10 rounded-xl bg-[#FF5330]/20 border border-[#FF5330]/40 flex items-center justify-center">
                    <Fingerprint className="w-4 h-4 text-[#FF5330]" />
                  </div>
                  <div className="h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 text-sm font-bold">
                    0
                  </div>
                  <div className="h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-white/40" />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[10px] text-white/30">Chiffrement local AES-256</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#18181B] tracking-tight">
            Prêt à mieux gérer
            <br />
            <span className="text-[#FF5330]">votre argent ?</span>
          </h2>
          <p className="text-sm sm:text-base text-[#6F6F73] max-w-md mx-auto">
            Rejoignez WealthFlow et commencez à prendre des décisions financières éclairées, dès aujourd'hui.
          </p>
          <button
            onClick={() => handleOpenAuth('register')}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#FF5330] text-white font-bold text-sm rounded-xl transition-all cursor-pointer active:scale-95 shadow-[0_4px_14px_rgba(255,83,48,0.3)]"
          >
            <span>Commencer gratuitement</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[#E8E8E8] bg-[#F7F7F7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <div className="mb-3">
                <BrandLogo size="sm" showBadge={false} withDarkContainer={false} useOfficialLogo={true} />
              </div>
              <p className="text-xs text-[#6F6F73] leading-relaxed max-w-xs">
                Gestion financière personnelle simple, sécurisée et efficace.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-bold text-[#18181B] uppercase tracking-wider mb-3">Produit</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-xs text-[#6F6F73] transition-colors">Fonctionnalités</a></li>
                <li><a href="#how-it-works" className="text-xs text-[#6F6F73] transition-colors">Comment ça marche</a></li>
                <li><a href="#security" className="text-xs text-[#6F6F73] transition-colors">Sécurité</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-bold text-[#18181B] uppercase tracking-wider mb-3">Légal</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => { setLegalTab('terms'); setLegalModalOpen(true); }}
                    className="text-xs text-[#6F6F73] hover:text-[#FF5330] transition-colors cursor-pointer text-left"
                  >
                    Conditions d'utilisation
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { setLegalTab('privacy'); setLegalModalOpen(true); }}
                    className="text-xs text-[#6F6F73] hover:text-[#FF5330] transition-colors cursor-pointer text-left"
                  >
                    Politique de confidentialité
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { setLegalTab('faq'); setLegalModalOpen(true); }}
                    className="text-xs font-bold text-[#FF5330] hover:underline transition-colors cursor-pointer text-left"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-xs font-bold text-[#18181B] uppercase tracking-wider mb-3">Aide</h4>
              <ul className="space-y-2">
                <li><span className="text-xs text-[#6F6F73]">Centre d'aide</span></li>
                <li>
                  <button
                    onClick={() => setContactModalOpen(true)}
                    className="text-xs text-[#6F6F73] hover:text-[#FF5330] transition-colors cursor-pointer"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-6 border-t border-[#E8E8E8] flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-[#A1A1AA]">
              &copy; {new Date().getFullYear()} WealthFlow. Tous droits réservés.
            </p>
            <div className="flex items-center gap-3">
              <p className="text-[11px] text-[#A1A1AA]">
                Conçu avec soin pour votre finances.
              </p>
              {/* Cadenas admin — visible seulement au hover, discret */}
              <button
                onMouseEnter={() => setAdminLockHovered(true)}
                onMouseLeave={() => setAdminLockHovered(false)}
                onClick={() => setAdminLoginOpen(true)}
                title=""
                aria-label="Accès restreint"
                className="group relative flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200 cursor-pointer"
              >
                <Lock
                  className={`w-3 h-3 transition-all duration-200 ${
                    adminLockHovered ? 'text-[#A1A1AA]' : 'text-[#E8E8E8]'
                  }`}
                />
                {/* Tooltip au hover */}
                {adminLockHovered && (
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md bg-[#18181B] text-white text-[9px] font-bold pointer-events-none">
                    Admin
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal connexion admin */}
      {adminLoginOpen && (
        <AdminLoginModal onClose={() => setAdminLoginOpen(false)} />
      )}

      {/* ===== MODAL CONTACT ===== */}
      {contactModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setContactModalOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Card */}
          <div
            className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E8E8E8] p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FF5330] flex items-center justify-center shadow-sm">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#18181B] tracking-tight">Nous contacter</h2>
                  <p className="text-xs text-[#6F6F73]">Support WealthFlow — disponible 7j/7</p>
                </div>
              </div>
              <button
                onClick={() => setContactModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#F7F7F7] hover:bg-[#EAEAEA] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[#52525B]" />
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-[#F0F0F0]" />

            {/* Contacts */}
            <div className="space-y-3">
              {/* Email */}
              <a
                href={`mailto:${supportEmail}`}
                className="flex items-center gap-4 p-4 rounded-2xl bg-[#F7F7F7] hover:bg-[#EAEAEA] border border-[#E8E8E8] transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E8E8] flex items-center justify-center shadow-sm flex-shrink-0">
                  <Mail className="w-5 h-5 text-[#FF5330]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Email</p>
                  <p className="text-sm font-bold text-[#18181B] group-hover:text-[#FF5330] transition-colors truncate">{supportEmail}</p>
                </div>
              </a>

              {/* Téléphone 1 */}
              <a
                href="tel:0566472284"
                className="flex items-center gap-4 p-4 rounded-2xl bg-[#F7F7F7] hover:bg-[#EAEAEA] border border-[#E8E8E8] transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E8E8] flex items-center justify-center shadow-sm flex-shrink-0">
                  <Phone className="w-5 h-5 text-[#10B981]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Téléphone 1</p>
                  <p className="text-sm font-bold text-[#18181B] group-hover:text-[#FF5330] transition-colors">05 66 4 72 84</p>
                </div>
              </a>

              {/* Téléphone 2 */}
              <a
                href="tel:0575597126"
                className="flex items-center gap-4 p-4 rounded-2xl bg-[#F7F7F7] hover:bg-[#EAEAEA] border border-[#E8E8E8] transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E8E8] flex items-center justify-center shadow-sm flex-shrink-0">
                  <Phone className="w-5 h-5 text-[#10B981]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Téléphone 2</p>
                  <p className="text-sm font-bold text-[#18181B] group-hover:text-[#FF5330] transition-colors">0575597126</p>
                </div>
              </a>
            </div>

            {/* Footer note */}
            <p className="text-center text-[11px] text-[#A1A1AA]">
              Notre équipe répond généralement en moins de 24h.
            </p>
          </div>
        </div>
      )}

      {/* ===== MODAL LÉGAL & FAQ ===== */}
      {legalModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
          onClick={() => setLegalModalOpen(false)}
        >
          <div
            className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#E8E8E8] max-h-[90vh] overflow-y-auto p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLegalModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#6F6F73] hover:text-[#18181B] transition-colors cursor-pointer z-10"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
            <LegalView initialTab={legalTab} />
          </div>
        </div>
      )}
    </div>
  );
};
