import React, { useState, useEffect } from 'react';
import { Moon, Sun, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CricketDashboard from './CricketDashboard';
import FootballDashboard from './FootballDashboard';

const Dashboard = () => {
  const [theme, setTheme] = useState('light');
  const [sport, setSport] = useState('cricket');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${sport === 'cricket' ? 'cricket-theme' : 'football-theme'}`}
      style={{
        background: theme === 'light' 
          ? 'var(--bg-primary)' 
          : 'var(--bg-primary)'
      }}
      data-testid="dashboard-container"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 border-b backdrop-blur-lg" 
        style={{
          background: theme === 'light' 
            ? 'rgba(255, 255, 255, 0.9)' 
            : 'rgba(26, 31, 40, 0.9)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{
                background: sport === 'cricket' ? 'var(--sport-light)' : 'var(--sport-light)'
              }}>
                <Trophy className="w-6 h-6" style={{ color: 'var(--sport-primary)' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Sports Scorecard
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Live scores & fixtures
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              data-testid="theme-toggle-button"
              className="rounded-full"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={sport} onValueChange={setSport} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 p-1 rounded-xl" 
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)'
            }}
          >
            <TabsTrigger 
              value="cricket" 
              data-testid="cricket-tab"
              className="rounded-lg font-medium transition-all"
              style={{
                color: sport === 'cricket' ? '#ffffff' : 'var(--text-secondary)',
                background: sport === 'cricket' ? 'var(--cricket-accent)' : 'transparent'
              }}
            >
              🏏 Cricket
            </TabsTrigger>
            <TabsTrigger 
              value="football" 
              data-testid="football-tab"
              className="rounded-lg font-medium transition-all"
              style={{
                color: sport === 'football' ? '#ffffff' : 'var(--text-secondary)',
                background: sport === 'football' ? 'var(--football-accent)' : 'transparent'
              }}
            >
              ⚽ Football
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cricket" className="animate-fade-in">
            <CricketDashboard theme={theme} />
          </TabsContent>

          <TabsContent value="football" className="animate-fade-in">
            <FootballDashboard theme={theme} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;