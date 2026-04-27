import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

type FontSize = 'normal' | 'large' | 'xlarge';
type ColorScheme = 'normal' | 'accessible';

interface Settings {
  fontSize: FontSize;
  colorScheme: ColorScheme;
  lineHeight: boolean;
  noImages: boolean;
}

const STORAGE_KEY = 'asuг_a11y';

function loadSettings(): Settings {
  // Принудительный сброс — всегда стартуем в обычной светлой теме
  const def: Settings = { fontSize: 'normal', colorScheme: 'normal', lineHeight: false, noImages: false };
  try {
    localStorage.removeItem(STORAGE_KEY);
    document.body.classList.remove('accessible', 'accessible-large', 'accessible-xlarge');
  } catch {
    // ignore
  }
  return def;
}

function applySettings(s: Settings) {
  const body = document.body;

  // color scheme
  body.classList.toggle('accessible', s.colorScheme === 'accessible');

  // font size
  body.classList.remove('accessible-large', 'accessible-xlarge');
  if (s.fontSize === 'large') body.classList.add('accessible-large');
  if (s.fontSize === 'xlarge') body.classList.add('accessible-large', 'accessible-xlarge');

  // line height
  body.style.lineHeight = s.lineHeight ? '1.9' : '';

  // no images (hide decorative images)
  const style = document.getElementById('a11y-no-img') as HTMLStyleElement | null;
  if (s.noImages) {
    if (!style) {
      const el = document.createElement('style');
      el.id = 'a11y-no-img';
      el.textContent = 'img { visibility: hidden !important; } svg.decorative { display: none !important; }';
      document.head.appendChild(el);
    }
  } else {
    style?.remove();
  }
}

export default function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    applySettings(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const reset = () => {
    const def: Settings = { fontSize: 'normal', colorScheme: 'normal', lineHeight: false, noImages: false };
    setSettings(def);
  };

  const fontLabels: Record<FontSize, string> = {
    normal: 'Обычный',
    large: 'Крупный',
    xlarge: 'Очень крупный',
  };

  return (
    <>
      {/* Trigger button — всегда виден */}
      <button
        onClick={() => setOpen(!open)}
        title="Версия для слабовидящих"
        aria-label="Открыть панель специальных возможностей"
        className="relative text-white/70 hover:text-white transition-colors flex items-center gap-1.5"
      >
        <Icon name="Eye" size={18} />
        <span className="text-xs hidden lg:block">Слабовидящим</span>
      </button>

      {/* Panel */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="fixed top-12 right-4 z-50 w-80 bg-card border-2 border-border rounded-lg shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary rounded-t-lg">
              <div className="flex items-center gap-2">
                <Icon name="Eye" size={16} className="text-foreground" />
                <span className="font-bold text-sm text-foreground">Специальные возможности</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Закрыть"
              >
                <Icon name="X" size={16} />
              </button>
            </div>

            <div className="p-4 space-y-5">

              {/* Color scheme */}
              <div>
                <div className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Цветовая схема</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => update({ colorScheme: 'normal' })}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded border-2 transition-all ${settings.colorScheme === 'normal' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                  >
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded-sm bg-white border border-gray-300" />
                      <div className="w-4 h-4 rounded-sm bg-[#1a2f5e]" />
                      <div className="w-4 h-4 rounded-sm bg-[#d97706]" />
                    </div>
                    <span className="text-xs font-medium text-foreground">Обычная</span>
                  </button>
                  <button
                    onClick={() => update({ colorScheme: 'accessible' })}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded border-2 transition-all ${settings.colorScheme === 'accessible' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                  >
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded-sm bg-white border border-black" />
                      <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#003791' }} />
                      <div className="w-4 h-4 rounded-sm bg-black" />
                    </div>
                    <span className="text-xs font-medium text-foreground">Контрастная</span>
                  </button>
                </div>
              </div>

              {/* Font size */}
              <div>
                <div className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Размер шрифта</div>
                <div className="grid grid-cols-3 gap-2">
                  {(['normal', 'large', 'xlarge'] as FontSize[]).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => update({ fontSize: sz })}
                      className={`py-2 px-1 rounded border-2 transition-all text-center ${settings.fontSize === sz ? 'border-primary bg-primary/10 font-bold' : 'border-border hover:border-primary/50'}`}
                    >
                      <span
                        className="text-foreground font-semibold block"
                        style={{ fontSize: sz === 'normal' ? '12px' : sz === 'large' ? '15px' : '18px' }}
                      >
                        А
                      </span>
                      <span className="text-xs text-muted-foreground block mt-0.5">{fontLabels[sz]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-foreground uppercase tracking-wide">Дополнительно</div>

                {/* Line height */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <div className="text-sm font-medium text-foreground">Увеличенный межстрочный интервал</div>
                    <div className="text-xs text-muted-foreground">Облегчает чтение длинных текстов</div>
                  </div>
                  <button
                    role="switch"
                    aria-checked={settings.lineHeight}
                    onClick={() => update({ lineHeight: !settings.lineHeight })}
                    className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ml-3 ${settings.lineHeight ? 'bg-primary' : 'bg-muted border border-border'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.lineHeight ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </label>

                {/* No images */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <div className="text-sm font-medium text-foreground">Скрыть декоративные изображения</div>
                    <div className="text-xs text-muted-foreground">Оставить только текст и иконки</div>
                  </div>
                  <button
                    role="switch"
                    aria-checked={settings.noImages}
                    onClick={() => update({ noImages: !settings.noImages })}
                    className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ml-3 ${settings.noImages ? 'bg-primary' : 'bg-muted border border-border'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.noImages ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </label>
              </div>

              {/* Reset */}
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <button
                  onClick={reset}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  Сбросить настройки
                </button>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon name="Info" size={12} />
                  ГОСТ Р 52872
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}