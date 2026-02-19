import React, { useState, useEffect } from 'react';
import './App.css';

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

  const parseDomains = (text: string): string[] => {
    return text
      .split(/[\s\t\n]+/)
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0);
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

  const compareLists = () => {
    const firstList = parseDomains(firstText);
    const secondList = parseDomains(secondText);

    const firstSet = new Set(firstList);
    const secondSet = new Set(secondList);

    const matches = firstList.filter(domain => secondSet.has(domain));
    const firstOnly = firstList.filter(domain => !secondSet.has(domain));
    const secondOnly = secondList.filter(domain => !firstSet.has(domain));

    setComparisonResult({
      matches,
      firstOnly,
      secondOnly
    });
  };

  const clearAll = () => {
    setFirstText('');
    setSecondText('');
    setComparisonResult(null);
  };

  const swapLists = () => {
    setFirstText(secondText);
    setSecondText(firstText);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`✅ ${type} скопирован в буфер обмена`);
    } catch (err) {
      alert('❌ Ошибка при копировании');
    }
  };

  const copyAllResults = () => {
    if (!comparisonResult) return;

    const allText = [
      '=== СОВПАДЕНИЯ ===',
      comparisonResult.matches.join('\n'),
      '\n=== ТОЛЬКО В СПИСКЕ 1 ===',
      comparisonResult.firstOnly.join('\n'),
      '\n=== ТОЛЬКО В СПИСКЕ 2 ===',
      comparisonResult.secondOnly.join('\n')
    ].join('\n');

    copyToClipboard(allText, 'Весь результат');
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

  const removeItem = (type: 'matches' | 'firstOnly' | 'secondOnly', index: number) => {
    if (!comparisonResult) return;

    const newResult = { ...comparisonResult };
    newResult[type] = newResult[type].filter((_, i) => i !== index);

    setComparisonResult(newResult);
  };

  const removeAllFromType = (type: 'matches' | 'firstOnly' | 'secondOnly') => {
    if (!comparisonResult) return;

    const newResult = { ...comparisonResult };
    newResult[type] = [];

    setComparisonResult(newResult);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Сравнение списков доменов</h1>
      </header>

      <div className="input-section">
        <div className="textarea-container">
          <div className="textarea-header">
            <label>Список 1:</label>
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
            <label>Список 2:</label>
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
        <button onClick={compareLists} className="btn primary">
          🔍 Сравнить списки
        </button>
        <button onClick={swapLists} className="btn secondary">
          🔄 Поменять местами
        </button>
        <button onClick={clearAll} className="btn danger">
          🗑️ Очистить всё
        </button>
      </div>

      {comparisonResult && (
        <div className="results">
          <div className="stats">
            <div className="stat-card match">
              <span className="stat-value">{comparisonResult.matches.length}</span>
              <span className="stat-label">Совпадений</span>
            </div>
            <div className="stat-card first-only">
              <span className="stat-value">{comparisonResult.firstOnly.length}</span>
              <span className="stat-label">Только в списке 1</span>
            </div>
            <div className="stat-card second-only">
              <span className="stat-value">{comparisonResult.secondOnly.length}</span>
              <span className="stat-label">Только в списке 2</span>
            </div>
          </div>

          <div className="global-actions">
            <button onClick={copyAllResults} className="btn secondary">
              📋 Копировать все результаты
            </button>
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
                  <h3>📋 Только в списке 1 ({comparisonResult.firstOnly.length})</h3>
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
                  <h3>📋 Только в списке 2 ({comparisonResult.secondOnly.length})</h3>
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