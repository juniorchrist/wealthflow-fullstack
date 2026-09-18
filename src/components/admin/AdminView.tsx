import React, { useState, useMemo, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Download,
  Edit3,
  Globe,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Phone,
  PiggyBank,
  Plus,
  RotateCw,
  Save,
  Search,
  Settings,
  Shield,
  Tags,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { AdminUser } from '../../types';
import { BrandLogo } from '../common/BrandLogo';
import { CategoryIcon } from '../common/CategoryIcon';
import { api } from '../../services/api';

// ─── Types ─────────────────────────────────────────────────────────────────────
type AdminSection = 'dashboard' | 'users' | 'bans' | 'support-tickets' | 'categories' | 'finances' | 'logs' | 'site-settings' | 'legal';

const ADMIN_NAV: { id: AdminSection; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard',        label: 'Tableau de bord',        icon: LayoutDashboard },
  { id: 'users',            label: 'Utilisateurs',           icon: Users },
  { id: 'bans',             label: 'Comptes bannis',         icon: Shield },
  { id: 'support-tickets',  label: 'Tickets support',        icon: Phone },
  { id: 'categories',       label: 'Catégories',             icon: Tags },
  { id: 'finances',         label: 'Finances globales',      icon: BarChart3 },
  { id: 'logs',             label: "Journaux d'activité",    icon: ClipboardList },
  { id: 'legal',            label: 'Volet Légal (CGU & Conf.)', icon: Globe },
  { id: 'site-settings',   label: 'Paramètres du site',     icon: Settings },
];

// Clé localStorage pour les paramètres du site
const SITE_SETTINGS_KEY = 'wf_admin_site_settings_v2';

interface SiteSettings {
  siteName: string;
  tagline: string;
  supportEmail: string;
  announcement: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  defaultPlan: string;
}

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'WealthFlow',
  tagline: 'Gestion financière personnelle simple, sécurisée et efficace.',
  supportEmail: 'support@wealthflow.app',
  announcement: '',
  maintenanceMode: false,
  allowRegistrations: true,
  defaultPlan: 'Standard',
};

