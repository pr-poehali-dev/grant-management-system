import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import Icon from '@/components/ui/icon';
import AccessibilityPanel from '@/components/AccessibilityPanel';
import AuthModal from '@/components/AuthModal';
import AuthGate from '@/components/AuthGate';
import AiAssistant from '@/components/AiAssistant';
import { useAuth } from '@/lib/auth';
import HomePage from '@/pages/HomePage';
import CabinetPage from '@/pages/CabinetPage';
import GrantsPage from '@/pages/GrantsPage';
import DashboardPage from '@/pages/DashboardPage';
import ReportsPage from '@/pages/ReportsPage';
import VerificationPage from '@/pages/VerificationPage';
import AdminPage from '@/pages/AdminPage';
import HelpPage from '@/pages/HelpPage';
import ContactsPage from '@/pages/ContactsPage';
import AboutPage from '@/pages/AboutPage';
import NewsPage from '@/pages/NewsPage';
import DocumentsPage from '@/pages/DocumentsPage';

type Section =
  | 'home' | 'about' | 'news' | 'documents'
  | 'cabinet' | 'grants' | 'dashboard' | 'reports'
  | 'verification' | 'admin' | 'help' | 'contacts';
type Role = 'producer' | 'officer' | 'admin';

const navItems: { id: Section; label: string; icon: string; roles?: Role[] }[] = [
  { id: 'home',         label: 'Главная',           icon: 'Home'       },
  { id: 'about',        label: 'О министерстве',    icon: 'Building2'  },
  { id: 'news',         label: 'Новости',           icon: 'Newspaper'  },
  { id: 'documents',    label: 'Документы',         icon: 'FolderOpen' },
  { id: 'grants',       label: 'Заявки и гранты',   icon: 'FilePlus'   },
  { id: 'reports',      label: 'Отчётность',        icon: 'FileCheck'  },
  { id: 'dashboard',    label: 'Аналитика',         icon: 'BarChart2'  },
  { id: 'cabinet',      label: 'Личный кабинет',    icon: 'User'       },
  { id: 'verification', label: 'Проверка отчётов',  icon: 'ShieldCheck' },
  { id: 'admin',        label: 'Администрирование', icon: 'Settings'    },
  { id: 'help',         label: 'Помощь',            icon: 'HelpCircle' },
  { id: 'contacts',     label: 'Контакты',          icon: 'Phone'      },
];

const API_REPORTS = 'https://functions.poehali.dev/c01991df-d80f-4791-9733-5b2f58fb5b48';

// Разделы, доступные ТОЛЬКО зарегистрированным пользователям
const PROTECTED_SECTIONS: Section[] = ['cabinet', 'grants', 'reports', 'verification', 'admin'];

const SECTION_DESCRIPTIONS: Partial<Record<Section, string>> = {
  cabinet:      'В личном кабинете доступны ваши гранты, заявки и сданные отчёты.',
  grants:       'Подача заявок на государственные гранты доступна после регистрации.',
  reports:      'Сдача отчётности по грантам доступна только зарегистрированным сельхозтоваропроизводителям.',
  verification: 'Проверка отчётности доступна сотрудникам Министерства сельского хозяйства.',
  admin:        'Администрирование системы доступно только администраторам АГРОГРАНТ.',
};

