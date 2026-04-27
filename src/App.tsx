import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import Icon from '@/components/ui/icon';
import AccessibilityPanel from '@/components/AccessibilityPanel';
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
  { id: 'verification', label: 'Проверка отчётов',  icon: 'ShieldCheck', roles: ['officer', 'admin'] },
  { id: 'admin',        label: 'Администрирование', icon: 'Settings',    roles: ['admin'] },
  { id: 'help',         label: 'Помощь',            icon: 'HelpCircle' },
  { id: 'contacts',     label: 'Контакты',          icon: 'Phone'      },
];

export default function App() {
  const [section, setSection] = useState<Section>('home');
  const [role, setRole] = useState<Role>('producer');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleNav = navItems.filter((item) => !item.roles || item.roles.includes(role));

  const navigate = (s: string) => {
    setSection(s as Section);
    setSidebarOpen(false);
    window.scrollTo(0, 0);
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

            {/* Логотип с гербом */}
            <button onClick={() => navigate('home')} className="flex items-center gap-3">
              {/* Цифровой герб РФ (SVG) */}
              <svg viewBox="0 0 40 48" width="32" height="38" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Герб Российской Федерации">
                <path d="M20 2C20 2 4 8 4 22C4 34 20 46 20 46C20 46 36 34 36 22C36 8 20 2 20 2Z" fill="#D52B1E"/>
                {/* Орёл — упрощённый силуэт */}
                <path d="M20 8L17 13H13L16 16L15 21L20 18L25 21L24 16L27 13H23L20 8Z" fill="#FFD700"/>
                <path d="M12 14C10 15 9 17 10 19C11 20 13 20 14 19" fill="#FFD700"/>
                <path d="M28 14C30 15 31 17 30 19C29 20 27 20 26 19" fill="#FFD700"/>
                <path d="M16 20C16 24 18 28 20 30C22 28 24 24 24 20" fill="#D52B1E"/>
                <rect x="18" y="20" width="4" height="8" rx="1" fill="#FFD700"/>
              </svg>

              <div className="leading-tight">
                <div className="text-white font-bold text-sm tracking-tight">АСУГ СХ СО</div>
                <div className="text-white/55 text-xs hidden sm:block" style={{ fontSize: 11 }}>
                  Минсельхозпрод Самарской области
                </div>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3 relative">
            <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded px-3 py-1.5 text-white/80" style={{ fontSize: 13 }}>
              <Icon name={role === 'producer' ? 'Tractor' : role === 'officer' ? 'Shield' : 'Settings'} size={13} />
              {roleLabels[role]}
            </div>
            <AccessibilityPanel />
            <button className="relative text-white/70 hover:text-white">
              <Icon name="Bell" size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: '#D52B1E' }}>3</span>
            </button>
            <button
              onClick={() => navigate('cabinet')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: '#003791' }}
            >
              ИВ
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
            </div>

            {/* Footer */}
            <footer className="bg-gov-navy text-white shrink-0">
              <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-white/10">
                <div>
                  <div className="text-sm font-bold mb-2">АСУГ СХ СО</div>
                  <div className="text-xs text-white/50 leading-relaxed">
                    Автоматизированная система учёта и контроля расходования грантов в сельском хозяйстве Самарской области
                  </div>
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
              <div className="px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
                <span>© 2026 Министерство сельского хозяйства и продовольствия Самарской области</span>
                <span>Сертификат ФСТЭК №12/2024</span>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}