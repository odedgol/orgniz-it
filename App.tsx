import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DayView from './pages/DayView';
import MonthView from './pages/MonthView';
import Subjects from './pages/Subjects';
import Jobs from './pages/Jobs';
import Stats from './pages/Stats';

const App = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/day" element={<DayView />} />
            <Route path="/month" element={<MonthView />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;