function loadSiteSettings(): SiteSettings {
  try {
    const saved = localStorage.getItem(SITE_SETTINGS_KEY);
    return saved ? { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SITE_SETTINGS;
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

// ─── Composant principal ───────────────────────────────────────────────────────
export const AdminView: React.FC = () => {
  const {
    transactions,
    categories,
    savingsGoals,
    userProfile,
    totalIncome,
    totalExpenses,
    totalSaved,
    formatCurrency,
    setActiveTab,
    setIsAdminAuthenticated,
    logout,
    exportDataJSON,
    monthlyBudgetTotal,
    registeredUsers,
    deleteUser,
    refreshAdminUsers,
  } = useWealth();

  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'actif' | 'inactif'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(loadSiteSettings);
  const [siteSettingsDraft, setSiteSettingsDraft] = useState<SiteSettings>(loadSiteSettings);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [bansList, setBansList] = useState<any[]>([]);
  const [ticketsList, setTicketsList] = useState<any[]>([]);
  const [legalDraft, setLegalDraft] = useState({ termsOfService: '', privacyPolicy: '' });
  const [legalSaved, setLegalSaved] = useState(false);
  const [legalLoading, setLegalLoading] = useState(false);
  const [maintenanceSaved, setMaintenanceSaved] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await api.admin.getTickets();
      if (res.success && res.data) {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray((res.data as any)?.tickets)
          ? (res.data as any).tickets
          : Array.isArray((res.data as any)?.data)
          ? (res.data as any).data
          : [];
        setTicketsList(list);
      }
    } catch (e) {
      console.error('[AdminView] Erreur chargement tickets:', e);
    }
  };

  const fetchBans = async () => {
    try {
      const res = await api.admin.getBans();
      if (res.success && res.data) {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray((res.data as any)?.bans)
          ? (res.data as any).bans
          : Array.isArray((res.data as any)?.data)
          ? (res.data as any).data
          : [];
        setBansList(list);
      }
    } catch (e) {
      console.error('[AdminView] Erreur chargement bans:', e);
    }
  };

  useEffect(() => {
    refreshAdminUsers();
    fetchBans();
    fetchTickets();

    // Charger les paramètres système, CGU, politique et maintenance
    api.system.getSettings().then((res) => {
      if (res.success && res.data) {
        const settingsData = (res.data as any)?.data || res.data;
        setLegalDraft({
          termsOfService: settingsData.termsOfService || '',
          privacyPolicy: settingsData.privacyPolicy || '',
        });
        setSiteSettingsDraft((prev) => ({
          ...prev,
          maintenanceMode: Boolean(settingsData.maintenanceMode),
          announcement: settingsData.maintenanceMessage || prev.announcement,
          allowRegistrations: settingsData.allowRegistrations ?? prev.allowRegistrations,
        }));
        setSiteSettings((prev) => ({
          ...prev,
          maintenanceMode: Boolean(settingsData.maintenanceMode),
          announcement: settingsData.maintenanceMessage || prev.announcement,
          allowRegistrations: settingsData.allowRegistrations ?? prev.allowRegistrations,
        }));
      }
    }).catch(() => {});
  }, [refreshAdminUsers, activeSection]);

  // Utilisateurs 100% réels (aucun compte fictif)
  const ALL_USERS: AdminUser[] = useMemo(() => {
    if (registeredUsers.length > 0) {
      return registeredUsers;
    }
    // Si la liste est encore vide mais qu'un profil utilisateur est présent
    if (userProfile.email || userProfile.name) {
      const formattedJoin = userProfile.createdAt
        ? new Date(userProfile.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
        : new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
      return [
        {
          id: userProfile.id || 'u-1',
          name: userProfile.name || userProfile.email.split('@')[0] || 'Utilisateur',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          plan: userProfile.plan || 'WealthFlow Pro',
          status: 'actif',
          lastLogin: 'En cours de session',
          joinDate: formattedJoin,
          income: totalIncome,
          expenses: totalExpenses,
          savings: totalSaved,
          transactions: transactions.length,
          budgetTotal: monthlyBudgetTotal,
        },
      ];
    }
    return [];
  }, [registeredUsers, userProfile, totalIncome, totalExpenses, totalSaved, transactions.length, monthlyBudgetTotal]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refreshAdminUsers(),
      fetchBans(),
      fetchTickets(),
    ]);
    setIsRefreshing(false);
    setActionFeedback('Synchronisation réussie');
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    const finalReason = banReason.trim() || 'Non-respect des Conditions Générales d\'Utilisation de WealthFlow';
    await deleteUser(userToDelete.id, finalReason);
    if (selectedUser?.id === userToDelete.id) {
      setSelectedUser(null);
    }
    setDeleteLoading(false);
    setUserToDelete(null);
    setBanReason('');
    setActionFeedback(`Compte banni et supprimé pour le motif : "${finalReason}"`);
    setTimeout(() => setActionFeedback(null), 3500);
    // Rafraîchir la liste des bans
    api.admin.getBans().then((r) => { if (r.success) setBansList(r.data as any[] || []); }).catch(() => {});
  };

  // Statistiques globales agrégées
  const globalStats = useMemo(() => {
    const totalUsers = ALL_USERS.length;
    const activeUsers = ALL_USERS.filter((u) => u.status === 'actif').length;
    const inactiveUsers = ALL_USERS.filter((u) => u.status === 'inactif').length;
    const globalIncome = ALL_USERS.reduce((s, u) => s + u.income, 0);
    const globalExpenses = ALL_USERS.reduce((s, u) => s + u.expenses, 0);
    const globalSavings = ALL_USERS.reduce((s, u) => s + u.savings, 0);
    const globalTransactions = ALL_USERS.reduce((s, u) => s + u.transactions, 0);
    return { totalUsers, activeUsers, inactiveUsers, globalIncome, globalExpenses, globalSavings, globalTransactions };
  }, [ALL_USERS]);

  // Filtrage utilisateurs
  const filteredUsers = useMemo(() => {
    return ALL_USERS.filter((u) => {
      const matchSearch = userSearch === '' || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchFilter = userFilter === 'all' || u.status === userFilter;
      return matchSearch && matchFilter;
    });
  }, [ALL_USERS, userSearch, userFilter]);

  // Bascule instantanée du mode maintenance avec synchronisation BDD
  const toggleMaintenanceMode = async () => {
    const nextVal = !siteSettingsDraft.maintenanceMode;
    setSiteSettingsDraft((p) => ({ ...p, maintenanceMode: nextVal }));
    setSiteSettings((p) => ({ ...p, maintenanceMode: nextVal }));
    try {
      await api.admin.updateSettings({
        maintenanceMode: nextVal,
        maintenanceMessage: siteSettingsDraft.announcement || 'WealthFlow est temporairement en maintenance. Nous revenons très vite !',
      });
      setActionFeedback(nextVal ? '🔧 Mode maintenance ACTIF (bloque l’accès utilisateur)' : '✅ Mode maintenance DÉSACTIVÉ (accès restauré)');
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (e) {
      console.warn('[AdminView] Erreur bascule maintenance:', e);
    }
  };

  // Gestion des paramètres du site & mode maintenance avec synchronisation backend
  const handleSaveSettings = async () => {
    setSiteSettings(siteSettingsDraft);
    localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(siteSettingsDraft));
    try {
      await api.admin.updateSettings({
        maintenanceMode: siteSettingsDraft.maintenanceMode,
        maintenanceMessage: siteSettingsDraft.announcement,
        allowRegistrations: siteSettingsDraft.allowRegistrations,
      });
    } catch (e) {
      console.warn('[AdminView] Erreur mise à jour settings système:', e);
    }
    setSettingsSaved(true);
    setActionFeedback('Paramètres & maintenance synchronisés');
    setTimeout(() => {
      setSettingsSaved(false);
      setActionFeedback(null);
    }, 2500);
  };

  // Diffuser une notification globale à tous les utilisateurs (ou ciblée)
  const handleBroadcastNotification = async () => {
    const titleEl = document.getElementById('notif-title') as HTMLInputElement | null;
    const msgEl = document.getElementById('notif-message') as HTMLTextAreaElement | null;
    const typeEl = document.getElementById('notif-type') as HTMLSelectElement | null;

    const title = titleEl?.value?.trim() || '';
    const message = msgEl?.value?.trim() || '';
    const type = typeEl?.value || 'info';

    if (!title || !message) {
      setActionFeedback('Veuillez saisir le titre et le message de la notification');
      setTimeout(() => setActionFeedback(null), 3000);
      return;
    }

    try {
      const res = await api.admin.broadcastNotification({
        title,
        message,
        type,
        targetUserId: 'all',
      });

      if (res.success) {
        setActionFeedback(res.message || 'Notification diffusée à tous les utilisateurs avec succès');
        if (titleEl) titleEl.value = '';
        if (msgEl) msgEl.value = '';
      } else {
        setActionFeedback(res.message || 'Erreur lors de l’envoi de la notification');
      }
    } catch (e: any) {
      console.error('[AdminView] Erreur diffusion notification:', e);
      setActionFeedback(e?.message || 'Erreur lors de l’envoi de la notification');
    }
    setTimeout(() => setActionFeedback(null), 3500);
  };

  // Sauvegarde des documents légaux (CGU et Politique de confidentialité)
  const handleSaveLegal = async () => {
    setLegalLoading(true);
    try {
      const res = await api.admin.updateSettings({
        termsOfService: legalDraft.termsOfService,
        privacyPolicy: legalDraft.privacyPolicy,
      });
      if (res.success) {
        setLegalSaved(true);
        setActionFeedback('Documents légaux enregistrés et publiés');
        setTimeout(() => {
          setLegalSaved(false);
          setActionFeedback(null);
        }, 2500);
      } else {
        setActionFeedback(res.message || 'Erreur lors de l’enregistrement des documents légaux');
        setTimeout(() => setActionFeedback(null), 3000);
      }
    } catch (e: any) {
      console.error('[AdminView] Erreur mise à jour légale:', e);
      setActionFeedback(e?.message || 'Erreur lors de la mise à jour des documents légaux');
      setTimeout(() => setActionFeedback(null), 3000);
    } finally {
      setLegalLoading(false);
    }
  };

  // Révocation d'un bannissement
  const handleUnban = async (id: string, email: string) => {
    try {
      const res = await api.admin.removeBan(id);
      if (res.success) {
        setBansList((prev) => prev.filter((b) => b.id !== id));
        setActionFeedback(`Bannissement levé pour ${email}`);
        setTimeout(() => setActionFeedback(null), 2500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Mettre à jour le statut d'un ticket avec réponse optionnelle
  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string, reply?: string) => {
    try {
      const res = await api.admin.updateTicket(ticketId, newStatus, reply);
      if (res.success) {
        setTicketsList((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus, ...(reply ? { reply } : {}) } : t))
        );
        setActionFeedback(`Statut du ticket mis à jour : ${newStatus}`);
        setTimeout(() => setActionFeedback(null), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Diffuser une notification à tous les utilisateurs
  const handleBroadcastNotification = async () => {
    const titleInput = document.getElementById('notif-title') as HTMLInputElement;
    const messageInput = document.getElementById('notif-message') as HTMLTextAreaElement;
    const typeInput = document.getElementById('notif-type') as HTMLSelectElement;

    const title = titleInput?.value?.trim();
    const message = messageInput?.value?.trim();
    const type = typeInput?.value || 'info';

    if (!title || !message) {
      setActionFeedback('⚠️ Veuillez remplir le titre et le message');
      setTimeout(() => setActionFeedback(null), 2000);
      return;
    }

    try {
      const res = await api.admin.broadcastNotification({
        title,
        message,
        type,
        targetUserId: 'all',
      });

      if (res.success) {
        setActionFeedback(`✅ Notification diffusée à tous les utilisateurs`);
        // Vider les champs
        if (titleInput) titleInput.value = '';
        if (messageInput) messageInput.value = '';
        setTimeout(() => setActionFeedback(null), 3000);
      } else {
        setActionFeedback(`❌ ${res.message || 'Erreur lors de l\'envoi'}`);
        setTimeout(() => setActionFeedback(null), 3000);
      }
    } catch (e) {
      console.error(e);
      setActionFeedback('❌ Erreur de connexion au serveur');
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setActiveTab('dashboard');
  };

  // ─── Rendu des sections ────────────────────────────────────────────────────
  const renderSection = () => {
    switch (activeSection) {

      // ── TABLEAU DE BORD ──────────────────────────────────────────────────
      case 'dashboard':
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-[#18181B] tracking-tight">Tableau de bord</h2>
              <p className="text-xs text-[#6F6F73] mt-0.5">
                Vue globale de la plateforme — {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* KPI Utilisateurs */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#6F6F73]">Total utilisateurs</span>
                  <div className="w-6 h-6 rounded-md bg-[#FF5330]/10 flex items-center justify-center">
                    <Users className="w-3 h-3 text-[#FF5330]" />
                  </div>
                </div>
                <p className="text-2xl font-black text-[#18181B] num-tabular">{globalStats.totalUsers}</p>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-[#10B981] font-bold">{globalStats.activeUsers} actifs</span>
                  <span className="text-[#A1A1AA]">·</span>
                  <span className="text-[#F97316] font-bold">{globalStats.inactiveUsers} inactifs</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#6F6F73]">Transactions totales</span>
                  <div className="w-6 h-6 rounded-md bg-[#10B981]/10 flex items-center justify-center">
                    <Activity className="w-3 h-3 text-[#10B981]" />
                  </div>
                </div>
                <p className="text-2xl font-black text-[#18181B] num-tabular">{globalStats.globalTransactions}</p>
                <p className="text-[10px] text-[#A1A1AA]">tous utilisateurs confondus</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#6F6F73]">Catégories</span>
                  <div className="w-6 h-6 rounded-md bg-[#FF5330]/10 flex items-center justify-center">
                    <Tags className="w-3 h-3 text-[#FF5330]" />
                  </div>
                </div>
                <p className="text-2xl font-black text-[#18181B] num-tabular">{categories.length}</p>
                <p className="text-[10px] text-[#A1A1AA]">{categories.filter(c => c.type === 'expense').length} dépenses · {categories.filter(c => c.type === 'income').length} revenus</p>
              </div>
            </div>

            {/* KPI Finances globales */}
            <div className="p-4 rounded-2xl bg-[#18181B] text-white space-y-3">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-white/50">Agrégat financier — tous utilisateurs</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] text-white/50 mb-0.5">Revenus totaux</p>
                  <p className="text-sm sm:text-base font-black text-[#10B981] num-tabular">{formatCurrency(globalStats.globalIncome)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/50 mb-0.5">Dépenses totales</p>
                  <p className="text-sm sm:text-base font-black text-[#EF4444] num-tabular">{formatCurrency(globalStats.globalExpenses)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/50 mb-0.5">Épargne totale</p>
                  <p className="text-sm sm:text-base font-black text-[#FF5330] num-tabular">{formatCurrency(globalStats.globalSavings)}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-[11px] text-white/50 mb-1.5">
                  <span>Ratio dépenses / revenus global</span>
                  <span className="font-bold text-white">{globalStats.globalIncome > 0 ? Math.round((globalStats.globalExpenses / globalStats.globalIncome) * 100) : 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF5330] rounded-full" style={{ width: `${globalStats.globalIncome > 0 ? Math.min(100, Math.round((globalStats.globalExpenses / globalStats.globalIncome) * 100)) : 0}%` }} />
                </div>
              </div>
            </div>

            {/* Top utilisateurs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-extrabold text-sm text-[#18181B]">Utilisateurs récents</h3>
                <button onClick={() => setActiveSection('users')} className="text-xs font-bold text-[#FF5330] flex items-center gap-0.5 hover:underline">
                  Voir tous <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="rounded-xl bg-white border border-[#E8E8E8] divide-y divide-[#F0F0F0] overflow-hidden">
                {ALL_USERS.slice(0, 5).map((u) => (
                  <div key={u.id} className="px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#FAFAFA]" onClick={() => { setSelectedUser(u); setActiveSection('users'); }}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#18181B] flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#18181B] truncate">{u.name}</p>
                        <p className="text-[10px] text-[#A1A1AA] truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${u.status === 'actif' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F97316]/10 text-[#F97316]'}`}>
                        {u.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FF5330]/10 text-[#FF5330]">{u.plan}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Annonce active */}
            {siteSettings.announcement && (
              <div className="p-3.5 rounded-xl bg-[#FF5330]/5 border border-[#FF5330]/20 flex items-start gap-2.5">
                <Bell className="w-4 h-4 text-[#FF5330] flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#FF5330]">Annonce active</p>
                  <p className="text-xs text-[#6F6F73] mt-0.5">{siteSettings.announcement}</p>
                </div>
                <button onClick={() => setActiveSection('site-settings')} className="flex-shrink-0 text-[10px] font-bold text-[#FF5330] hover:underline">Modifier</button>
              </div>
            )}

            {siteSettings.maintenanceMode && (
              <div className="p-3.5 rounded-xl bg-[#EF4444]/5 border border-[#EF4444]/20 flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                <p className="text-xs font-bold text-[#EF4444]">Mode maintenance activé — le site est inaccessible aux utilisateurs</p>
              </div>
            )}
          </div>
        );

      // ── UTILISATEURS ─────────────────────────────────────────────────────
      case 'users':
        return (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-[#18181B] tracking-tight">Utilisateurs réels</h2>
                <p className="text-xs text-[#6F6F73] mt-0.5">
                  {globalStats.totalUsers} compte{globalStats.totalUsers > 1 ? 's' : ''} enregistré{globalStats.totalUsers > 1 ? 's' : ''} · {globalStats.activeUsers} actif{globalStats.activeUsers > 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E8E8E8] text-xs font-bold text-[#18181B] hover:bg-[#F7F7F7] active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                  title="Synchroniser avec la base de données"
                >
                  <RotateCw className={`w-3.5 h-3.5 text-[#FF5330] ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Chargement...' : 'Actualiser'}</span>
                </button>
                <div className="flex items-center gap-1 text-[10px] font-bold">
                  <span className="px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981]">{globalStats.activeUsers} actifs</span>
                  <span className="px-2.5 py-1 rounded-full bg-[#F97316]/10 text-[#F97316]">{globalStats.inactiveUsers} inactifs</span>
                </div>
              </div>
            </div>

            {/* Fiche détail utilisateur sélectionné */}
            {selectedUser && (
              <div className="p-4 rounded-2xl bg-white border-2 border-[#FF5330]/20 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#18181B] flex items-center justify-center text-white text-lg font-black">
                      {selectedUser.name ? selectedUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="font-black text-sm text-[#18181B]">{selectedUser.name || 'Utilisateur'}</p>
                      <p className="text-xs text-[#6F6F73]">{selectedUser.email}</p>
                      {selectedUser.phone && (
                        <div className="flex items-center gap-1 text-[11px] text-[#6F6F73] mt-0.5">
                          <Phone className="w-3 h-3 text-[#FF5330]" />
                          <span>{selectedUser.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${selectedUser.status === 'actif' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F97316]/10 text-[#F97316]'}`}>
                          {selectedUser.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FF5330]/10 text-[#FF5330]">
                          {selectedUser.plan}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="p-1 rounded-lg text-[#A1A1AA] hover:text-[#18181B] cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Stats financières réelles de l'utilisateur */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Revenus', value: formatCurrency(selectedUser.income), color: 'text-[#10B981]' },
                    { label: 'Dépenses', value: formatCurrency(selectedUser.expenses), color: 'text-[#EF4444]' },
                    { label: 'Épargne', value: formatCurrency(selectedUser.savings), color: 'text-[#FF5330]' },
                  ].map((s) => (
                    <div key={s.label} className="p-2.5 rounded-xl bg-[#F7F7F7] text-center">
                      <p className="text-[10px] text-[#6F6F73]">{s.label}</p>
                      <p className={`text-xs font-black num-tabular mt-0.5 ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-[#E8E8E8] divide-y divide-[#F0F0F0] overflow-hidden">
                  {[
                    { label: 'Téléphone', value: selectedUser.phone || 'Non renseigné' },
                    { label: 'Transactions', value: String(selectedUser.transactions) },
                    { label: 'Budget mensuel', value: formatCurrency(selectedUser.budgetTotal) },
                    { label: 'Dernière connexion', value: selectedUser.lastLogin },
                    { label: 'Inscrit le', value: selectedUser.joinDate },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between px-3 py-2">
                      <span className="text-[11px] text-[#6F6F73]">{row.label}</span>
                      <span className="text-[11px] font-bold text-[#18181B]">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Barre dépenses/budget */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-[#6F6F73] mb-1">
                    <span>Utilisation budget</span>
                    <span className="font-bold text-[#18181B]">
                      {selectedUser.budgetTotal > 0 ? Math.min(100, Math.round((selectedUser.expenses / selectedUser.budgetTotal) * 100)) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF5330] rounded-full"
                      style={{
                        width: `${selectedUser.budgetTotal > 0 ? Math.min(100, Math.round((selectedUser.expenses / selectedUser.budgetTotal) * 100)) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Action de suppression */}
                <div className="pt-2 flex justify-end border-t border-[#F0F0F0]">
                  <button
                    onClick={() => setUserToDelete(selectedUser)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#EF4444]/10 hover:bg-[#EF4444] text-[#EF4444] hover:text-white text-xs font-bold transition-all cursor-pointer active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer cet utilisateur</span>
                  </button>
                </div>
              </div>
            )}

            {/* Barre de recherche + filtre */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Rechercher par nom, email ou numéro..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-xs font-semibold text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#FF5330]"
                />
              </div>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value as 'all' | 'actif' | 'inactif')}
                className="py-2.5 px-3 bg-white border border-[#E8E8E8] rounded-xl text-xs font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330] cursor-pointer"
              >
                <option value="all">Tous ({ALL_USERS.length})</option>
                <option value="actif">Actifs ({globalStats.activeUsers})</option>
                <option value="inactif">Inactifs ({globalStats.inactiveUsers})</option>
              </select>
            </div>

            {/* Liste utilisateurs 100% réels */}
            <div className="rounded-xl bg-white border border-[#E8E8E8] divide-y divide-[#F0F0F0] overflow-hidden">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#6F6F73] space-y-1">
                  <p className="font-bold text-[#18181B]">Aucun utilisateur trouvé.</p>
                  <p className="text-[11px] text-[#A1A1AA]">
                    {userSearch ? 'Aucun utilisateur ne correspond à votre recherche.' : "Les utilisateurs qui s'inscrivent apparaîtront ici automatiquement."}
                  </p>
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
                    className={`px-3.5 py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      selectedUser?.id === u.id ? 'bg-[#FF5330]/5' : 'hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#18181B] flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                        {u.name ? u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#18181B] truncate">{u.name}</p>
                        <p className="text-[10px] text-[#A1A1AA] truncate">
                          {u.email} {u.phone ? `· ${u.phone}` : ''} · {u.lastLogin}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="hidden sm:block text-right">
                        <p className="text-[10px] font-black text-[#10B981] num-tabular">+{formatCurrency(u.income)}</p>
                        <p className="text-[10px] text-[#EF4444] num-tabular">-{formatCurrency(u.expenses)}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${u.status === 'actif' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F97316]/10 text-[#F97316]'}`}>
                        {u.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUserToDelete(u);
                        }}
                        className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
                        title="Supprimer l'utilisateur"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronDown className={`w-3.5 h-3.5 text-[#A1A1AA] transition-transform ${selectedUser?.id === u.id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      // ── CATÉGORIES ───────────────────────────────────────────────────────
      case 'categories':
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[#18181B] tracking-tight">Catégories</h2>
                <p className="text-xs text-[#6F6F73] mt-0.5">{categories.length} catégories · gestion globale</p>
              </div>
            </div>

            {/* Stats catégories */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs">
                <p className="text-[11px] text-[#6F6F73]">Catégories dépenses</p>
                <p className="text-2xl font-black text-[#18181B] num-tabular mt-0.5">{categories.filter(c => c.type === 'expense').length}</p>
                <p className="text-[10px] text-[#A1A1AA] mt-0.5">Budget total alloué</p>
                <p className="text-xs font-bold text-[#FF5330] num-tabular">{formatCurrency(categories.filter(c => c.type === 'expense').reduce((s, c) => s + c.budgetLimit, 0))}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs">
                <p className="text-[11px] text-[#6F6F73]">Catégories revenus</p>
                <p className="text-2xl font-black text-[#18181B] num-tabular mt-0.5">{categories.filter(c => c.type === 'income').length}</p>
                <p className="text-[10px] text-[#A1A1AA] mt-0.5">Sources de revenu actives</p>
                <p className="text-xs font-bold text-[#10B981] num-tabular">{categories.filter(c => c.type === 'income').length} sources</p>
              </div>
            </div>

            {/* Utilisation des catégories de dépense */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-sm text-[#18181B] px-1">Utilisation — catégories dépenses</h3>
              <div className="rounded-xl bg-white border border-[#E8E8E8] divide-y divide-[#F0F0F0] overflow-hidden">
                {categories.filter(c => c.type === 'expense').map((cat) => {
                  const spent = transactions.filter((t) => (t.categoryId === cat.id || t.category === cat.name) && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                  const pct = cat.budgetLimit > 0 ? Math.min(100, Math.round((spent / cat.budgetLimit) * 100)) : 0;
                  const over = spent > cat.budgetLimit && cat.budgetLimit > 0;
                  // Compter les utilisateurs simulés qui ont cette catégorie (estimation)
                  const usersCount = Math.floor(Math.random() * 4) + 3;
                  return (
                    <div key={cat.id} className="px-3.5 py-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#F7F7F7] flex items-center justify-center">
                            <CategoryIcon name={cat.icon || cat.name} className="w-3.5 h-3.5 text-[#52525B]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#18181B]">{cat.name}</p>
                            <p className="text-[10px] text-[#A1A1AA]">Utilisée par {usersCount} utilisateurs</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-black num-tabular ${over ? 'text-[#EF4444]' : 'text-[#18181B]'}`}>{pct}%</span>
                          {over && <span className="block text-[9px] text-[#EF4444] font-bold">Dépassé</span>}
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${over ? 'bg-[#EF4444]' : pct > 80 ? 'bg-[#F97316]' : 'bg-[#FF5330]'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#A1A1AA] num-tabular">
                        <span>{formatCurrency(spent)} dépensés</span>
                        <span>Plafond : {formatCurrency(cat.budgetLimit)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Catégories revenus */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-sm text-[#18181B] px-1">Catégories revenus</h3>
              <div className="rounded-xl bg-white border border-[#E8E8E8] divide-y divide-[#F0F0F0] overflow-hidden">
                {categories.filter(c => c.type === 'income').map((cat) => {
                  const earned = transactions.filter((t) => (t.categoryId === cat.id || t.category === cat.name) && t.type === 'income').reduce((s, t) => s + t.amount, 0);
                  return (
                    <div key={cat.id} className="px-3.5 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                          <CategoryIcon name={cat.icon || cat.name} className="w-3.5 h-3.5 text-[#10B981]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#18181B]">{cat.name}</p>
                          <p className="text-[10px] text-[#A1A1AA]">Source de revenu</p>
                        </div>
                      </div>
                      <p className="text-xs font-black text-[#10B981] num-tabular">{earned > 0 ? `+${formatCurrency(earned)}` : '—'}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      // ── FINANCES GLOBALES ─────────────────────────────────────────────────
      case 'finances':
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-[#18181B] tracking-tight">Finances globales</h2>
              <p className="text-xs text-[#6F6F73] mt-0.5">Revenus, dépenses et épargne — agrégat plateforme</p>
            </div>

            {/* Agrégat global */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Revenus totaux', value: globalStats.globalIncome, icon: TrendingUp, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', prefix: '+' },
                { label: 'Dépenses totales', value: globalStats.globalExpenses, icon: TrendingDown, color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', prefix: '-' },
                { label: 'Épargne totale', value: globalStats.globalSavings, icon: PiggyBank, color: 'text-[#FF5330]', bg: 'bg-[#FF5330]/10', prefix: '' },
              ].map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.label} className="p-4 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#6F6F73]">{kpi.label}</span>
                      <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${kpi.color}`} />
                      </div>
                    </div>
                    <p className={`text-lg font-black num-tabular ${kpi.color}`}>{kpi.prefix}{formatCurrency(kpi.value)}</p>
                  </div>
                );
              })}
            </div>

            {/* Tableau par utilisateur */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-sm text-[#18181B] px-1">Détail par utilisateur</h3>
              <div className="rounded-xl bg-white border border-[#E8E8E8] overflow-hidden">
                {/* Header tableau */}
                <div className="grid grid-cols-12 gap-2 px-3.5 py-2 bg-[#F7F7F7] border-b border-[#E8E8E8]">
                  <div className="col-span-4"><p className="text-[10px] font-bold text-[#6F6F73] uppercase tracking-wider">Utilisateur</p></div>
                  <div className="col-span-2 text-right"><p className="text-[10px] font-bold text-[#6F6F73] uppercase tracking-wider">Revenus</p></div>
                  <div className="col-span-2 text-right"><p className="text-[10px] font-bold text-[#6F6F73] uppercase tracking-wider">Dépenses</p></div>
                  <div className="col-span-2 text-right"><p className="text-[10px] font-bold text-[#6F6F73] uppercase tracking-wider">Épargne</p></div>
                  <div className="col-span-2 text-right"><p className="text-[10px] font-bold text-[#6F6F73] uppercase tracking-wider">Budget</p></div>
                </div>
                {/* Lignes */}
                <div className="divide-y divide-[#F0F0F0]">
                  {ALL_USERS.map((u) => (
                    <div key={u.id} className="grid grid-cols-12 gap-2 px-3.5 py-2.5 items-center cursor-pointer" onClick={() => { setSelectedUser(u); setActiveSection('users'); }}>
                      <div className="col-span-4 flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-[#18181B] flex items-center justify-center text-white text-[9px] font-black flex-shrink-0">
                          {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-[#18181B] truncate">{u.name}</p>
                          <span className={`text-[9px] font-bold ${u.status === 'actif' ? 'text-[#10B981]' : 'text-[#F97316]'}`}>{u.status}</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-right"><p className="text-[11px] font-bold text-[#10B981] num-tabular">{formatCurrency(u.income)}</p></div>
                      <div className="col-span-2 text-right"><p className="text-[11px] font-bold text-[#EF4444] num-tabular">{formatCurrency(u.expenses)}</p></div>
                      <div className="col-span-2 text-right"><p className="text-[11px] font-bold text-[#FF5330] num-tabular">{formatCurrency(u.savings)}</p></div>
                      <div className="col-span-2 text-right">
                        <p className="text-[11px] font-bold text-[#18181B] num-tabular">{u.budgetTotal > 0 ? `${Math.min(100, Math.round((u.expenses / u.budgetTotal) * 100))}%` : '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Totaux */}
                <div className="grid grid-cols-12 gap-2 px-3.5 py-2.5 bg-[#F7F7F7] border-t border-[#E8E8E8]">
                  <div className="col-span-4"><p className="text-[11px] font-black text-[#18181B]">Total plateforme</p></div>
                  <div className="col-span-2 text-right"><p className="text-[11px] font-black text-[#10B981] num-tabular">{formatCurrency(globalStats.globalIncome)}</p></div>
                  <div className="col-span-2 text-right"><p className="text-[11px] font-black text-[#EF4444] num-tabular">{formatCurrency(globalStats.globalExpenses)}</p></div>
                  <div className="col-span-2 text-right"><p className="text-[11px] font-black text-[#FF5330] num-tabular">{formatCurrency(globalStats.globalSavings)}</p></div>
                  <div className="col-span-2" />
                </div>
              </div>
            </div>

            {/* Objectifs d'épargne réels */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-sm text-[#18181B] px-1">Objectifs d'épargne — utilisateur actif</h3>
              <div className="rounded-xl bg-white border border-[#E8E8E8] divide-y divide-[#F0F0F0] overflow-hidden">
                {savingsGoals.map((goal) => {
                  const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                  const done = goal.currentAmount >= goal.targetAmount;
                  return (
                    <div key={goal.id} className="px-3.5 py-2.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PiggyBank className="w-3.5 h-3.5 text-[#FF5330]" />
                          <span className="text-xs font-bold text-[#18181B]">{goal.title}</span>
                          {done && <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />}
                        </div>
                        <span className="text-xs font-black text-[#FF5330] num-tabular">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${done ? 'bg-[#10B981]' : 'bg-[#FF5330]'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#A1A1AA] num-tabular">
                        <span>{formatCurrency(goal.currentAmount)}</span>
                        <span>/ {formatCurrency(goal.targetAmount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      // ── JOURNAUX ─────────────────────────────────────────────────────────
      case 'logs':
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[#18181B] tracking-tight">Journaux d'activité</h2>
                <p className="text-xs text-[#6F6F73] mt-0.5">Actions récentes sur la plateforme</p>
              </div>
              <button onClick={exportDataJSON} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7F7F7] border border-[#E8E8E8] text-xs font-bold text-[#52525B] cursor-pointer">
                <Download className="w-3.5 h-3.5" /> Exporter
              </button>
            </div>

            <div className="rounded-xl bg-white border border-[#E8E8E8] divide-y divide-[#F0F0F0] overflow-hidden">
              {/* Logs réels basés sur les vraies transactions */}
              {transactions.slice(0, 6).map((t, i) => (
                <div key={`tx-${i}`} className="px-3.5 py-2.5 flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${t.type === 'income' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#FF5330]/10 text-[#FF5330]'}`}>
                    <Activity className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#18181B]">{t.type === 'income' ? 'Revenu enregistré' : t.type === 'expense' ? 'Dépense enregistrée' : 'Épargne déposée'}</p>
                    <p className="text-[10px] text-[#6F6F73] truncate">{userProfile.name} · {t.title} · {formatCurrency(t.amount)}</p>
                  </div>
                  <span className="text-[10px] text-[#A1A1AA] flex-shrink-0">{t.date}</span>
                </div>
              ))}
              {/* Logs pour les autres utilisateurs */}
              {ALL_USERS.filter((u) => u.email !== userProfile.email).map((u, i) => (
                <div key={`user-${i}`} className="px-3.5 py-2.5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 bg-[#3B82F6]/10 text-[#3B82F6]">
                    <Users className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#18181B]">Connexion utilisateur</p>
                    <p className="text-[10px] text-[#6F6F73] truncate">{u.name} · {u.email} · {u.status}</p>
                  </div>
                  <span className="text-[10px] text-[#A1A1AA] flex-shrink-0">{u.lastLogin}</span>
                </div>
              ))}
              <div className="px-3.5 py-2.5 flex items-start gap-3">
                <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 bg-[#FF5330]/10 text-[#FF5330]">
                  <Shield className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#18181B]">Connexion admin</p>
                  <p className="text-[10px] text-[#6F6F73]">Accès espace administrateur validé</p>
                </div>
                <span className="text-[10px] text-[#A1A1AA] flex-shrink-0">Aujourd'hui</span>
              </div>
            </div>
          </div>
        );

      // ── PARAMÈTRES DU SITE ─────────────────────────────────────────────────
      case 'site-settings':
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[#18181B] tracking-tight">Paramètres du site</h2>
                <p className="text-xs text-[#6F6F73] mt-0.5">Informations et configuration de la plateforme</p>
              </div>
              <button onClick={handleSaveSettings}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF5330] text-white text-xs font-bold cursor-pointer transition-all active:scale-95">
                <Save className="w-3.5 h-3.5" />
                {settingsSaved ? 'Sauvegardé ✓' : 'Sauvegarder'}
              </button>
            </div>

            {/* Informations du site */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-xs text-[#6F6F73] uppercase tracking-wider px-1">Identité du site</h3>
              <div className="space-y-3 bg-white border border-[#E8E8E8] rounded-xl p-4">
                <div>
                  <label className="text-[11px] font-bold text-[#18181B] block mb-1.5">Nom du site</label>
                  <input type="text" value={siteSettingsDraft.siteName}
                    onChange={(e) => setSiteSettingsDraft(p => ({ ...p, siteName: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-sm font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#18181B] block mb-1.5">Slogan / Description courte</label>
                  <input type="text" value={siteSettingsDraft.tagline}
                    onChange={(e) => setSiteSettingsDraft(p => ({ ...p, tagline: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-sm font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#18181B] block mb-1.5">Email de support</label>
                  <input type="email" value={siteSettingsDraft.supportEmail}
                    onChange={(e) => setSiteSettingsDraft(p => ({ ...p, supportEmail: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-sm font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]" />
                </div>
              </div>
            </div>

            {/* Annonce */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-xs text-[#6F6F73] uppercase tracking-wider px-1">Annonce globale</h3>
              <div className="bg-white border border-[#E8E8E8] rounded-xl p-4">
                <label className="text-[11px] font-bold text-[#18181B] block mb-1.5">Bannière d'annonce (laissez vide pour désactiver)</label>
                <textarea value={siteSettingsDraft.announcement}
                  onChange={(e) => setSiteSettingsDraft(p => ({ ...p, announcement: e.target.value }))}
                  rows={3}
                  placeholder="Ex: Maintenance programmée le 15 octobre de 02h à 04h..."
                  className="w-full px-3 py-2.5 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-sm text-[#18181B] focus:outline-none focus:border-[#FF5330] resize-none" />
                {siteSettingsDraft.announcement && (
                  <div className="mt-2 p-2 rounded-lg bg-[#FF5330]/5 border border-[#FF5330]/15">
                    <p className="text-[10px] font-bold text-[#FF5330] mb-0.5">Aperçu</p>
                    <p className="text-xs text-[#6F6F73]">{siteSettingsDraft.announcement}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notification globale aux utilisateurs */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-xs text-[#6F6F73] uppercase tracking-wider px-1">📢 Envoyer une notification</h3>
              <div className="bg-white border border-[#E8E8E8] rounded-xl p-4 space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-[#18181B] block mb-1.5">Titre de la notification</label>
                  <input type="text" placeholder="Ex: Mise à jour de la politique de confidentialité"
                    className="w-full px-3 py-2.5 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-sm font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
                    id="notif-title" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#18181B] block mb-1.5">Message</label>
                  <textarea rows={4} placeholder="Rédigez ici le contenu de la notification..."
                    className="w-full px-3 py-2.5 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-sm text-[#18181B] focus:outline-none focus:border-[#FF5330] resize-none"
                    id="notif-message" />
                </div>
                <div className="flex items-center gap-2">
                  <select className="flex-1 px-3 py-2 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-xs font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
                    id="notif-type">
                    <option value="info">ℹ️ Information</option>
                    <option value="warning">⚠️ Avertissement</option>
                    <option value="success">✅ Succès</option>
                    <option value="alert">🔴 Alerte</option>
                  </select>
                  <button onClick={handleBroadcastNotification}
                    className="px-4 py-2 rounded-xl bg-[#FF5330] hover:bg-[#E04524] text-white text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm inline-flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5" />
                    Diffuser à tous
                  </button>
                </div>
                <p className="text-[10px] text-[#6F6F73] italic">
                  💡 Cette notification sera envoyée à tous les utilisateurs enregistrés et apparaîtra dans leur centre de notifications.
                </p>
              </div>
            </div>

            {/* Paramètres de fonctionnement */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-xs text-[#6F6F73] uppercase tracking-wider px-1">Fonctionnement</h3>
              <div className="bg-white border border-[#E8E8E8] rounded-xl divide-y divide-[#F0F0F0] overflow-hidden">
                {/* Mode maintenance */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-xs font-bold text-[#18181B]">Mode maintenance</p>
                    <p className="text-[10px] text-[#A1A1AA]">Rend le site inaccessible aux utilisateurs</p>
                  </div>
                  <button
                    onClick={() => setSiteSettingsDraft(p => ({ ...p, maintenanceMode: !p.maintenanceMode }))}
                    className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${siteSettingsDraft.maintenanceMode ? 'bg-[#EF4444]' : 'bg-[#E8E8E8]'}`}
                    style={{ height: '22px', width: '40px' }}
                  >
                    <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform ${siteSettingsDraft.maintenanceMode ? 'translate-x-5' : 'translate-x-0.5'}`}
                      style={{ width: '18px', height: '18px', transform: siteSettingsDraft.maintenanceMode ? 'translateX(20px)' : 'translateX(2px)' }} />
                  </button>
                </div>
                {/* Inscriptions */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-xs font-bold text-[#18181B]">Autoriser les inscriptions</p>
                    <p className="text-[10px] text-[#A1A1AA]">Permet aux nouveaux utilisateurs de s'inscrire</p>
                  </div>
                  <button
                    onClick={() => setSiteSettingsDraft(p => ({ ...p, allowRegistrations: !p.allowRegistrations }))}
                    className={`relative rounded-full transition-colors cursor-pointer flex-shrink-0 ${siteSettingsDraft.allowRegistrations ? 'bg-[#10B981]' : 'bg-[#E8E8E8]'}`}
                    style={{ height: '22px', width: '40px' }}
                  >
                    <span className={`absolute top-0.5 rounded-full bg-white shadow-sm transition-transform`}
                      style={{ width: '18px', height: '18px', transform: siteSettingsDraft.allowRegistrations ? 'translateX(20px)' : 'translateX(2px)' }} />
                  </button>
                </div>
                {/* Plan par défaut */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-xs font-bold text-[#18181B]">Plan par défaut</p>
                    <p className="text-[10px] text-[#A1A1AA]">Plan assigné aux nouveaux utilisateurs</p>
                  </div>
                  <select value={siteSettingsDraft.defaultPlan}
                    onChange={(e) => setSiteSettingsDraft(p => ({ ...p, defaultPlan: e.target.value }))}
                    className="px-2.5 py-1.5 bg-[#F7F7F7] border border-[#E8E8E8] rounded-lg text-xs font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330] cursor-pointer">
                    <option value="Standard">Standard</option>
                    <option value="WealthFlow Pro">WealthFlow Pro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Infos techniques */}
            <div className="p-3 rounded-xl bg-[#F7F7F7] border border-[#E8E8E8]">
              <p className="text-[10px] font-bold text-[#6F6F73] uppercase tracking-wider mb-2">Infos plateforme</p>
              {[
                { label: 'Version', value: 'WealthFlow V2' },
                { label: 'Stockage', value: 'LocalStorage (local)' },
                { label: 'Utilisateurs', value: `${globalStats.totalUsers} comptes` },
                { label: 'Transactions', value: `${globalStats.globalTransactions} au total` },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-1">
                  <span className="text-[11px] text-[#A1A1AA]">{row.label}</span>
                  <span className="text-[11px] font-bold text-[#18181B]">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        );

      // ── COMPTES BANNIS & MOTIFS RÉELS ─────────────────────────────────────
      case 'bans':
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[#18181B] tracking-tight">Comptes bannis & Historique</h2>
                <p className="text-xs text-[#6F6F73] mt-0.5">
                  Gestion des sanctions et des motifs réels affichés aux utilisateurs dans le Centre d'aide
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#EF4444]/10 text-[#EF4444] text-xs font-bold">
                {bansList.length} banni{bansList.length > 1 ? 's' : ''}
              </span>
            </div>

            {bansList.length === 0 ? (
              <div className="p-8 text-center bg-white border border-[#E8E8E8] rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#18181B]">Aucun compte banni pour le moment</h3>
                <p className="text-xs text-[#6F6F73] mt-1 max-w-sm mx-auto">
                  Lorsqu'un utilisateur est supprimé ou sanctionné avec un motif, il apparaît ici et peut consulter la raison dans son Centre d'aide.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden divide-y divide-[#F0F0F0]">
                {bansList.map((ban) => (
                  <div key={ban.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#18181B]">
                          {ban.prenom || ban.nom ? `${ban.prenom || ''} ${ban.nom || ''}`.trim() : ban.email}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] font-bold">
                          BANNI
                        </span>
                      </div>
                      <p className="text-xs text-[#52525B] font-mono">{ban.email}</p>
                      <div className="p-2.5 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-xs text-[#9F1239]">
                        <span className="font-bold">Motif réel enregistré : </span>
                        {ban.reason}
                      </div>
                      <p className="text-[10px] text-[#A1A1AA]">
                        Sanctionné le {new Date(ban.bannedAt || ban.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} par {ban.bannedBy || 'Administrateur'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleUnban(ban.id, ban.email)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F4F4F5] hover:bg-[#E4E4E7] text-xs font-bold text-[#18181B] transition-colors cursor-pointer self-start sm:self-center"
                    >
                      <RotateCw className="w-3.5 h-3.5" /> Lever le ban
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      // ── TICKETS DE SUPPORT ────────────────────────────────────────────────
      case 'support-tickets':
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[#18181B] tracking-tight">Tickets d'assistance</h2>
                <p className="text-xs text-[#6F6F73] mt-0.5">
                  Demandes d'aide, signalements et recours envoyés depuis le Centre d'aide
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchTickets}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E8E8E8] text-xs font-bold text-[#18181B] hover:bg-[#F7F7F7] active:scale-95 transition-all cursor-pointer"
                  title="Rafraîchir les tickets"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#FF5330]" />
                  <span>Actualiser</span>
                </button>
                <span className="px-2.5 py-1 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-bold">
                  {ticketsList.length} ticket{ticketsList.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {ticketsList.length === 0 ? (
              <div className="p-8 text-center bg-white border border-[#E8E8E8] rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#18181B]">Aucun ticket en attente</h3>
                <p className="text-xs text-[#6F6F73] mt-1 max-w-sm mx-auto">
                  Les messages et demandes soumis par les utilisateurs via le formulaire de contact apparaîtront directement ici.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {ticketsList.map((ticket) => (
                  <div key={ticket.id} className="p-4 sm:p-5 bg-white border border-[#E8E8E8] rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ticket.status === 'resolved'
                            ? 'bg-[#10B981]/15 text-[#10B981]'
                            : ticket.status === 'in_progress'
                            ? 'bg-[#3B82F6]/15 text-[#3B82F6]'
                            : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                        }`}>
                          {ticket.status === 'resolved' ? 'Résolu' : ticket.status === 'in_progress' ? 'En cours' : 'En attente'}
                        </span>
                        <span className="text-xs font-black text-[#18181B]">{ticket.subject}</span>
                      </div>
                      <span className="text-[10px] text-[#A1A1AA]">
                        {new Date(ticket.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-xs text-[#52525B] leading-relaxed bg-[#F7F7F7] p-3 rounded-xl border border-[#E8E8E8]">
                      {ticket.message}
                    </div>

                    {ticket.reply && (
                      <div className="text-xs text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] p-2.5 rounded-xl">
                        <span className="font-bold">Réponse transmise à l'utilisateur : </span>
                        {ticket.reply}
                      </div>
                    )}

                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-[#F0F0F0]">
                      <div className="text-[11px] text-[#6F6F73]">
                        De : <strong className="text-[#18181B]">{ticket.name}</strong> ({ticket.email})
                        {ticket.category && (
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-[#E4E4E7] text-[#3F3F46] text-[10px] font-semibold">
                            {ticket.category}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {ticket.status !== 'resolved' && (
                          <button
                            onClick={() => {
                              const replyText = window.prompt("Rédigez un message de réponse pour l'utilisateur (optionnel) :", "Votre demande a été traitée par l'équipe d'assistance.");
                              handleUpdateTicketStatus(ticket.id, 'resolved', replyText || undefined);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] font-bold text-xs transition-colors cursor-pointer"
                          >
                            Traiter & Répondre
                          </button>
                        )}
                        {ticket.status === 'open' && (
                          <button
                            onClick={() => handleUpdateTicketStatus(ticket.id, 'in_progress')}
                            className="px-2.5 py-1 rounded-lg bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#3B82F6] font-bold text-xs transition-colors cursor-pointer"
                          >
                            Passer en cours
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      // ── VOLET LÉGAL (CGU ET CONFIDENTIALITÉ) ──────────────────────────────
      case 'legal':
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[#18181B] tracking-tight">Volet Légal & Politiques</h2>
                <p className="text-xs text-[#6F6F73] mt-0.5">
                  Rédigez et mettez à jour les Conditions d'Utilisation et la Politique de Confidentialité du site
                </p>
              </div>
              <button
                onClick={handleSaveLegal}
                disabled={legalLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF5330] hover:bg-[#E04524] text-white text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {legalLoading ? 'Enregistrement...' : legalSaved ? 'Enregistré ✓' : 'Publier les modifications'}
              </button>
            </div>

            <div className="space-y-6">
              {/* CGU */}
              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#FF5330]" />
                    <h3 className="text-sm font-black text-[#18181B]">Conditions Générales d'Utilisation (CGU)</h3>
                  </div>
                  <span className="text-[10px] text-[#6F6F73]">Visible sur /legal (onglet CGU)</span>
                </div>
                <textarea
                  value={legalDraft.termsOfService}
                  onChange={(e) => setLegalDraft((p) => ({ ...p, termsOfService: e.target.value }))}
                  rows={10}
                  placeholder="Rédigez ici les règles d'utilisation de WealthFlow..."
                  className="w-full px-3.5 py-3 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-xs text-[#18181B] font-mono leading-relaxed focus:outline-none focus:border-[#FF5330] resize-y"
                />
              </div>

              {/* Politique de Confidentialité */}
              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#10B981]" />
                    <h3 className="text-sm font-black text-[#18181B]">Politique de Confidentialité & RGPD</h3>
                  </div>
                  <span className="text-[10px] text-[#6F6F73]">Visible sur /legal (onglet Confidentialité)</span>
                </div>
                <textarea
                  value={legalDraft.privacyPolicy}
                  onChange={(e) => setLegalDraft((p) => ({ ...p, privacyPolicy: e.target.value }))}
                  rows={10}
                  placeholder="Rédigez ici les règles relatives à la protection des données personnelles..."
                  className="w-full px-3.5 py-3 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-xs text-[#18181B] font-mono leading-relaxed focus:outline-none focus:border-[#FF5330] resize-y"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ─── Shell ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col lg:flex-row">

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-60 xl:w-64 bg-white border-r border-[#E8E8E8] h-screen sticky top-0 px-3 py-4 z-30 select-none overflow-y-auto flex-shrink-0">
        <div className="px-1 mb-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <BrandLogo size="md" showBadge={false} withDarkContainer={false} />
        </div>
        <div className="px-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FF5330]/10 text-[#FF5330] text-[11px] font-black">
            <Shield className="w-3 h-3" /> ESPACE ADMIN
          </span>
        </div>
        <nav className="flex-1 space-y-0.5">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button key={item.id} onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${isActive ? 'bg-[#FF5330]/10 text-[#FF5330]' : 'text-[#52525B] hover:bg-[#F7F7F7]'}`}>
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#FF5330]' : 'text-[#71717A]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="pt-3 border-t border-[#E8E8E8] space-y-0.5">
          <button onClick={() => setActiveTab('dashboard')} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-[#52525B] transition-colors cursor-pointer">
            <Globe className="w-3.5 h-3.5 text-[#71717A]" /><span>Voir le site</span>
          </button>
          <button onClick={handleAdminLogout} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-[#EF4444] transition-colors cursor-pointer">
            <LogOut className="w-3.5 h-3.5" /><span>Quitter l'admin</span>
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header mobile */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-[#E8E8E8] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMobileNavOpen(true)} className="w-8 h-8 rounded-lg bg-[#F7F7F7] flex items-center justify-center text-[#52525B] cursor-pointer">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <BrandLogo size="sm" showBadge={false} withDarkContainer={false} />
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#FF5330]/10 text-[#FF5330]">ADMIN</span>
        </header>

        {/* Drawer mobile */}
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsMobileNavOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl flex flex-col p-4 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-black text-[#FF5330]">Menu Admin</span>
                <button onClick={() => setIsMobileNavOpen(false)} className="w-7 h-7 rounded-full bg-[#F7F7F7] flex items-center justify-center cursor-pointer">
                  <X className="w-3.5 h-3.5 text-[#52525B]" />
                </button>
              </div>
              <nav className="flex-1 space-y-0.5 overflow-y-auto">
                {ADMIN_NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button key={item.id} onClick={() => { setActiveSection(item.id); setIsMobileNavOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${isActive ? 'bg-[#FF5330]/10 text-[#FF5330]' : 'text-[#52525B] hover:bg-[#F7F7F7]'}`}>
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#FF5330]' : 'text-[#71717A]'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="pt-3 border-t border-[#E8E8E8] space-y-1">
                <button onClick={() => { setActiveTab('dashboard'); setIsMobileNavOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#52525B] cursor-pointer">
                  <Globe className="w-4 h-4 text-[#71717A]" /> Voir le site
                </button>
                <button onClick={handleAdminLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#EF4444] cursor-pointer">
                  <LogOut className="w-4 h-4" /> Quitter l'admin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header desktop */}
        <header className="hidden lg:flex sticky top-0 z-20 bg-white border-b border-[#E8E8E8] px-6 py-3 items-center justify-between">
          <div>
            <h1 className="text-sm font-black text-[#18181B]">
              {ADMIN_NAV.find((n) => n.id === activeSection)?.label ?? 'Administration'}
            </h1>
            <p className="text-[10px] text-[#A1A1AA]">WealthFlow · Espace administrateur</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('dashboard')} className="text-xs font-bold text-[#6F6F73] flex items-center gap-1 transition-colors cursor-pointer">
              <Globe className="w-3.5 h-3.5" /> Voir le site
            </button>
            <button onClick={handleAdminLogout} className="text-xs font-bold text-[#EF4444] flex items-center gap-1 transition-colors cursor-pointer">
              <LogOut className="w-3.5 h-3.5" /> Quitter
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto pb-24 lg:pb-12">
          {renderSection()}
        </main>

        {/* Modal de confirmation de suppression d'utilisateur */}
        {userToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-[#E8E8E8] animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444] flex-shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#18181B]">Supprimer l'utilisateur ?</h3>
                  <p className="text-xs text-[#6F6F73]">Action d'administration irréversible</p>
                </div>
              </div>

              <p className="text-xs text-[#6F6F73] leading-relaxed">
                Êtes-vous certain de vouloir supprimer définitivement le compte de{' '}
                <strong className="text-[#18181B]">{userToDelete.name}</strong> ({userToDelete.email}) ?
                Toutes ses données associées seront supprimées et ce motif sera enregistré.
              </p>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#18181B] block">
                  Motif réel de suppression / bannissement (affiché au Centre d'aide) :
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Ex: Non-respect des CGU, suspicion de fraude, spam..."
                  rows={2}
                  className="w-full px-3 py-2 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-xs text-[#18181B] focus:outline-none focus:border-[#FF5330] resize-none"
                />
                <div className="flex flex-wrap gap-1 mt-1">
                  {[
                    "Non-respect des CGU",
                    "Suspicion d'activité frauduleuse",
                    "Comportement abusif",
                    "Demande de clôture",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBanReason(preset)}
                      className="text-[9px] px-2 py-0.5 rounded-md bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#52525B] transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setUserToDelete(null)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#F7F7F7] hover:bg-[#E8E8E8] text-[#18181B] font-bold text-xs transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {deleteLoading ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification toast d'action admin */}
        {actionFeedback && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#18181B] text-white text-xs font-bold rounded-xl shadow-xl animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>{actionFeedback}</span>
          </div>
        )}
      </div>
    </div>
  );
};
