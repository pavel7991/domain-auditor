import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

interface DuplicateInfo {
  [key: string]: number[];
}

const App: React.FC = () => {
  const [firstText, setFirstText] = useState('');
  const [secondText, setSecondText] = useState('');
  const [firstDomainCount, setFirstDomainCount] = useState(0);
  const [secondDomainCount, setSecondDomainCount] = useState(0);
  const [comparisonResult, setComparisonResult] = useState<{
    matches: string[];
    firstOnly: string[];
    secondOnly: string[];
  } | null>(null);

  // Состояния для лоадеров
  const [isComparing, setIsComparing] = useState(false);
  const [isFindingDuplicates, setIsFindingDuplicates] = useState(false);

  // Отдельное состояние для дубликатов
  const [duplicates, setDuplicates] = useState<{
    firstDuplicates: DuplicateInfo;
    secondDuplicates: DuplicateInfo;
  } | null>(null);

  // Состояния для сообщений о пустых результатах
  const [comparisonMessage, setComparisonMessage] = useState<string | null>(null);
  const [duplicatesMessage, setDuplicatesMessage] = useState<string | null>(null);

  const parseDomains = (text: string): string[] => {
    return text
      .split(/[\s\t\n]+/)
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0);
  };

  // Поиск дубликатов в массиве
  const findDuplicates = (domains: string[]): DuplicateInfo => {
    const duplicates: DuplicateInfo = {};
    const seen = new Map<string, number[]>();

    domains.forEach((domain, index) => {
      if (seen.has(domain)) {
        seen.get(domain)!.push(index + 1);
      } else {
        seen.set(domain, [index + 1]);
      }
    });

    seen.forEach((positions, domain) => {
      if (positions.length > 1) {
        duplicates[domain] = positions;
      }
    });

    return duplicates;
  };

  // Обновление счетчиков при изменении текста
  useEffect(() => {
    setFirstDomainCount(parseDomains(firstText).length);
  }, [firstText]);

  useEffect(() => {
    setSecondDomainCount(parseDomains(secondText).length);
  }, [secondText]);

  // Форматирование текста при потере фокуса
  const formatTextareaOnBlur = (text: string): string => {
    const domains = parseDomains(text);
    return domains.join('\n');
  };

  const handleFirstBlur = () => {
    setFirstText(formatTextareaOnBlur(firstText));
  };

  const handleSecondBlur = () => {
    setSecondText(formatTextareaOnBlur(secondText));
  };

  // Сравнение списков с лоадером
  const compareLists = async () => {
    setIsComparing(true);
    setComparisonMessage(null);

    // Имитация небольшой задержки для демонстрации лоадера
    await new Promise(resolve => setTimeout(resolve, 500));

    const firstList = parseDomains(firstText);
    const secondList = parseDomains(secondText);

    const firstSet = new Set(firstList);
    const secondSet = new Set(secondList);

    const matches = firstList.filter(domain => secondSet.has(domain));
    const firstOnly = firstList.filter(domain => !secondSet.has(domain));
    const secondOnly = secondList.filter(domain => !firstSet.has(domain));

    if (matches.length === 0 && firstOnly.length === 0 && secondOnly.length === 0) {
      setComparisonMessage('❌ Нет данных для сравнения');
      setComparisonResult(null);
    } else if (matches.length === 0 && firstOnly.length === 0) {
      setComparisonMessage('📭 Совпадений не найдено. Все домены только во втором списке');
      setComparisonResult({ matches, firstOnly, secondOnly });
    } else if (matches.length === 0 && secondOnly.length === 0) {
      setComparisonMessage('📭 Совпадений не найдено. Все домены только в первом списке');
      setComparisonResult({ matches, firstOnly, secondOnly });
    } else if (matches.length === 0) {
      setComparisonMessage('📭 Совпадений не найдено');
      setComparisonResult({ matches, firstOnly, secondOnly });
    } else {
      setComparisonMessage(null);
      setComparisonResult({ matches, firstOnly, secondOnly });
    }

    setIsComparing(false);
  };

  // Отдельная функция для поиска дубликатов с лоадером
  const findDuplicatesInLists = async () => {
    setIsFindingDuplicates(true);
    setDuplicatesMessage(null);

    // Имитация небольшой задержки для демонстрации лоадера
    await new Promise(resolve => setTimeout(resolve, 500));

    const firstList = parseDomains(firstText);
    const secondList = parseDomains(secondText);

    const firstDuplicates = findDuplicates(firstList);
    const secondDuplicates = findDuplicates(secondList);

    if (Object.keys(firstDuplicates).length === 0 && Object.keys(secondDuplicates).length === 0) {
      setDuplicatesMessage('✅ Дубликатов не найдено! Все домены уникальны');
      setDuplicates(null);
    } else {
      setDuplicatesMessage(null);
      setDuplicates({
        firstDuplicates,
        secondDuplicates
      });
    }

    setIsFindingDuplicates(false);
  };

  const clearAll = () => {
    setFirstText('');
    setSecondText('');
    setComparisonResult(null);
    setDuplicates(null);
    setComparisonMessage(null);
    setDuplicatesMessage(null);
  };

  const swapLists = () => {
    setFirstText(secondText);
    setSecondText(firstText);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`✅ ${type} скопирован в буфер обмена`, {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } catch (err) {
      toast.error('❌ Ошибка при копировании', {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    }
  };

  const copyAllDuplicates = () => {
    if (!duplicates) return;

    const duplicateText = [];

    if (Object.keys(duplicates.firstDuplicates).length > 0) {
      duplicateText.push('=== ДУБЛИКАТЫ В СПИСКЕ 1 ===');
      Object.entries(duplicates.firstDuplicates).forEach(([domain]) => {
        duplicateText.push(domain);
      });
    }

    if (Object.keys(duplicates.secondDuplicates).length > 0) {
      duplicateText.push('\n=== ДУБЛИКАТЫ В СПИСКЕ 2 ===');
      Object.entries(duplicates.secondDuplicates).forEach(([domain]) => {
        duplicateText.push(domain);
      });
    }

    copyToClipboard(duplicateText.join('\n'), 'Все дубликаты');
  };

  const copySingleResult = (domain: string) => {
    copyToClipboard(domain, 'Домен');
  };

  const copyMatchResults = (type: 'matches' | 'firstOnly' | 'secondOnly') => {
    if (!comparisonResult) return;

    const titles = {
      matches: 'Совпадения',
      firstOnly: 'Только в списке 1',
      secondOnly: 'Только в списке 2'
    };

    copyToClipboard(comparisonResult[type].join('\n'), titles[type]);
  };

  const copyDuplicates = (type: 'first' | 'second') => {
    if (!duplicates) return;

    const duplicatesList = type === 'first' ? duplicates.firstDuplicates : duplicates.secondDuplicates;
    const title = type === 'first' ? 'Дубликаты в списке 1' : 'Дубликаты в списке 2';

    const text = Object.keys(duplicatesList).join('\n');

    copyToClipboard(text, title);
  };

  const removeItem = (type: 'matches' | 'firstOnly' | 'secondOnly', index: number) => {
    if (!comparisonResult) return;

    const newResult = { ...comparisonResult };
    newResult[type] = newResult[type].filter((_, i) => i !== index);

    setComparisonResult(newResult);
    toast.info('🗑️ Элемент удален', {
      position: "bottom-right",
      autoClose: 1500,
      theme: "dark",
    });
  };

  const removeDuplicate = (type: 'first' | 'second', domain: string) => {
    if (!duplicates) return;

    const newDuplicates = { ...duplicates };
    if (type === 'first') {
      const newFirst = { ...newDuplicates.firstDuplicates };
      delete newFirst[domain];
      newDuplicates.firstDuplicates = newFirst;
    } else {
      const newSecond = { ...newDuplicates.secondDuplicates };
      delete newSecond[domain];
      newDuplicates.secondDuplicates = newSecond;
    }

    setDuplicates(newDuplicates);
    toast.info('🗑️ Дубликат удален', {
      position: "bottom-right",
      autoClose: 1500,
      theme: "dark",
    });
  };

  const removeAllFromType = (type: 'matches' | 'firstOnly' | 'secondOnly') => {
    if (!comparisonResult) return;

    const newResult = { ...comparisonResult };
    newResult[type] = [];

    setComparisonResult(newResult);
    toast.info(`🗑️ Все ${type === 'matches' ? 'совпадения' : type === 'firstOnly' ? 'из списка 1' : 'из списка 2'} удалены`, {
      position: "bottom-right",
      autoClose: 1500,
      theme: "dark",
    });
  };

  const removeAllDuplicates = (type: 'first' | 'second') => {
    if (!duplicates) return;

    const newDuplicates = { ...duplicates };
    if (type === 'first') {
      newDuplicates.firstDuplicates = {};
    } else {
      newDuplicates.secondDuplicates = {};
    }

    setDuplicates(newDuplicates);
    toast.info(`🗑️ Все дубликаты из списка ${type === 'first' ? '1' : '2'} удалены`, {
      position: "bottom-right",
      autoClose: 1500,
      theme: "dark",
    });
  };

  return (
    <div className="app">
      <ToastContainer />

      <header className="header">
        <h1>🔄 Сравнение списков доменов и поиск дубликатов</h1>
      </header>

      <div className="input-section">
        <div className="textarea-container">
          <div className="textarea-header">
            <label>Список-1:</label>
            <span className="domain-count-badge">{firstDomainCount} доменов</span>
          </div>
          <textarea
            value={firstText}
            onChange={(e) => setFirstText(e.target.value)}
            onBlur={handleFirstBlur}
            placeholder="Вставьте домены через пробел, табуляцию или с новой строки..."
            spellCheck={false}
          />
        </div>

        <div className="textarea-container">
          <div className="textarea-header">
            <label>Список-2:</label>
            <span className="domain-count-badge">{secondDomainCount} доменов</span>
          </div>
          <textarea
            value={secondText}
            onChange={(e) => setSecondText(e.target.value)}
            onBlur={handleSecondBlur}
            placeholder="Вставьте домены для сравнения..."
            spellCheck={false}
          />
        </div>
      </div>

      <div className="actions">
        <button
          onClick={compareLists}
          className={`btn primary ${isComparing ? 'loading' : ''}`}
          disabled={isComparing || isFindingDuplicates}
        >
          {isComparing ? (
            <>
              <span className="spinner"></span>
              Сравнение...
            </>
          ) : (
            '🔍 Сравнить списки'
          )}
        </button>

        <button
          onClick={findDuplicatesInLists}
          className={`btn warning ${isFindingDuplicates ? 'loading' : ''}`}
          disabled={isComparing || isFindingDuplicates}
        >
          {isFindingDuplicates ? (
            <>
              <span className="spinner"></span>
              Поиск дубликатов...
            </>
          ) : (
            '🔁 Найти дубликаты'
          )}
        </button>

        <button onClick={swapLists} className="btn secondary" disabled={isComparing || isFindingDuplicates}>
          🔄 Поменять местами
        </button>
        <button onClick={clearAll} className="btn danger" disabled={isComparing || isFindingDuplicates}>
          🗑️ Очистить всё
        </button>
      </div>

      {/* Сообщение о результате поиска дубликатов */}
      {duplicatesMessage && (
        <div className="message-card success">
          <span className="message-icon">✨</span>
          <span className="message-text">{duplicatesMessage}</span>
        </div>
      )}

      {/* Результаты поиска дубликатов */}
      {duplicates && (Object.keys(duplicates.firstDuplicates).length > 0 || Object.keys(duplicates.secondDuplicates).length > 0) && (
        <div className="results-section">
          <h2 className="section-title">🔄 Найденные дубликаты</h2>

          <div className="stats stats-2col">
            <div className="stat-card duplicate">
              <span className="stat-value">{Object.keys(duplicates.firstDuplicates).length}</span>
              <span className="stat-label">Дубликатов в «СПИСКЕ-1»</span>
            </div>
            <div className="stat-card duplicate">
              <span className="stat-value">{Object.keys(duplicates.secondDuplicates).length}</span>
              <span className="stat-label">Дубликатов в «СПИСКЕ-2»</span>
            </div>
          </div>

          <div className="global-actions">
            <button onClick={copyAllDuplicates} className="btn warning">
              📋 Копировать все дубликаты
            </button>
          </div>

          <div className="result-lists">
            {Object.keys(duplicates.firstDuplicates).length > 0 && (
              <div className="result-card duplicates">
                <div className="result-header">
                  <h3>🔄 Дубликаты в «СПИСКЕ-1» ({Object.keys(duplicates.firstDuplicates).length})</h3>
                  <div className="result-actions">
                    <button
                      onClick={() => copyDuplicates('first')}
                      className="icon-btn copy-btn"
                      title="Копировать дубликаты"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => removeAllDuplicates('first')}
                      className="icon-btn delete-btn"
                      title="Удалить все дубликаты"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="domain-grid">
                  {Object.keys(duplicates.firstDuplicates).map((domain, idx) => (
                    <div key={idx} className="domain-item duplicate-item">
                      <span className="domain-text">{domain}</span>
                      <div className="domain-item-actions">
                        <button
                          onClick={() => copySingleResult(domain)}
                          className="small-icon-btn copy-btn"
                          title="Копировать домен"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => removeDuplicate('first', domain)}
                          className="small-icon-btn delete-btn"
                          title="Удалить"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(duplicates.secondDuplicates).length > 0 && (
              <div className="result-card duplicates">
                <div className="result-header">
                  <h3>🔄 Дубликаты в «СПИСКЕ-2» ({Object.keys(duplicates.secondDuplicates).length})</h3>
                  <div className="result-actions">
                    <button
                      onClick={() => copyDuplicates('second')}
                      className="icon-btn copy-btn"
                      title="Копировать дубликаты"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => removeAllDuplicates('second')}
                      className="icon-btn delete-btn"
                      title="Удалить все дубликаты"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="domain-grid">
                  {Object.keys(duplicates.secondDuplicates).map((domain, idx) => (
                    <div key={idx} className="domain-item duplicate-item">
                      <span className="domain-text">{domain}</span>
                      <div className="domain-item-actions">
                        <button
                          onClick={() => copySingleResult(domain)}
                          className="small-icon-btn copy-btn"
                          title="Копировать домен"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => removeDuplicate('second', domain)}
                          className="small-icon-btn delete-btn"
                          title="Удалить"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Сообщение о результате сравнения */}
      {comparisonMessage && (
        <div className="message-card info">
          <span className="message-icon">ℹ️</span>
          <span className="message-text">{comparisonMessage}</span>
        </div>
      )}

      {/* Результаты сравнения */}
      {comparisonResult && !comparisonMessage && (
        <div className="results-section">
          <h2 className="section-title">📊 Результаты сравнения</h2>
          <div className="stats">
            <div className="stat-card match">
              <span className="stat-value">{comparisonResult.matches.length}</span>
              <span className="stat-label">Совпадений</span>
            </div>
            <div className="stat-card first-only">
              <span className="stat-value">{comparisonResult.firstOnly.length}</span>
              <span className="stat-label">Только в «списке-1»</span>
            </div>
            <div className="stat-card second-only">
              <span className="stat-value">{comparisonResult.secondOnly.length}</span>
              <span className="stat-label">Только в «списке-2»</span>
            </div>
          </div>

          <div className="result-lists">
            {comparisonResult.matches.length > 0 && (
              <div className="result-card matches">
                <div className="result-header">
                  <h3>✅ Совпадения ({comparisonResult.matches.length})</h3>
                  <div className="result-actions">
                    <button
                      onClick={() => copyMatchResults('matches')}
                      className="icon-btn copy-btn"
                      title="Копировать совпадения"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => removeAllFromType('matches')}
                      className="icon-btn delete-btn"
                      title="Удалить все совпадения"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="domain-grid">
                  {comparisonResult.matches.map((domain, idx) => (
                    <div key={idx} className="domain-item match-item">
                      <span className="domain-text">{domain}</span>
                      <div className="domain-item-actions">
                        <button
                          onClick={() => copySingleResult(domain)}
                          className="small-icon-btn copy-btn"
                          title="Копировать домен"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => removeItem('matches', idx)}
                          className="small-icon-btn delete-btn"
                          title="Удалить"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {comparisonResult.firstOnly.length > 0 && (
              <div className="result-card first-only">
                <div className="result-header">
                  <h3>📋 Только в «СПИСКЕ-1» ({comparisonResult.firstOnly.length})</h3>
                  <div className="result-actions">
                    <button
                      onClick={() => copyMatchResults('firstOnly')}
                      className="icon-btn copy-btn"
                      title="Копировать список"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => removeAllFromType('firstOnly')}
                      className="icon-btn delete-btn"
                      title="Удалить все"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="domain-grid">
                  {comparisonResult.firstOnly.map((domain, idx) => (
                    <div key={idx} className="domain-item first-only-item">
                      <span className="domain-text">{domain}</span>
                      <div className="domain-item-actions">
                        <button
                          onClick={() => copySingleResult(domain)}
                          className="small-icon-btn copy-btn"
                          title="Копировать домен"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => removeItem('firstOnly', idx)}
                          className="small-icon-btn delete-btn"
                          title="Удалить"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {comparisonResult.secondOnly.length > 0 && (
              <div className="result-card second-only">
                <div className="result-header">
                  <h3>📋 Только в «СПИСКЕ-2» ({comparisonResult.secondOnly.length})</h3>
                  <div className="result-actions">
                    <button
                      onClick={() => copyMatchResults('secondOnly')}
                      className="icon-btn copy-btn"
                      title="Копировать список"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => removeAllFromType('secondOnly')}
                      className="icon-btn delete-btn"
                      title="Удалить все"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="domain-grid">
                  {comparisonResult.secondOnly.map((domain, idx) => (
                    <div key={idx} className="domain-item second-only-item">
                      <span className="domain-text">{domain}</span>
                      <div className="domain-item-actions">
                        <button
                          onClick={() => copySingleResult(domain)}
                          className="small-icon-btn copy-btn"
                          title="Копировать домен"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => removeItem('secondOnly', idx)}
                          className="small-icon-btn delete-btn"
                          title="Удалить"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;