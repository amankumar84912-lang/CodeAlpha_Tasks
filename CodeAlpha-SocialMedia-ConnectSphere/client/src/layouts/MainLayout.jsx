import Navbar from '../components/Navbar';

/**
 * MainLayout — wraps every authenticated page with the fixed Navbar.
 * Usage: <MainLayout><PageContent /></MainLayout>
 */
export default function MainLayout({ children }) {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