export default function App() {
  const auth = useAuth();
  const [section, setSection] = useState<Section>('home');
  const [role, setRole] = useState<Role>('producer');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Подтягиваем роль пользователя в локальный state
  useEffect(() => {
    if (auth.user) setRole(auth.user.role);
  }, [auth.user]);

  // Реальный счётчик: количество новых отчётов на проверке (из БД)
  useEffect(() => {
    const load = () => {
      fetch(`${API_REPORTS}?status=submitted`)
        .then((r) => r.json())
        .then((d) => setNotifCount(d?.stats?.new ?? 0))
        .catch(() => setNotifCount(0));
    };
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  const visibleNav = navItems.filter((item) => !item.roles || item.roles.includes(role));

  const navigate = (s: string) => {
    setSection(s as Section);
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const roleLabels: Record<Role, string> = {
    producer: 'Производитель',
    officer: 'Сотрудник МСХ',
    admin: 'Администратор',
  };

  return (
    <TooltipProvider>
      <Toaster />
      <div className="min-h-screen bg-background flex flex-col">

        {/* Триколор РФ */}
        <div className="flex w-full shrink-0" style={{ height: 6 }}>
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: '#003791' }} />
          <div className="flex-1" style={{ backgroundColor: '#D52B1E' }} />
        </div>

        {/* Top bar */}
        <header className="bg-gov-navy border-b border-white/10 px-4 py-2 flex items-center justify-between z-30 relative shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white/70 hover:text-white md:hidden mr-1"
            >
              <Icon name="Menu" size={20} />
            </button>

            {/* Логотип */}
            <button onClick={() => navigate('home')} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ backgroundColor: '#D52B1E' }}
              >
                <Icon name="Wheat" size={18} className="text-white" />
              </div>
              <div className="text-white font-bold text-lg tracking-tight">АГРОГРАНТ</div>
            </button>
          </div>

          <div className="flex items-center gap-3 relative">
            {auth.user ? (
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white/10 rounded px-3 py-1.5 text-white/90" style={{ fontSize: 13 }}>
                  <Icon name={role === 'producer' ? 'Tractor' : role === 'officer' ? 'Shield' : 'Settings'} size={13} />
                  <span className="max-w-[160px] truncate">{auth.user.full_name}</span>
                </div>
                <button onClick={auth.logout} title="Выйти"
                  className="text-white/70 hover:text-white p-1.5 hover:bg-white/10 rounded transition-colors">
                  <Icon name="LogOut" size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button onClick={() => openAuth('login')}
                  className="text-white/90 hover:text-white text-xs font-semibold px-3 py-1.5 hover:bg-white/10 rounded transition-colors flex items-center gap-1.5">
                  <Icon name="LogIn" size={13} />
                  <span className="hidden sm:inline">Войти</span>
                </button>
                <button onClick={() => openAuth('register')}
                  className="bg-white text-gov-navy text-xs font-semibold px-3 py-1.5 rounded hover:bg-white/90 transition-colors hidden sm:flex items-center gap-1.5">
                  <Icon name="UserPlus" size={13} />
                  Регистрация
                </button>
              </div>
            )}
            <AccessibilityPanel />
            <button
              onClick={() => navigate('verification')}
              title={notifCount > 0 ? `Новых отчётов на проверку: ${notifCount}` : 'Нет новых уведомлений'}
              className="relative text-white/70 hover:text-white"
            >
              <Icon name="Bell" size={18} />
              {notifCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                  style={{ backgroundColor: '#D52B1E' }}
                >
                  {notifCount > 99 ? '99+' : notifCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Sidebar overlay mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-20 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`
              fixed md:static z-20 top-0 bottom-0 w-60 bg-sidebar flex-shrink-0
              flex flex-col transition-transform duration-300 pt-[52px] md:pt-0
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
          >
            <div className="flex flex-col flex-1 overflow-y-auto py-3">
              <nav className="px-2 space-y-0.5">
                {visibleNav.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`w-full text-left px-3 py-2.5 rounded text-sm flex items-center gap-3 sidebar-item font-medium
                      ${section === item.id ? 'sidebar-item-active' : 'text-sidebar-foreground'}`}
                  >
                    <Icon name={item.icon} size={16} />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-auto px-3 pt-4 pb-3 border-t border-sidebar-border">
                <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60 mb-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  ЕСИА подключено
                </div>
                <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  ЭДО активно
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto min-w-0 flex flex-col">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gov-line px-8 py-2.5 flex items-center gap-2 text-xs text-muted-foreground shrink-0">
              <button onClick={() => navigate('home')} className="hover:text-gov-navy transition-colors">Главная</button>
              {section !== 'home' && (
                <>
                  <Icon name="ChevronRight" size={12} />
                  <span className="text-foreground font-medium">
                    {navItems.find((n) => n.id === section)?.label}
                  </span>
                </>
              )}
            </div>

            <div className="flex-1">
              {(() => {
                const isProtected = PROTECTED_SECTIONS.includes(section);
                if (isProtected && !auth.user) {
                  const label = navItems.find((n) => n.id === section)?.label || section;
                  return (
                    <AuthGate
                      sectionLabel={label}
                      description={SECTION_DESCRIPTIONS[section]}
                      onLogin={() => openAuth('login')}
                      onRegister={() => openAuth('register')}
                    />
                  );
                }
                return (
                  <>
                    {section === 'home'         && <HomePage        onNavigate={navigate} />}
                    {section === 'about'        && <AboutPage />}
                    {section === 'news'         && <NewsPage />}
                    {section === 'documents'    && <DocumentsPage />}
                    {section === 'cabinet'      && <CabinetPage     onNavigate={navigate} role={role} onRoleChange={setRole} />}
                    {section === 'grants'       && <GrantsPage      onNavigate={navigate} />}
                    {section === 'dashboard'    && <DashboardPage />}
                    {section === 'reports'      && <ReportsPage />}
                    {section === 'verification' && <VerificationPage />}
                    {section === 'admin'        && <AdminPage />}
                    {section === 'help'         && <HelpPage />}
                    {section === 'contacts'     && <ContactsPage />}
                  </>
                );
              })()}
            </div>

            {/* Footer */}
            <footer className="bg-gov-navy text-white shrink-0">
              <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-white/10">
                <div>
                  <div className="text-sm font-bold mb-2">АГРОГРАНТ</div>
                  <div className="text-xs text-white/50 leading-relaxed mb-3">
                    Автоматизированная система учёта и контроля расходования грантов в сельском хозяйстве Самарской области
                  </div>
                  <a href="https://агрогрант.рф" className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white transition-colors font-semibold">
                    <Icon name="Globe" size={12} />
                    агрогрант.рф
                  </a>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">Разделы</div>
                  <div className="space-y-1.5">
                    {(['about', 'news', 'documents', 'grants', 'help'] as Section[]).map((s) => (
                      <button key={s} onClick={() => navigate(s)} className="block text-xs text-white/60 hover:text-white transition-colors">
                        {navItems.find(n => n.id === s)?.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">Контакты</div>
                  <div className="text-xs text-white/60 space-y-1.5">
                    <div>443006, Самара, ул. Молодогвардейская, 210</div>
                    <a href="tel:88463321004" className="block hover:text-white transition-colors">8 (846) 332-10-04</a>
                    <a href="mailto:mcx@samregion.ru" className="block hover:text-white transition-colors">mcx@samregion.ru</a>
                    <a href="https://mcx.samregion.ru" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">mcx.samregion.ru</a>
                  </div>
                </div>
              </div>

              {/* Блок интеллектуальной собственности */}
              <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center shrink-0">
                      <Icon name="Cpu" size={14} className="text-white/80" />
                    </div>
                    <div className="text-xs text-white/70">
                      Интеллектуальный продукт компании <span className="font-semibold text-white">ООО «МАТ-Лабс»</span>
                    </div>
                  </div>
                  <div className="text-xs text-white/40 sm:ml-auto">
                    Все права на программное обеспечение защищены
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
                <span>© 2026 Министерство сельского хозяйства и продовольствия Самарской области</span>
                <span>Сертификат ФСТЭК №12/2024</span>
              </div>
            </footer>
          </main>
        </div>

        {/* ИИ-агент-менеджер — доступен на всех страницах */}
        <AiAssistant currentPage={navItems.find((n) => n.id === section)?.label} />

        {/* Модалка регистрации/входа */}
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
      </div>
    </TooltipProvider>
  );
}