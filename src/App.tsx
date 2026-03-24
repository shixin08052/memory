import React, { useState, useEffect } from 'react';
import './App.css';

// 1. 这里定义了数据的“形状”，告诉 TypeScript 我们会存哪些数据
interface Issue {
  id: string;
  text: string;
  person: string;
  resolved: boolean;
}

function App() {
  // 2. 这里加上了 <Issue[]>，告诉它这是一个装满 Issue 的数组，不再是 never 了
  const [issues, setIssues] = useState<Issue[]>([]);
  const [inputText, setInputText] = useState('');
  const [person, setPerson] = useState('a');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/issues');
      const data: Issue[] = await res.json();
      setIssues(data || []);
    } catch (error) {
      console.error("加载失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const addIssue = async () => {
    if (!inputText.trim()) return;
    
    const newIssue = { text: inputText, person, resolved: false };
    
    try {
      await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIssue)
      });
      setInputText('');
      fetchIssues(); // 重新拉取
    } catch (error) {
      alert("保存失败，请检查网络！");
    }
  };

  // 3. 明确告诉它 e 是一个键盘事件
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addIssue();
  };

  // 4. 明确告诉它 id 是一个字符串
  const toggleStatus = async (id: string) => {
    try {
      await fetch('/api/issues', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchIssues(); // 重新拉取更新后的状态
    } catch (error) {
      console.error("更新状态失败:", error);
    }
  };

  return (
    <div className="container">
      <h1>🌱 我们的成长小本本</h1>
      <p className="subtitle">记录是为了更好的相爱，而不是为了互相伤害</p>

      <div className="input-section">
        <select value={person} onChange={(e) => setPerson(e.target.value)}>
          <option value="a">Ta的问题 (粉)</option>
          <option value="b">我的问题 (蓝)</option>
        </select>
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="写下需要复盘的小问题..." 
          onKeyDown={handleKeyPress}
        />
        <button className="add-btn" onClick={addIssue}>记录</button>
      </div>

      <ul className="list-container">
        {loading ? (
          <li style={{ textAlign: 'center', color: '#9a8c98' }}>正在同步云端数据...</li>
        ) : issues.length === 0 ? (
          <li style={{ textAlign: 'center', color: '#9a8c98' }}>还没有记录，今天也是和平的一天~</li>
        ) : (
          issues.map((issue) => (
            <li key={issue.id} className={`list-item person-${issue.person} ${issue.resolved ? 'resolved' : ''}`}>
              <div className="item-text">{issue.text}</div>
              <button 
                className="toggle-btn" 
                onClick={() => toggleStatus(issue.id)}
              >
                {issue.resolved ? '♥ 已改正' : '需努力'}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default App;
