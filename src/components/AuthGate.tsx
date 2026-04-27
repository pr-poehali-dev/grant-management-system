import Icon from '@/components/ui/icon';

interface AuthGateProps {
  sectionLabel: string;
  description?: string;
  onLogin: () => void;
  onRegister: () => void;
}

export default function AuthGate({ sectionLabel, description, onLogin, onRegister }: AuthGateProps) {
  return (
    <div className="animate-fade-in max-w-2xl mx-auto px-6 py-12">
      <div className="bg-white border border-gov-line rounded-lg p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gov-navy/10 flex items-center justify-center">
          <Icon name="Lock" size={26} className="text-gov-navy" />
        </div>
        <h2 className="text-lg font-bold text-gov-navy mb-2">
          Раздел «{sectionLabel}» доступен после входа
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {description || 'Чтобы продолжить работу, войдите в систему или зарегистрируйтесь как сельхозтоваропроизводитель или сотрудник министерства.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-2 justify-center mb-6">
          <button onClick={onLogin}
            className="bg-gov-navy text-white font-semibold px-5 py-2.5 rounded hover:bg-gov-navy-light transition-colors flex items-center justify-center gap-2">
            <Icon name="LogIn" size={15} />
            Войти
          </button>
          <button onClick={onRegister}
            className="bg-white border border-gov-navy text-gov-navy font-semibold px-5 py-2.5 rounded hover:bg-secondary transition-colors flex items-center justify-center gap-2">
            <Icon name="UserPlus" size={15} />
            Зарегистрироваться
          </button>
        </div>

        <div className="text-xs text-muted-foreground border-t border-gov-line pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Icon name="ShieldCheck" size={14} className="mx-auto mb-1 text-gov-navy" />
            Защищённое соединение
          </div>
          <div>
            <Icon name="Clock" size={14} className="mx-auto mb-1 text-gov-navy" />
            Регистрация — 1 минута
          </div>
          <div>
            <Icon name="HeadphonesIcon" size={14} className="mx-auto mb-1 text-gov-navy" />
            Поддержка 8 (846) 332-10-04
          </div>
        </div>
      </div>
    </div>
  );
}
