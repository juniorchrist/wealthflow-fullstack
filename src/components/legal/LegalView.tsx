import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Lock, Printer, Shield, Sparkles } from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { api } from '../../services/api';

export const LegalView: React.FC = () => {
  const { setActiveTab, isAuthenticated } = useWealth();

  const [activeTabLegal, setActiveTabLegal] = useState<'terms' | 'privacy'>('terms');
  const [terms, setTerms] = useState<string>('');
  const [privacy, setPrivacy] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.system.getSettings().then((res) => {
      if (!isMounted) return;
      if (res.success && res.data) {
        setTerms(res.data.termsOfService || '');
        setPrivacy(res.data.privacyPolicy || '');
        if (res.data.updatedAt) {
          setUpdatedAt(
            new Date(res.data.updatedAt).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })
          );
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
      <div className="flex items-center gap-2 border-b border-[#E8E8E8] pb-1">
        <button
          onClick={() => setActiveTabLegal('terms')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTabLegal === 'terms'
              ? 'bg-[#18181B] text-white shadow-xs'
              : 'bg-[#F7F7F7] text-[#71717A] hover:bg-[#EAEAEA]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Conditions Générales d'Utilisation (CGU)</span>
        </button>

        <button
          onClick={() => setActiveTabLegal('privacy')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTabLegal === 'privacy'
              ? 'bg-[#18181B] text-white shadow-xs'
              : 'bg-[#F7F7F7] text-[#71717A] hover:bg-[#EAEAEA]'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Politique de Confidentialité</span>
        </button>
      </div>

      {/* Carte du contenu légal */}
      <div className="rounded-2xl bg-white border border-[#E8E8E8] p-6 sm:p-8 shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#71717A]">
            Chargement des dispositions légales officielles...
          </div>
        ) : (
          <div>
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
