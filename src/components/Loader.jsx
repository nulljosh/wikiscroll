import './Loader.css';

export default function Loader({ fullScreen = false }) {
  return (
    <div className={`loader ${fullScreen ? 'loader-fullscreen' : ''}`}>
      <div className="loader-spinner">
        <div className="spinner-ring" />
      </div>
      {fullScreen && (
        <div className="loader-text">
          <h1 className="loader-brand">WikiScroll</h1>
          <p className="loader-subtitle">Discovering knowledge...</p>
        </div>
      )}
    </div>
  );
}
