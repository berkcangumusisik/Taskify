import { useTheme } from '../context/ThemeContext';
import TagManager from './TagManager';
import { Link } from 'react-router-dom';

const Header = ({ viewType, onViewChange }) => {
  const { theme, setTheme } = useTheme();

  const VIEW_TYPES = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'list', label: 'Liste', icon: '📝' },
    { id: 'kanban', label: 'Kanban', icon: '📋' },
    { id: 'calendar', label: 'Takvim', icon: '📅' },
    { id: 'gantt', label: 'Gantt', icon: '📊' },
    { id: 'pomodoro', label: 'Pomodoro', icon: '⏰' },
  ];

  const THEMES = [
    { id: 'light', label: 'Açık Tema', icon: '☀️' },
    { id: 'dark', label: 'Koyu Tema', icon: '🌙' },
    { id: 'cupcake', label: 'Cupcake', icon: '🧁' },
    { id: 'bumblebee', label: 'Bumblebee', icon: '🐝' },
    { id: 'emerald', label: 'Emerald', icon: '💎' },
    { id: 'corporate', label: 'Corporate', icon: '💼' },
    { id: 'synthwave', label: 'Synthwave', icon: '🌆' },
    { id: 'retro', label: 'Retro', icon: '📺' },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: '🤖' },
    { id: 'valentine', label: 'Valentine', icon: '💝' },
    { id: 'halloween', label: 'Halloween', icon: '🎃' },
    { id: 'garden', label: 'Garden', icon: '🌸' },
    { id: 'forest', label: 'Forest', icon: '🌲' },
    { id: 'aqua', label: 'Aqua', icon: '💧' },
    { id: 'lofi', label: 'Lo-Fi', icon: '🎧' },
    { id: 'pastel', label: 'Pastel', icon: '🎨' },
    { id: 'fantasy', label: 'Fantasy', icon: '🦄' },
    { id: 'wireframe', label: 'Wireframe', icon: '🔲' },
    { id: 'black', label: 'Black', icon: '⚫' },
    { id: 'luxury', label: 'Luxury', icon: '👑' },
    { id: 'dracula', label: 'Dracula', icon: '🧛' },
    { id: 'cmyk', label: 'CMYK', icon: '🖨️' },
    { id: 'autumn', label: 'Autumn', icon: '🍂' },
    { id: 'business', label: 'Business', icon: '💰' },
    { id: 'acid', label: 'Acid', icon: '🌈' },
    { id: 'lemonade', label: 'Lemonade', icon: '🍋' },
    { id: 'night', label: 'Night', icon: '🌃' },
    { id: 'coffee', label: 'Coffee', icon: '☕' },
    { id: 'winter', label: 'Winter', icon: '❄️' },
  ];

  const handleNavigation = (path) => {
    if (path === '/') {
      onViewChange('dashboard');
    }
  };

  return (
    <header className="bg-base-100 shadow-lg">
      <div className="container mx-auto">
        <div className="navbar gap-2 flex-col md:flex-row">
          {/* Logo ve Başlık */}
          <div className="flex-1 w-full md:w-auto flex justify-between">
            <button
              className="btn btn-ghost text-xl gap-2"
              onClick={() => handleNavigation('/')}
            >
              ✨ Taskify
              <div className="badge badge-primary">Beta</div>
            </button>

            {/* Mobil Menü */}
            <div className="flex md:hidden gap-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  document.getElementById('mobile-menu').showModal()
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Desktop Görünüm Seçici */}
          <div className="flex-none gap-2 hidden md:flex">
            <div className="tabs tabs-boxed bg-base-200">
              {VIEW_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`tab ${viewType === type.id ? 'tab-active' : ''}`}
                  onClick={() => onViewChange(type.id)}
                >
                  <span className="mr-2">{type.icon}</span>
                  <span className="hidden lg:inline">{type.label}</span>
                </button>
              ))}
            </div>

            {/* Tema Seçici */}
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost gap-2">
                {THEMES.find((t) => t.id === theme)?.icon || '🎨'}
                <span>Tema</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </label>
              <div
                tabIndex={0}
                className="dropdown-content z-[1] card card-compact w-64 p-2 shadow bg-base-200 text-base-content"
              >
                <div className="card-body">
                  <h3 className="card-title text-sm">Tema Seçimi</h3>

                  {/* Temel Temalar */}
                  <div className="py-2">
                    <h4 className="font-medium opacity-70 text-xs mb-2">
                      Temel Temalar
                    </h4>
                    <div className="grid grid-cols-1 gap-1">
                      {THEMES.slice(0, 2).map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={`btn btn-sm justify-start gap-2 ${
                            theme === t.id ? 'btn-primary' : 'btn-ghost'
                          }`}
                        >
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Özel Temalar */}
                  <div className="py-2">
                    <h4 className="font-medium opacity-70 text-xs mb-2">
                      Özel Temalar
                    </h4>
                    <div className="grid grid-cols-1 gap-1 max-h-[50vh] overflow-y-auto pr-2">
                      {THEMES.slice(2).map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={`btn btn-sm justify-start gap-2 ${
                            theme === t.id ? 'btn-primary' : 'btn-ghost'
                          }`}
                        >
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tema Bilgisi */}
                  <div className="mt-2 pt-2 border-t border-base-300">
                    <p className="text-xs opacity-70">
                      Aktif Tema: {THEMES.find((t) => t.id === theme)?.label}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              className="btn btn-ghost btn-sm"
              onClick={() =>
                document.getElementById('tag-manager-modal').showModal()
              }
            >
              🏷️ Etiketler
            </button>

            {/* Kullanıcı Menüsü */}
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=taskify"
                    alt="avatar"
                  />
                </div>
              </label>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52"
              >
                <li>
                  <button
                    className="justify-between"
                    onClick={() => handleNavigation('/profile')}
                  >
                    Profil
                    <span className="badge badge-primary badge-sm">Yeni</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('/settings')}>
                    Ayarlar
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('/logout')}>
                    Çıkış
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Mobil Menü Modal */}
      <dialog id="mobile-menu" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Menü</h3>

          {/* Mobil Görünüm Seçici */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {VIEW_TYPES.map((type) => (
              <button
                key={type.id}
                className={`btn btn-sm ${
                  viewType === type.id ? 'btn-primary' : 'btn-ghost'
                }`}
                onClick={() => {
                  onViewChange(type.id);
                  document.getElementById('mobile-menu').close();
                }}
              >
                <span className="mr-2">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>

          {/* Mobil Hızlı Erişim */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                document.getElementById('tag-manager-modal').showModal();
                document.getElementById('mobile-menu').close();
              }}
            >
              🏷️ Etiketler
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                document.getElementById('theme-picker').showModal();
                document.getElementById('mobile-menu').close();
              }}
            >
              🎨 Tema
            </button>
          </div>

          {/* Mobil Kullanıcı Menüsü */}
          <div className="flex flex-col gap-2">
            <button className="btn btn-ghost justify-between">
              Profil
              <span className="badge badge-primary badge-sm">Yeni</span>
            </button>
            <button className="btn btn-ghost">Ayarlar</button>
            <button className="btn btn-ghost">Çıkış</button>
          </div>

          <div className="modal-action">
            <button
              className="btn"
              onClick={() => document.getElementById('mobile-menu').close()}
            >
              Kapat
            </button>
          </div>
        </div>
      </dialog>

      {/* Tema Seçici Modal */}
      <dialog id="theme-picker" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Tema Seçimi</h3>

          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  document.getElementById('theme-picker').close();
                }}
                className={`btn btn-sm justify-start gap-2 ${
                  theme === t.id ? 'btn-primary' : 'btn-ghost'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="modal-action">
            <button
              className="btn"
              onClick={() => document.getElementById('theme-picker').close()}
            >
              Kapat
            </button>
          </div>
        </div>
      </dialog>

      <TagManager />
    </header>
  );
};

export default Header;
