import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/lib/auth';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ open, onClose, initialMode = 'login' }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [orgName, setOrgName] = useState('');
  const [inn, setInn] = useState('');
  const [role, setRole] = useState<'producer' | 'officer'>('producer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const reset = () => {
    setEmail(''); setPassword(''); setFullName(''); setPhone('');
    setOrgName(''); setInn(''); setError('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await login(email, password)
        : await register({ email, password, full_name: fullName, phone, org_name: orgName, inn, role });
      if (!res.ok) {
        setError(res.error || 'Ошибка');
      } else {
        reset();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gov-navy text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="LogIn" size={18} />
            <h2 className="font-bold">{mode === 'login' ? 'Вход в систему' : 'Регистрация'}</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <Icon name="X" size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-3">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold mb-1">ФИО *</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} required
                  className="w-full px-3 py-2 border border-gov-line rounded text-sm focus:outline-none focus:border-gov-navy"
                  placeholder="Иванов Иван Иванович" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">Телефон</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gov-line rounded text-sm focus:outline-none focus:border-gov-navy"
                    placeholder="+7 (___) ___-__-__" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Роль</label>
                  <select value={role} onChange={(e) => setRole(e.target.value as 'producer' | 'officer')}
                    className="w-full px-3 py-2 border border-gov-line rounded text-sm bg-white">
                    <option value="producer">Производитель / КФХ</option>
                    <option value="officer">Сотрудник МСХ</option>
                  </select>
                </div>
              </div>
              {role === 'producer' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Наименование организации</label>
                    <input value={orgName} onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-3 py-2 border border-gov-line rounded text-sm focus:outline-none focus:border-gov-navy"
                      placeholder="КФХ «...» / ИП ... / СПК «...»" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">ИНН</label>
                    <input value={inn} onChange={(e) => setInn(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      className="w-full px-3 py-2 border border-gov-line rounded text-sm focus:outline-none focus:border-gov-navy font-mono"
                      placeholder="10 или 12 цифр" />
                  </div>
                </>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1">Email *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-3 py-2 border border-gov-line rounded text-sm focus:outline-none focus:border-gov-navy"
              placeholder="email@example.ru" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Пароль *</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full px-3 py-2 border border-gov-line rounded text-sm focus:outline-none focus:border-gov-navy"
              placeholder="не менее 6 символов" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded flex items-start gap-2">
              <Icon name="AlertCircle" size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-gov-navy text-white font-semibold py-2.5 rounded hover:bg-gov-navy-light disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            <Icon name={loading ? 'Loader2' : (mode === 'login' ? 'LogIn' : 'UserPlus')} size={15} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Обработка...' : (mode === 'login' ? 'Войти' : 'Зарегистрироваться')}
          </button>

          <div className="text-xs text-center text-muted-foreground pt-2 border-t border-gov-line">
            {mode === 'login' ? 'Нет аккаунта? ' : 'Уже зарегистрированы? '}
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-gov-navy font-semibold hover:underline">
              {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </div>

          {mode === 'register' && (
            <div className="text-xs text-muted-foreground bg-secondary/50 rounded p-2">
              <Icon name="Info" size={11} className="inline mr-1" />
              После регистрации вам будут доступны: подача заявок на гранты, личный кабинет, сдача отчётности.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
