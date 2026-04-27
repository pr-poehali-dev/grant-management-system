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

type Section = 'home' | 'cabinet' | 'grants' | 'dashboard' | 'reports' | 'verification' | 'admin' | 'help' | 'contacts';
type Role = 'producer' | 'officer' | 'admin';

const navItems: { id: Section; label: string; icon: string; roles?: Role[] }[] = [
  { id: 'home', label: 'Главная', icon: 'Home' },
  { id: 'cabinet', label: 'Личный кабинет', icon: 'User' },
  { id: 'grants', label: 'Заявки на гранты', icon: 'FilePlus' },
  { id: 'reports', label: 'Отчётность', icon: 'FileCheck' },
  { id: 'dashboard', label: 'Аналитика', icon: 'BarChart2' },
  { id: 'verification', label: 'Проверка отчётов', icon: 'ShieldCheck', roles: ['officer', 'admin'] },
  { id: 'admin', label: 'Администрирование', icon: 'Settings', roles: ['admin'] },
  { id: 'help', label: 'Помощь', icon: 'HelpCircle' },
  { id: 'contacts', label: 'Контакты', icon: 'Phone' },
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
        {/* Top bar */}
        <header className="bg-gov-navy border-b border-white/10 px-4 py-2.5 flex items-center justify-between z-30 relative shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white/70 hover:text-white md:hidden mr-1"
            >
              <Icon name="Menu" size={20} />
            </button>
            <button onClick={() => navigate('home')} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center">
                <Icon name="Wheat" size={16} className="text-white" />
              </div>
              <div className="leading-tight">
                <div className="text-white font-black text-sm tracking-tight">АСУГ СХ СО</div>
                <div className="text-white/50 text-xs hidden sm:block">Учёт и контроль грантов АПК · Самарская область</div>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3 relative">
            <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded px-3 py-1.5 text-xs text-white/80">
              <Icon name={role === 'producer' ? 'Tractor' : role === 'officer' ? 'Shield' : 'Settings'} size={13} />
              {roleLabels[role]}
            </div>
            <AccessibilityPanel />
            <button className="relative text-white/70 hover:text-white">
              <Icon name="Bell" size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">3</span>
            </button>
            <button
              onClick={() => navigate('cabinet')}
              className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold"
            >
              ИВ
            </button>
          </div>
        </header>

        {/* Gov gold stripe */}
        <div className="bg-amber-500 h-0.5 w-full shrink-0" />

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
              {section === 'home' && <HomePage onNavigate={navigate} />}
              {section === 'cabinet' && <CabinetPage onNavigate={navigate} role={role} onRoleChange={setRole} />}
              {section === 'grants' && <GrantsPage onNavigate={navigate} />}
              {section === 'dashboard' && <DashboardPage />}
              {section === 'reports' && <ReportsPage />}
              {section === 'verification' && <VerificationPage />}
              {section === 'admin' && <AdminPage />}
              {section === 'help' && <HelpPage />}
              {section === 'contacts' && <ContactsPage />}
            </div>

            {/* Footer */}
            <footer className="bg-gov-navy text-white/50 text-xs px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
              <span>© 2026 АСУГ СХ СО · Министерство сельского хозяйства и продовольствия Самарской области</span>
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('help')} className="hover:text-white transition-colors">Документация</button>
                <button onClick={() => navigate('contacts')} className="hover:text-white transition-colors">Обратная связь</button>
                <span className="text-white/30">Сертификат ФСТЭК №12/2024</span>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}