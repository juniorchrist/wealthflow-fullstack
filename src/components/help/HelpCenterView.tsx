import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Headphones,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Send,
  Shield,
  ShieldAlert,
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { api } from '../../services/api';
import { BrandLogo } from '../common/BrandLogo';

export const HelpCenterView: React.FC = () => {
  const { setActiveTab, userProfile, isAuthenticated } = useWealth();

  const [activeSubTab, setActiveSubTab] = useState<'contact' | 'ban-check'>('contact');

  // État formulaire de contact
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    subject: '',
    category: 'technique',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // État vérification de bannissement
  const [searchEmail, setSearchEmail] = useState(userProfile?.email || '');
  const [isCheckingBan, setIsCheckingBan] = useState(false);
  const [banResult, setBanResult] = useState<{
    searched: boolean;
    isBanned: boolean;
    reason?: string;
    bannedAt?: string;
    bannedBy?: string;
    message?: string;
  } | null>(null);


  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setSubmitError('Veuillez remplir tous les champs du formulaire.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const res = await api.support.createTicket({
        ...formData,
        userId: userProfile?.id,
      });

      if (res.success) {
        setSubmitSuccess(res.message || 'Votre message a bien été envoyé !');
        setFormData({
          name: userProfile?.name || '',
          email: userProfile?.email || '',
          subject: '',
          category: 'technique',
          message: '',
        });
      } else {
        setSubmitError(res.message || "Erreur lors de l'envoi de votre message.");
      }
    } catch {
      setSubmitError("Impossible d'envoyer votre message pour le moment. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail || !searchEmail.includes('@')) {
      return;
    }

    setIsCheckingBan(true);
    setBanResult(null);

    try {
      const res = await api.support.checkBan(searchEmail);
      if (res.success && res.data) {
        setBanResult({
          searched: true,
          isBanned: Boolean(res.data.isBanned),
          reason: res.data.reason,
          bannedAt: res.data.bannedAt,
          bannedBy: res.data.bannedBy,
          message: res.data.message,
        });
      } else {
        setBanResult({
          searched: true,
          isBanned: false,
          message: 'Aucun enregistrement de suspension trouvé pour cette adresse email.',
        });
      }
    } catch {
      setBanResult({
        searched: true,
        isBanned: false,
        message: 'Erreur lors de la vérification. Veuillez réessayer.',
      });
    } finally {
      setIsCheckingBan(false);
    }
  };

  const startAppealForBanned = () => {
    setActiveSubTab('contact');
    setFormData((prev) => ({
      ...prev,
      email: searchEmail,
      subject: `Recours - Compte suspendu (${searchEmail})`,
      category: 'compte_banni',
      message: `Bonjour,\n\nJe souhaite contester la suspension de mon compte liée au motif : "${banResult?.reason}".\n\nExplications complémentaires :\n`,
    }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6 select-none animate-in fade-in duration-300">
      
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
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#18181B] to-[#3F3F46] flex items-center justify-center text-white shadow-sm">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
              Centre d'Aide & Assistance
            </h1>
            <p className="text-xs text-[#71717A]">
              Support technique et motifs de suspension
            </p>
          </div>
        </div>

        {/* Canaux directs */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[11px] font-bold text-[#15803D]">Support en ligne</span>
          </div>
        </div>
      </div>

      {/* Navigation interne */}
      <div className="flex items-center gap-2 border-b border-[#E8E8E8] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('contact')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'contact'
              ? 'bg-[#18181B] text-white'
              : 'bg-[#F7F7F7] text-[#71717A] hover:bg-[#EAEAEA]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Faire part d'un souci (Support)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ban-check')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'ban-check'
              ? 'bg-[#EF4444] text-white'
              : 'bg-[#F7F7F7] text-[#71717A] hover:bg-[#EAEAEA]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Statut du compte & Motif réel</span>
        </button>
      </div>

      {/* ─── ONGLET 1 : CONTACT / ASSISTANCE ─── */}
      {activeSubTab === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-[#E8E8E8] p-5 sm:p-7 shadow-xs">
            <h2 className="text-base font-bold text-[#18181B] mb-1">
              Envoyer un message à l'équipe technique
            </h2>
            <p className="text-xs text-[#71717A] mb-5">
              Un bug sur le site, une difficulté d'accès ou une question sur votre compte ? Décrivez votre situation et nous vous répondrons dans les plus brefs délais.
            </p>

            {submitSuccess && (
              <div className="mb-5 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-3 text-xs text-[#15803D]">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#10B981]" />
                <div>
                  <p className="font-bold">Message envoyé avec succès !</p>
                  <p className="mt-0.5">{submitSuccess}</p>
                </div>
              </div>
            )}

            {submitError && (
              <div className="mb-5 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-3 text-xs text-[#B91C1C]">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-[#EF4444]" />
                <div>
                  <p className="font-bold">Impossible d'envoyer le message</p>
                  <p className="mt-0.5">{submitError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#71717A] uppercase mb-1.5">
                    Votre nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Jean Dupont"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] text-xs font-semibold text-[#18181B] focus:bg-white focus:border-[#18181B] focus:outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#71717A] uppercase mb-1.5">
                    Votre adresse email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jean.dupont@email.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] text-xs font-semibold text-[#18181B] focus:bg-white focus:border-[#18181B] focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#71717A] uppercase mb-1.5">
                    Catégorie du problème
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] text-xs font-semibold text-[#18181B] focus:bg-white focus:border-[#18181B] focus:outline-none transition-all"
                  >
                    <option value="technique">Bug ou problème technique</option>
                    <option value="compte_banni">Recours suite à suspension/bannissement</option>
                    <option value="securite">Sécurité et code PIN</option>
                    <option value="facturation">Plan & Fonctionnalités</option>
                    <option value="autre">Autre demande</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#71717A] uppercase mb-1.5">
                    Objet de votre demande
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Ex: Problème d'affichage de mon graphique..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] text-xs font-semibold text-[#18181B] focus:bg-white focus:border-[#18181B] focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#71717A] uppercase mb-1.5">
                  Description détaillée de votre situation
                </label>
                <textarea
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Expliquez ici ce qui s'est passé, les messages d'erreur rencontrés ou vos arguments..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] text-xs font-medium text-[#18181B] focus:bg-white focus:border-[#18181B] focus:outline-none transition-all resize-y"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Transmission en cours...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer mon message au support</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Colonne latérale Infos */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#F7F7F7] border border-[#E8E8E8] p-5 space-y-4">
              <h3 className="text-xs font-bold text-[#18181B] uppercase tracking-wider">
                Coordonnées de l'assistance
              </h3>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E8E8E8] flex items-center justify-center text-[#18181B] flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#71717A]">Email du support</p>
                  <p className="text-xs font-bold text-[#18181B]">support@wealthflow.app</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E8E8E8] flex items-center justify-center text-[#18181B] flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#71717A]">Ligne d'assistance directe</p>
                  <p className="text-xs font-bold text-[#18181B]">+225 05 55 47 24 21</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8E8E8]">
                <p className="text-[11px] text-[#71717A] leading-relaxed">
                  Notre équipe examine les tickets et les demandes de recours du lundi au samedi de 08h00 à 20h00 GMT.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── ONGLET 2 : VÉRIFICATION STATUT & MOTIF RÉEL ─── */}
      {activeSubTab === 'ban-check' && (
        <div className="max-w-2xl mx-auto rounded-2xl bg-white border border-[#E8E8E8] p-5 sm:p-7 space-y-5 shadow-xs">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[#18181B]">
              Consultation des motifs de suspension de compte
            </h2>
            <p className="text-xs text-[#71717A] mt-1">
              Si votre compte a été supprimé ou bloqué par l'administration, vous pouvez saisir ici votre adresse email pour connaître la <strong>raison réelle et officielle</strong> de la sanction.
            </p>
          </div>

          <form onSubmit={handleCheckBan} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3" />
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Entrez l'adresse email de votre compte..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] text-xs font-semibold text-[#18181B] focus:bg-white focus:border-[#18181B] focus:outline-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isCheckingBan}
              className="px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCheckingBan ? 'Recherche...' : 'Vérifier mon statut'}
            </button>
          </form>

          {/* Résultat */}
          {banResult && banResult.searched && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              {banResult.isBanned ? (
                <div className="rounded-2xl bg-[#FEF2F2] border border-[#FECACA] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse" />
                      <span className="text-xs font-bold text-[#991B1B] uppercase tracking-wide">
                        Statut : Compte Suspendu / Banni
                      </span>
                    </div>
                    {banResult.bannedAt && (
                      <span className="text-[11px] text-[#7F1D1D] font-medium">
                        Le {new Date(banResult.bannedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-[#FCA5A5] space-y-2">
                    <p className="text-[11px] font-bold text-[#7F1D1D] uppercase">
                      Motif réel enregistré par l'administrateur :
                    </p>
                    <p className="text-xs font-semibold text-[#18181B] leading-relaxed bg-[#FFF1F2] p-3 rounded-lg border border-[#FFE4E6]">
                      « {banResult.reason} »
                    </p>
                    {banResult.bannedBy && (
                      <p className="text-[10px] text-[#991B1B]">
                        Sanction prononcée par : <strong>{banResult.bannedBy}</strong>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <p className="text-xs text-[#991B1B]">
                      Vous estimez qu'il s'agit d'une erreur ?
                    </p>
                    <button
                      onClick={startAppealForBanned}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Formuler un recours maintenant</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] p-5 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#15803D]">
                      Aucune mesure disciplinaire enregistrée
                    </p>
                    <p className="text-xs text-[#166534]">
                      L'adresse <strong>{searchEmail}</strong> ne figure pas sur le registre des comptes suspendus. Vous pouvez vous connecter normalement.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};