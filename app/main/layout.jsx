import './layout.css';

export default function MainLayout({ children }) {
  return (
    <div className="layout-container">
      {children}
    </div>
  );
}
