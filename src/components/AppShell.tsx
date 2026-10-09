import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { SectionId } from '../types/navigation';
import { useDemoData } from '../contexts/DemoDataContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { NewSaleDialog } from './pos/NewSaleDialog';
import { Overview } from '../pages/Overview';
import { Transactions } from '../pages/Transactions';
import { Customers } from '../pages/Customers';
import { SmartAnalytics } from '../pages/SmartAnalytics';
import { RootCauseDetective } from '../pages/RootCauseDetective';
import { InventoryIntelligence } from '../pages/InventoryIntelligence';
import { WhatIfSimulator } from '../pages/WhatIfSimulator';
import { BusinessAssistant } from '../pages/BusinessAssistant';
import { Settings } from '../pages/Settings';
import { Profile } from '../pages/Profile';

const SIDEBAR_KEY = 'karobar-sidebar';

/** Layout + client-side section switching (no page reloads). */
export function AppShell() {
  const [section, setSection] = useState<SectionId>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(SIDEBAR_KEY) === 'collapsed';
    } catch {
      return false;
    }
  });
  const [sale, setSale] = useState<{open: boolean;customerId?: string;}>({ open: false });
  const { resetToken } = useDemoData();

  const navigate = useCallback((id: SectionId) => {
    setSection(id);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0 });
  }, []);

  const toggleCollapsed = () =>
  setCollapsed((c) => {
    const next = !c;
    try {
      window.localStorage.setItem(SIDEBAR_KEY, next ? 'collapsed' : 'expanded');
    } catch {

      // ignore
    }return next;
  });

  const openNewSale = useCallback((customerId?: string) => setSale({ open: true, customerId }), []);

  const renderSection = () => {
    switch (section) {
      case 'overview':
        return <Overview onNavigate={navigate} />;
      case 'transactions':
        return <Transactions />;
      case 'customers':
        return <Customers onNewSale={openNewSale} />;
      case 'analytics':
        return <SmartAnalytics />;
      case 'rootcause':
        return <RootCauseDetective />;
      case 'inventory':
        return <InventoryIntelligence />;
      case 'simulator':
        return <WhatIfSimulator />;
      case 'assistant':
        return <BusinessAssistant onNavigate={navigate} />;
      case 'settings':
        return <Settings onNavigate={navigate} />;
      case 'profile':
        return <Profile onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-canvas text-ink">
      <Sidebar
        active={section}
        onNavigate={navigate}
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed} />
      
      <div className={`flex min-h-screen min-w-0 flex-col transition-[padding] duration-200 ease-out ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-[248px]'}`}>
        <TopBar section={section} onOpenMenu={() => setMobileNavOpen(true)} onNewSale={() => openNewSale()} onNavigate={navigate} />
        <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <motion.div
            key={`${section}-${resetToken}`}
            className="mx-auto max-w-[1400px]"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}>
            
            {renderSection()}
          </motion.div>
        </main>
      </div>
      <NewSaleDialog
        open={sale.open}
        initialCustomerId={sale.customerId}
        onClose={() => setSale({ open: false })}
        onViewTransactions={() => {
          setSale({ open: false });
          navigate('transactions');
        }} />
      
    </div>);

}