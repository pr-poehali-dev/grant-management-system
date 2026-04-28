import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/lib/auth';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ open, onClose, initialMode = 'login' }: AuthModalProps) {
  const { login, register, fetchCaptcha } = useAuth();
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

  const [captcha, setCaptcha] = useState<{ question: string; token: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [needCaptcha, setNeedCaptcha] = useState(false);

  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [devHint, setDevHint] = useState<string | null>(null);

  const loadCaptcha = useCallback(async () => {
    const c = await fetchCaptcha();
    if (c) { setCaptcha(c); setCaptchaAnswer(''); }
  }, [fetchCaptcha]);

  useEffect(() => {
    if (open && (mode === 'register' || needCaptcha) && !captcha) loadCaptcha();
  }, [open, mode, needCaptcha, captcha, loadCaptcha]);

  if (!open) return null;

  const reset = () => {
    setEmail(''); setPassword(''); setFullName(''); setPhone('');
    setOrgName(''); setInn(''); setError('');
    setCaptcha(null); setCaptchaAnswer(''); setNeedCaptcha(false);
    setTwoFactorRequired(false); setTwoFactorCode(''); setDevHint(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const opts: { captchaToken?: string; captchaAnswer?: string; twoFactorCode?: string } = {};
        if (captcha && captchaAnswer) {
          opts.captchaToken = captcha.token;
          opts.captchaAnswer = captchaAnswer;
        }
        if (twoFactorRequired && twoFactorCode) {
          opts.twoFactorCode = twoFactorCode;
        }
        const res = await login(email, password, opts);
        if (res.ok) { reset(); onClose(); return; }

        if (res.twoFactorRequired) {
          setTwoFactorRequired(true);
          setError(res.error || 'Введите код подтверждения, отправленный администратору');
          if (res.devCode) setDevHint(`DEV-код: ${res.devCode}`);
          return;
        }
        if (res.needCaptcha) {
          setNeedCaptcha(true);
          await loadCaptcha();
        }
        setError(res.error || 'Ошибка');
      } else {
        if (!captcha || !captchaAnswer) {
          setError('Заполните проверку «я не робот»');
          return;
        }
        const res = await register({
          email, password, full_name: fullName, phone, org_name: orgName, inn, role,
          captchaToken: captcha.token, captchaAnswer,
        });
        if (res.ok) { reset(); onClose(); return; }
        if (res.needCaptcha) await loadCaptcha();
        setError(res.error || 'Ошибка');
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
            <Icon name={twoFactorRequired ? 'ShieldCheck' : 'LogIn'} size={18} />
            <h2 className="font-bold">
              {twoFactorRequired ? 'Подтверждение входа' : (mode === 'login' ? 'Вход в систему' : 'Регистрация')}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <Icon name="X" size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-3">
          {twoFactorRequired ? (
            <>
              <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded flex items-start gap-2">
                <Icon name="ShieldCheck" size={14} className="shrink-0 mt-0.5" />
                <span>Введите 6-значный код подтверждения. Код действителен 5 минут.</span>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Код подтверждения *</label>
                <input
                  inputMode="numeric"
                  autoFocus
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2 border border-gov-line rounded text-lg text-center font-mono tracking-[0.5em] focus:outline-none focus:border-gov-navy"
                  placeholder="000000"
                />
              </div>
              {devHint && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                  <Icon name="Bug" size={11} className="inline mr-1" />
                  {devHint}
                </div>
              )}
            </>
          ) : (
            <>
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
                <label className="block text-xs font-semibold mb-1">
                  Пароль * {mode === 'register' && <span className="text-muted-foreground font-normal">(от 8 символов, буквы и цифры)</span>}
                </label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  minLength={mode === 'register' ? 8 : 6}
                  className="w-full px-3 py-2 border border-gov-line rounded text-sm focus:outline-none focus:border-gov-navy"
                  placeholder={mode === 'register' ? 'не менее 8 символов' : 'ваш пароль'} />
              </div>

              {(mode === 'register' || needCaptcha) && captcha && (
                <div className="bg-secondary/40 border border-gov-line rounded p-3">
                  <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                    <Icon name="ShieldCheck" size={12} />
                    Проверка «я не робот»: {captcha.question}
                  </label>
                  <div className="flex gap-2">
                    <input
                      inputMode="numeric"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      className="flex-1 px-3 py-2 border border-gov-line rounded text-sm focus:outline-none focus:border-gov-navy"
                      placeholder="Ответ"
                      required
                    />
                    <button type="button" onClick={loadCaptcha}
                      className="text-xs px-2 border border-gov-line rounded hover:bg-white" title="Другой пример">
                      <Icon name="RefreshCw" size={12} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded flex items-start gap-2">
              <Icon name="AlertCircle" size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-gov-navy text-white font-semibold py-2.5 rounded hover:bg-gov-navy-light disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            <Icon name={loading ? 'Loader2' : (twoFactorRequired ? 'ShieldCheck' : (mode === 'login' ? 'LogIn' : 'UserPlus'))} size={15} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Обработка...' : (twoFactorRequired ? 'Подтвердить' : (mode === 'login' ? 'Войти' : 'Зарегистрироваться'))}
          </button>

          {!twoFactorRequired && (
            <div className="text-xs text-center text-muted-foreground pt-2 border-t border-gov-line">
              {mode === 'login' ? 'Нет аккаунта? ' : 'Уже зарегистрированы? '}
              <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setNeedCaptcha(false); setCaptcha(null); }}
                className="text-gov-navy font-semibold hover:underline">
                {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </div>
          )}

          {mode === 'register' && !twoFactorRequired && (
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
