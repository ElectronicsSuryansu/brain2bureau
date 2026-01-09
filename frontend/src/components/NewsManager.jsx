import React, { useEffect, useState } from 'react';
import '../styles/News.css';

export default function NewsManager({ onNavigate }) {
  const [news, setNews] = useState(() => { try { return JSON.parse(localStorage.getItem('news') || '[]'); } catch(e) { return []; } });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', body: '' });

  useEffect(() => {
    const handler = () => setNews(JSON.parse(localStorage.getItem('news') || '[]'));
    window.addEventListener('storage', handler);
    window.addEventListener('newsChanged', handler);
    return () => { window.removeEventListener('storage', handler); window.removeEventListener('newsChanged', handler); };
  }, []);

  const saveNews = (list) => {
    localStorage.setItem('news', JSON.stringify(list));
    try { window.dispatchEvent(new Event('newsChanged')); } catch(e){}
    setNews(list);
  };

  const addNew = () => { setEditing('new'); setForm({ title:'', body:'' }); };
  const editItem = (i) => { setEditing(i); setForm(news[i]); };
  const removeItem = (i) => { if (!confirm('Delete this news item?')) return; const l = news.slice(); l.splice(i,1); saveNews(l); };
  const saveEdit = () => {
    const l = news.slice();
    if (editing === 'new') { l.unshift({ title: form.title || 'Untitled', body: form.body || '', time: Date.now() }); }
    else { l[editing] = { ...l[editing], title: form.title, body: form.body, time: Date.now() } }
    saveNews(l);
    setEditing(null);
  };

  return (
    <div className="news-manager">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2>News Manager</h2>
        <div>
          <button className="small-button" onClick={addNew}>Add News</button>
          <button className="back-button" onClick={() => onNavigate && onNavigate('home')} style={{marginLeft:8}}>Back</button>
        </div>
      </div>

      <div className="news-list-manager">
        {editing && (
          <div className="news-edit">
            <input placeholder="Title" value={form.title} onChange={(e)=> setForm({...form, title: e.target.value})} />
            <textarea placeholder="Body" value={form.body} onChange={(e)=> setForm({...form, body: e.target.value})} />
            <div style={{marginTop:8}}>
              <button className="small-button" onClick={saveEdit}>Save</button>
              <button className="small-button" onClick={() => setEditing(null)} style={{marginLeft:8}}>Cancel</button>
            </div>
          </div>
        )}

        {news.length === 0 && <div className="muted">No news items yet.</div>}

        {news.map((n,i) => (
          <div key={i} className="news-manager-item">
            <div style={{flex:1}}>
              <div className="news-title">{n.title}</div>
              <div className="news-meta muted">{new Date(n.time).toLocaleString()}</div>
              <div className="news-body" style={{marginTop:6}}>{n.body}</div>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:8, marginLeft:12}}>
              <button className="small-button" onClick={()=> editItem(i)}>Edit</button>
              <button className="small-button" onClick={()=> removeItem(i)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
