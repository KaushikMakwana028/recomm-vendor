import { Dropdown } from 'react-bootstrap'
import { useLanguage } from '../contexts/LanguageContext'

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
]

const LanguageSelector = () => {
  const { language, changeLanguage } = useLanguage()
  const current = languages.find((l) => l.code === language) || languages[0]

  return (
    <>
      <style>{`
        .lang-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.625rem;
          border: none;
          background: transparent;
          border-radius: 9px;
          cursor: pointer;
          transition: background 0.2s;
          color: #374151;
          height: 38px;
        }
        .lang-btn:hover { background: #f3f4f6; }
        .lang-btn::after { display: none !important; }
        .lang-flag { font-size: 1.1rem; line-height: 1; }
        .lang-label {
          font-size: 0.8125rem;
          font-weight: 500;
          white-space: nowrap;
          color: #374151;
        }
        .lang-menu {
          border: none !important;
          border-radius: 14px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
          padding: 0.375rem !important;
          margin-top: 8px !important;
          min-width: 155px !important;
        }
        .lang-option {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.5625rem 0.875rem;
          border-radius: 9px;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-size: 0.875rem;
          color: #374151;
          cursor: pointer;
          transition: background 0.15s;
          font-family: 'Poppins', sans-serif;
        }
        .lang-option:hover { background: #f9fafb; }
        .lang-option.lang-active {
          background: linear-gradient(135deg, rgba(99,102,241,0.09), rgba(139,92,246,0.09));
          color: #6366f1;
          font-weight: 600;
        }
        @media (max-width: 480px) {
          .lang-label { display: none; }
          .lang-btn { padding: 0.25rem 0.5rem; }
        }
      `}</style>

      <Dropdown align="end">
        <Dropdown.Toggle as="button" className="lang-btn">
          <span className="lang-flag">{current.flag}</span>
          <span className="lang-label">{current.name}</span>
        </Dropdown.Toggle>
        <Dropdown.Menu className="lang-menu">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`lang-option ${lang.code === language ? 'lang-active' : ''}`}
              onClick={() => changeLanguage(lang.code)}
            >
              <span className="lang-flag">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </>
  )
}

export default LanguageSelector