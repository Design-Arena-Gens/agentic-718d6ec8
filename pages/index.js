import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const triggerGeneration = async () => {
    setStatus('loading');
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setResult(data);
      } else {
        setStatus('error');
        setError(data.error || 'Failed to generate video');
      }
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎬 YouTube Shorts Automation</h1>
        <p style={styles.description}>
          Automated AI-powered YouTube Shorts creator for stock market content
        </p>

        <div style={styles.features}>
          <h2 style={styles.subtitle}>Features:</h2>
          <ul style={styles.list}>
            <li>✅ Automated script generation with ChatGPT</li>
            <li>✅ Professional voiceover with ElevenLabs</li>
            <li>✅ AI-generated images with Leonardo.ai</li>
            <li>✅ Stock footage B-roll from Pexels</li>
            <li>✅ Automatic subtitle generation</li>
            <li>✅ Direct YouTube upload</li>
            <li>✅ Scheduled daily execution (2 PM UTC)</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.subtitle}>Manual Trigger:</h2>
          <button
            onClick={triggerGeneration}
            disabled={status === 'loading'}
            style={{
              ...styles.button,
              ...(status === 'loading' ? styles.buttonDisabled : {})
            }}
          >
            {status === 'loading' ? '⏳ Generating...' : '🚀 Generate Video Now'}
          </button>
        </div>

        {status === 'success' && result && (
          <div style={styles.success}>
            <h3 style={styles.resultTitle}>✅ Success!</h3>
            <p><strong>Video URL:</strong> <a href={result.videoUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>{result.videoUrl}</a></p>
            <p><strong>Topic:</strong> {result.topic}</p>
          </div>
        )}

        {status === 'error' && error && (
          <div style={styles.error}>
            <h3 style={styles.resultTitle}>❌ Error</h3>
            <p>{error}</p>
          </div>
        )}

        <div style={styles.section}>
          <h2 style={styles.subtitle}>Setup Instructions:</h2>
          <ol style={styles.list}>
            <li>Create a Google Sheet named 'YouTube_Shorts_Ideas'</li>
            <li>Add video topics in column A</li>
            <li>Set up API keys in environment variables</li>
            <li>Configure YouTube OAuth credentials</li>
            <li>Deploy to Vercel or run locally</li>
          </ol>
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Powered by OpenAI, ElevenLabs, Leonardo.ai, and Pexels
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '0.5rem',
    textAlign: 'center',
  },
  description: {
    fontSize: '1.1rem',
    color: '#666',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  subtitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '1rem',
  },
  features: {
    marginBottom: '2rem',
  },
  section: {
    marginBottom: '2rem',
  },
  list: {
    lineHeight: '1.8',
    color: '#555',
  },
  button: {
    width: '100%',
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  success: {
    background: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '2rem',
  },
  error: {
    background: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '2rem',
  },
  resultTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '500',
  },
  footer: {
    marginTop: '3rem',
    paddingTop: '2rem',
    borderTop: '1px solid #eee',
    textAlign: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: '0.9rem',
  },
};
