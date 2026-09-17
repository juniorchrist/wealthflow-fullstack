import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, FileText, HelpCircle, Lock, Printer, Shield, Sparkles } from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { api } from '../../services/api';

export const LegalView: React.FC = () => {
  const { setActiveTab, isAuthenticated, addNotification } = useWealth();

  const [activeTabLegal, setActiveTabLegal] = useState<'terms' | 'privacy' | 'faq'>('terms');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [terms, setTerms] = useState<string>('');
  const [privacy, setPrivacy] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // FAQ Content
  const FAQ_ITEMS = [
    {
      q: "Comment fonctionne le code PIN et le verrouillage de l'application ?",
      a: "Vous pouvez configurer un code PIN à 4 chiffres dans 'Sécurité & PIN'. Une fois activé, l'application se verrouille automatiquement après votre délai d'inactivité configuré (ex: 15 min), ou immédiatement en cliquant sur le cadenas dans le menu.",
    },
    {
      q: "Mes données financières sont-elles sécurisées ?",
      a: "Absolument. Vos identifiants sont chiffrés avec les normes bancaires de l'industrie (bcrypt, TLS/HTTPS). Vos données ne sont jamais partagées ni vendues à des services publicitaires tiers.",
    },
    {
      q: "Mon compte a été suspendu ou supprimé. Que faire ?",
      a: "Rendez-vous dans le Centre d'aide, onglet 'Statut du compte'. Entrez votre email pour voir la raison exacte de la décision de l'administrateur. Vous pourrez ensuite envoyer un message de recours via le formulaire de contact.",
    },
    {
      q: "Comment exporter toutes mes données et transactions ?",
      a: "Vous pouvez télécharger l'intégralité de vos comptes, transactions et objectifs sous format JSON depuis l'onglet 'Paramètres' en bas de page.",
    },
    {
      q: "Que faire en cas d'erreur lors de l'enregistrement d'une opération ?",
      a: "Vérifiez votre connexion internet. Si le serveur Render s'est mis en veille, patientez une vingtaine de secondes puis réessayez. Si le problème persiste, écrivez-nous via le formulaire du Centre d'aide.",
    },
  ];

  useEffect(() => {
    let isMounted = true;
    api.system.getSettings().then((res) => {
      if (!isMounted) return;
      if (res.success && res.data) {
        const termsContent = res.data.termsOfService || '';
        const privacyContent = res.data.privacyPolicy || '';
        setTerms(termsContent);
        setPrivacy(privacyContent);
        if (res.data.updatedAt) {
          const formattedDate = new Date(res.data.updatedAt).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          });
          setUpdatedAt(formattedDate);

          // Pousser une notification unique par version des documents légaux
          const flagKey = `wf_legal_notif_${res.data.updatedAt}`;
          if (!localStorage.getItem(flagKey) && (termsContent || privacyContent)) {
            addNotification({
              title: '📜 Documents légaux mis à jour',
              message: `Les Conditions Générales d'Utilisation (CGU), la Politique de Confidentialité et le RGPD ont été mis à jour le ${formattedDate}. Consultez-les dans la section Légal.`,
              date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
              read: false,
              type: 'info',
            });
            localStorage.setItem(flagKey, '1');
          }
        }
      }
      setLoading(false);
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const renderContent = (content: string) => {
    if (!content) {
      return (
        <p className="text-xs text-[#71717A] italic">
          Ce document est en cours de mise à jour par l'administration de WealthFlow.
        </p>
      );
    }

    // Découpage simple des paragraphes et titres markdown
    const lines = content.split('\n');
    return (
      <div className="space-y-3 text-xs sm:text-sm text-[#27272A] leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('# ')) {
            return (
              <h2 key={idx} className="text-lg sm:text-xl font-black text-[#18181B] mt-4 mb-2">
                {trimmed.replace('# ', '')}
              </h2>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={idx} className="text-sm sm:text-base font-bold text-[#18181B] mt-3 mb-1">
                {trimmed.replace('## ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-xs sm:text-sm font-bold text-[#18181B] mt-2 mb-1">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <li key={idx} className="ml-4 list-disc text-[#3F3F46]">
                {trimmed.replace(/^[-*]\s+/, '')}
              </li>
            );
          }
          if (/^\d+\.\s/.test(trimmed)) {
            return (
              <li key={idx} className="ml-4 list-decimal text-[#3F3F46]">
                {trimmed.replace(/^\d+\.\s+/, '')}
              </li>
            );
          }
          if (trimmed === '') {
            return <div key={idx} className="h-2" />;
          }
          return <p key={idx}>{trimmed}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 select-none animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8E8E8]">
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-9 h-9 rounded-xl bg-[#F7F7F7] hover:bg-[#EAEAEA] border border-[#E8E8E8] flex items-center justify-center text-[#52525B] transition-colors cursor-pointer"
              title="Retour au tableau de bord"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-10 h-10 rounded-2xl bg-[#18181B] flex items-center justify-center text-white shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
              Informations Légales & Conformité
            </h1>
            <p className="text-xs text-[#71717A]">
              Règles d'utilisation et protection de vos données définies par l'administration
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-3.5 py-2 rounded-xl bg-[#F7F7F7] hover:bg-[#EAEAEA] border border-[#E8E8E8] text-xs font-bold text-[#18181B] flex items-center gap-2 cursor-pointer transition-colors self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Imprimer</span>
        </button>
      </div>

      {/* Onglets de sélection */}
      <div className="flex items-center gap-2 border-b border-[#E8E8E8] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTabLegal('terms')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
            activeTabLegal === 'terms'
              ? 'bg-[#18181B] text-white shadow-xs'
              : 'bg-[#F7F7F7] text-[#71717A] hover:bg-[#EAEAEA]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Conditions d'Utilisation</span>
        </button>

        <button
          onClick={() => setActiveTabLegal('privacy')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
            activeTabLegal === 'privacy'
              ? 'bg-[#18181B] text-white shadow-xs'
              : 'bg-[#F7F7F7] text-[#71717A] hover:bg-[#EAEAEA]'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Politique de Confidentialité</span>
        </button>

        <button
          onClick={() => setActiveTabLegal('faq')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
            activeTabLegal === 'faq'
              ? 'bg-[#FF5330] text-white shadow-xs'
              : 'bg-[#F7F7F7] text-[#71717A] hover:bg-[#EAEAEA]'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>FAQ</span>
        </button>
      </div>

      {/* Carte du contenu légal */}
      <div className="rounded-2xl bg-white border border-[#E8E8E8] p-6 sm:p-8 shadow-xs">
        {loading && activeTabLegal !== 'faq' ? (
          <div className="py-12 text-center text-xs text-[#71717A]">
            Chargement des dispositions légales officielles...
          </div>
        ) : (
          <div>
            {activeTabLegal === 'faq' ? (
              <div className="space-y-3">
                <div className="pb-4 mb-5 border-b border-[#F4F4F5]">
                  <h2 className="text-lg font-black text-[#18181B] mb-1">
                    Foire Aux Questions (FAQ)
                  </h2>
                  <p className="text-xs text-[#71717A]">
                    Réponses aux questions les plus courantes sur WealthFlow
                  </p>
                </div>

                {FAQ_ITEMS.map((item, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left font-bold text-xs sm:text-sm text-[#18181B] hover:bg-[#F0F0F0] transition-colors cursor-pointer"
                      >
                        <span>{item.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#71717A] flex-shrink-0 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-3.5 pt-1 text-xs text-[#52525B] leading-relaxed border-t border-[#E8E8E8] bg-white">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#F4F4F5]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">
                      Version officielle en vigueur
                    </span>
                  </div>
                  {updatedAt && (
                    <span className="text-[11px] text-[#A1A1AA]">
                      Dernière mise à jour : {updatedAt}
                    </span>
                  )}
                </div>

                {activeTabLegal === 'terms' ? renderContent(terms) : renderContent(privacy)}
              </>
            )}
          </div>
        )}
      </div>

      {/* Notice de bas de page */}
      <div className="rounded-2xl bg-[#F7F7F7] border border-[#E8E8E8] p-4 text-center text-[11px] text-[#71717A]">
        Ces règles sont éditées et maintenues directement par l'administrateur de la plateforme WealthFlow. Pour toute question, utilisez le Centre d'aide.
      </div>
    </div>
  );
};
